import type { TitleImageSplitSlide } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

export function renderTitleImageSplit(slide: PptxSlide, spec: TitleImageSplitSlide, ctx: RenderContext, index: number): void {
  const { theme } = ctx;
  slide.background = { color: theme.paper };
  const imagePath = ctx.resolveAsset(spec.image);

  slide.addImage({
    path: imagePath,
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    sizing: { type: "cover", x: 0, y: 0, w: 13.333, h: 7.5 },
  });
  addRect(slide, 0, 0, 5.85, 7.5, theme.paper, { transparency: 8 });
  addRect(slide, 5.85, 0, 0.035, 7.5, theme.brown);
  addRect(slide, 0, 0, 5.85, 7.5, "FFFFFF", { transparency: 72 });
  addRect(slide, 0.73, 0.97, 1.1, 0.05, theme.brown);

  addText(slide, theme, spec.eyebrow, 0.72, 1.34, 3.8, 0.45, { fontSize: 20, bold: true, color: theme.brown });
  addText(slide, theme, spec.titleLines[0] ?? "", 0.70, 2.04, 3.6, 0.6, { fontSize: 36, bold: true });
  addText(slide, theme, spec.titleLines[1] ?? "", 0.70, 2.72, 4.5, 1.1, { fontSize: 58, bold: true });
  addText(slide, theme, spec.titleLines.slice(2).join("\n"), 0.72, 4.20, 4.1, 0.95, { fontSize: 30, bold: true });
  addRect(slide, 0.78, 5.38, 0.32, 0.42, "D9BC8C");
  addText(slide, theme, spec.note, 1.22, 5.33, 3.75, 0.58, { fontSize: 14, color: theme.muted });
  if (spec.keywords) addText(slide, theme, spec.keywords, 0.80, 6.72, 3.9, 0.25, { fontSize: 11, color: theme.brown });
  slideNumber(slide, theme, spec.slideNumber ?? index + 1, theme.paper);
}
