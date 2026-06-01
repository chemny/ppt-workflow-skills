import fs from "node:fs";
import type { TeachingItem, TeachingToolkitSlide } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

const W = 13.333;
const H = 7.5;
const M = 0.72;
const ACCENT = "002FA7";
const TOP_KICKER = 0.42;
const TOP_TITLE = 0.78;
const TOP_SUBTITLE = 1.68;
const CONTENT_TOP = 2.42;
const SOURCE_Y = 7.03;
const tones: NonNullable<TeachingItem["tone"]>[] = ["blue", "green", "yellow", "red", "muted"];

function displayText(text: string | undefined, maxChars: number): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(0, maxChars - 1))}…`;
}

function smartTitle(title: string): { text: string; fontSize: number; height: number; subtitleY: number } {
  const normalized = title.replace(/\s+/g, " ").trim();

  if (normalized.length <= 18) return { text: normalized, fontSize: 32, height: 0.82, subtitleY: TOP_SUBTITLE };
  if (normalized.length <= 22) return { text: normalized, fontSize: 29, height: 0.82, subtitleY: TOP_SUBTITLE };
  return { text: displayText(normalized, 22), fontSize: 28, height: 0.82, subtitleY: TOP_SUBTITLE };
}

function color(ctx: RenderContext, item?: TeachingItem): string {
  if (item?.tone === "green") return ctx.theme.green ?? "C5E803";
  if (item?.tone === "yellow") return ctx.theme.yellow ?? "FFD500";
  if (item?.tone === "red") return ctx.theme.red;
  return ctx.theme.blue ?? ACCENT;
}

function eventPrimary(ctx: RenderContext): string {
  return ctx.designBrief?.colorSystem?.primary ?? ctx.theme.blue ?? ACCENT;
}

function eventAccent(ctx: RenderContext, index = 0): string {
  const accents = ctx.designBrief?.colorSystem?.accent;
  return accents?.[index % accents.length] ?? [ctx.theme.yellow ?? "FFD500", "7A4A25", "7DD3FC"][index % 3];
}

function isBrandEvent(ctx: RenderContext): boolean {
  return ctx.designBrief?.designMode === "brand-event" || ctx.designBrief?.componentPack?.id === "activity-components";
}

function label(slide: PptxSlide, ctx: RenderContext, text: string, x = M, y = TOP_KICKER, w = 4.4, c = ACCENT): void {
  addText(slide, ctx.theme, text.toUpperCase(), x, y, w, 0.18, {
    fontSize: 8,
    bold: true,
    color: c,
    charSpace: 1.2,
    margin: 0,
  });
}

function header(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, titleW = 10.4): void {
  label(slide, ctx, spec.eyebrow ?? "SWISS");
  const title = smartTitle(spec.title);
  addText(slide, ctx.theme, title.text, M, TOP_TITLE, titleW, title.height, {
    fontSize: title.fontSize,
    bold: false,
    color: ctx.theme.ink,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) {
    addText(slide, ctx.theme, displayText(spec.subtitle, 58), M, title.subtitleY, 8.8, 0.30, { fontSize: 12.4, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  }
}

function source(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.sourceNote) addText(slide, ctx.theme, spec.sourceNote, M, SOURCE_Y, 7.8, 0.14, { fontSize: 7.2, color: ctx.theme.muted, margin: 0 });
}

function eventHeader(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, titleW = 9.8): void {
  const primary = eventPrimary(ctx);
  const title = smartTitle(spec.title);
  const eyebrow = spec.eyebrow?.replace(/-/g, " ") ?? "EVENT";
  addRoundRect(slide, M, 0.38, 1.62, 0.28, "FFFFFF", { color: primary, width: 0.8 }, 0.08);
  addText(slide, ctx.theme, eyebrow.toUpperCase(), M + 0.16, 0.46, 1.28, 0.10, { fontSize: 7.4, bold: true, color: primary, align: "center", margin: 0, fit: "shrink" });
  addText(slide, ctx.theme, title.text, M, 0.92, titleW, title.height, {
    fontSize: title.fontSize + 2,
    bold: true,
    color: ctx.theme.ink,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) addText(slide, ctx.theme, displayText(spec.subtitle, 58), M, 1.78, 8.9, 0.30, { fontSize: 13.2, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  eventConfetti(slide, ctx, 11.25, 0.38);
}

function eventConfetti(slide: PptxSlide, ctx: RenderContext, x: number, y: number): void {
  const colors = [eventPrimary(ctx), eventAccent(ctx, 0), eventAccent(ctx, 1), eventAccent(ctx, 2)];
  for (let i = 0; i < 14; i += 1) {
    const cx = x + (i % 5) * 0.28;
    const cy = y + Math.floor(i / 5) * 0.23;
    if (i % 3 === 0) slide.addShape("ellipse", { x: cx, y: cy, w: 0.055, h: 0.055, fill: { color: colors[i % colors.length] }, line: { color: colors[i % colors.length], transparency: 100 } });
    else addRect(slide, cx, cy, 0.075, 0.035, colors[i % colors.length]);
  }
}

function eventSticker(slide: PptxSlide, ctx: RenderContext, text: string, x: number, y: number, fill: string, w = 1.04): void {
  addRoundRect(slide, x, y, w, 0.38, fill, { color: "FFFFFF", width: 1.0 }, 0.14);
  const textColor = fill === "FFFFFF" ? eventPrimary(ctx) : fill === eventAccent(ctx, 0) || fill === ctx.theme.green ? ctx.theme.ink : ctx.theme.white;
  addText(slide, ctx.theme, text, x + 0.08, y + 0.11, w - 0.16, 0.12, {
    fontSize: 8.4,
    bold: true,
    color: textColor,
    align: "center",
    margin: 0,
    fit: "shrink",
  });
}

function eventCover(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  const primary = eventPrimary(ctx);
  const yellow = eventAccent(ctx, 0);
  const brown = eventAccent(ctx, 1);
  const heroAsset = spec.visual?.asset;
  const hasHeroImage = Boolean(heroAsset);
  slide.background = { color: primary };
  if (heroAsset) {
    addImageCover(slide, ctx.resolveAsset(heroAsset), 0, 0, W, H);
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: 7.35,
      h: H,
      fill: { color: primary, transparency: 5 },
      line: { color: primary, transparency: 100 },
    });
  } else {
    addRect(slide, 0, 0, W, H, primary);
  }
  dotMatrix(slide, ctx, 0.25, 0.18, 46, 30, "7EA6FF");
  eventSticker(slide, ctx, "六一活动", 0.82, 0.72, yellow, 1.22);
  eventSticker(slide, ctx, "门店亲子", 2.22, 0.72, "FFFFFF", 1.26);
  const coverTitle = hasHeroImage ? spec.title.replace("亲子", "\n亲子") : spec.title;
  addText(slide, ctx.theme, coverTitle, 0.78, 1.42, hasHeroImage ? 5.95 : 8.8, hasHeroImage ? 2.25 : 1.85, {
    fontSize: hasHeroImage ? 43 : 48,
    bold: true,
    color: "FFFFFF",
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
  if (spec.subtitle) addText(slide, ctx.theme, spec.subtitle, 0.84, 4.92, 6.6, 0.34, { fontSize: 15, color: "EAF2FF", margin: 0 });
  if (spec.body) addText(slide, ctx.theme, spec.body, 0.84, 5.42, 7.6, 0.22, { fontSize: 9.2, color: "CFE0FF", margin: 0, fit: "shrink" });
  if (!hasHeroImage) {
    addRoundRect(slide, 9.45, 1.05, 2.55, 2.55, "FFFFFF", { color: "FFFFFF", width: 1.2 }, 0.20);
    icon(slide, ctx, "coffee", 10.00, 1.42, 1.42, primary);
    addRoundRect(slide, 9.72, 3.85, 2.02, 0.56, yellow, { color: "FFFFFF", width: 1 }, 0.16);
    addText(slide, ctx.theme, "亲子咖啡小任务", 9.92, 4.04, 1.62, 0.14, { fontSize: 9.2, bold: true, color: ctx.theme.ink, align: "center", margin: 0 });
    [["gift", 9.20, 5.42, yellow], ["users", 10.38, 5.70, "FFFFFF"], ["bean", 11.42, 5.28, "7DD3FC"]].forEach(([name, ix, iy, fill]) => {
      slide.addShape("ellipse", { x: Number(ix), y: Number(iy), w: 0.62, h: 0.62, fill: { color: String(fill) }, line: { color: "FFFFFF", width: 1.1 } });
      icon(slide, ctx, String(name), Number(ix) + 0.11, Number(iy) + 0.10, 0.40, fill === "FFFFFF" ? primary : brown);
    });
  }
  hairline(slide, 0.82, 6.88, 3.2, "86A8FF");
}

function eventCards(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.visual?.asset) {
    eventImageCards(slide, spec, ctx);
    return;
  }
  eventHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  const count = Math.max(1, items.length);
  const cardW = count <= 3 ? 3.55 : 2.78;
  const gap = count <= 3 ? 0.44 : 0.28;
  const startX = (W - count * cardW - (count - 1) * gap) / 2;
  items.forEach((item, i) => {
    const x = startX + i * (cardW + gap);
    const c = [eventPrimary(ctx), eventAccent(ctx, 0), eventAccent(ctx, 2), eventAccent(ctx, 1)][i % 4];
    addRoundRect(slide, x, 2.55, cardW, 3.22, "FFFFFF", { color: "DCE8FF", width: 1.0 }, 0.18);
    addRoundRect(slide, x + 0.22, 2.82, 0.72, 0.72, c, { color: c, width: 1 }, 0.18);
    icon(slide, ctx, item.icon ?? item.label, x + 0.35, 2.95, 0.46, c === "FFFFFF" ? eventPrimary(ctx) : "FFFFFF");
    eventSticker(slide, ctx, item.label ?? `任务${i + 1}`, x + 1.08, 2.95, i % 2 === 0 ? eventAccent(ctx, 0) : eventAccent(ctx, 2), 1.12);
    addText(slide, ctx.theme, displayText(item.title, 16), x + 0.26, 3.92, cardW - 0.52, 0.42, { fontSize: 19.5, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 32), x + 0.26, 4.62, cardW - 0.52, 0.50, { fontSize: 12.2, color: ctx.theme.muted, fit: "shrink", margin: 0 });
    addRect(slide, x + 0.26, 5.35, cardW - 0.52, 0.06, c);
  });
  source(slide, spec, ctx);
}

function eventImageCards(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  eventHeader(slide, spec, ctx, 7.1);
  const primary = eventPrimary(ctx);
  const items = (spec.items ?? []).slice(0, 3);
  addRoundRect(slide, 7.18, 2.36, 4.95, 3.58, "FFFFFF", { color: "DCE8FF", width: 1.0 }, 0.18);
  addImageCover(slide, ctx.resolveAsset(spec.visual?.asset ?? ""), 7.34, 2.52, 4.63, 3.02);
  items.forEach((item, i) => {
    const y = 2.48 + i * 1.04;
    const c = [primary, eventAccent(ctx, 0), eventAccent(ctx, 2)][i % 3];
    addRoundRect(slide, 0.92, y, 5.58, 0.76, "FFFFFF", { color: "DCE8FF", width: 0.9 }, 0.16);
    addRoundRect(slide, 1.12, y + 0.14, 0.48, 0.48, c, { color: c, width: 1 }, 0.12);
    icon(slide, ctx, item.icon ?? item.label, 1.22, y + 0.23, 0.28, c === eventAccent(ctx, 0) ? ctx.theme.ink : "FFFFFF");
    addText(slide, ctx.theme, displayText(item.title, 16), 1.82, y + 0.17, 1.85, 0.18, { fontSize: 13.2, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 28), 3.85, y + 0.18, 2.25, 0.18, { fontSize: 9.4, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  if (spec.body) {
    addRoundRect(slide, 0.92, 5.78, 5.58, 0.46, primary, { color: primary, width: 1 }, 0.14);
    addText(slide, ctx.theme, displayText(spec.body, 42), 1.18, 5.93, 5.08, 0.12, { fontSize: 8.8, bold: true, color: "FFFFFF", align: "center", margin: 0, fit: "shrink" });
  }
  source(slide, spec, ctx);
}

function eventRoute(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  eventHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  const y = 3.44;
  const startX = 1.12;
  const gap = 3.65;
  items.forEach((item, i) => {
    const x = startX + i * gap;
    const c = [eventPrimary(ctx), eventAccent(ctx, 2), eventAccent(ctx, 0), eventAccent(ctx, 1)][i % 4];
    if (i < items.length - 1) {
      slide.addShape("line", { x: x + 1.12, y: y + 0.47, w: gap - 1.40, h: 0, line: { color: c, width: 2.0, dash: "dash" } });
    }
    slide.addShape("ellipse", { x, y, w: 1.05, h: 1.05, fill: { color: c }, line: { color: "FFFFFF", width: 1.4 } });
    icon(slide, ctx, item.icon ?? item.title, x + 0.24, y + 0.22, 0.56, c === eventAccent(ctx, 0) ? ctx.theme.ink : "FFFFFF");
    addText(slide, ctx.theme, displayText(item.title, 12), x - 0.42, y + 1.35, 1.92, 0.24, { fontSize: 15.2, bold: true, color: ctx.theme.ink, align: "center", margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 18), x - 0.55, y + 1.78, 2.16, 0.24, { fontSize: 9.6, color: ctx.theme.muted, align: "center", margin: 0, fit: "shrink" });
  });
  if (spec.body) {
    addRoundRect(slide, 1.35, 6.08, 10.62, 0.52, eventPrimary(ctx), { color: eventPrimary(ctx), width: 1 }, 0.16);
    addText(slide, ctx.theme, displayText(spec.body, 68), 1.62, 6.26, 10.08, 0.14, { fontSize: 9.6, bold: true, color: "FFFFFF", align: "center", margin: 0, fit: "shrink" });
  }
  source(slide, spec, ctx);
}

function eventCoupon(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  eventHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 3);
  items.forEach((item, i) => {
    const x = 0.90 + i * 4.05;
    const c = [eventPrimary(ctx), eventAccent(ctx, 0), eventAccent(ctx, 1)][i];
    addRoundRect(slide, x, 2.52, 3.25, 3.12, "FFFFFF", { color: c, width: 1.4 }, 0.22);
    addRect(slide, x + 0.18, 3.12, 2.88, 0.035, c);
    addText(slide, ctx.theme, displayText(item.value ?? item.label ?? item.title, 8), x + 0.24, 2.95, 2.76, 0.82, { fontSize: i === 0 ? 48 : 39, bold: true, color: c, align: "center", margin: 0, fit: "shrink" });
    addText(slide, ctx.theme, displayText(item.title, 12), x + 0.30, 4.12, 2.65, 0.32, { fontSize: 16, bold: true, color: ctx.theme.ink, align: "center", margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 24), x + 0.38, 4.72, 2.48, 0.36, { fontSize: 10.6, color: ctx.theme.muted, align: "center", margin: 0, fit: "shrink" });
    slide.addShape("ellipse", { x: x - 0.16, y: 3.78, w: 0.32, h: 0.32, fill: { color: ctx.theme.bg }, line: { color: ctx.theme.bg, transparency: 100 } });
    slide.addShape("ellipse", { x: x + 3.09, y: 3.78, w: 0.32, h: 0.32, fill: { color: ctx.theme.bg }, line: { color: ctx.theme.bg, transparency: 100 } });
  });
  if (spec.body) {
    addRoundRect(slide, 1.0, 6.18, 11.3, 0.45, eventPrimary(ctx), { color: eventPrimary(ctx), width: 1 }, 0.14);
    addText(slide, ctx.theme, displayText(spec.body, 72), 1.22, 6.33, 10.82, 0.12, { fontSize: 9.2, bold: true, color: "FFFFFF", align: "center", margin: 0, fit: "shrink" });
  }
  source(slide, spec, ctx);
}

function eventChecklist(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  eventHeader(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  addRoundRect(slide, 0.92, 2.45, 4.32, 3.22, eventPrimary(ctx), { color: eventPrimary(ctx), width: 1 }, 0.20);
  dotMatrix(slide, ctx, 3.35, 2.72, 10, 9, "7EA6FF");
  addText(slide, ctx.theme, displayText(spec.body ?? "完成任务，领取小奖品", 36), 1.28, 3.24, 3.42, 1.05, { fontSize: 24, bold: true, color: "FFFFFF", margin: 0, fit: "shrink" });
  eventSticker(slide, ctx, "盖章领奖", 1.28, 4.82, eventAccent(ctx, 0), 1.30);
  items.forEach((item, i) => {
    const y = 2.60 + i * 0.92;
    const c = [eventPrimary(ctx), eventAccent(ctx, 2), eventAccent(ctx, 0), eventAccent(ctx, 1)][i % 4];
    addRoundRect(slide, 5.86, y, 5.78, 0.64, "FFFFFF", { color: "DCE8FF", width: 0.8 }, 0.14);
    addRoundRect(slide, 6.04, y + 0.12, 0.40, 0.40, c, { color: c, width: 1 }, 0.10);
    icon(slide, ctx, item.icon ?? item.label, 6.12, y + 0.19, 0.24, c === eventAccent(ctx, 0) ? ctx.theme.ink : "FFFFFF");
    addText(slide, ctx.theme, displayText(item.title, 18), 6.70, y + 0.17, 2.1, 0.20, { fontSize: 13.6, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 26), 8.92, y + 0.18, 2.38, 0.18, { fontSize: 9.4, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBrandEvent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, index: number): void {
  slide.background = { color: ctx.designBrief?.colorSystem?.background ?? "F8FBFF" };
  const componentType = spec.componentPlan?.find((component) => component.priority === "primary")?.type ?? spec.componentPlan?.[0]?.type;
  if (spec.pageType === "cover") eventCover(slide, spec, ctx);
  else if (componentType === "kpi-card" || spec.pageType === "data-proof") eventCoupon(slide, spec, ctx);
  else if (componentType === "process-flow" || componentType === "mermaid-diagram") eventRoute(slide, spec, ctx);
  else if (componentType === "checklist" || spec.pageType === "checklist") eventChecklist(slide, spec, ctx);
  else if (spec.pageType === "qa-closing" || spec.pageType === "summary") eventChecklist(slide, spec, ctx);
  else eventCards(slide, spec, ctx);
  if (spec.pageType !== "cover") slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
}

function mark(slide: PptxSlide, ctx: RenderContext, text: string, x: number, y: number, fill = ACCENT, s = 0.34): void {
  addRect(slide, x, y, s, s, fill);
  addText(slide, ctx.theme, text.slice(0, 2).toUpperCase(), x + 0.02, y + s * 0.28, s - 0.04, 0.10, {
    fontSize: 8.4,
    bold: true,
    color: fill === ctx.theme.yellow || fill === ctx.theme.green ? ctx.theme.ink : ctx.theme.white,
    align: "center",
    margin: 0,
  });
}

function addRoundRect(slide: PptxSlide, x: number, y: number, w: number, h: number, fill: string, line?: { color?: string; width?: number; transparency?: number }, radius = 0.12): void {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: radius,
    fill: { color: fill, transparency: line?.transparency ?? 0 },
    line: line?.color ? { color: line.color, width: line.width ?? 1 } : { color: fill, transparency: 100 },
  });
}

function icon(slide: PptxSlide, ctx: RenderContext, name: string | undefined, x: number, y: number, s: number, c: string): void {
  const n = (name ?? "").toLowerCase();
  if (n.includes("gift")) {
    addRect(slide, x + s * 0.18, y + s * 0.40, s * 0.64, s * 0.46, "FFFFFF", { color: c, width: 1.2 });
    addRect(slide, x + s * 0.14, y + s * 0.30, s * 0.72, s * 0.14, c);
    addRect(slide, x + s * 0.46, y + s * 0.30, s * 0.08, s * 0.56, c);
    slide.addShape("arc", { x: x + s * 0.28, y: y + s * 0.12, w: s * 0.22, h: s * 0.22, line: { color: c, width: 1.2 }, adjustPoint: 0.5 });
    slide.addShape("arc", { x: x + s * 0.50, y: y + s * 0.12, w: s * 0.22, h: s * 0.22, line: { color: c, width: 1.2 }, adjustPoint: 0.5 });
    return;
  }
  if (n.includes("coffee") || n.includes("bean")) {
    addRoundRect(slide, x + s * 0.20, y + s * 0.36, s * 0.48, s * 0.34, "FFFFFF", { color: c, width: 1.4 }, 0.06);
    slide.addShape("ellipse", { x: x + s * 0.62, y: y + s * 0.43, w: s * 0.22, h: s * 0.18, fill: { color: "FFFFFF", transparency: 100 }, line: { color: c, width: 1.3 } });
    addRect(slide, x + s * 0.16, y + s * 0.76, s * 0.62, s * 0.04, c);
    addRect(slide, x + s * 0.28, y + s * 0.16, s * 0.05, s * 0.14, c);
    addRect(slide, x + s * 0.44, y + s * 0.12, s * 0.05, s * 0.16, c);
    return;
  }
  if (n.includes("users")) {
    slide.addShape("ellipse", { x: x + s * 0.18, y: y + s * 0.15, w: s * 0.24, h: s * 0.24, fill: { color: "FFFFFF", transparency: 100 }, line: { color: c, width: 1.3 } });
    slide.addShape("ellipse", { x: x + s * 0.54, y: y + s * 0.15, w: s * 0.24, h: s * 0.24, fill: { color: "FFFFFF", transparency: 100 }, line: { color: c, width: 1.3 } });
    slide.addShape("arc", { x: x + s * 0.10, y: y + s * 0.50, w: s * 0.40, h: s * 0.28, line: { color: c, width: 1.3 }, adjustPoint: 0.5 });
    slide.addShape("arc", { x: x + s * 0.48, y: y + s * 0.50, w: s * 0.40, h: s * 0.28, line: { color: c, width: 1.3 }, adjustPoint: 0.5 });
    return;
  }
  if (n.includes("eye")) {
    slide.addShape("ellipse", { x: x + s * 0.16, y: y + s * 0.34, w: s * 0.68, h: s * 0.32, fill: { color: "FFFFFF", transparency: 100 }, line: { color: c, width: 1.4 } });
    slide.addShape("ellipse", { x: x + s * 0.42, y: y + s * 0.40, w: s * 0.16, h: s * 0.16, fill: { color: c }, line: { color: c, transparency: 100 } });
    return;
  }
  if (n.includes("ticket")) {
    addRoundRect(slide, x + s * 0.14, y + s * 0.25, s * 0.72, s * 0.46, "FFFFFF", { color: c, width: 1.3 }, 0.08);
    addRect(slide, x + s * 0.42, y + s * 0.28, s * 0.04, s * 0.40, c);
    return;
  }
  if (n.includes("check")) {
    addRect(slide, x + s * 0.20, y + s * 0.49, s * 0.22, s * 0.05, c);
    slide.addShape("line", { x: x + s * 0.40, y: y + s * 0.54, w: s * 0.40, h: -s * 0.32, line: { color: c, width: 2.0 } });
    return;
  }
  if (n.includes("store")) {
    addRect(slide, x + s * 0.18, y + s * 0.42, s * 0.64, s * 0.40, "FFFFFF", { color: c, width: 1.2 });
    addRect(slide, x + s * 0.13, y + s * 0.28, s * 0.74, s * 0.12, c);
    addRect(slide, x + s * 0.42, y + s * 0.58, s * 0.16, s * 0.24, c);
    return;
  }
  if (n.includes("book")) {
    addRect(slide, x + s * 0.18, y + s * 0.20, s * 0.30, s * 0.58, "FFFFFF", { color: c, width: 1.2 });
    addRect(slide, x + s * 0.52, y + s * 0.20, s * 0.30, s * 0.58, "FFFFFF", { color: c, width: 1.2 });
    addRect(slide, x + s * 0.48, y + s * 0.20, s * 0.04, s * 0.58, c);
    return;
  }
  if (n.includes("route")) {
    slide.addShape("line", { x: x + s * 0.22, y: y + s * 0.68, w: s * 0.56, h: -s * 0.42, line: { color: c, width: 1.5, dash: "dash" } });
    slide.addShape("ellipse", { x: x + s * 0.12, y: y + s * 0.60, w: s * 0.18, h: s * 0.18, fill: { color: c }, line: { color: c, transparency: 100 } });
    slide.addShape("ellipse", { x: x + s * 0.70, y: y + s * 0.18, w: s * 0.18, h: s * 0.18, fill: { color: c }, line: { color: c, transparency: 100 } });
    return;
  }
  if (n.includes("question") || n.includes("message")) {
    addRoundRect(slide, x + s * 0.18, y + s * 0.20, s * 0.62, s * 0.46, "FFFFFF", { color: c, width: 1.2 }, 0.10);
    addText(slide, ctx.theme, "?", x + s * 0.34, y + s * 0.28, s * 0.30, s * 0.20, { fontSize: 15, bold: true, color: c, align: "center", margin: 0 });
    return;
  }
  if (n.includes("spark")) {
    addText(slide, ctx.theme, "*", x + s * 0.30, y + s * 0.18, s * 0.40, s * 0.36, { fontSize: 24, bold: true, color: c, align: "center", margin: 0 });
    addText(slide, ctx.theme, "+", x + s * 0.58, y + s * 0.46, s * 0.24, s * 0.20, { fontSize: 13, bold: true, color: c, align: "center", margin: 0 });
    return;
  }
  slide.addShape("ellipse", { x: x + s * 0.24, y: y + s * 0.24, w: s * 0.52, h: s * 0.52, fill: { color: "FFFFFF", transparency: 100 }, line: { color: c, width: 1.4 } });
}

function dotMatrix(slide: PptxSlide, ctx: RenderContext, x: number, y: number, cols: number, rows: number, c = ACCENT): void {
  for (let r = 0; r < rows; r += 1) {
    for (let col = 0; col < cols; col += 1) {
      if ((r + col) % 2 === 0) {
        addText(slide, ctx.theme, col % 4 === 0 ? "+" : "·", x + col * 0.16, y + r * 0.13, 0.05, 0.04, {
          fontSize: 4.2,
          color: c,
          transparency: 42,
          margin: 0,
          align: "center",
        });
      }
    }
  }
}

function hairline(slide: PptxSlide, x: number, y: number, w: number, c = "D4D4D2"): void {
  addRect(slide, x, y, w, 0.012, c);
}

function accentBand(slide: PptxSlide, ctx: RenderContext, x: number, y: number, w: number, colorValue = ctx.theme.blue ?? ACCENT): void {
  addRect(slide, x, y, w, 0.08, colorValue);
  addRect(slide, x, y + 0.16, Math.max(0.36, w * 0.28), 0.035, ctx.theme.line);
}

function renderBP01(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  slide.background = { color: ACCENT };
  addRect(slide, 0, 0, W, H, ACCENT);
  dotMatrix(slide, ctx, 0.18, 0.16, 44, 28, "7EA6FF");
  label(slide, ctx, spec.eyebrow ?? "MANIFESTO", 0.78, 0.70, 5.0, "FFFFFF");
  const parts = spec.title.includes("：") ? spec.title.split("：") : spec.title.split(":");
  const title = parts.length > 1 ? `${parts[0]}\n${parts.slice(1).join("")}` : spec.title;
  addText(slide, ctx.theme, title, 0.76, 1.26, 8.4, 2.6, {
    fontSize: 54,
    bold: false,
    color: "FFFFFF",
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
  if (spec.subtitle) addText(slide, ctx.theme, spec.subtitle, 0.80, 5.55, 6.8, 0.26, { fontSize: 13.5, color: "EAF0FF", margin: 0 });
  if (spec.body) addText(slide, ctx.theme, spec.body, 0.80, 6.00, 6.2, 0.18, { fontSize: 8.8, color: "C8D8FF", margin: 0 });
  hairline(slide, 0.80, 6.88, 3.2, "86A8FF");
}

function renderBP02(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  const axisX = 1.04;
  addRect(slide, axisX, CONTENT_TOP, 0.035, 3.60, ctx.theme.ink);
  items.forEach((item, i) => {
    const y = CONTENT_TOP + 0.04 + i * 0.90;
    addRect(slide, axisX - 0.09, y + 0.03, 0.22, 0.22, color(ctx, item));
    label(slide, ctx, item.label ?? `T${i + 1}`, 1.48, y - 0.02, 1.3, color(ctx, item));
    addText(slide, ctx.theme, item.title, 2.58, y - 0.03, 4.15, 0.28, { fontSize: 16.5, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, 2.58, y + 0.34, 4.4, 0.30, { fontSize: 11, color: ctx.theme.muted, margin: 0, fit: "shrink" });
    addText(slide, ctx.theme, item.label ?? String(i + 1), 8.62 + i * 0.65, 5.28 - i * 0.55, 1.0, 0.55, {
      fontSize: 30 + i * 5,
      bold: false,
      color: color(ctx, item),
      margin: 0,
      fit: "shrink",
    });
  });
  addRect(slide, 8.18, CONTENT_TOP, 3.62, 3.50, ctx.theme.warm);
  addText(slide, ctx.theme, spec.body ?? "KPI", 8.48, CONTENT_TOP + 0.36, 2.9, 0.8, { fontSize: 24, bold: false, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  source(slide, spec, ctx);
}

function renderBP03(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  addRect(slide, 0, 0, W / 2, H, ctx.theme.deep);
  addRect(slide, W / 2, 0, W / 2, H, ctx.theme.warm);
  label(slide, ctx, spec.eyebrow ?? "STATEMENT", 0.72, 0.62, 3.6, "FFFFFF");
  addText(slide, ctx.theme, spec.title, 0.72, 1.48, 5.2, 2.8, { fontSize: 38, bold: false, color: ctx.theme.white, fit: "shrink", margin: 0 });
  if (spec.subtitle) addText(slide, ctx.theme, spec.subtitle, 7.12, 1.14, 4.8, 0.54, { fontSize: 20, bold: false, color: ctx.theme.ink, margin: 0 });
  addText(slide, ctx.theme, spec.body ?? spec.prompt ?? "", 7.12, 2.10, 4.8, 1.4, { fontSize: 17, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const y = 4.05 + i * 0.62;
    mark(slide, ctx, item.label ?? `0${i + 1}`, 7.12, y, color(ctx, item), 0.26);
    addText(slide, ctx.theme, item.title, 7.55, y - 0.02, 3.7, 0.22, { fontSize: 11.5, bold: true, color: ctx.theme.ink, margin: 0 });
  });
}

function renderBP04(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 6);
  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * 4.08;
    const y = CONTENT_TOP + row * 1.82;
    hairline(slide, x, y, 3.44, color(ctx, item));
    mark(slide, ctx, item.label ?? `0${i + 1}`, x, y + 0.28, color(ctx, item), 0.32);
    addText(slide, ctx.theme, item.title, x, y + 0.84, 3.25, 0.34, { fontSize: 18.5, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x, y + 1.30, 3.10, 0.34, { fontSize: 11.3, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBP05(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const x = M + i * 4.04;
    const y = CONTENT_TOP + i * 0.20;
    const h = 3.25 - i * 0.36;
    addRect(slide, x, y, 3.48, h, i === 0 ? ctx.theme.deep : i === 1 ? ctx.theme.warm : ctx.theme.paper, { color: i === 2 ? ctx.theme.line : undefined, width: 0.8 });
    mark(slide, ctx, item.label ?? `0${i + 1}`, x + 0.24, y + 0.28, color(ctx, item), 0.36);
    addText(slide, ctx.theme, item.title, x + 0.24, y + 0.86, 2.85, 0.50, { fontSize: 21, bold: false, color: i === 0 ? ctx.theme.white : ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, item.body, x + 0.24, y + 1.60, 2.8, 0.78, { fontSize: 12, color: i === 0 ? "DDE6FF" : ctx.theme.muted, fit: "shrink", margin: 0 });
    addRect(slide, x + 0.24, y + h - 0.42, 1.4, 0.07, color(ctx, item));
  });
  source(slide, spec, ctx);
}

function renderBP06(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx, 5.5);
  if (spec.body) addText(slide, ctx.theme, spec.body, 7.0, 0.92, 4.6, 0.80, { fontSize: 13.2, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  const items = (spec.items ?? []).slice(0, 4);
  items.forEach((item, i) => {
    const x = 1.05 + i * 2.85;
    const h = 1.25 + i * 0.42;
    const y = 5.92 - h;
    addRect(slide, x, y, 2.32, h, i % 2 === 0 ? ctx.theme.deep : ctx.theme.warm, { color: ctx.theme.line, width: 0.5 });
    addText(slide, ctx.theme, item.label ?? String(i + 1), x + 0.20, y + 0.22, 1.72, 0.55, { fontSize: 34, bold: false, color: i % 2 === 0 ? ctx.theme.white : color(ctx, item), fit: "shrink", margin: 0 });
    addText(slide, ctx.theme, item.title, x + 0.22, y + h - 0.62, 1.85, 0.25, { fontSize: 12.8, bold: true, color: i % 2 === 0 ? ctx.theme.white : ctx.theme.ink, fit: "shrink", margin: 0 });
  });
  source(slide, spec, ctx);
}

function renderBP07(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 5);
  const maxW = 7.6;
  items.forEach((item, i) => {
    const y = CONTENT_TOP + i * 0.68;
    const ratio = Math.max(0.25, Math.min(1, Number.parseFloat(item.label ?? "") / 100 || (items.length - i) / items.length));
    addText(slide, ctx.theme, item.title, M, y - 0.02, 2.5, 0.24, { fontSize: 13, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    addRect(slide, 3.40, y, maxW, 0.28, ctx.theme.warm);
    addRect(slide, 3.40, y, maxW * ratio, 0.28, color(ctx, item));
    addText(slide, ctx.theme, item.label ?? "", 11.25, y - 0.02, 0.88, 0.22, { fontSize: 11.5, bold: true, color: color(ctx, item), align: "right", margin: 0 });
  });
  source(slide, spec, ctx);
}

function renderBP08(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 2);
  hairline(slide, 6.66, CONTENT_TOP - 0.10, 0.01, ctx.theme.line);
  items.forEach((item, i) => {
    const x = i === 0 ? M : 7.05;
    const c = i === 0 ? ctx.theme.red : ctx.theme.blue ?? ACCENT;
    label(slide, ctx, item.label ?? (i === 0 ? "BEFORE" : "AFTER"), x, CONTENT_TOP, 2.6, c);
    addText(slide, ctx.theme, item.title, x, CONTENT_TOP + 0.68, 4.7, 0.62, { fontSize: 25, bold: false, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x, CONTENT_TOP + 1.58, 4.6, 1.05, { fontSize: 13.5, color: ctx.theme.muted, margin: 0, fit: "shrink" });
    addRect(slide, x, 5.42, 2.1, 0.08, c);
  });
  source(slide, spec, ctx);
}

function renderBP09(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  label(slide, ctx, spec.eyebrow ?? "STATEMENT");
  addText(slide, ctx.theme, spec.title, M, TOP_TITLE, 10.9, 0.90, { fontSize: 36, bold: false, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  if (spec.subtitle) addText(slide, ctx.theme, spec.subtitle, M, TOP_SUBTITLE, 8.4, 0.30, { fontSize: 13.5, color: ctx.theme.muted, margin: 0 });
  const items = (spec.items ?? []).slice(0, 3);
  items.forEach((item, i) => {
    const x = 0.76 + i * 3.95;
    addText(slide, ctx.theme, item.label ?? item.title, x, 4.06, 3.1, 0.82, { fontSize: 43, bold: false, color: color(ctx, item), fit: "shrink", margin: 0 });
    addText(slide, ctx.theme, item.title, x, 5.14, 3.2, 0.30, { fontSize: 14.8, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x, 5.60, 3.2, 0.38, { fontSize: 11, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBP10(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  addRect(slide, 0, 0, W / 2, H, ctx.theme.deep);
  addRect(slide, W / 2, 0, W / 2, H, ctx.theme.bg);
  label(slide, ctx, spec.eyebrow ?? "CLOSING", 0.72, 0.62, 3.6, "FFFFFF");
  addText(slide, ctx.theme, spec.title, 0.72, 1.32, 5.25, 3.2, { fontSize: 46, bold: false, color: ctx.theme.white, fit: "shrink", margin: 0 });
  (spec.items ?? []).slice(0, 4).forEach((item, i) => {
    const y = 1.25 + i * 1.05;
    mark(slide, ctx, item.label ?? `0${i + 1}`, 7.15, y, color(ctx, item), 0.32);
    addText(slide, ctx.theme, item.title, 7.68, y - 0.02, 4.35, 0.34, { fontSize: 17, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, 7.68, y + 0.43, 4.25, 0.32, { fontSize: 10.8, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  if (spec.body) addText(slide, ctx.theme, spec.body, 7.15, 6.10, 4.8, 0.35, { fontSize: 12.5, color: ctx.theme.muted, fit: "shrink", margin: 0 });
}

function renderBP11(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 5);
  const y = 4.05;
  hairline(slide, 1.0, y, 11.2, ctx.theme.ink);
  items.forEach((item, i) => {
    const x = 1.0 + i * (11.2 / Math.max(1, items.length - 1));
    addRect(slide, x - 0.10, y - 0.10, 0.20, 0.20, color(ctx, item));
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, x - 0.34, y - 0.72, 0.68, 0.18, { fontSize: 8, bold: true, color: color(ctx, item), align: "center", margin: 0 });
    addText(slide, ctx.theme, item.title, x - 0.76, y + 0.36, 1.52, 0.34, { fontSize: 12.8, bold: true, color: ctx.theme.ink, align: "center", margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x - 0.92, y + 0.86, 1.84, 0.40, { fontSize: 9.4, color: ctx.theme.muted, align: "center", margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBP12(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  label(slide, ctx, spec.eyebrow ?? "MANIFESTO", M, 0.56);
  addText(slide, ctx.theme, spec.title, M, 1.20, 11.6, 2.65, { fontSize: 50, bold: false, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  addRect(slide, 0, 5.15, W, 0.98, ctx.theme.deep);
  addText(slide, ctx.theme, spec.body ?? spec.subtitle ?? "", M, 5.45, 10.8, 0.32, { fontSize: 16, bold: false, color: ctx.theme.white, fit: "shrink", margin: 0 });
  source(slide, spec, ctx);
}

function renderBP13(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  addRect(slide, M, CONTENT_TOP, 4.35, 3.62, ctx.theme.deep);
  addText(slide, ctx.theme, spec.body ?? spec.subtitle ?? "", 1.04, CONTENT_TOP + 0.58, 3.62, 1.50, { fontSize: 27, bold: false, color: ctx.theme.white, margin: 0, fit: "shrink" });
  addRect(slide, 1.04, 5.12, 1.8, 0.08, ctx.theme.blue ?? ACCENT);
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const y = CONTENT_TOP + i * 1.16;
    mark(slide, ctx, item.label ?? `0${i + 1}`, 5.76, y, color(ctx, item), 0.36);
    addText(slide, ctx.theme, item.title, 6.32, y - 0.02, 4.8, 0.34, { fontSize: 18.2, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, 6.32, y + 0.44, 5.05, 0.38, { fontSize: 12, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBP14(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx, 5.8);
  const items = (spec.items ?? []).slice(0, 4);
  items.forEach((item, i) => {
    const y = 2.10 + i * 0.78;
    mark(slide, ctx, item.label ?? `0${i + 1}`, M, y, color(ctx, item), 0.30);
    addText(slide, ctx.theme, item.title, 1.08, y - 0.02, 3.2, 0.24, { fontSize: 13.5, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, item.body, 1.08, y + 0.32, 3.6, 0.24, { fontSize: 9.8, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  });
  const cx = 8.95;
  const cy = 3.72;
  [2.25, 1.55, 0.85].forEach((s, i) => {
    slide.addShape("ellipse", {
      x: cx - s / 2,
      y: cy - s / 2,
      w: s,
      h: s,
      fill: { color: "FFFFFF", transparency: 100 },
      line: { color: i === 0 ? ctx.theme.blue ?? ACCENT : ctx.theme.line, width: i === 0 ? 1.2 : 0.8 },
    });
  });
  addRect(slide, cx - 1.75, cy - 0.03, 3.50, 0.05, ctx.theme.blue ?? ACCENT);
  addRect(slide, cx - 0.03, cy - 1.75, 0.05, 3.50, ctx.theme.blue ?? ACCENT);
  addText(slide, ctx.theme, "LOOP", cx - 0.48, cy - 0.13, 0.96, 0.18, { fontSize: 10, bold: true, color: ctx.theme.ink, align: "center", margin: 0 });
  source(slide, spec, ctx);
}

function renderBP15(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 12);
  items.forEach((item, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const x = M + col * 1.98;
    const y = 2.10 + row * 0.92;
    addRect(slide, x, y, 1.68, 0.62, row === 0 ? ctx.theme.paper : ctx.theme.warm, { color: ctx.theme.line, width: 0.35 });
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, x + 0.12, y + 0.12, 0.44, 0.12, { fontSize: 7.6, bold: true, color: color(ctx, item), margin: 0 });
    addText(slide, ctx.theme, item.title, x + 0.12, y + 0.34, 1.32, 0.15, { fontSize: 8.3, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  });
  const hero = spec.body ?? spec.subtitle ?? (spec.items?.[0]?.label ?? "");
  addText(slide, ctx.theme, hero, M, 4.38, 9.2, 1.05, { fontSize: 56, bold: false, color: ctx.theme.blue ?? ACCENT, fit: "shrink", margin: 0 });
  source(slide, spec, ctx);
}

function renderBP16(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  (spec.items ?? []).slice(0, 6).forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * 4.04;
    const y = CONTENT_TOP + row * 1.56;
    addRect(slide, x, y, 3.50, 1.16, ctx.theme.paper, { color: ctx.theme.line, width: 0.45 });
    mark(slide, ctx, item.label ?? `0${i + 1}`, x + 0.16, y + 0.18, color(ctx, item), 0.28);
    addText(slide, ctx.theme, item.title, x + 0.62, y + 0.17, 2.52, 0.25, { fontSize: 14.2, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, item.body, x + 0.16, y + 0.62, 3.0, 0.32, { fontSize: 10.2, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  });
  source(slide, spec, ctx);
}

function renderBP17(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx, 5.8);
  if (spec.body) addText(slide, ctx.theme, spec.body, 7.1, 0.88, 4.6, 0.70, { fontSize: 12.5, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  const cx = 6.65;
  const cy = 3.72;
  addRect(slide, cx - 1.0, cy - 0.45, 2.0, 0.90, ctx.theme.deep);
  addText(slide, ctx.theme, "SYSTEM", cx - 0.48, cy - 0.08, 0.96, 0.14, { fontSize: 9, bold: true, color: ctx.theme.white, align: "center", margin: 0 });
  (spec.items ?? []).slice(0, 4).forEach((item, i) => {
    const positions = [[1.25, 2.45], [10.25, 2.45], [1.25, 4.65], [10.25, 4.65]];
    const [x, y] = positions[i] ?? [1.25, 2.45];
    addRect(slide, x, y, 1.75, 0.72, ctx.theme.paper, { color: color(ctx, item), width: 0.8 });
    addText(slide, ctx.theme, item.title, x + 0.16, y + 0.18, 1.35, 0.22, { fontSize: 10.5, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    addRect(slide, i % 2 === 0 ? x + 1.75 : cx + 1.0, y + 0.35, i % 2 === 0 ? cx - x - 2.75 : x - cx - 1.0, 0.025, color(ctx, item));
  });
  source(slide, spec, ctx);
}

function renderBP18(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const x = M + i * 4.02;
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, x, 2.20, 2.0, 0.62, { fontSize: 36, bold: false, color: color(ctx, item), margin: 0, fit: "shrink" });
    addText(slide, ctx.theme, item.title, x, 3.10, 3.2, 0.35, { fontSize: 16.5, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x, 3.72, 3.0, 0.65, { fontSize: 11, color: ctx.theme.muted, margin: 0, fit: "shrink" });
    addRect(slide, x, 5.10, 2.4, 0.07, color(ctx, item));
  });
  addText(slide, ctx.theme, spec.body ?? "NOW", M, 5.72, 7.5, 0.75, { fontSize: 44, bold: false, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  source(slide, spec, ctx);
}

function renderBP19(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const items = (spec.items ?? []).slice(0, 4);
  items.forEach((item, i) => {
    const x = M + i * 3.06;
    const c = color(ctx, item);
    addRect(slide, x, CONTENT_TOP, 2.68, 3.46, ctx.theme.paper, { color: ctx.theme.line, width: 0.6 });
    mark(slide, ctx, item.label ?? `0${i + 1}`, x + 0.20, CONTENT_TOP + 0.28, c, 0.40);
    addRect(slide, x + 0.20, CONTENT_TOP + 1.04, 2.26, 0.09, c);
    addText(slide, ctx.theme, item.title, x + 0.20, CONTENT_TOP + 1.52, 2.15, 0.50, { fontSize: 18.8, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, item.body, x + 0.20, CONTENT_TOP + 2.40, 2.13, 0.60, { fontSize: 11.2, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderBP20(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  (spec.items ?? []).slice(0, 4).forEach((item, i) => {
    const y = 2.05 + i * 0.95;
    hairline(slide, M, y - 0.10, 11.9, ctx.theme.line);
    addText(slide, ctx.theme, item.label ?? String(i + 1), M, y, 2.8, 0.48, { fontSize: 30, bold: false, color: color(ctx, item), fit: "shrink", margin: 0 });
    addText(slide, ctx.theme, item.title, 4.10, y + 0.08, 3.0, 0.24, { fontSize: 13.5, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, item.body, 7.25, y + 0.08, 4.2, 0.24, { fontSize: 10.5, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  });
  source(slide, spec, ctx);
}

function renderBP21(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const x = M + i * 3.45;
    addText(slide, ctx.theme, item.label ?? item.title, x, 2.34, 2.8, 0.55, { fontSize: 32, bold: false, color: color(ctx, item), fit: "shrink", margin: 0 });
    addText(slide, ctx.theme, item.title, x, 3.12, 2.8, 0.25, { fontSize: 12.5, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
  });
  const startX = 10.18;
  const startY = 2.25;
  for (let r = 0; r < 7; r += 1) {
    for (let c = 0; c < 5; c += 1) {
      addRect(slide, startX + c * 0.26, startY + r * 0.26, 0.12, 0.12, (r + c) % 3 === 0 ? ctx.theme.blue ?? ACCENT : ctx.theme.line);
    }
  }
  addRect(slide, M, 5.30, 11.85, 0.58, ctx.theme.deep);
  addText(slide, ctx.theme, spec.body ?? spec.subtitle ?? "", M + 0.24, 5.50, 10.8, 0.16, { fontSize: 10.5, bold: true, color: ctx.theme.white, margin: 0, fit: "shrink" });
  source(slide, spec, ctx);
}

function renderBP22(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  if (spec.visual?.asset) {
    addImageCover(slide, ctx.resolveAsset(spec.visual.asset), M, CONTENT_TOP, 11.9, 3.00);
  } else if (spec.visual?.type === "native-diagram") {
    renderNativeProductVisual(slide, spec, ctx, M, CONTENT_TOP, 11.9, 3.00);
  } else {
    addRect(slide, M, CONTENT_TOP, 11.9, 3.00, ctx.theme.deep);
  }
  (spec.items ?? []).slice(0, 3).forEach((item, i) => {
    const x = M + i * 4.02;
    mark(slide, ctx, item.label ?? `0${i + 1}`, x, 5.62, color(ctx, item), 0.32);
    addText(slide, ctx.theme, item.title, x + 0.50, 5.54, 3.15, 0.30, { fontSize: 13.2, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, item.body, x + 0.50, 5.96, 3.00, 0.30, { fontSize: 10.2, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  });
  source(slide, spec, ctx);
}

function primaryComponent(spec: TeachingToolkitSlide, ...types: string[]) {
  return (spec.componentPlan ?? []).find((component) => types.includes(component.type));
}

function renderIconCardComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const component = primaryComponent(spec, "icon-card") ?? spec.componentPlan?.[0];
  const items = (component?.content ?? spec.items ?? []).slice(0, 4);
  if (items.length === 3) {
    addRect(slide, M, CONTENT_TOP + 0.05, 4.08, 3.36, ctx.theme.deep);
    dotMatrix(slide, ctx, M + 2.35, CONTENT_TOP + 0.26, 12, 12, "7EA6FF");
    addText(slide, ctx.theme, displayText(spec.body ?? spec.subtitle ?? "", 42), M + 0.34, CONTENT_TOP + 0.58, 3.20, 1.25, {
      fontSize: 25.5,
      bold: true,
      color: ctx.theme.white,
      margin: 0,
      fit: "shrink",
    });
    addRect(slide, M + 0.34, CONTENT_TOP + 2.78, 1.72, 0.08, ctx.theme.blue ?? ACCENT);
    items.forEach((item, i) => {
      const y = CONTENT_TOP + 0.16 + i * 1.04;
      const c = color(ctx, item);
      mark(slide, ctx, item.icon ?? item.label ?? `0${i + 1}`, 5.18, y, c, 0.40);
      addText(slide, ctx.theme, displayText(item.title, 18), 5.78, y - 0.02, 2.70, 0.32, {
        fontSize: 17,
        bold: true,
        color: ctx.theme.ink,
        margin: 0,
        fit: "shrink",
      });
      if (item.body) {
        addText(slide, ctx.theme, displayText(item.body, 34), 5.78, y + 0.43, 5.52, 0.30, {
          fontSize: 10.8,
          color: ctx.theme.muted,
          margin: 0,
          fit: "shrink",
        });
      }
    });
    source(slide, spec, ctx);
    return;
  }
  const count = Math.max(1, items.length);
  const cardW = count <= 3 ? 3.5 : 2.78;
  const gap = count <= 3 ? 0.42 : 0.26;
  const startX = (W - count * cardW - (count - 1) * gap) / 2;
  items.forEach((item, i) => {
    const x = startX + i * (cardW + gap);
    const c = color(ctx, item);
    addRect(slide, x, CONTENT_TOP + 0.15, cardW, 3.24, ctx.theme.paper, { color: ctx.theme.line, width: 0.55 });
    mark(slide, ctx, item.label ?? item.icon ?? `0${i + 1}`, x + 0.24, CONTENT_TOP + 0.42, c, 0.44);
    accentBand(slide, ctx, x + 0.24, CONTENT_TOP + 1.10, cardW - 0.48, c);
    addText(slide, ctx.theme, displayText(item.title, 16), x + 0.24, CONTENT_TOP + 1.52, cardW - 0.48, 0.42, {
      fontSize: 19.5,
      bold: true,
      color: ctx.theme.ink,
      margin: 0,
      fit: "shrink",
    });
    if (item.body) {
      addText(slide, ctx.theme, displayText(item.body, 32), x + 0.24, CONTENT_TOP + 2.34, cardW - 0.48, 0.52, {
        fontSize: 11.8,
        color: ctx.theme.muted,
        margin: 0,
        fit: "shrink",
      });
    }
  });
  source(slide, spec, ctx);
}

function renderKpiComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const component = primaryComponent(spec, "kpi-card", "chart-native");
  const items = (component?.content ?? spec.items ?? []).slice(0, 4);
  const count = Math.max(1, items.length);
  const colW = 11.6 / count;
  if (spec.body) {
    addText(slide, ctx.theme, displayText(spec.body, 62), M, 2.13, 10.8, 0.30, {
      fontSize: 14.2,
      color: ctx.theme.ink,
      bold: true,
      margin: 0,
      fit: "shrink",
    });
  }
  items.forEach((item, i) => {
    const x = M + i * colW;
    const c = color(ctx, item);
    addText(slide, ctx.theme, displayText(item.value ?? item.label ?? item.title, 10), x, 2.88, colW - 0.25, 0.74, {
      fontSize: 45,
      bold: false,
      color: c,
      margin: 0,
      fit: "shrink",
    });
    addText(slide, ctx.theme, displayText(item.title, 14), x, 3.86, colW - 0.28, 0.30, {
      fontSize: 15.2,
      bold: true,
      color: ctx.theme.ink,
      margin: 0,
      fit: "shrink",
    });
    if (item.body) {
      addText(slide, ctx.theme, displayText(item.body, 26), x, 4.44, colW - 0.42, 0.46, {
        fontSize: 10.4,
        color: ctx.theme.muted,
        margin: 0,
        fit: "shrink",
      });
    }
    accentBand(slide, ctx, x, 5.56, Math.min(2.4, colW - 0.55), c);
  });
  if (spec.body) {
    addRect(slide, M, 6.22, 11.82, 0.46, ctx.theme.deep);
    addText(slide, ctx.theme, displayText(spec.body, 70), M + 0.22, 6.36, 10.8, 0.16, {
      fontSize: 9.6,
      bold: true,
      color: ctx.theme.white,
      margin: 0,
      fit: "shrink",
    });
  }
  source(slide, spec, ctx);
}

function renderProcessComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const component = primaryComponent(spec, "process-flow", "timeline");
  const items = (component?.content ?? spec.items ?? []).slice(0, 5);
  const startX = M;
  const y = 3.08;
  const cardW = 2.18;
  const gap = 0.22;
  const span = items.length * cardW + Math.max(0, items.length - 1) * gap;
  hairline(slide, startX, y, Math.min(span, 11.9), ctx.theme.ink);
  items.forEach((item, i) => {
    const x = startX + i * (cardW + gap);
    const c = color(ctx, item);
    addRect(slide, x + 0.14, y - 0.16, 0.32, 0.32, c);
    addRect(slide, x, y + 0.52, cardW, 1.72, ctx.theme.paper, { color: ctx.theme.line, width: 0.55 });
    addRect(slide, x, y + 0.52, cardW, 0.08, c);
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, x + 0.18, y + 0.82, 0.54, 0.16, {
      fontSize: 8.2,
      bold: true,
      color: c,
      margin: 0,
    });
    addText(slide, ctx.theme, displayText(item.title, 8), x + 0.18, y + 1.12, cardW - 0.36, 0.28, {
      fontSize: 14.8,
      bold: true,
      color: ctx.theme.ink,
      margin: 0,
      fit: "shrink",
    });
    if (item.body) {
      addText(slide, ctx.theme, displayText(item.body, 14), x + 0.18, y + 1.58, cardW - 0.36, 0.26, {
        fontSize: 9.4,
        color: ctx.theme.muted,
        margin: 0,
        fit: "shrink",
      });
    }
  });
  if (spec.body) {
    addRect(slide, M, 6.15, 11.84, 0.48, ctx.theme.deep);
    addText(slide, ctx.theme, displayText(spec.body, 72), M + 0.22, 6.30, 10.9, 0.16, {
      fontSize: 9.2,
      bold: true,
      color: ctx.theme.white,
      margin: 0,
      fit: "shrink",
    });
  }
  source(slide, spec, ctx);
}

function renderComparisonMatrixComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx);
  const component = primaryComponent(spec, "comparison-matrix");
  const items = (component?.content ?? spec.items ?? []).slice(0, 6);
  addRect(slide, M, 2.06, 11.78, 0.34, ctx.theme.deep);
  addText(slide, ctx.theme, displayText(spec.body ?? "Decision matrix", 58), M + 0.18, 2.16, 9.8, 0.12, {
    fontSize: 8.8,
    bold: true,
    color: ctx.theme.white,
    charSpace: 0.8,
    margin: 0,
    fit: "shrink",
  });
  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * 4.02;
    const y = 2.58 + row * 1.34;
    const c = color(ctx, item);
    addRect(slide, x, y, 3.52, 1.02, row === 0 ? ctx.theme.paper : ctx.theme.warm, { color: ctx.theme.line, width: 0.5 });
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, x + 0.16, y + 0.15, 0.62, 0.16, { fontSize: 8.4, bold: true, color: c, margin: 0 });
    addText(slide, ctx.theme, displayText(item.title, 16), x + 0.16, y + 0.42, 3.05, 0.26, { fontSize: 13.2, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 22), x + 0.16, y + 0.78, 3.05, 0.18, { fontSize: 8.6, color: ctx.theme.muted, fit: "shrink", margin: 0 });
  });
  source(slide, spec, ctx);
}

function renderChecklistComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx, 10.8);
  const component = primaryComponent(spec, "checklist");
  const items = (component?.content ?? spec.items ?? []).slice(0, 5);
  addRect(slide, M, CONTENT_TOP + 0.05, 4.20, 3.20, ctx.theme.deep);
  dotMatrix(slide, ctx, M + 2.50, CONTENT_TOP + 0.24, 12, 12, "7EA6FF");
  addText(slide, ctx.theme, displayText(spec.body ?? "", 44), M + 0.34, CONTENT_TOP + 0.58, 3.40, 1.18, {
    fontSize: 24,
    bold: true,
    color: ctx.theme.white,
    margin: 0,
    fit: "shrink",
  });
  addRect(slide, M + 0.34, CONTENT_TOP + 2.78, 1.72, 0.08, ctx.theme.blue ?? ACCENT);
  items.forEach((item, i) => {
    const y = CONTENT_TOP + 0.20 + i * 1.02;
    mark(slide, ctx, item.icon ?? item.label ?? `0${i + 1}`, 5.30, y, color(ctx, item), 0.38);
    addText(slide, ctx.theme, displayText(item.title, 20), 5.88, y - 0.02, 4.35, 0.30, { fontSize: 16.2, bold: true, color: ctx.theme.ink, margin: 0, fit: "shrink" });
    if (item.body) addText(slide, ctx.theme, displayText(item.body, 34), 5.88, y + 0.42, 4.60, 0.28, { fontSize: 10.6, color: ctx.theme.muted, margin: 0, fit: "shrink" });
  });
  source(slide, spec, ctx);
}

function renderMermaidFallbackComponent(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  header(slide, spec, ctx, 10.6);
  const component = primaryComponent(spec, "mermaid-diagram", "architecture-diagram");
  const raw = component?.syntax ?? component?.fallback ?? spec.body ?? "";
  const parsed = parseMermaidFlow(raw);
  const items = parsed.nodes.length
    ? parsed.nodes.map((node, index) => ({ label: node.id, title: node.label, tone: tones[index % tones.length] }))
    : (spec.items ?? []).slice(0, 5);
  addRect(slide, M, 2.36, 11.86, 3.86, ctx.theme.paper, { color: ctx.theme.line, width: 0.5 });
  if (parsed.nodes.length >= 3 && parsed.edges.length >= 2 && renderConvergingDiagram(slide, ctx, parsed, 1.10, 2.74, 10.86, 2.98)) {
    source(slide, spec, ctx);
    return;
  }
  renderLinearDiagram(slide, ctx, items, parsed.edges, 1.08, 3.28, 10.9);
  source(slide, spec, ctx);
}

interface ParsedMermaidDiagram {
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ from: string; to: string }>;
}

function parseMermaidFlow(raw: string): ParsedMermaidDiagram {
  const nodes = new Map<string, string>();
  const nodePattern = /([A-Za-z][A-Za-z0-9_]*)\[([^\]]+)\]/g;
  let nodeMatch: RegExpExecArray | null;
  while ((nodeMatch = nodePattern.exec(raw)) !== null) {
    nodes.set(nodeMatch[1], nodeMatch[2].trim());
  }

  const edges: ParsedMermaidDiagram["edges"] = [];
  const edgePattern = /([A-Za-z][A-Za-z0-9_]*)(?:\[[^\]]+\])?\s*[-.=]+(?:\|[^|]*\|)?-?>\s*([A-Za-z][A-Za-z0-9_]*)(?:\[[^\]]+\])?/g;
  let edgeMatch: RegExpExecArray | null;
  while ((edgeMatch = edgePattern.exec(raw)) !== null) {
    edges.push({ from: edgeMatch[1], to: edgeMatch[2] });
    if (!nodes.has(edgeMatch[1])) nodes.set(edgeMatch[1], edgeMatch[1]);
    if (!nodes.has(edgeMatch[2])) nodes.set(edgeMatch[2], edgeMatch[2]);
  }

  return {
    nodes: [...nodes.entries()].map(([id, label]) => ({ id, label })).slice(0, 6),
    edges: edges.slice(0, 8),
  };
}

function renderConvergingDiagram(slide: PptxSlide, ctx: RenderContext, parsed: ParsedMermaidDiagram, x: number, y: number, w: number, h: number): boolean {
  const inbound = new Map<string, string[]>();
  parsed.edges.forEach((edge) => inbound.set(edge.to, [...(inbound.get(edge.to) ?? []), edge.from]));
  const sink = [...inbound.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (!sink || sink[1].length < 2) return false;
  const [sinkId, inputIds] = sink;
  const inputNodes = inputIds
    .map((id) => parsed.nodes.find((node) => node.id === id))
    .filter((node): node is { id: string; label: string } => Boolean(node))
    .slice(0, 4);
  const sinkNode = parsed.nodes.find((node) => node.id === sinkId);
  if (!sinkNode || inputNodes.length < 2) return false;

  const leftX = x + 0.28;
  const sinkX = x + w - 3.35;
  const nodeW = 2.36;
  const nodeH = 0.54;
  const sinkY = y + h / 2 - 0.47;
  const midX = x + w * 0.55;
  inputNodes.forEach((node, index) => {
    const nodeY = y + 0.08 + index * 0.78;
    const c = ctx.theme.blue ?? ACCENT;
    addRect(slide, leftX, nodeY, nodeW, nodeH, ctx.theme.cold, { color: ctx.theme.line, width: 0.45 });
    mark(slide, ctx, node.id, leftX + 0.14, nodeY + 0.12, c, 0.24);
    addText(slide, ctx.theme, displayText(node.label, 14), leftX + 0.50, nodeY + 0.16, nodeW - 0.64, 0.16, { fontSize: 10.4, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    const lineY = nodeY + nodeH / 2;
    addRect(slide, leftX + nodeW, lineY, midX - leftX - nodeW, 0.018, c);
    addRect(slide, midX, Math.min(lineY, sinkY + nodeH / 2), 0.018, Math.abs(sinkY + nodeH / 2 - lineY) || 0.018, c);
    addRect(slide, midX, sinkY + nodeH / 2, sinkX - midX, 0.018, c);
  });
  addRect(slide, sinkX, sinkY, 2.82, 0.94, ctx.theme.deep);
  addText(slide, ctx.theme, displayText(sinkNode.label, 18), sinkX + 0.22, sinkY + 0.30, 2.36, 0.22, { fontSize: 15.2, bold: true, color: ctx.theme.white, align: "center", fit: "shrink", margin: 0 });
  return true;
}

function renderLinearDiagram(slide: PptxSlide, ctx: RenderContext, items: TeachingItem[], edges: ParsedMermaidDiagram["edges"], x: number, y: number, w: number): void {
  const safeItems = items.slice(0, 5);
  if (!safeItems.length) return;
  const nodeW = safeItems.length <= 3 ? 2.08 : 1.82;
  const gap = safeItems.length === 1 ? 0 : (w - safeItems.length * nodeW) / Math.max(1, safeItems.length - 1);
  safeItems.forEach((item, index) => {
    const nodeX = x + index * (nodeW + gap);
    const c = color(ctx, item);
    addRect(slide, nodeX, y, nodeW, 0.86, ctx.theme.paper, { color: c, width: 0.9 });
    mark(slide, ctx, item.label ?? `0${index + 1}`, nodeX + 0.14, y + 0.20, c, 0.28);
    addText(slide, ctx.theme, displayText(item.title, 14), nodeX + 0.52, y + 0.24, nodeW - 0.66, 0.20, { fontSize: 10.8, bold: true, color: ctx.theme.ink, fit: "shrink", margin: 0 });
    if (index < safeItems.length - 1) {
      const lineW = Math.max(0.24, gap - 0.14);
      addRect(slide, nodeX + nodeW + 0.07, y + 0.43, lineW, 0.022, edges.length ? c : ctx.theme.line);
      addRect(slide, nodeX + nodeW + 0.07 + lineW - 0.08, y + 0.38, 0.08, 0.12, edges.length ? c : ctx.theme.line);
    }
  });
}

function renderNativeProductVisual(
  slide: PptxSlide,
  spec: TeachingToolkitSlide,
  ctx: RenderContext,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  addRect(slide, x, y, w, h, ctx.theme.deep);
  const accent = ctx.theme.blue ?? ACCENT;
  dotMatrix(slide, ctx, x + 6.25, y + 0.28, 20, 14, "7EA6FF");
  addRect(slide, x + 0.36, y + 0.34, 1.55, 0.08, accent);
  addRect(slide, x + 0.36, y + 0.58, 0.62, 0.08, "FFFFFF");
  addText(slide, ctx.theme, spec.visual?.caption ?? "PRODUCT SYSTEM", x + 0.36, y + h - 0.42, 3.2, 0.14, {
    fontSize: 7.2,
    bold: true,
    color: "C8D8FF",
    charSpace: 1.1,
    margin: 0,
  });

  drawPhone(slide, x + 4.85, y + 0.34, 1.22, 2.42, "F4F6F8", accent);
  drawPhone(slide, x + 6.06, y + 0.54, 1.18, 2.22, "DDE8EE", ctx.theme.green ?? "00A36C");
  drawCameraBlock(slide, x + 7.05, y + 0.48, ctx);

  const facts = (spec.items ?? []).slice(0, 3);
  facts.forEach((item, i) => {
    const lx = x + 0.55 + i * 3.65;
    addText(slide, ctx.theme, item.label ?? `0${i + 1}`, lx, y + 1.12, 0.58, 0.22, {
      fontSize: 12,
      bold: true,
      color: color(ctx, item),
      margin: 0,
    });
    addText(slide, ctx.theme, item.title, lx, y + 1.45, 2.35, 0.30, {
      fontSize: 15.5,
      bold: true,
      color: "FFFFFF",
      fit: "shrink",
      margin: 0,
    });
    if (item.body) {
      addText(slide, ctx.theme, item.body, lx, y + 1.92, 2.52, 0.46, {
        fontSize: 8.8,
        color: "C8D8FF",
        fit: "shrink",
        margin: 0,
      });
    }
    addRect(slide, lx, y + 2.62, 1.35, 0.055, color(ctx, item));
  });
}

function drawPhone(slide: PptxSlide, x: number, y: number, w: number, h: number, fill: string, accent: string): void {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: "FFFFFF", width: 1.0, transparency: 20 },
  });
  addRect(slide, x + 0.09, y + 0.13, w - 0.18, h - 0.26, "101010");
  slide.addShape("roundRect", {
    x: x + w * 0.35,
    y: y + 0.18,
    w: w * 0.30,
    h: 0.07,
    rectRadius: 0.03,
    fill: { color: "202020" },
    line: { color: "202020", transparency: 100 },
  });
  addRect(slide, x + 0.18, y + h - 0.42, w - 0.36, 0.06, accent);
}

function drawCameraBlock(slide: PptxSlide, x: number, y: number, ctx: RenderContext): void {
  addRect(slide, x, y, 2.20, 1.72, "F5F5F2", { color: "FFFFFF", width: 0.8 });
  addText(slide, ctx.theme, "48MP", x + 0.18, y + 0.18, 0.72, 0.18, { fontSize: 10, bold: true, color: ctx.theme.ink, margin: 0 });
  [["0.5x", 0.28, 0.62], ["1x", 0.88, 0.62], ["2x", 1.48, 0.62]].forEach(([t, dx, dy]) => {
    slide.addShape("ellipse", {
      x: x + Number(dx),
      y: y + Number(dy),
      w: 0.38,
      h: 0.38,
      fill: { color: ctx.theme.deep },
      line: { color: ctx.theme.blue ?? ACCENT, width: 1.0 },
    });
    addText(slide, ctx.theme, String(t), x + Number(dx) - 0.02, y + Number(dy) + 0.46, 0.44, 0.08, {
      fontSize: 6.5,
      bold: true,
      color: ctx.theme.muted,
      align: "center",
      margin: 0,
    });
  });
  addRect(slide, x + 0.18, y + 1.44, 1.5, 0.05, ctx.theme.blue ?? ACCENT);
}

function renderFallback(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.visual?.asset) renderBP22(slide, spec, ctx);
  else if ((spec.items ?? []).length <= 2) renderBP08(slide, spec, ctx);
  else if ((spec.items ?? []).length <= 3) renderBP13(slide, spec, ctx);
  else renderBP19(slide, spec, ctx);
}

export function renderBlueprintSwiss(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, index: number): void {
  slide.background = { color: ctx.theme.bg };
  if (isBrandEvent(ctx)) {
    renderBrandEvent(slide, spec, ctx, index);
    return;
  }
  const layout = spec.registeredLayout;
  const componentType = spec.componentPlan?.find((component) => component.priority === "primary")?.type ?? spec.componentPlan?.[0]?.type;
  if (layout === "BP01") renderBP01(slide, spec, ctx);
  else if (componentType === "kpi-card" || componentType === "chart-native") renderKpiComponent(slide, spec, ctx);
  else if (componentType === "icon-card") renderIconCardComponent(slide, spec, ctx);
  else if (componentType === "process-flow" || componentType === "timeline") renderProcessComponent(slide, spec, ctx);
  else if (componentType === "comparison-matrix") renderComparisonMatrixComponent(slide, spec, ctx);
  else if (componentType === "checklist") renderChecklistComponent(slide, spec, ctx);
  else if (componentType === "mermaid-diagram" || componentType === "architecture-diagram") renderMermaidFallbackComponent(slide, spec, ctx);
  else if (layout === "BP02") renderBP02(slide, spec, ctx);
  else if (layout === "BP03") renderBP03(slide, spec, ctx);
  else if (layout === "BP04") renderBP04(slide, spec, ctx);
  else if (layout === "BP05") renderBP05(slide, spec, ctx);
  else if (layout === "BP06") renderBP06(slide, spec, ctx);
  else if (layout === "BP07") renderBP07(slide, spec, ctx);
  else if (layout === "BP08") renderBP08(slide, spec, ctx);
  else if (layout === "BP09") renderBP09(slide, spec, ctx);
  else if (layout === "BP10") renderBP10(slide, spec, ctx);
  else if (layout === "BP11") renderBP11(slide, spec, ctx);
  else if (layout === "BP12") renderBP12(slide, spec, ctx);
  else if (layout === "BP13") renderBP13(slide, spec, ctx);
  else if (layout === "BP14") renderBP14(slide, spec, ctx);
  else if (layout === "BP15") renderBP15(slide, spec, ctx);
  else if (layout === "BP16") renderBP16(slide, spec, ctx);
  else if (layout === "BP17") renderBP17(slide, spec, ctx);
  else if (layout === "BP18") renderBP18(slide, spec, ctx);
  else if (layout === "BP19") renderBP19(slide, spec, ctx);
  else if (layout === "BP20") renderBP20(slide, spec, ctx);
  else if (layout === "BP21") renderBP21(slide, spec, ctx);
  else if (layout === "BP22") renderBP22(slide, spec, ctx);
  else renderFallback(slide, spec, ctx);
  if (layout !== "BP01" && spec.pageType !== "cover") slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
}

function addImageCover(slide: PptxSlide, path: string, x: number, y: number, w: number, h: number): void {
  const natural = imageSizeForPptxSizing(path, w, h);
  slide.addImage({ path, x, y, w: natural.w, h: natural.h, sizing: { type: "cover", w, h } });
}

function imageSizeForPptxSizing(path: string, fallbackW: number, fallbackH: number): { w: number; h: number } {
  const size = readImagePixelSize(path);
  if (!size) return { w: fallbackW, h: fallbackH };
  const ratio = size.width / size.height;
  return ratio >= 1 ? { w: ratio, h: 1 } : { w: 1, h: 1 / ratio };
}

function readImagePixelSize(path: string): { width: number; height: number } | null {
  const data = fs.readFileSync(path);
  if (data.length >= 24 && data.toString("ascii", 1, 4) === "PNG") return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
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
