import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { DeckSpec } from "../schema.js";
import { aiProductSwiss, automotiveDeepBlue, blueprintSwiss, literaryWarm, swissMinimal, teachingToolkit, type ThemeTokens } from "../themes/literaryWarm.js";

const require = createRequire(import.meta.url);
const PptxGenJS = require("pptxgenjs") as new () => Pptx;

export type Pptx = {
  layout: string;
  author: string;
  subject: string;
  title: string;
  company: string;
  lang?: string;
  theme: unknown;
  defineSlideMaster: (props: unknown) => void;
  addSlide: (masterName?: string) => PptxSlide;
  writeFile: (props: { fileName: string }) => Promise<string>;
};
export type PptxSlide = {
  background?: unknown;
  addText: (text: string, options: Record<string, unknown>) => unknown;
  addShape: (shapeType: string, options: Record<string, unknown>) => unknown;
  addImage: (options: Record<string, unknown>) => unknown;
};
type TextOptions = Record<string, unknown>;

export interface RenderContext {
  pptx: Pptx;
  theme: ThemeTokens;
  designBrief?: DeckSpec["designBrief"];
  themeId: DeckSpec["theme"]["id"];
  coverVariant?: DeckSpec["theme"]["coverVariant"];
  rootDir: string;
  resolveAsset: (assetIdOrPath: string) => string;
  resolveSvgLayer: (slideNumber: number) => string | null;
  nativeSvgConversion: NativeSvgConversionRecord[];
}

export interface NativeSvgConversionRecord {
  svgPath: string;
  converted: Record<string, number>;
  skipped: Record<string, number>;
}

export function createPresentation(deck: DeckSpec, rootDir: string): RenderContext {
  const pptx = new PptxGenJS();
  const theme =
    deck.theme.id === "automotive-deep-blue"
      ? automotiveDeepBlue(deck.theme.fontFace)
      : deck.theme.id === "blueprint-swiss"
      ? blueprintSwiss(deck.theme.fontFace)
      : deck.theme.id === "swiss-minimal"
      ? swissMinimal(deck.theme.fontFace)
      : deck.theme.id === "ai-product-swiss"
      ? aiProductSwiss(deck.theme.fontFace)
      : deck.theme.id === "teaching-toolkit"
        ? teachingToolkit(deck.theme.fontFace)
        : literaryWarm(deck.theme.fontFace);
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = deck.meta.author ?? "ppt-builder-cli";
  pptx.subject = deck.meta.subject ?? deck.meta.title;
  pptx.title = deck.meta.title;
  pptx.company = deck.meta.company ?? "";
  pptx.lang = deck.meta.lang ?? "zh-CN";
  pptx.theme = {
    headFontFace: theme.fontFace,
    bodyFontFace: theme.fontFace,
    lang: deck.meta.lang ?? "zh-CN",
  };
  pptx.defineSlideMaster({
    title: "BLANK",
    background: { color: theme.bg },
    objects: [],
  });

  function resolveAsset(assetIdOrPath: string): string {
    const mapped = deck.assets?.[assetIdOrPath] ?? assetIdOrPath;
    return path.isAbsolute(mapped) ? mapped : path.resolve(rootDir, mapped);
  }

  function resolveSvgLayer(slideNumber: number): string | null {
    const file = path.resolve(rootDir, "svg-pages", `slide-${String(slideNumber).padStart(2, "0")}.svg`);
    return fs.existsSync(file) ? file : null;
  }

  return { pptx, theme, designBrief: deck.designBrief, themeId: deck.theme.id, coverVariant: deck.theme.coverVariant, rootDir, resolveAsset, resolveSvgLayer, nativeSvgConversion: [] };
}

export function addSvgLayer(slide: PptxSlide, svgPath: string, x = 0, y = 0, w = 13.333, h = 7.5): void {
  const svg = fs.readFileSync(svgPath);
  const data = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  slide.addImage({ data, x, y, w, h });
}

export function addNativeSvgLayer(slide: PptxSlide, svgPath: string): NativeSvgConversionRecord {
  const svg = fs.readFileSync(svgPath, "utf8");
  const record: NativeSvgConversionRecord = { svgPath, converted: {}, skipped: {} };
  for (const element of parseSvgElements(svg)) {
    const converted =
      element.name === "rect"
        ? addNativeRect(slide, element.attrs)
        : element.name === "circle"
          ? addNativeCircle(slide, element.attrs)
          : element.name === "line"
            ? addNativeLine(slide, element.attrs)
            : element.name === "path"
              ? addNativePath(slide, element.attrs)
              : element.name === "text"
                ? addNativeText(slide, element.attrs, element.text ?? "")
                : 0;
    const bucket = converted > 0 ? record.converted : record.skipped;
    bucket[element.name] = (bucket[element.name] ?? 0) + Math.max(1, converted);
  }
  return record;
}

function parseSvgElements(svg: string): Array<{ name: string; attrs: Record<string, string>; text?: string }> {
  const elements: Array<{ name: string; attrs: Record<string, string>; text?: string }> = [];
  const simplePattern = /<(rect|circle|line|path)\b([^>]*)\/?>/g;
  for (const match of svg.matchAll(simplePattern)) {
    elements.push({ name: match[1], attrs: parseAttrs(match[2]) });
  }
  const textPattern = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  for (const match of svg.matchAll(textPattern)) {
    elements.push({ name: "text", attrs: parseAttrs(match[1]), text: decodeXml(stripTags(match[2])).trim() });
  }
  return elements;
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /([:\w-]+)\s*=\s*"([^"]*)"/g;
  for (const match of raw.matchAll(attrPattern)) attrs[match[1]] = match[2];
  return attrs;
}

function addNativeRect(slide: PptxSlide, attrs: Record<string, string>): number {
  const x = px(attrs.x);
  const y = px(attrs.y);
  const w = px(attrs.width);
  const h = px(attrs.height);
  if (w <= 0 || h <= 0) return 0;
  if (isFullyTransparent(attrs)) return 0;
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: fillOptions(attrs),
    line: lineOptions(attrs),
    transparency: transparency(attrs),
  });
  return 1;
}

function addNativeCircle(slide: PptxSlide, attrs: Record<string, string>): number {
  const r = px(attrs.r);
  if (r <= 0) return 0;
  const cx = px(attrs.cx);
  const cy = px(attrs.cy);
  if (isFullyTransparent(attrs)) return 0;
  slide.addShape("ellipse", {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
    fill: fillOptions(attrs),
    line: lineOptions(attrs),
    transparency: transparency(attrs),
  });
  return 1;
}

function addNativeLine(slide: PptxSlide, attrs: Record<string, string>): number {
  const x1 = px(attrs.x1);
  const y1 = px(attrs.y1);
  const x2 = px(attrs.x2);
  const y2 = px(attrs.y2);
  slide.addShape("line", {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: lineOptions(attrs, "stroke"),
  });
  return 1;
}

function addNativePath(slide: PptxSlide, attrs: Record<string, string>): number {
  const d = attrs.d ?? "";
  const points = [...d.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/gi)].map((match) => ({
    x: px(match[1]),
    y: px(match[2]),
  }));
  let converted = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    slide.addShape("line", {
      x: prev.x,
      y: prev.y,
      w: next.x - prev.x,
      h: next.y - prev.y,
      line: lineOptions(attrs, "stroke"),
    });
    converted += 1;
  }
  return converted;
}

function addNativeText(slide: PptxSlide, attrs: Record<string, string>, text: string): number {
  if (!text) return 0;
  const fontSize = num(attrs["font-size"], 18);
  slide.addText(text, {
    x: px(attrs.x),
    y: px(attrs.y) - fontSize / 96,
    w: 8,
    h: Math.max(0.25, fontSize / 54),
    fontFace: firstFont(attrs["font-family"]),
    fontSize,
    color: cleanColor(attrs.fill, "000000"),
    bold: attrs["font-weight"] === "700" || attrs["font-weight"] === "800" || attrs["font-weight"] === "bold",
    margin: 0,
    breakLine: false,
    fit: "shrink",
    transparency: transparency(attrs),
  });
  return 1;
}

function fillOptions(attrs: Record<string, string>): Record<string, unknown> {
  const fill = attrs.fill ?? "none";
  if (fill === "none") return { color: "FFFFFF", transparency: 100 };
  return { color: cleanColor(fill, "FFFFFF"), transparency: transparency(attrs, "fill-opacity") };
}

function lineOptions(attrs: Record<string, string>, colorAttr: "stroke" | "line" = "stroke"): Record<string, unknown> {
  const stroke = attrs[colorAttr] ?? attrs.stroke;
  if (!stroke || stroke === "none") return { color: cleanColor(attrs.fill, "FFFFFF"), transparency: 100 };
  return {
    color: cleanColor(stroke, "000000"),
    width: Math.max(0.25, num(attrs["stroke-width"], 1) * 0.75),
    transparency: transparency(attrs, "stroke-opacity"),
  };
}

function isFullyTransparent(attrs: Record<string, string>): boolean {
  return attrs.opacity === "0" || attrs["fill-opacity"] === "0";
}

function transparency(attrs: Record<string, string>, opacityAttr?: string): number {
  const raw = opacityAttr ? attrs[opacityAttr] ?? attrs.opacity : attrs.opacity;
  if (!raw) return 0;
  const opacity = Math.max(0, Math.min(1, Number(raw)));
  return Math.round((1 - opacity) * 100);
}

function px(value: string | undefined): number {
  return num(value, 0) / 96;
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(String(value ?? "").replace(/px$/, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanColor(value: string | undefined, fallback: string): string {
  if (!value || value === "none") return fallback;
  return value.replace("#", "").toUpperCase();
}

function firstFont(value: string | undefined): string {
  return (value ?? "Microsoft YaHei").split(",")[0].replace(/["']/g, "").trim() || "Microsoft YaHei";
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function decodeXml(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export function addText(
  slide: PptxSlide,
  theme: ThemeTokens,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: TextOptions = {},
): void {
  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: theme.fontFace,
    fontSize: 18,
    color: theme.ink,
    bold: false,
    align: "left",
    valign: "top",
    breakLine: false,
    margin: 0.06,
    fit: "shrink",
    ...opts,
  });
}

export function addRect(
  slide: PptxSlide,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  line?: { color?: string; width?: number; transparency?: number },
): void {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: fill, transparency: line?.transparency ?? 0 },
    line: line?.color ? { color: line.color, width: line.width ?? 1 } : { color: fill, transparency: 100 },
  });
}

export function slideNumber(slide: PptxSlide, theme: ThemeTokens, n: number, color = theme.brown): void {
  addText(slide, theme, String(n).padStart(2, "0"), 12.0, 6.83, 0.6, 0.25, {
    fontSize: 9,
    color,
    align: "right",
  });
}
