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
const CONTENT_TOP = 2.26;
const SOURCE_Y = 7.03;

function color(ctx: RenderContext, item?: TeachingItem): string {
  if (item?.tone === "green") return ctx.theme.green ?? "C5E803";
  if (item?.tone === "yellow") return ctx.theme.yellow ?? "FFD500";
  if (item?.tone === "red") return ctx.theme.red;
  return ctx.theme.blue ?? ACCENT;
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
  addText(slide, ctx.theme, spec.title, M, TOP_TITLE, titleW, 0.82, {
    fontSize: 32,
    bold: false,
    color: ctx.theme.ink,
    fit: "shrink",
    margin: 0,
  });
  if (spec.subtitle) {
    addText(slide, ctx.theme, spec.subtitle, M, TOP_SUBTITLE, 8.4, 0.28, { fontSize: 13.2, color: ctx.theme.muted, margin: 0 });
  }
}

function source(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  if (spec.sourceNote) addText(slide, ctx.theme, spec.sourceNote, M, SOURCE_Y, 7.8, 0.14, { fontSize: 7.2, color: ctx.theme.muted, margin: 0 });
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

function renderS01(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS02(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS03(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS04(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS05(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS06(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS07(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS08(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS09(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS10(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS11(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS12(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
  label(slide, ctx, spec.eyebrow ?? "MANIFESTO", M, 0.56);
  addText(slide, ctx.theme, spec.title, M, 1.20, 11.6, 2.65, { fontSize: 50, bold: false, color: ctx.theme.ink, fit: "shrink", margin: 0 });
  addRect(slide, 0, 5.15, W, 0.98, ctx.theme.deep);
  addText(slide, ctx.theme, spec.body ?? spec.subtitle ?? "", M, 5.45, 10.8, 0.32, { fontSize: 16, bold: false, color: ctx.theme.white, fit: "shrink", margin: 0 });
  source(slide, spec, ctx);
}

function renderS13(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS14(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS15(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS16(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS17(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS18(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS19(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS20(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS21(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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

function renderS22(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext): void {
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
  if (spec.visual?.asset) renderS22(slide, spec, ctx);
  else if ((spec.items ?? []).length <= 2) renderS08(slide, spec, ctx);
  else if ((spec.items ?? []).length <= 3) renderS13(slide, spec, ctx);
  else renderS19(slide, spec, ctx);
}

export function renderGuizangSwiss(slide: PptxSlide, spec: TeachingToolkitSlide, ctx: RenderContext, index: number): void {
  slide.background = { color: ctx.theme.bg };
  const layout = spec.registeredLayout;
  if (layout === "S01") renderS01(slide, spec, ctx);
  else if (layout === "S02") renderS02(slide, spec, ctx);
  else if (layout === "S03") renderS03(slide, spec, ctx);
  else if (layout === "S04") renderS04(slide, spec, ctx);
  else if (layout === "S05") renderS05(slide, spec, ctx);
  else if (layout === "S06") renderS06(slide, spec, ctx);
  else if (layout === "S07") renderS07(slide, spec, ctx);
  else if (layout === "S08") renderS08(slide, spec, ctx);
  else if (layout === "S09") renderS09(slide, spec, ctx);
  else if (layout === "S10") renderS10(slide, spec, ctx);
  else if (layout === "S11") renderS11(slide, spec, ctx);
  else if (layout === "S12") renderS12(slide, spec, ctx);
  else if (layout === "S13") renderS13(slide, spec, ctx);
  else if (layout === "S14") renderS14(slide, spec, ctx);
  else if (layout === "S15") renderS15(slide, spec, ctx);
  else if (layout === "S16") renderS16(slide, spec, ctx);
  else if (layout === "S17") renderS17(slide, spec, ctx);
  else if (layout === "S18") renderS18(slide, spec, ctx);
  else if (layout === "S19") renderS19(slide, spec, ctx);
  else if (layout === "S20") renderS20(slide, spec, ctx);
  else if (layout === "S21") renderS21(slide, spec, ctx);
  else if (layout === "S22") renderS22(slide, spec, ctx);
  else renderFallback(slide, spec, ctx);
  if (layout !== "S01" && spec.pageType !== "cover") slideNumber(slide, ctx.theme, spec.slideNumber ?? index + 1, ctx.theme.muted);
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
