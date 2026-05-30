import path from "node:path";
import { createRequire } from "node:module";
import type { DeckSpec } from "../schema.js";
import { aiProductSwiss, automotiveDeepBlue, guizangSwiss, literaryWarm, swissMinimal, teachingToolkit, type ThemeTokens } from "../themes/literaryWarm.js";

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
  themeId: DeckSpec["theme"]["id"];
  coverVariant?: DeckSpec["theme"]["coverVariant"];
  rootDir: string;
  resolveAsset: (assetIdOrPath: string) => string;
}

export function createPresentation(deck: DeckSpec, rootDir: string): RenderContext {
  const pptx = new PptxGenJS();
  const theme =
    deck.theme.id === "automotive-deep-blue"
      ? automotiveDeepBlue(deck.theme.fontFace)
      : deck.theme.id === "guizang-swiss"
      ? guizangSwiss(deck.theme.fontFace)
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

  return { pptx, theme, themeId: deck.theme.id, coverVariant: deck.theme.coverVariant, rootDir, resolveAsset };
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
