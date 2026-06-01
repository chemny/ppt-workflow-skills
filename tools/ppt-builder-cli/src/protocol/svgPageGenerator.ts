import fs from "node:fs/promises";
import path from "node:path";
import type { VisualLock, VisualPagePlan } from "./visualRoute.js";

export interface SvgPageGenerationResult {
  svgDir: string;
  files: Array<{ slideNumber: number; file: string; role: string }>;
}

export async function writeSvgPages(outDir: string, visualLock: VisualLock, visualPagePlan: VisualPagePlan): Promise<SvgPageGenerationResult> {
  return writeSvgPagesToBuildDir(path.join(outDir, "05-build"), visualLock, visualPagePlan);
}

export async function writeSvgPagesToBuildDir(buildDir: string, visualLock: VisualLock, visualPagePlan: VisualPagePlan): Promise<SvgPageGenerationResult> {
  const svgDir = path.join(buildDir, "svg-pages");
  await fs.mkdir(svgDir, { recursive: true });
  const files: SvgPageGenerationResult["files"] = [];

  for (const slide of visualPagePlan.slides) {
    if (visualPagePlan.route === "template-native" || !slide.svgRole || slide.svgRole === "none") continue;
    const file = path.join(svgDir, `slide-${String(slide.slideNumber).padStart(2, "0")}.svg`);
    await fs.writeFile(file, renderSvgPage(slide, visualLock), "utf8");
    files.push({ slideNumber: slide.slideNumber, file, role: slide.svgRole });
  }

  return { svgDir, files };
}

function renderSvgPage(slide: VisualPagePlan["slides"][number], lock: VisualLock): string {
  const c = normalizedColors(lock.colors);
  const rhythm = slide.pageRhythm;
  const role = slide.svgRole;
  const elements: string[] = [];

  // Transparent background keeps the SVG usable as a safe visual layer in
  // PPTGenJS while still satisfying the explicit background-rect requirement.
  // Critical slide text is kept in PPT-native objects, so SVG motifs must stay
  // sparse and avoid the main title/body zones.
  elements.push(`<rect width="1280" height="720" fill="${c.background}" fill-opacity="0"/>`);

  if (rhythm === "anchor") {
    elements.push(dotMatrix(760, 60, 24, 12, c.accent, 0.22));
    elements.push(`<rect x="72" y="620" width="300" height="3" fill="${c.accent}"/>`);
    elements.push(`<rect x="72" y="638" width="118" height="2" fill="${c.line}" opacity="0.7"/>`);
    elements.push(`<circle cx="1130" cy="122" r="58" fill="${c.accent2}" opacity="0.10"/>`);
  } else if (rhythm === "breathing") {
    elements.push(`<path d="M930 92 C1060 122 1138 214 1156 350 C1175 494 1088 612 952 648" fill="none" stroke="${c.accent}" stroke-width="3" opacity="0.18"/>`);
    elements.push(`<rect x="72" y="584" width="140" height="5" fill="${c.accent}"/>`);
    elements.push(dotMatrix(90, 510, 18, 7, c.muted, 0.14));
  } else {
    elements.push(`<line x1="72" y1="196" x2="1208" y2="196" stroke="${c.line}" stroke-width="1" opacity="0.65"/>`);
    elements.push(`<rect x="72" y="650" width="220" height="4" fill="${c.accent}"/>`);
    elements.push(`<rect x="1052" y="72" width="84" height="8" fill="${c.accent}"/>`);
    elements.push(`<rect x="1136" y="72" width="42" height="18" fill="${c.accent}" opacity="0.95"/>`);
    elements.push(dotMatrix(940, 238, 16, 8, c.accent, 0.10));
  }

  if (role.includes("diagram") || role.includes("connector")) {
    elements.push(diagramMotif(c));
  } else if (role.includes("component") || role.includes("frame")) {
    elements.push(frameMotif(c));
  } else if (role.includes("image")) {
    elements.push(imageFrameMotif(c));
  }

  const comment = `<!-- slide:${slide.slideNumber}; role:${xml(slide.svgRole)}; rhythm:${slide.pageRhythm}; critical text remains PPT-native -->`;
  return [
    `<svg width="${lock.canvas.width}" height="${lock.canvas.height}" viewBox="${xml(lock.canvas.viewBox)}" xmlns="http://www.w3.org/2000/svg">`,
    comment,
    ...elements,
    `</svg>`,
    "",
  ].join("\n");
}

function normalizedColors(colors: VisualLock["colors"]): Record<string, string> {
  return {
    background: hex(colors.background, "#FAFAF8"),
    surface: hex(colors.surface, "#FFFFFF"),
    text: hex(colors.text, "#0A0A0A"),
    muted: hex(colors.muted, "#737373"),
    line: hex(colors.line, "#D4D4D2"),
    accent: hex(colors.accent, "#002FA7"),
    accent2: hex(colors.accent2, "#00A676"),
    accent3: hex(colors.accent3, "#FFD100"),
  };
}

function hex(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const raw = value.startsWith("#") ? value : `#${value}`;
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw.toUpperCase() : fallback;
}

function dotMatrix(x: number, y: number, cols: number, rows: number, color: string, opacity: number): string {
  const dots: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      dots.push(`<circle cx="${x + col * 14}" cy="${y + row * 14}" r="1.45" fill="${color}" opacity="${opacity}"/>`);
    }
  }
  return `<g>${dots.join("")}</g>`;
}

function diagramMotif(c: Record<string, string>): string {
  return [
    `<g opacity="0.95">`,
    `<rect x="836" y="292" width="112" height="48" fill="${c.surface}" stroke="${c.accent}" stroke-width="2"/>`,
    `<rect x="1010" y="218" width="112" height="48" fill="${c.surface}" stroke="${c.accent2}" stroke-width="2"/>`,
    `<rect x="1010" y="366" width="112" height="48" fill="${c.surface}" stroke="${c.accent3}" stroke-width="2"/>`,
    `<path d="M948 316 L1010 242" fill="none" stroke="${c.accent}" stroke-width="2"/>`,
    `<path d="M948 316 L1010 390" fill="none" stroke="${c.accent}" stroke-width="2"/>`,
    `</g>`,
  ].join("");
}

function frameMotif(c: Record<string, string>): string {
  return [
    `<g opacity="0.9">`,
    `<rect x="74" y="224" width="245" height="305" fill="none" stroke="${c.line}" stroke-width="1.2"/>`,
    `<rect x="86" y="242" width="54" height="8" fill="${c.accent}"/>`,
    `<rect x="357" y="224" width="245" height="305" fill="none" stroke="${c.line}" stroke-width="1.2"/>`,
    `<rect x="369" y="242" width="54" height="8" fill="${c.accent2}"/>`,
    `<rect x="640" y="224" width="245" height="305" fill="none" stroke="${c.line}" stroke-width="1.2"/>`,
    `<rect x="652" y="242" width="54" height="8" fill="${c.accent3}"/>`,
    `</g>`,
  ].join("");
}

function imageFrameMotif(c: Record<string, string>): string {
  return [
    `<g opacity="0.88">`,
    `<rect x="660" y="198" width="492" height="310" fill="none" stroke="${c.accent}" stroke-width="2"/>`,
    `<rect x="682" y="220" width="78" height="6" fill="${c.accent}"/>`,
    `<rect x="682" y="486" width="196" height="4" fill="${c.line}"/>`,
    `</g>`,
  ].join("");
}

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
