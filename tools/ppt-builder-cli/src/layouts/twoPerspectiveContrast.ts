import type { PerspectiveBlock, TwoPerspectiveContrastSlide } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

function block(
  slide: PptxSlide,
  ctx: RenderContext,
  x: number,
  fill: string,
  line: string,
  color: string,
  value: PerspectiveBlock,
): void {
  const { theme } = ctx;
  addRect(slide, x, 1.56, 4.50, 4.05, fill, { color: line, width: 1 });
  addText(slide, theme, value.title, x + 0.33, 2.07, 3.7, 0.42, { fontSize: 25, bold: true, color });
  addText(slide, theme, value.body, x + 0.37, 2.90, 3.62, 1.55, { fontSize: 19, color });
  addRect(slide, x + 0.35, 4.78, 2.2, 0.03, color);
  addText(slide, theme, value.keyword, x + 0.37, 5.04, 3.4, 0.25, { fontSize: 11, color });
}

export function renderTwoPerspectiveContrast(
  slide: PptxSlide,
  spec: TwoPerspectiveContrastSlide,
  ctx: RenderContext,
  index: number,
): void {
  const { theme } = ctx;
  slide.background = { color: "F4EBDC" };
  addRect(slide, 0, 0, 13.333, 0.82, "EFE1CD");
  addText(slide, theme, spec.title, 0.85, 0.25, 7.7, 0.45, { fontSize: 24, bold: true });
  if (spec.label) addText(slide, theme, spec.label, 11.0, 0.30, 1.2, 0.25, { fontSize: 11, color: theme.brown, align: "right" });

  addRect(slide, 6.15, 1.15, 1.05, 5.25, theme.deep);
  addRect(slide, 6.49, 1.35, 0.38, 4.85, "F4EBDC");
  addText(slide, theme, spec.centerWord, 6.12, 2.80, 1.12, 0.95, { fontSize: 24, bold: true, color: "F4EBDC", align: "center" });

  block(slide, ctx, 0.85, theme.cold, "C2CCC9", "384548", spec.left);
  block(slide, ctx, 8.02, theme.warm, "D6BA8E", theme.brown, spec.right);
  addText(slide, theme, spec.footerPrompt, 2.0, 6.24, 9.55, 0.52, { fontSize: 15, align: "center" });
  slideNumber(slide, theme, spec.slideNumber ?? index + 1);
}
