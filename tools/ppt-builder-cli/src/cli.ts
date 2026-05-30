import fs from "node:fs/promises";
import path from "node:path";
import { assertDeckSpec, type DeckSpec } from "./schema.js";
import { createPresentation } from "./renderer/pptxgen.js";
import { renderTitleImageSplit } from "./layouts/titleImageSplit.js";
import { renderTwoPerspectiveContrast } from "./layouts/twoPerspectiveContrast.js";
import { renderRailFlow } from "./layouts/railFlow.js";
import { renderTeachingToolkit } from "./layouts/teachingToolkit.js";
import { renderAiProductSwiss } from "./layouts/aiProductSwiss.js";
import { renderGuizangSwiss } from "./layouts/guizangSwiss.js";
import { ensureManualAdvanceAndSubtleTransitions } from "./postprocess/playback.js";

function usage(): string {
  return "Usage: tsx src/cli.ts build <deck.json> --out <output.pptx>";
}

function parseBuildArgs(argv: string[]): { input: string; out: string } {
  if (argv[0] !== "build" || !argv[1]) throw new Error(usage());
  const outIndex = argv.indexOf("--out");
  if (outIndex === -1 || !argv[outIndex + 1]) throw new Error(usage());
  return { input: argv[1], out: argv[outIndex + 1] };
}

async function readDeckSpec(inputPath: string): Promise<{ deck: DeckSpec; rootDir: string }> {
  const absoluteInput = path.resolve(inputPath);
  const raw = JSON.parse(await fs.readFile(absoluteInput, "utf8")) as unknown;
  assertDeckSpec(raw);
  return { deck: raw, rootDir: path.dirname(absoluteInput) };
}

async function build(inputPath: string, outPath: string): Promise<void> {
  const { deck, rootDir } = await readDeckSpec(inputPath);
  const ctx = createPresentation(deck, rootDir);

  deck.slides.forEach((slideSpec, index) => {
    const slide = ctx.pptx.addSlide("BLANK");
    if (slideSpec.layout === "title-image-split") renderTitleImageSplit(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "two-perspective-contrast") renderTwoPerspectiveContrast(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "rail-flow") renderRailFlow(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "teaching-toolkit" && ctx.themeId === "guizang-swiss") {
      renderGuizangSwiss(slide, slideSpec, ctx, index);
    }
    else if (slideSpec.layout === "teaching-toolkit" && (ctx.themeId === "ai-product-swiss" || ctx.themeId === "swiss-minimal" || ctx.themeId === "automotive-deep-blue")) {
      renderAiProductSwiss(slide, slideSpec, ctx, index);
    }
    else if (slideSpec.layout === "teaching-toolkit") renderTeachingToolkit(slide, slideSpec, ctx, index);
    else throw new Error(`Unsupported layout: ${(slideSpec as { layout: string }).layout}`);
  });

  const absoluteOut = path.resolve(outPath);
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true });
  await ctx.pptx.writeFile({ fileName: absoluteOut });
  await ensureManualAdvanceAndSubtleTransitions(absoluteOut);
  console.log(absoluteOut);
}

const args = parseBuildArgs(process.argv.slice(2));
await build(args.input, args.out);
