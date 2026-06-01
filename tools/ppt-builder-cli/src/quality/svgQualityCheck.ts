import fs from "node:fs/promises";
import path from "node:path";

type Severity = "error" | "warning";

export interface SvgQualityIssue {
  severity: Severity;
  code: string;
  message: string;
  file?: string;
}

export interface SvgQualityReport {
  status: "pass" | "fail";
  svgDir: string;
  visualLock?: string;
  checks: {
    svgFiles: number;
    expectedViewBox?: string;
  };
  issues: SvgQualityIssue[];
}

export interface SvgQualityOptions {
  svgDir: string;
  visualLockPath?: string;
  visualPagePlanPath?: string;
}

interface VisualLockLike {
  canvas?: { viewBox?: string };
  colors?: Record<string, string>;
  forbiddenSvgFeatures?: string[];
}

interface VisualPagePlanLike {
  slides?: Array<{ slideNumber?: number; svgRole?: string }>;
}

const defaultForbidden = ["foreignObject", "script", "style", "class", "mask", "textPath", "animate", "set", "iframe", "@font-face"];

export async function checkSvgQuality(options: SvgQualityOptions): Promise<SvgQualityReport> {
  const svgDir = path.resolve(options.svgDir);
  const issues: SvgQualityIssue[] = [];
  const visualLock = options.visualLockPath ? await readVisualLock(path.resolve(options.visualLockPath), issues) : null;
  const visualPagePlan = options.visualPagePlanPath ? await readVisualPagePlan(path.resolve(options.visualPagePlanPath), issues) : null;
  const expectedViewBox = visualLock?.canvas?.viewBox;
  const forbidden = visualLock?.forbiddenSvgFeatures?.length ? visualLock.forbiddenSvgFeatures : defaultForbidden;

  let entries: string[] = [];
  try {
    entries = await fs.readdir(svgDir);
  } catch {
    issues.push({ severity: "error", code: "svg_dir_missing", message: "SVG directory does not exist or cannot be read." });
    return makeReport(svgDir, options.visualLockPath, 0, expectedViewBox, issues);
  }

  const svgFiles = entries.filter((entry) => entry.toLowerCase().endsWith(".svg")).sort();
  if (!svgFiles.length) {
    issues.push({ severity: "warning", code: "svg_files_missing", message: "SVG directory contains no .svg files." });
  }
  checkExpectedSvgFiles(svgFiles, visualPagePlan, issues);

  const allowedColors = new Set(Object.values(visualLock?.colors ?? {}).map((value) => normalizeHex(value)).filter((value): value is string => Boolean(value)));
  for (const file of svgFiles) {
    const absolute = path.join(svgDir, file);
    let svg = "";
    try {
      svg = await fs.readFile(absolute, "utf8");
    } catch {
      issues.push({ severity: "error", code: "svg_unreadable", message: "SVG file cannot be read.", file });
      continue;
    }
    checkSingleSvg(svg, file, expectedViewBox, forbidden, allowedColors, issues);
  }

  return makeReport(svgDir, options.visualLockPath, svgFiles.length, expectedViewBox, issues);
}

export async function writeSvgQualityReport(report: SvgQualityReport, outPath: string): Promise<void> {
  const absoluteOut = path.resolve(outPath);
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true });
  await fs.writeFile(absoluteOut, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function checkSingleSvg(
  svg: string,
  file: string,
  expectedViewBox: string | undefined,
  forbidden: string[],
  allowedColors: Set<string>,
  issues: SvgQualityIssue[],
): void {
  if (!/<svg[\s>]/i.test(svg)) {
    issues.push({ severity: "error", code: "svg_root_missing", message: "File does not contain an <svg> root.", file });
  }
  const viewBox = svg.match(/\bviewBox=["']([^"']+)["']/)?.[1];
  if (!viewBox) {
    issues.push({ severity: "error", code: "viewbox_missing", message: "SVG missing viewBox.", file });
  } else if (expectedViewBox && normalizeSpace(viewBox) !== normalizeSpace(expectedViewBox)) {
    issues.push({ severity: "error", code: "viewbox_mismatch", message: `SVG viewBox '${viewBox}' does not match visual-lock '${expectedViewBox}'.`, file });
  }
  if (!/<rect\b[^>]*(width=["']100%["']|width=["']1280["']|height=["']720["'])/i.test(svg)) {
    issues.push({ severity: "warning", code: "background_rect_unclear", message: "SVG may be missing an explicit page background rectangle.", file });
  }

  for (const feature of forbidden) {
    const pattern = forbiddenPattern(feature);
    if (pattern.test(svg)) {
      issues.push({ severity: "error", code: "forbidden_svg_feature", message: `Forbidden SVG feature detected: ${feature}.`, file });
    }
  }
  if (/rgba\s*\(/i.test(svg)) {
    issues.push({ severity: "error", code: "rgba_forbidden", message: "Use HEX plus fill-opacity/stroke-opacity instead of rgba(...).", file });
  }
  if (/<image\b[^>]+href=["']https?:\/\//i.test(svg)) {
    issues.push({ severity: "error", code: "remote_image_forbidden", message: "SVG image href must be a local project asset, not a remote URL.", file });
  }
  for (const imageTag of svg.matchAll(/<image\b[^>]*>/gi)) {
    if (!/\bpreserveAspectRatio=/i.test(imageTag[0])) {
      issues.push({ severity: "warning", code: "image_preserve_aspect_missing", message: "SVG image is missing preserveAspectRatio; image may stretch.", file });
    }
  }
  if (allowedColors.size) {
    const colors = [...svg.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => normalizeHex(match[0])).filter(Boolean);
    for (const color of colors) {
      if (color && !allowedColors.has(color)) {
        issues.push({ severity: "warning", code: "color_not_in_visual_lock", message: `Color ${color} is not listed in visual-lock colors.`, file });
      }
    }
  }
}

function forbiddenPattern(feature: string): RegExp {
  if (feature === "class") return /\sclass=["']/i;
  if (feature === "style") return /<style[\s>]/i;
  if (feature === "script") return /<script[\s>]|son\w+=["']/i;
  if (feature === "animation") return /<animate\w*[\s>]|<set[\s>]/i;
  if (feature === "external-css") return /rel=["']stylesheet["']|<\?xml-stylesheet/i;
  if (feature === "font-face") return /@font-face/i;
  return new RegExp(`<${escapeRegExp(feature)}[\\s>]`, "i");
}

async function readVisualLock(filePath: string, issues: SvgQualityIssue[]): Promise<VisualLockLike | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as VisualLockLike;
  } catch {
    issues.push({ severity: "error", code: "visual_lock_unreadable", message: "visual-lock.json cannot be read or parsed." });
    return null;
  }
}

async function readVisualPagePlan(filePath: string, issues: SvgQualityIssue[]): Promise<VisualPagePlanLike | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as VisualPagePlanLike;
  } catch {
    issues.push({ severity: "error", code: "visual_page_plan_unreadable", message: "visual-page-plan.json cannot be read or parsed." });
    return null;
  }
}

function checkExpectedSvgFiles(svgFiles: string[], visualPagePlan: VisualPagePlanLike | null, issues: SvgQualityIssue[]): void {
  if (!visualPagePlan?.slides) return;
  const actual = new Set(svgFiles);
  for (const slide of visualPagePlan.slides) {
    if (!slide.slideNumber || !slide.svgRole || slide.svgRole === "none") continue;
    const expected = `slide-${String(slide.slideNumber).padStart(2, "0")}.svg`;
    if (!actual.has(expected)) {
      issues.push({
        severity: "error",
        code: "expected_svg_missing",
        message: `visual-page-plan requires ${expected}, but it is missing from svg-pages.`,
        file: expected,
      });
    }
  }
}

function makeReport(svgDir: string, visualLock: string | undefined, svgFiles: number, expectedViewBox: string | undefined, issues: SvgQualityIssue[]): SvgQualityReport {
  return {
    status: issues.some((issue) => issue.severity === "error") ? "fail" : "pass",
    svgDir,
    visualLock: visualLock ? path.resolve(visualLock) : undefined,
    checks: { svgFiles, expectedViewBox },
    issues,
  };
}

function normalizeSpace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeHex(value: string | undefined): string | null {
  if (!value) return null;
  const hex = value.startsWith("#") ? value.slice(1) : value;
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
