import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { assertDeckSpec, type DeckSpec } from "../schema.js";

type Severity = "error" | "warning";

interface QualityIssue {
  severity: Severity;
  code: string;
  message: string;
  slide?: number;
}

interface QualityReport {
  status: "pass" | "fail";
  deckJson: string;
  pptx: string;
  slideCount: {
    expected: number;
    actual: number;
  };
  checks: {
    transitionSlides: number;
    manualAdvanceSlides: number;
    mediaFiles: number;
    svgMediaFiles: number;
    referencedAssetCount: number;
  };
  issues: QualityIssue[];
}

interface CheckOptions {
  deckJsonPath: string;
  pptxPath: string;
  assetManifestPath?: string;
  designLockPath?: string;
}

export async function checkPptxQuality(options: CheckOptions): Promise<QualityReport> {
  const deckPath = path.resolve(options.deckJsonPath);
  const pptxPath = path.resolve(options.pptxPath);
  const rootDir = path.dirname(deckPath);
  const deck = await readDeck(deckPath);
  const issues: QualityIssue[] = [];
  checkDeckLayoutCapacity(deck, issues);

  const pptxBuffer = await readRequiredFile(pptxPath, issues, "pptx_missing", "PPTX file does not exist or cannot be read.");
  if (!pptxBuffer) return makeReport(deckPath, pptxPath, deck.slides.length, 0, 0, 0, 0, 0, 0, issues);

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(pptxBuffer);
  } catch {
    issues.push({ severity: "error", code: "pptx_unreadable", message: "PPTX cannot be opened as a zip package." });
    return makeReport(deckPath, pptxPath, deck.slides.length, 0, 0, 0, 0, 0, 0, issues);
  }

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumberFromPath(a) - slideNumberFromPath(b));

  if (slideFiles.length !== deck.slides.length) {
    issues.push({
      severity: "error",
      code: "slide_count_mismatch",
      message: `Expected ${deck.slides.length} slides from deck JSON, found ${slideFiles.length} in PPTX.`,
    });
  }

  let transitionSlides = 0;
  let manualAdvanceSlides = 0;
  const placeholderPattern = /TODO|TBD|PLACEHOLDER|待补充|占位|lorem ipsum/i;
  const internalLeakPattern = /blueprint-swiss|BP0[1-9]|BP1[0-9]|BP2[0-2]|registeredLayout/i;

  for (const file of slideFiles) {
    const slideIndex = slideNumberFromPath(file);
    const xml = await zip.file(file)?.async("string");
    if (!xml) continue;
    if (xml.includes("<p:transition")) transitionSlides += 1;
    else issues.push({ severity: "warning", code: "missing_transition", message: "Slide has no transition metadata.", slide: slideIndex });

    if (xml.includes('advClick="1"')) manualAdvanceSlides += 1;
    else issues.push({ severity: "error", code: "manual_advance_missing", message: "Slide may not support manual click/keyboard advance.", slide: slideIndex });

    const visibleText = xml.replace(/<[^>]+>/g, " ");
    if (placeholderPattern.test(visibleText)) {
      issues.push({ severity: "error", code: "placeholder_text", message: "Slide appears to contain placeholder/TODO text.", slide: slideIndex });
    }
    if (internalLeakPattern.test(visibleText)) {
      issues.push({ severity: "warning", code: "internal_label_leak", message: "Slide text may contain internal theme/layout labels.", slide: slideIndex });
    }
  }

  const mediaNames = Object.keys(zip.files).filter((name) => /^ppt\/media\/.+/.test(name) && !name.endsWith("/"));
  const mediaFiles = mediaNames.length;
  const svgMediaFiles = mediaNames.filter((name) => name.toLowerCase().endsWith(".svg")).length;
  const referencedAssets = collectReferencedAssets(deck);
  for (const asset of referencedAssets) {
    const resolved = resolveAsset(deck, rootDir, asset);
    if (!(await exists(resolved))) {
      issues.push({ severity: "error", code: "asset_file_missing", message: `Referenced asset is missing: ${asset}` });
    }
  }
  if (referencedAssets.length > 0 && mediaFiles === 0) {
    issues.push({ severity: "error", code: "media_missing", message: "Deck references visual assets, but PPTX contains no media files." });
  }
  const route = await readVisualRoute(rootDir);
  if (route === "svg-native" && svgMediaFiles >= Math.max(1, Math.floor(deck.slides.length * 0.6))) {
    issues.push({
      severity: "error",
      code: "svg_native_not_converted",
      message: "visual-route is svg-native, but the PPTX still contains per-slide SVG media. Convert SVG pages to native PPT objects instead of embedding SVG/image layers as the final route.",
    });
  }

  if (options.assetManifestPath) await checkAssetManifest(path.resolve(options.assetManifestPath), issues);
  if (options.designLockPath) await checkJsonReadable(path.resolve(options.designLockPath), issues, "design_lock_unreadable", "design-lock.json cannot be read or parsed.");

  return makeReport(deckPath, pptxPath, deck.slides.length, slideFiles.length, transitionSlides, manualAdvanceSlides, mediaFiles, svgMediaFiles, referencedAssets.length, issues);
}

async function readVisualRoute(rootDir: string): Promise<string | undefined> {
  const candidates = [
    path.resolve(rootDir, "visual-route.json"),
    path.resolve(rootDir, "../04-design/visual-route.json"),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(await fs.readFile(candidate, "utf8")) as { route?: string };
      if (typeof parsed.route === "string") return parsed.route;
    } catch {
      // Legacy deck checks may not have route metadata.
    }
  }
  return undefined;
}

function checkDeckLayoutCapacity(deck: DeckSpec, issues: QualityIssue[]): void {
  deck.slides.forEach((slide, index) => {
    if (!("title" in slide)) return;
    const slideNumber = slide.slideNumber ?? index + 1;
    const titleLength = plainLength(slide.title);
    const subtitleLength = "subtitle" in slide ? plainLength(slide.subtitle) : 0;
    const isCover = "pageType" in slide && slide.pageType === "cover";
    if (!isCover && /\n/.test(slide.title)) {
      issues.push({
        severity: "error",
        code: "body_title_must_not_wrap",
        message: "Body slide title contains a line break. Rewrite it as one concise line and move detail into subtitle/body.",
        slide: slideNumber,
      });
    }
    if (!isCover && titleLength > 22) {
      issues.push({
        severity: "error",
        code: "title_capacity_exceeded",
        message: `Body slide title is too long for one-line rendering (${titleLength} chars). Rewrite it to 18-22 Chinese chars max and move explanation into subtitle/body.`,
        slide: slideNumber,
      });
    } else if (!isCover && titleLength > 18) {
      issues.push({
        severity: "warning",
        code: "title_near_capacity",
        message: `Body slide title is near one-line capacity (${titleLength} chars). Prefer <= 18 Chinese chars when possible.`,
        slide: slideNumber,
      });
    } else if (isCover && titleLength > 42) {
      issues.push({
        severity: "warning",
        code: "cover_title_near_capacity",
        message: `Cover title is long (${titleLength} chars). Cover may use two-line typography, but visual review is required.`,
        slide: slideNumber,
      });
    }
    if (subtitleLength > 72) {
      issues.push({
        severity: "warning",
        code: "subtitle_capacity_exceeded",
        message: `Subtitle is long (${subtitleLength} chars). Shorten it to avoid crowding the body area.`,
        slide: slideNumber,
      });
    }

    if ("visualStrategy" in slide && slide.visualStrategy) {
      checkVisualStrategyConsistency(slide, slideNumber, issues);
    }

    if (!("componentPlan" in slide) || !slide.componentPlan?.length) return;
    const primary = slide.componentPlan.find((component) => component.priority === "primary") ?? slide.componentPlan[0];
    const hasDiagramComponent = slide.componentPlan.some((component) => component.type === "mermaid-diagram" || component.type === "architecture-diagram");
    if (hasDiagramComponent && primary.type !== "mermaid-diagram" && primary.type !== "architecture-diagram") {
      issues.push({
        severity: "warning",
        code: "diagram_component_not_primary",
        message: "Slide includes a Mermaid/diagram component, but the current renderer only renders the primary component. Make the diagram primary, choose a diagram layout, or convert it into a native component.",
        slide: slideNumber,
      });
    }
    const capacity = componentCapacity(primary.type);
    if (!capacity) return;

    if (primary.content.length > capacity.maxItems) {
      issues.push({
        severity: "error",
        code: "component_item_capacity_exceeded",
        message: `${primary.type} supports up to ${capacity.maxItems} visible items in this renderer; got ${primary.content.length}.`,
        slide: slideNumber,
      });
    }
    primary.content.forEach((item, itemIndex) => {
      const itemTitleLength = plainLength(item.title);
      const itemBodyLength = plainLength(item.body);
      if (itemTitleLength > capacity.maxTitleChars) {
        issues.push({
          severity: "warning",
          code: "component_title_near_or_over_capacity",
          message: `${primary.type} item ${itemIndex + 1} title is ${itemTitleLength} chars; recommended max is ${capacity.maxTitleChars}.`,
          slide: slideNumber,
        });
      }
      if (itemBodyLength > capacity.maxBodyChars) {
        issues.push({
          severity: "warning",
          code: "component_body_near_or_over_capacity",
          message: `${primary.type} item ${itemIndex + 1} body is ${itemBodyLength} chars; recommended max is ${capacity.maxBodyChars}.`,
          slide: slideNumber,
        });
      }
    });
  });
}

function checkVisualStrategyConsistency(slide: DeckSpec["slides"][number], slideNumber: number, issues: QualityIssue[]): void {
  if (!("visualStrategy" in slide) || !slide.visualStrategy || !("layout" in slide) || slide.layout !== "teaching-toolkit") return;
  const strategy = slide.visualStrategy;
  const visualType = slide.visual?.type;
  const hasDiagram = Boolean(slide.componentPlan?.some((component) => component.type === "mermaid-diagram" || component.type === "architecture-diagram"));
  const primary = slide.componentPlan?.find((component) => component.priority === "primary") ?? slide.componentPlan?.[0];

  if (strategy.primaryVisualType === "ai-generated-image" && visualType !== "generated-image") {
    issues.push({
      severity: "warning",
      code: "visual_strategy_primary_mismatch",
      message: "visualStrategy selects AI image as primary, but deck visual.type is not generated-image.",
      slide: slideNumber,
    });
  }
  if (strategy.primaryVisualType === "mermaid-diagram" && !hasDiagram) {
    issues.push({
      severity: "error",
      code: "visual_strategy_mermaid_missing_component",
      message: "visualStrategy selects Mermaid as primary, but no Mermaid/diagram component is present in deck-builder input.",
      slide: slideNumber,
    });
  }
  if (strategy.primaryVisualType === "mermaid-diagram" && primary && primary.type !== "mermaid-diagram" && primary.type !== "architecture-diagram") {
    issues.push({
      severity: "warning",
      code: "visual_strategy_mermaid_not_primary",
      message: "visualStrategy selects Mermaid as primary, but the primary component is not a diagram component.",
      slide: slideNumber,
    });
  }
  if (strategy.primaryVisualType === "ppt-native-component" && !primary) {
    issues.push({
      severity: "warning",
      code: "visual_strategy_native_missing_component",
      message: "visualStrategy selects PPT-native component as primary, but no componentPlan is present.",
      slide: slideNumber,
    });
  }
  if (visualType === "generated-image" && strategy.aiImageUse?.use === false) {
    issues.push({
      severity: "error",
      code: "visual_strategy_conflict_ai_image",
      message: "Deck visual.type is generated-image, but visualStrategy.aiImageUse.use is false.",
      slide: slideNumber,
    });
  }
  if (hasDiagram && strategy.mermaidUse?.use === false) {
    issues.push({
      severity: "warning",
      code: "visual_strategy_conflict_mermaid",
      message: "Deck contains Mermaid/diagram component, but visualStrategy.mermaidUse.use is false.",
      slide: slideNumber,
    });
  }
}

function componentCapacity(type: string): { maxItems: number; maxTitleChars: number; maxBodyChars: number } | null {
  if (type === "icon-card") return { maxItems: 4, maxTitleChars: 18, maxBodyChars: 34 };
  if (type === "kpi-card" || type === "chart-native") return { maxItems: 4, maxTitleChars: 14, maxBodyChars: 28 };
  if (type === "process-flow" || type === "timeline") return { maxItems: 5, maxTitleChars: 8, maxBodyChars: 12 };
  if (type === "comparison-matrix") return { maxItems: 6, maxTitleChars: 16, maxBodyChars: 22 };
  if (type === "checklist") return { maxItems: 5, maxTitleChars: 22, maxBodyChars: 32 };
  if (type === "mermaid-diagram" || type === "architecture-diagram") return { maxItems: 5, maxTitleChars: 14, maxBodyChars: 24 };
  return null;
}

function plainLength(value: string | undefined): number {
  return (value ?? "").replace(/\s+/g, "").length;
}

export async function writeQualityReport(report: QualityReport, outPath: string): Promise<void> {
  const absoluteOut = path.resolve(outPath);
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true });
  await fs.writeFile(absoluteOut, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

async function readDeck(deckPath: string): Promise<DeckSpec> {
  const raw = JSON.parse(await fs.readFile(deckPath, "utf8")) as unknown;
  assertDeckSpec(raw);
  return raw;
}

async function readRequiredFile(filePath: string, issues: QualityIssue[], code: string, message: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch {
    issues.push({ severity: "error", code, message });
    return null;
  }
}

function makeReport(
  deckJson: string,
  pptx: string,
  expectedSlides: number,
  actualSlides: number,
  transitionSlides: number,
  manualAdvanceSlides: number,
  mediaFiles: number,
  svgMediaFiles: number,
  referencedAssetCount: number,
  issues: QualityIssue[],
): QualityReport {
  return {
    status: issues.some((issue) => issue.severity === "error") ? "fail" : "pass",
    deckJson,
    pptx,
    slideCount: { expected: expectedSlides, actual: actualSlides },
    checks: { transitionSlides, manualAdvanceSlides, mediaFiles, svgMediaFiles, referencedAssetCount },
    issues,
  };
}

function slideNumberFromPath(file: string): number {
  return Number(file.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
}

function collectReferencedAssets(deck: DeckSpec): string[] {
  const assets = new Set<string>();
  for (const slide of deck.slides) {
    if ("visual" in slide && slide.visual?.asset) assets.add(slide.visual.asset);
    if ("image" in slide && slide.image) assets.add(slide.image);
  }
  return [...assets];
}

function resolveAsset(deck: DeckSpec, rootDir: string, assetIdOrPath: string): string {
  const mapped = deck.assets?.[assetIdOrPath] ?? assetIdOrPath;
  return path.isAbsolute(mapped) ? mapped : path.resolve(rootDir, mapped);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkJsonReadable(filePath: string, issues: QualityIssue[], code: string, message: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as unknown;
  } catch {
    issues.push({ severity: "error", code, message });
    return null;
  }
}

async function checkAssetManifest(filePath: string, issues: QualityIssue[]): Promise<void> {
  const raw = await checkJsonReadable(filePath, issues, "asset_manifest_unreadable", "asset-manifest.json cannot be read or parsed.");
  if (!raw || typeof raw !== "object") return;
  const assets = (raw as { assets?: unknown }).assets;
  if (!Array.isArray(assets)) {
    issues.push({ severity: "warning", code: "asset_manifest_shape", message: "asset-manifest.json does not contain an assets array." });
    return;
  }
  for (const [index, asset] of assets.entries()) {
    if (!asset || typeof asset !== "object") continue;
    const status = String((asset as { status?: unknown }).status ?? "");
    const required = (asset as { required?: unknown }).required !== false;
    if (["missing", "pending", "placeholder"].includes(status)) {
      issues.push({
        severity: status === "placeholder" || !required ? "warning" : "error",
        code: "asset_not_ready",
        message: `Asset manifest item ${index + 1} is not delivery-ready: ${status}${required ? "" : " (optional)"}.`,
      });
    }
  }
}
