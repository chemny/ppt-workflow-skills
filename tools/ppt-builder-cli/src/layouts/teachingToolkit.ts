import type { TeachingItem, TeachingToolkitSlide } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

function toneColor(ctx: RenderContext, item?: TeachingItem): string {
  const t = item?.tone ?? "blue";
  if (t === "green") return ctx.theme.green ?? "16A36B";
  if (t === "yellow") return ctx.theme.yellow ?? "F6B73C";
  if (t === "red") return ctx.theme.red;
  if (t === "muted") return ctx.theme.muted;
  return ctx.theme.blue ?? ctx.theme.brown;
}

function addHeader(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  if (spec.eyebrow) {
    addText(slide, theme, spec.eyebrow, 0.70, 0.34, 4.2, 0.24, {
      fontSize: 10,
      bold: true,
      color: theme.blue ?? theme.brown,
      charSpace: 0.8,
    });
  }
  addText(slide, theme, spec.title, 0.68, 0.70, 8.7, 0.72, {
    fontSize: spec.pageType === "cover" ? 30 : 25,
    bold: true,
    color: theme.ink,
    breakLine: false,
    fit: "shrink",
  });
  if (spec.subtitle) addText(slide, theme, spec.subtitle, 0.72, 1.45, 8.3, 0.35, { fontSize: 14, color: theme.muted });
}

function addSource(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.sourceNote) addText(slide, ctx.theme, spec.sourceNote, 0.72, 6.95, 8.6, 0.22, { fontSize: 8, color: ctx.theme.muted });
}

function addVisualFrame(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, x: number, y: number, w: number, h: number): void {
  const { theme } = ctx;
  addRect(slide, x, y, w, h, theme.paper, { color: theme.line, width: 1 });
  addRect(slide, x, y, w, 0.26, theme.warm);
  if (spec.visual?.asset) {
    slide.addImage({ path: ctx.resolveAsset(spec.visual.asset), x: x + 0.14, y: y + 0.40, w: w - 0.28, h: h - 0.85 });
  } else {
    addRect(slide, x + 0.28, y + 0.58, w - 0.56, h - 1.1, "EEF4FF", { color: "C9D8FF", width: 1 });
    addText(slide, theme, spec.visual?.caption ?? "视觉素材占位\n请替换为截图或生成图", x + 0.55, y + h / 2 - 0.25, w - 1.1, 0.6, {
      fontSize: 16,
      color: theme.muted,
      align: "center",
      valign: "mid",
    });
  }
  if (spec.visual?.caption) addText(slide, theme, spec.visual.caption, x + 0.18, y + h - 0.35, w - 0.36, 0.22, { fontSize: 9, color: theme.muted });
}

function renderCover(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addRect(slide, 0, 0, SLIDE_W, SLIDE_H, theme.bg);
  addRect(slide, 0, 0, SLIDE_W, SLIDE_H, theme.deep);
  addRect(slide, 0.0, 0.0, 0.16, SLIDE_H, theme.blue ?? theme.brown);
  addRect(slide, 8.22, 0.0, 5.12, SLIDE_H, "101A33");
  addText(slide, theme, spec.eyebrow ?? "AI PRODUCT TUTORIAL", 0.76, 0.64, 4.4, 0.24, {
    fontSize: 10,
    bold: true,
    color: theme.yellow ?? "FFD23F",
    charSpace: 1.2,
  });
  addText(slide, theme, spec.title, 0.74, 1.18, 6.85, 1.28, {
    fontSize: 41,
    bold: true,
    color: theme.white,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) addText(slide, theme, spec.subtitle, 0.80, 2.84, 6.3, 0.38, { fontSize: 16, color: "C8D2E8" });
  if (spec.body) addText(slide, theme, spec.body, 0.82, 3.46, 5.8, 0.60, { fontSize: 13, color: "E5EAF5" });
  addRect(slide, 0.78, 6.25, 6.3, 0.02, theme.blue ?? theme.brown);
  addText(slide, theme, "分享人：待补充    时间 / 场景：待补充", 0.80, 6.46, 5.8, 0.24, { fontSize: 11, color: "AAB7CF" });
  addVisualFrame(slide, spec, ctx, 8.55, 0.78, 4.25, 5.85);
}

function renderCards(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  const count = Math.max(items.length, 1);
  const w = count <= 3 ? 3.45 : 2.65;
  const gap = 0.32;
  const startX = (SLIDE_W - count * w - (count - 1) * gap) / 2;
  items.forEach((item, i) => {
    const x = startX + i * (w + gap);
    const color = toneColor(ctx, item);
    addRect(slide, x, 2.15, w, 3.25, theme.paper, { color: theme.line, width: 1 });
    addRect(slide, x, 2.15, w, 0.12, color);
    if (item.label) addText(slide, theme, item.label, x + 0.22, 2.52, w - 0.44, 0.24, { fontSize: 10, bold: true, color });
    addText(slide, theme, item.title, x + 0.22, 2.90, w - 0.44, 0.48, { fontSize: 18, bold: true, color: theme.ink });
    if (item.body) addText(slide, theme, item.body, x + 0.22, 3.62, w - 0.44, 1.12, { fontSize: 13, color: theme.ink });
  });
  if (spec.prompt) {
    addRect(slide, 1.05, 5.88, 11.2, 0.55, "EAF1FF", { color: "C9D8FF", width: 1 });
    addText(slide, theme, spec.prompt, 1.26, 6.04, 10.8, 0.24, { fontSize: 13, color: theme.ink, align: "center" });
  }
  addSource(slide, spec, ctx);
}

function renderDemo(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addHeader(slide, spec, ctx);
  addRect(slide, 0.78, 2.08, 5.15, 3.95, theme.paper, { color: theme.line, width: 1 });
  addRect(slide, 0.78, 2.08, 5.15, 0.34, "EAF1FF");
  addText(slide, theme, "提示词 / 操作步骤", 1.02, 2.18, 2.2, 0.20, { fontSize: 10, bold: true, color: theme.blue ?? theme.brown });
  addText(slide, theme, spec.body ?? spec.prompt ?? "", 1.02, 2.70, 4.62, 2.65, { fontSize: 14, color: theme.ink, breakLine: false, fit: "shrink" });
  addVisualFrame(slide, spec, ctx, 6.42, 2.08, 5.95, 3.95);
  if (spec.items?.length) {
    spec.items.slice(0, 3).forEach((item, i) => {
      const x = 1.05 + i * 3.65;
      addText(slide, theme, `${i + 1}. ${item.title}`, x, 6.25, 3.15, 0.24, { fontSize: 11, bold: true, color: toneColor(ctx, item) });
    });
  }
  addSource(slide, spec, ctx);
}

function renderChecklist(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const { theme } = ctx;
  addHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 6);
  items.forEach((item, i) => {
    const y = 2.05 + i * 0.68;
    const color = toneColor(ctx, item);
    addRect(slide, 1.05, y, 0.26, 0.26, color);
    addText(slide, theme, item.title, 1.55, y - 0.03, 3.0, 0.32, { fontSize: 15, bold: true, color: theme.ink });
    if (item.body) addText(slide, theme, item.body, 4.52, y - 0.02, 6.8, 0.30, { fontSize: 13, color: theme.muted });
  });
  if (spec.prompt) {
    addRect(slide, 1.05, 6.16, 10.9, 0.48, theme.warm, { color: "C9D8FF", width: 1 });
    addText(slide, theme, spec.prompt, 1.25, 6.30, 10.4, 0.22, { fontSize: 12, align: "center" });
  }
  addSource(slide, spec, ctx);
}

export function renderTeachingToolkit(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, index: number): void {
  slide.background = { color: ctx.theme.bg };
  if (spec.pageType === "cover") renderCover(slide, spec, ctx);
  else if (["live-demo", "screenshot-callout", "before-after", "prompt-template"].includes(spec.pageType)) renderDemo(slide, spec, ctx);
  else if (["checklist", "risk-warning", "summary", "qa-closing"].includes(spec.pageType)) renderChecklist(slide, spec, ctx);
  else renderCards(slide, spec, ctx);
  slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
}
