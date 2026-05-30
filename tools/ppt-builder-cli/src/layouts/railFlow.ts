import type { RailFlowSlide, RailNode } from "../schema.js";
import type { PptxSlide, RenderContext } from "../renderer/pptxgen.js";
import { addRect, addText, slideNumber } from "../renderer/pptxgen.js";

function toneColor(node: RailNode, ctx: RenderContext): string {
  if (node.tone === "red") return ctx.theme.red;
  if (node.tone === "deep") return ctx.theme.deep;
  return ctx.theme.brown;
}

function addNode(slide: PptxSlide, ctx: RenderContext, x: number, node: RailNode): void {
  const { theme } = ctx;
  const color = toneColor(node, ctx);
  addText(slide, theme, node.label, x + 0.1, 1.82, 2.6, 0.25, { fontSize: 11, bold: true, color, align: "center" });
  addRect(slide, x, 2.25, 2.8, 2.58, theme.white, { color: theme.line, width: 1 });
  addRect(slide, x, 2.25, 2.8, 0.12, color);
  addText(slide, theme, node.title, x + 0.24, 2.66, 2.35, 0.35, { fontSize: 18, bold: true, color });
  addText(slide, theme, node.body, x + 0.24, 3.30, 2.35, 1.1, { fontSize: 13, color: theme.ink });
}

export function renderRailFlow(slide: PptxSlide, spec: RailFlowSlide, ctx: RenderContext, index: number): void {
  const { theme } = ctx;
  slide.background = { color: theme.bg };
  addText(slide, theme, spec.title, 0.72, 0.60, 6.4, 0.55, { fontSize: 29, bold: true });
  addText(slide, theme, spec.subtitle, 0.76, 1.26, 8.0, 0.35, { fontSize: 17, color: theme.muted });

  addRect(slide, 1.0, 3.58, 10.75, 0.07, theme.deep);
  addRect(slide, 1.0, 4.13, 10.75, 0.07, theme.deep);
  for (let i = 0; i < 14; i += 1) addRect(slide, 1.3 + i * 0.75, 3.33, 0.08, 1.17, "A48D70");

  const xs = [0.95, 4.90, 8.85];
  spec.nodes.slice(0, 3).forEach((node, i) => addNode(slide, ctx, xs[i] ?? 0.95, node));

  addRect(slide, 3.98, 3.35, 0.55, 0.05, theme.brown);
  addRect(slide, 4.36, 3.21, 0.16, 0.16, theme.brown);
  addRect(slide, 7.93, 3.35, 0.55, 0.05, theme.brown);
  addRect(slide, 8.31, 3.21, 0.16, 0.16, theme.brown);

  addRect(slide, 1.18, 5.43, 10.42, 0.80, "EFE3D2", { color: "D6C3A7", width: 1 });
  addText(slide, theme, spec.prompt, 1.40, 5.58, 9.95, 0.42, { fontSize: 17, align: "center" });
  slideNumber(slide, theme, spec.slideNumber ?? index + 1);
}
