import fs from "node:fs";
import type { TeachingItem, TeachingToolkitSlide } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

function toneColor(ctx: RenderContext, item?: TeachingItem): string {
  const t = item?.tone ?? "blue";
  if (t === "green") return ctx.theme.green ?? "00A878";
  if (t === "yellow") return ctx.theme.yellow ?? "FFD23F";
  if (t === "red") return ctx.theme.red;
  if (t === "muted") return ctx.theme.muted;
  return ctx.theme.blue ?? ctx.theme.brown;
}

function isSwissMinimal(ctx: RenderContext): boolean {
  return ctx.themeId === "swiss-minimal";
}

function addSwissMotif(slide: PptxSlide, ctx: RenderContext): void {
  if (!isSwissMinimal(ctx)) return;
  return;
}

function addSwissIconMark(
  slide: PptxSlide,
  ctx: RenderContext,
  label: string,
  x: number,
  y: number,
  color: string,
  size = 0.38,
): void {
  if (!isSwissMinimal(ctx)) {
    addText(slide, ctx.theme, label, x, y, size, 0.18, { fontSize: 8.5, bold: true, color, margin: 0 });
    return;
  }
  addRect(slide, x, y, size, size, color);
  addText(slide, ctx.theme, label.slice(0, 2).toUpperCase(), x + 0.02, y + size * 0.32, size - 0.04, size * 0.22, {
    fontSize: 9.8,
    bold: true,
    color: ctx.theme.white,
    align: "center",
    valign: "mid",
    margin: 0,
  });
}

function addSwissBluePattern(slide: PptxSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const markColor = swissCoverPalette(ctx).pattern;
  for (let row = 0; row < 24; row += 1) {
    for (let col = 0; col < 42; col += 1) {
      if ((row + col) % 3 === 0 || (row > 4 && row < 18 && col > 10 && col < 30 && (row + col) % 2 === 0)) {
        const x = 0.08 + col * 0.32;
        const y = 0.08 + row * 0.30;
        addText(slide, theme, col % 5 === 0 ? "+" : "·", x, y, 0.08, 0.06, {
          fontSize: 5.5,
          color: markColor,
          transparency: row % 4 === 0 ? 45 : 62,
          margin: 0,
          align: "center",
        });
      }
    }
  }
  addRect(slide, 0.82, 6.92, 3.25, 0.01, markColor, { color: markColor, transparency: 45, width: 0.5 });
}

function swissCoverPalette(ctx: RenderContext): { bg: string; title: string; text: string; muted: string; pattern: string } {
  const variant = ctx.coverVariant ?? "cobalt-blue";
  if (variant === "electric-violet") return { bg: "4B19D8", title: "FFFFFF", text: "F2ECFF", muted: "D8CBFF", pattern: "C9B8FF" };
  if (variant === "emerald-black") return { bg: "003D35", title: "F7FFF9", text: "DDF8EE", muted: "B7E8D8", pattern: "76DDBE" };
  if (variant === "coral-red") return { bg: "D83A34", title: "FFFFFF", text: "FFF0EA", muted: "FFD0C3", pattern: "FFD7CA" };
  if (variant === "graphite-lime") return { bg: "151A1E", title: "F7FFE8", text: "E8F2D0", muted: "C9D8A4", pattern: "C6FF3D" };
  return { bg: ctx.theme.blue ?? "003BBF", title: "FFFFFF", text: "DCEAFF", muted: "BDD3FF", pattern: "7FB4FF" };
}

function addSwissHeader(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissMotif(slide, ctx);
  if (spec.eyebrow) {
    addText(slide, theme, spec.eyebrow.toUpperCase(), 0.72, 0.42, 3.4, 0.22, {
      fontSize: swiss ? 9.5 : 8.5,
      bold: true,
      color: theme.blue ?? theme.brown,
      charSpace: 1.1,
    });
  }
  addText(slide, theme, spec.title, 0.70, 0.74, swiss ? 9.35 : 8.25, swiss ? 0.86 : 0.72, {
    fontSize: swiss ? 33 : 28,
    bold: true,
    color: theme.ink,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) {
    addText(slide, theme, spec.subtitle, 0.72, swiss ? 1.65 : 1.50, swiss ? 7.9 : 6.8, 0.34, {
      fontSize: swiss ? 14.5 : 12.5,
      color: theme.muted,
      margin: 0,
    });
  }
}

function addSource(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.sourceNote) addText(slide, ctx.theme, spec.sourceNote, 0.72, 7.04, 8.8, 0.18, { fontSize: 7.5, color: ctx.theme.muted });
}

function addVisual(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, x: number, y: number, w: number, h: number): void {
  const { theme } = ctx;
  addRect(slide, x, y, w, h, theme.paper, { color: theme.line, width: 0.8 });
  if (spec.visual?.asset) {
    addImageCover(slide, ctx.resolveAsset(spec.visual.asset), x + 0.10, y + 0.10, w - 0.20, h - 0.42);
  } else {
    addRect(slide, x + 0.24, y + 0.28, w - 0.48, h - 0.72, theme.cold, { color: theme.line, width: 0.8 });
    addText(slide, theme, spec.visual?.caption ?? "Visual evidence\nscreenshot / result / diagram", x + 0.42, y + h / 2 - 0.32, w - 0.84, 0.55, {
      fontSize: 13,
      color: theme.muted,
      align: "center",
      valign: "mid",
    });
  }
  if (spec.visual?.caption) addText(slide, theme, spec.visual.caption, x + 0.12, y + h - 0.24, w - 0.24, 0.16, { fontSize: 7.5, color: theme.muted });
}

function addImageCover(slide: PptxSlide, path: string, x: number, y: number, w: number, h: number, transparency?: number): void {
  const natural = imageSizeForPptxSizing(path, w, h);
  slide.addImage({
    path,
    x,
    y,
    w: natural.w,
    h: natural.h,
    transparency,
    sizing: { type: "cover", w, h },
  });
}

function addImageContain(slide: PptxSlide, path: string, x: number, y: number, w: number, h: number, transparency?: number): void {
  const natural = imageSizeForPptxSizing(path, w, h);
  slide.addImage({
    path,
    x,
    y,
    w: natural.w,
    h: natural.h,
    transparency,
    sizing: { type: "contain", w, h },
  });
}

function imageSizeForPptxSizing(path: string, fallbackW: number, fallbackH: number): { w: number; h: number } {
  const size = readImagePixelSize(path);
  if (!size) return { w: fallbackW, h: fallbackH };
  const ratio = size.width / size.height;
  return ratio >= 1 ? { w: ratio, h: 1 } : { w: 1, h: 1 / ratio };
}

function readImagePixelSize(path: string): { width: number; height: number } | null {
  const data = fs.readFileSync(path);
  if (data.length >= 24 && data.toString("ascii", 1, 4) === "PNG") {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = data[offset + 1];
      const length = data.readUInt16BE(offset + 2);
      if (length < 2) return null;
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
        return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }
  return null;
}

function renderCover(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  if (ctx.themeId === "automotive-deep-blue") {
    slide.background = { color: theme.deep };
    addRect(slide, 0, 0, SLIDE_W, SLIDE_H, theme.deep);
    if (spec.visual?.asset) {
      addImageCover(slide, ctx.resolveAsset(spec.visual.asset), 5.52, 0, 7.82, 7.5, 8);
      addRect(slide, 5.48, 0, 7.86, 7.5, "020814", { color: "020814", transparency: 46 });
    }
    addRect(slide, 0.72, 0.72, 0.06, 5.92, theme.yellow ?? theme.brown);
    addText(slide, theme, spec.eyebrow ?? "AUTOMOTIVE PRODUCT TALK", 1.02, 0.86, 5.1, 0.22, {
      fontSize: 8.5,
      bold: true,
      color: theme.yellow ?? theme.brown,
      charSpace: 1.2,
    });
    addText(slide, theme, spec.title, 1.00, 1.42, 6.25, 1.50, {
      fontSize: 43,
      bold: true,
      color: theme.white,
      fit: "shrink",
      margin: 0,
    });
    if (spec.subtitle) addText(slide, theme, spec.subtitle, 1.04, 3.14, 5.4, 0.36, { fontSize: 15, color: "D7E2F4", margin: 0 });
    if (spec.body) addText(slide, theme, spec.body, 1.04, 3.76, 5.7, 0.30, { fontSize: 11.5, color: theme.muted, margin: 0 });
    addRect(slide, 1.04, 6.25, 3.7, 0.04, theme.yellow ?? theme.brown);
    addText(slide, theme, "Xiaomi EV | User Meetup", 1.04, 6.46, 4.8, 0.18, { fontSize: 9, color: theme.muted, margin: 0 });
    return;
  }
  if (ctx.themeId === "swiss-minimal") {
    const palette = swissCoverPalette(ctx);
    const titleLines = spec.title.includes("：") ? spec.title.replace("：", "\n") : spec.title;
    slide.background = { color: palette.bg };
    addRect(slide, 0, 0, SLIDE_W, SLIDE_H, palette.bg);
    addSwissBluePattern(slide, ctx);
    addText(slide, theme, spec.eyebrow ?? "MANIFESTO", 0.86, 1.18, 4.8, 0.20, {
      fontSize: 8.5,
      bold: true,
      color: palette.text,
      charSpace: 1.2,
    });
    addText(slide, theme, titleLines, 0.82, 1.56, 8.9, 2.38, {
      fontSize: 58,
      bold: false,
      color: palette.title,
      fit: "shrink",
      margin: 0,
      breakLine: false,
    });
    if (spec.subtitle) addText(slide, theme, spec.subtitle, 0.86, 5.52, 7.1, 0.34, { fontSize: 15, color: palette.text, margin: 0 });
    if (spec.body) addText(slide, theme, spec.body, 0.86, 6.00, 7.8, 0.28, { fontSize: 11.5, color: palette.muted, margin: 0 });
    addText(slide, theme, `SWISS MINIMAL · ${String(ctx.coverVariant ?? "cobalt-blue").toUpperCase()}`, 0.86, 7.08, 3.5, 0.12, { fontSize: 6.5, color: palette.muted, charSpace: 1.0, margin: 0 });
    return;
  }
  slide.background = { color: theme.deep };
  addRect(slide, 0, 0, SLIDE_W, SLIDE_H, theme.deep);
  addRect(slide, 0.68, 0.58, 0.08, 6.30, theme.blue ?? theme.brown);
  addRect(slide, 0.68, 6.62, 4.45, 0.06, theme.blue ?? theme.brown);
  addText(slide, theme, spec.eyebrow ?? "AI PRODUCT TUTORIAL", 0.98, 0.76, 4.5, 0.22, {
    fontSize: 8.5,
    bold: true,
    color: theme.yellow ?? "FFD23F",
    charSpace: 1.2,
  });
  addText(slide, theme, spec.title, 0.96, 1.18, 10.7, 1.70, {
    fontSize: 50,
    bold: true,
    color: theme.white,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) addText(slide, theme, spec.subtitle, 1.00, 3.10, 7.4, 0.36, { fontSize: 15, color: "CFD8EA", margin: 0 });
  if (spec.body) addText(slide, theme, spec.body, 1.00, 3.76, 7.8, 0.30, { fontSize: 12.5, color: "F3F6FF", margin: 0 });
  addText(slide, theme, "Speaker / Date / Session", 1.00, 6.36, 4.6, 0.18, { fontSize: 9.5, color: "98A7C2", margin: 0 });

  if (spec.visual?.asset) {
    addRect(slide, 8.02, 0.72, 4.42, 5.86, "0B1228");
    addImageCover(slide, ctx.resolveAsset(spec.visual.asset), 8.18, 0.90, 4.10, 5.36);
    if (spec.visual.caption) addText(slide, theme, spec.visual.caption, 8.18, 6.40, 4.1, 0.18, { fontSize: 7.5, color: "AAB7CF" });
  }
}

function renderSection(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  slide.background = { color: theme.deep };
  addRect(slide, 0, 0, SLIDE_W, SLIDE_H, theme.deep);
  addText(slide, theme, spec.eyebrow ?? "SECTION", 0.88, 0.84, 2.4, 0.20, { fontSize: 8.5, bold: true, color: theme.yellow ?? "FFD23F", charSpace: 1.1 });
  addText(slide, theme, spec.title, 0.86, 2.18, 8.6, 0.92, { fontSize: 42, bold: true, color: theme.white, margin: 0 });
  if (spec.subtitle ?? spec.body) addText(slide, theme, spec.subtitle ?? spec.body ?? "", 0.90, 3.44, 6.8, 0.38, { fontSize: 15, color: "C8D2E8", margin: 0 });
  addRect(slide, 0.90, 5.92, 4.0, 0.06, theme.blue ?? theme.brown);
}

function renderConcept(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  const yOffset = 0;
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 3);
  addRect(slide, 0.80, (swiss ? 2.28 : 2.18) + yOffset, 4.7, swiss ? 3.95 : 3.75, theme.deep);
  if (swiss) {
    addRect(slide, 1.10, 2.58 + yOffset, 0.62, 0.62, theme.blue ?? theme.brown);
    addRect(slide, 1.84, 2.58 + yOffset, 0.62, 0.62, theme.white, { color: theme.white, width: 0.8 });
    addRect(slide, 2.58, 2.58 + yOffset, 0.62, 0.62, theme.yellow ?? theme.brown);
  }
  addText(slide, theme, spec.body ?? spec.subtitle ?? "", 1.12, (swiss ? 3.54 : 2.66) + yOffset, 3.9, swiss ? 1.62 : 1.55, {
    fontSize: swiss ? 26 : 24,
    bold: true,
    color: theme.white,
    fit: "shrink",
    margin: 0,
  });
  addRect(slide, 1.14, (swiss ? 5.72 : 5.23) + yOffset, 1.72, 0.07, theme.blue ?? theme.brown);
  items.forEach((item, i) => {
    const y = (swiss ? 2.28 : 2.16) + yOffset + i * (swiss ? 1.25 : 1.18);
    const color = toneColor(ctx, item);
    addSwissIconMark(slide, ctx, item.label ?? `0${i + 1}`, 6.02, y, color, swiss ? 0.42 : 0.36);
    addText(slide, theme, item.title, 6.68, y - 0.02, 4.9, 0.38, { fontSize: swiss ? 19 : 17, bold: true, color: theme.ink, margin: 0 });
    if (item.body) addText(slide, theme, item.body, 6.68, y + 0.46, 4.95, 0.44, { fontSize: swiss ? 13.5 : 11.5, color: theme.muted, margin: 0 });
  });
  addSource(slide, spec, ctx);
}

function renderFlow(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 6);
  const count = Math.max(items.length, 1);
  const w = swiss ? Math.min(2.05, 10.9 / count) : Math.min(1.85, 10.8 / count);
  const gap = count > 1 ? ((swiss ? 10.9 : 10.8) - count * w) / (count - 1) : 0;
  items.forEach((item, i) => {
    const x = 0.88 + i * (w + gap);
    const color = toneColor(ctx, item);
    if (swiss) addRect(slide, x - 0.10, 2.36, w + 0.20, 3.12, theme.paper, { color: theme.line, width: 0.8 });
    addText(slide, theme, String(i + 1).padStart(2, "0"), x, swiss ? 2.62 : 2.32, w, 0.30, { fontSize: swiss ? 17 : 13, bold: true, color, margin: 0 });
    addRect(slide, x, swiss ? 3.16 : 2.92, w, swiss ? 0.10 : 0.08, color);
    addText(slide, theme, item.title, x, swiss ? 3.52 : 3.28, w, 0.48, { fontSize: swiss ? 17 : 15, bold: true, color: theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, theme, item.body, x, swiss ? 4.26 : 4.02, w, swiss ? 0.88 : 0.86, { fontSize: swiss ? 12.5 : 10.5, color: theme.muted, fit: "shrink", margin: 0 });
  });
  if (spec.prompt) {
    addRect(slide, 0.88, swiss ? 6.10 : 6.18, 11.05, swiss ? 0.52 : 0.42, theme.warm, { color: theme.line, width: 0.8 });
    addText(slide, theme, spec.prompt, 1.06, swiss ? 6.25 : 6.30, 10.7, 0.18, { fontSize: swiss ? 12.5 : 10.5, color: theme.ink, align: "center", margin: 0 });
  }
  addSource(slide, spec, ctx);
}

function renderDemo(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addSwissHeader(slide, spec, ctx);
  addRect(slide, 0.82, 2.08, 4.45, 4.15, theme.paper, { color: theme.line, width: 0.8 });
  addText(slide, theme, "INPUT / PROMPT", 1.05, 2.34, 1.6, 0.18, { fontSize: 8, bold: true, color: theme.blue ?? theme.brown, charSpace: 0.8 });
  addText(slide, theme, spec.body ?? spec.prompt ?? "", 1.05, 2.78, 3.95, 2.55, { fontSize: 12.5, color: theme.ink, fit: "shrink", margin: 0.03 });
  if (spec.prompt && spec.body) addText(slide, theme, spec.prompt, 1.05, 5.56, 3.95, 0.34, { fontSize: 9.5, color: theme.muted, fit: "shrink", margin: 0 });
  addVisual(slide, spec, ctx, 5.70, 2.08, 6.76, 4.15);
  addSource(slide, spec, ctx);
}

function renderComparison(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 2);
  const labels = ["BEFORE", "AFTER"];
  items.forEach((item, i) => {
    const x = i === 0 ? 0.84 : 6.82;
    const color = i === 0 ? theme.red : theme.green ?? "00A878";
    addRect(slide, x, 2.10, 5.58, 3.92, theme.paper, { color: theme.line, width: 0.8 });
    if (swiss) addSwissIconMark(slide, ctx, item.label ?? labels[i], x + 0.30, 2.36, color, 0.42);
    else addText(slide, theme, item.label ?? labels[i], x + 0.28, 2.38, 1.25, 0.18, { fontSize: 8, bold: true, color, charSpace: 0.8 });
    addText(slide, theme, item.title, x + 0.28, swiss ? 3.02 : 2.84, 4.85, 0.50, { fontSize: swiss ? 22 : 18, bold: true, color: theme.ink, margin: 0 });
    if (item.body) addText(slide, theme, item.body, x + 0.28, swiss ? 3.82 : 3.56, 4.85, 1.50, { fontSize: swiss ? 14 : 12, color: theme.muted, fit: "shrink", margin: 0 });
    addRect(slide, x + 0.28, 5.48, 1.36, 0.06, color);
  });
  addSource(slide, spec, ctx);
}

function renderChecklist(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 6);
  items.forEach((item, i) => {
    const y = (swiss ? 2.55 : 2.08) + i * (swiss ? 0.76 : 0.66);
    const color = toneColor(ctx, item);
    if (swiss) {
      addRect(slide, 0.90, y - 0.12, 11.18, 0.62, i % 2 === 0 ? theme.paper : theme.cold, { color: theme.line, width: 0.3, transparency: 0 });
      addSwissIconMark(slide, ctx, String(i + 1).padStart(2, "0"), 1.06, y - 0.02, color, 0.34);
    } else {
      addText(slide, theme, String(i + 1).padStart(2, "0"), 1.02, y, 0.36, 0.22, { fontSize: 9.5, bold: true, color, margin: 0 });
    }
    addText(slide, theme, item.title, swiss ? 1.64 : 1.62, y - 0.04, swiss ? 3.75 : 3.4, 0.34, { fontSize: swiss ? 16.5 : 14.5, bold: true, color: theme.ink, margin: 0 });
    if (item.body) addText(slide, theme, item.body, swiss ? 5.42 : 5.24, y - 0.02, swiss ? 5.95 : 5.95, 0.34, { fontSize: swiss ? 13 : 11.5, color: theme.muted, fit: "shrink", margin: 0 });
  });
  if (spec.prompt) {
    addRect(slide, 1.02, swiss ? 6.42 : 6.32, 10.95, swiss ? 0.44 : 0.38, theme.deep);
    addText(slide, theme, spec.prompt, 1.22, swiss ? 6.55 : 6.43, 10.5, 0.15, { fontSize: swiss ? 11.5 : 10, color: theme.white, align: "center", margin: 0 });
  }
  addSource(slide, spec, ctx);
}

function renderBigNumber(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 3);
  items.forEach((item, i) => {
    const x = 0.88 + i * 3.85;
    const color = toneColor(ctx, item);
    addText(slide, theme, item.label ?? item.title, x, swiss ? 2.82 : 3.15, 3.2, 0.78, {
      fontSize: swiss ? 42 : 34,
      bold: true,
      color,
      fit: "shrink",
      margin: 0,
    });
    addText(slide, theme, item.title, x, swiss ? 3.86 : 4.16, 3.25, 0.38, {
      fontSize: swiss ? 18 : 16,
      bold: true,
      color: theme.ink,
      fit: "shrink",
      margin: 0,
    });
    if (item.body) addText(slide, theme, item.body, x, swiss ? 4.48 : 4.78, 3.18, 0.72, { fontSize: swiss ? 13 : 11.5, color: theme.muted, fit: "shrink", margin: 0 });
    addRect(slide, x, swiss ? 5.52 : 5.80, 2.1, 0.08, color);
  });
  if (spec.prompt) {
    addRect(slide, 0.88, 6.36, 11.1, 0.40, theme.deep);
    addText(slide, theme, spec.prompt, 1.08, 6.48, 10.7, 0.14, { fontSize: 11, color: theme.white, align: "center", margin: 0 });
  }
  addSource(slide, spec, ctx);
}

function renderSwissImageHero(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addSwissHeader(slide, spec, ctx);
  const hasAsset = Boolean(spec.visual?.asset);
  const heroY = 2.08;
  const heroH = 3.20;
  if (hasAsset) {
    addRect(slide, 0.74, heroY, 11.86, heroH, theme.deep);
    addImageCover(slide, ctx.resolveAsset(spec.visual?.asset ?? ""), 0.74, heroY, 11.86, heroH);
  } else {
    addRect(slide, 0.74, heroY, 11.86, heroH, theme.deep);
    addText(slide, theme, spec.body ?? spec.subtitle ?? "", 1.06, 2.86, 10.8, 0.80, { fontSize: 30, bold: true, color: theme.white, align: "center", valign: "mid", margin: 0 });
  }
  const items = (spec.items ?? []).slice(0, 3);
  items.forEach((item, i) => {
    const x = 0.74 + i * 4.06;
    const color = toneColor(ctx, item);
    addRect(slide, x, 5.78, 3.68, 0.78, theme.paper, { color: theme.line, width: 0.4 });
    addSwissIconMark(slide, ctx, item.label ?? `0${i + 1}`, x + 0.16, 5.98, color, 0.34);
    addText(slide, theme, item.title, x + 0.62, 5.92, 2.74, 0.24, { fontSize: 12.5, bold: true, color: theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, theme, item.body, x + 0.62, 6.26, 2.82, 0.20, { fontSize: 9.5, color: theme.muted, fit: "shrink", margin: 0 });
  });
  addSource(slide, spec, ctx);
}

function renderCards(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  const swiss = isSwissMinimal(ctx);
  addSwissHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  const count = Math.max(items.length, 1);
  const w = count <= 3 ? (swiss ? 3.62 : 3.45) : 2.62;
  const gap = 0.36;
  const startX = (SLIDE_W - count * w - (count - 1) * gap) / 2;
  items.forEach((item, i) => {
    const x = startX + i * (w + gap);
    const color = toneColor(ctx, item);
    if (swiss) addRect(slide, x - 0.10, 2.20, w + 0.20, 3.40, theme.paper, { color: theme.line, width: 0.8 });
    if (swiss) addSwissIconMark(slide, ctx, item.label ?? `0${i + 1}`, x + 0.10, 2.48, color, 0.44);
    else addText(slide, theme, item.label ?? `0${i + 1}`, x, 2.24, w, 0.18, { fontSize: 8.5, bold: true, color, charSpace: 0.8, margin: 0 });
    addRect(slide, x + (swiss ? 0.10 : 0), swiss ? 3.18 : 2.64, swiss ? w - 0.20 : w, swiss ? 0.10 : 0.08, color);
    addText(slide, theme, item.title, x + (swiss ? 0.10 : 0), swiss ? 3.54 : 3.04, swiss ? w - 0.20 : w, 0.54, { fontSize: swiss ? 21 : 18, bold: true, color: theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, theme, item.body, x + (swiss ? 0.10 : 0), swiss ? 4.34 : 3.84, swiss ? w - 0.24 : w, 0.92, { fontSize: swiss ? 13.5 : 11.5, color: theme.muted, fit: "shrink", margin: 0 });
  });
  if (spec.body && items.length === 0) addText(slide, theme, spec.body, 0.92, 2.42, 7.4, 1.4, { fontSize: swiss ? 24 : 20, bold: true, color: theme.ink, fit: "shrink", margin: 0 });
  addSource(slide, spec, ctx);
}

export function renderAiProductSwiss(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, index: number): void {
  slide.background = { color: ctx.theme.bg };
  if (isSwissMinimal(ctx) && spec.registeredLayout) {
    if (spec.registeredLayout === "SM01") renderCover(slide, spec, ctx);
    else if (spec.registeredLayout === "SM02") renderSection(slide, spec, ctx);
    else if (spec.registeredLayout === "SM03") renderConcept(slide, spec, ctx);
    else if (spec.registeredLayout === "SM04") renderChecklist(slide, spec, ctx);
    else if (spec.registeredLayout === "SM05" || spec.registeredLayout === "SM06") renderCards(slide, spec, ctx);
    else if (spec.registeredLayout === "SM07") renderFlow(slide, spec, ctx);
    else if (spec.registeredLayout === "SM08") renderComparison(slide, spec, ctx);
    else if (spec.registeredLayout === "SM09") renderBigNumber(slide, spec, ctx);
    else if (spec.registeredLayout === "SM10") renderSwissImageHero(slide, spec, ctx);
    else renderCards(slide, spec, ctx);
    if (spec.registeredLayout !== "SM01") slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
    return;
  }

  if (spec.pageType === "cover") renderCover(slide, spec, ctx);
  else if (spec.pageType === "section-divider") renderSection(slide, spec, ctx);
  else if (["concept-explain", "capability-map"].includes(spec.pageType)) renderConcept(slide, spec, ctx);
  else if (["step-flow", "prompt-template"].includes(spec.pageType)) renderFlow(slide, spec, ctx);
  else if (["live-demo", "screenshot-callout"].includes(spec.pageType)) renderDemo(slide, spec, ctx);
  else if (["before-after", "problem-example", "comparison"].includes(spec.pageType)) renderComparison(slide, spec, ctx);
  else if (["checklist", "risk-warning", "summary", "qa-closing", "practice-task"].includes(spec.pageType)) renderChecklist(slide, spec, ctx);
  else renderCards(slide, spec, ctx);
  if (spec.pageType !== "cover") slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
}
