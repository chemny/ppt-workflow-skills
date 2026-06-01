import fs from "node:fs/promises";
import path from "node:path";
import { assertDeckSpec, type DeckSpec } from "./schema.js";
import { addNativeSvgLayer, createPresentation } from "./renderer/pptxgen.js";
import { renderTitleImageSplit } from "./layouts/titleImageSplit.js";
import { renderTwoPerspectiveContrast } from "./layouts/twoPerspectiveContrast.js";
import { renderRailFlow } from "./layouts/railFlow.js";
import { renderTeachingToolkit } from "./layouts/teachingToolkit.js";
import { renderAiProductSwiss } from "./layouts/aiProductSwiss.js";
import { renderBlueprintSwiss } from "./layouts/blueprintSwiss.js";
import { ensureManualAdvanceAndSubtleTransitions } from "./postprocess/playback.js";
import { checkPptxQuality, writeQualityReport } from "./quality/pptxQualityCheck.js";
import { reviewProject } from "./quality/projectFinalReview.js";
import { generatePresentationPractice } from "./quality/presentationPractice.js";
import { renderPreview } from "./quality/renderPreview.js";
import { checkSvgQuality, writeSvgQualityReport } from "./quality/svgQualityCheck.js";
import { validateSlideSpecFile } from "./protocol/validateSlideSpec.js";
import { compileSlideSpecFile } from "./protocol/compileSlideSpec.js";
import { createVisualStrategyReport, writeVisualStrategyReport } from "./protocol/visualStrategyReport.js";
import { writeSvgPagesToBuildDir } from "./protocol/svgPageGenerator.js";

function usage(): string {
  return [
    "Usage:",
    "  tsx src/cli.ts build <deck.json> --out <output.pptx>",
    "  tsx src/cli.ts compile-slide-spec <v3-slide-spec.json> --out <deck.json> [--theme <theme-id>]",
    "  tsx src/cli.ts write-project-artifacts <v3-slide-spec.json> --out-dir <project-dir> [--theme <theme-id>]",
    "  tsx src/cli.ts build-slide-spec <v3-slide-spec.json> --out <output.pptx> [--theme <theme-id>]",
    "  tsx src/cli.ts check <deck.json> --pptx <deck.pptx> [--asset-manifest <path>] [--design-lock <path>] [--out <report.json>]",
    "  tsx src/cli.ts check-svg <svg-dir> --visual-lock <visual-lock.json> [--visual-page-plan <visual-page-plan.json>] [--out <report.json>]",
    "  tsx src/cli.ts render-preview <deck.pptx> --out-dir <preview-dir> [--report <report.json>]",
    "  tsx src/cli.ts review-project <project-dir> [--out]",
    "  tsx src/cli.ts practice-project <project-dir> [--out]",
    "  tsx src/cli.ts validate-slide-spec <v3-slide-spec.json>",
    "  tsx src/cli.ts visual-strategy-report <v3-slide-spec.json> [--out <report.json>]",
  ].join("\n");
}

function parseOptionalOutArg(argv: string[], command: string): { input: string; out?: string } {
  if (argv[0] !== command || !argv[1]) throw new Error(usage());
  const outIndex = argv.indexOf("--out");
  return { input: argv[1], out: outIndex === -1 ? undefined : argv[outIndex + 1] };
}

function parsePreviewArgs(argv: string[]): { pptx: string; outDir: string; report?: string } {
  if (argv[0] !== "render-preview" || !argv[1]) throw new Error(usage());
  const outDirIndex = argv.indexOf("--out-dir");
  if (outDirIndex === -1 || !argv[outDirIndex + 1]) throw new Error(usage());
  const reportIndex = argv.indexOf("--report");
  return {
    pptx: argv[1],
    outDir: argv[outDirIndex + 1],
    report: reportIndex === -1 ? undefined : argv[reportIndex + 1],
  };
}

function parseBuildArgs(argv: string[]): { input: string; out: string } {
  if ((argv[0] !== "build" && argv[0] !== "build-slide-spec" && argv[0] !== "compile-slide-spec") || !argv[1]) throw new Error(usage());
  const outIndex = argv.indexOf("--out");
  if (outIndex === -1 || !argv[outIndex + 1]) throw new Error(usage());
  return { input: argv[1], out: argv[outIndex + 1] };
}

function parseThemeArg(argv: string[]): string | undefined {
  const themeIndex = argv.indexOf("--theme");
  return themeIndex === -1 ? undefined : argv[themeIndex + 1];
}

function parseOutDirArg(argv: string[]): { input: string; outDir: string } {
  if (argv[0] !== "write-project-artifacts" || !argv[1]) throw new Error(usage());
  const outDirIndex = argv.indexOf("--out-dir");
  if (outDirIndex === -1 || !argv[outDirIndex + 1]) throw new Error(usage());
  return { input: argv[1], outDir: argv[outDirIndex + 1] };
}

function parseCheckArgs(argv: string[]): { input: string; pptx: string; assetManifest?: string; designLock?: string; out?: string } {
  if (argv[0] !== "check" || !argv[1]) throw new Error(usage());
  const pptxIndex = argv.indexOf("--pptx");
  if (pptxIndex === -1 || !argv[pptxIndex + 1]) throw new Error(usage());
  const assetManifestIndex = argv.indexOf("--asset-manifest");
  const designLockIndex = argv.indexOf("--design-lock");
  const outIndex = argv.indexOf("--out");
  return {
    input: argv[1],
    pptx: argv[pptxIndex + 1],
    assetManifest: assetManifestIndex === -1 ? undefined : argv[assetManifestIndex + 1],
    designLock: designLockIndex === -1 ? undefined : argv[designLockIndex + 1],
    out: outIndex === -1 ? undefined : argv[outIndex + 1],
  };
}

function parseSvgCheckArgs(argv: string[]): { svgDir: string; visualLock?: string; visualPagePlan?: string; out?: string } {
  if (argv[0] !== "check-svg" || !argv[1]) throw new Error(usage());
  const visualLockIndex = argv.indexOf("--visual-lock");
  const visualPagePlanIndex = argv.indexOf("--visual-page-plan");
  const outIndex = argv.indexOf("--out");
  return {
    svgDir: argv[1],
    visualLock: visualLockIndex === -1 ? undefined : argv[visualLockIndex + 1],
    visualPagePlan: visualPagePlanIndex === -1 ? undefined : argv[visualPagePlanIndex + 1],
    out: outIndex === -1 ? undefined : argv[outIndex + 1],
  };
}

async function readDeckSpec(inputPath: string): Promise<{ deck: DeckSpec; rootDir: string }> {
  const absoluteInput = path.resolve(inputPath);
  const raw = JSON.parse(await fs.readFile(absoluteInput, "utf8")) as unknown;
  assertDeckSpec(raw);
  return { deck: raw, rootDir: path.dirname(absoluteInput) };
}

async function build(inputPath: string, outPath: string): Promise<void> {
  const { deck, rootDir } = await readDeckSpec(inputPath);
  await buildDeck(deck, rootDir, outPath);
}

async function buildDeck(deck: DeckSpec, rootDir: string, outPath: string): Promise<void> {
  const ctx = createPresentation(deck, rootDir);

  deck.slides.forEach((slideSpec, index) => {
    const slide = ctx.pptx.addSlide("BLANK");
    if ("slideNumber" in slideSpec && typeof slideSpec.slideNumber === "number") {
      const svgLayer = ctx.resolveSvgLayer(slideSpec.slideNumber);
      if (svgLayer) ctx.nativeSvgConversion.push(addNativeSvgLayer(slide, svgLayer));
    }
    if (slideSpec.layout === "title-image-split") renderTitleImageSplit(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "two-perspective-contrast") renderTwoPerspectiveContrast(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "rail-flow") renderRailFlow(slide, slideSpec, ctx, index);
    else if (slideSpec.layout === "teaching-toolkit" && ctx.themeId === "blueprint-swiss") {
      renderBlueprintSwiss(slide, slideSpec, ctx, index);
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
  if (ctx.nativeSvgConversion.length > 0) {
    await fs.writeFile(
      path.join(path.dirname(absoluteOut), "native-svg-conversion-report.json"),
      `${JSON.stringify({ version: "0.1", records: ctx.nativeSvgConversion }, null, 2)}\n`,
      "utf8",
    );
  }
  console.log(absoluteOut);
}

const argv = process.argv.slice(2);
if (argv[0] === "build") {
  const args = parseBuildArgs(argv);
  await build(args.input, args.out);
} else if (argv[0] === "compile-slide-spec") {
  const args = parseBuildArgs(argv);
  const { deck } = await compileSlideSpecFile(args.input, { themeId: parseThemeArg(argv) });
  const absoluteOut = path.resolve(args.out);
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true });
  await fs.writeFile(absoluteOut, `${JSON.stringify(deck, null, 2)}\n`, "utf8");
  console.log(absoluteOut);
} else if (argv[0] === "write-project-artifacts") {
  const args = parseOutDirArg(argv);
  const { deck, artifacts } = await compileSlideSpecFile(args.input, { themeId: parseThemeArg(argv) });
  const outDir = path.resolve(args.outDir);
  const buildDir = path.join(outDir, "05-build");
  const designDir = path.join(outDir, "04-design");
  await Promise.all([buildDir, designDir].map((dir) => fs.mkdir(dir, { recursive: true })));
  await fs.writeFile(path.join(buildDir, "deck-builder-input.json"), `${JSON.stringify(deck, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "asset-plan.json"), `${JSON.stringify(artifacts.assetManifest, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "design-brief.json"), `${JSON.stringify(artifacts.designBrief, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "design-system.json"), `${JSON.stringify(artifacts.designLock, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "visual-route.json"), `${JSON.stringify(artifacts.visualRoute, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "visual-lock.json"), `${JSON.stringify(artifacts.visualLock, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "visual-page-plan.json"), `${JSON.stringify(artifacts.visualPagePlan, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "page-design-plan.json"), `${JSON.stringify(artifacts.pageDesignPlan, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(designDir, "visual-strategy-report.json"), `${JSON.stringify(artifacts.visualStrategyReport, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(buildDir, "layout-mapping-report.json"), `${JSON.stringify(artifacts.layoutMappingReport, null, 2)}\n`, "utf8");
  if (artifacts.visualRoute.route === "svg-native") {
    await writeSvgPagesToBuildDir(buildDir, artifacts.visualLock, artifacts.visualPagePlan);
  }
  console.log(outDir);
} else if (argv[0] === "build-slide-spec") {
  const args = parseBuildArgs(argv);
  const { deck, artifacts } = await compileSlideSpecFile(args.input, { themeId: parseThemeArg(argv) });
  const buildDir = path.dirname(path.resolve(args.out));
  await fs.mkdir(buildDir, { recursive: true });
  await fs.writeFile(path.join(buildDir, "visual-route.json"), `${JSON.stringify(artifacts.visualRoute, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(buildDir, "visual-lock.json"), `${JSON.stringify(artifacts.visualLock, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(buildDir, "visual-page-plan.json"), `${JSON.stringify(artifacts.visualPagePlan, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(buildDir, "page-design-plan.json"), `${JSON.stringify(artifacts.pageDesignPlan, null, 2)}\n`, "utf8");
  if (artifacts.visualRoute.route === "svg-native") {
    await writeSvgPagesToBuildDir(buildDir, artifacts.visualLock, artifacts.visualPagePlan);
  }
  await buildDeck(deck, buildDir, args.out);
} else if (argv[0] === "check") {
  const args = parseCheckArgs(argv);
  const report = await checkPptxQuality({
    deckJsonPath: args.input,
    pptxPath: args.pptx,
    assetManifestPath: args.assetManifest,
    designLockPath: args.designLock,
  });
  if (args.out) await writeQualityReport(report, args.out);
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "fail") process.exitCode = 2;
} else if (argv[0] === "check-svg") {
  const args = parseSvgCheckArgs(argv);
  const report = await checkSvgQuality({ svgDir: args.svgDir, visualLockPath: args.visualLock, visualPagePlanPath: args.visualPagePlan });
  if (args.out) await writeSvgQualityReport(report, args.out);
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "fail") process.exitCode = 2;
} else if (argv[0] === "render-preview") {
  const args = parsePreviewArgs(argv);
  const report = await renderPreview({ pptxPath: args.pptx, outDir: args.outDir, reportPath: args.report });
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "failed") process.exitCode = 2;
} else if (argv[0] === "review-project") {
  if (!argv[1]) throw new Error(usage());
  const report = await reviewProject({ projectDir: argv[1], writeReports: argv.includes("--out") });
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "FAIL") process.exitCode = 2;
} else if (argv[0] === "practice-project") {
  if (!argv[1]) throw new Error(usage());
  const report = await generatePresentationPractice({ projectDir: argv[1], writeReports: argv.includes("--out") });
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "BLOCKED") process.exitCode = 2;
} else if (argv[0] === "validate-slide-spec") {
  if (!argv[1]) throw new Error(usage());
  const report = await validateSlideSpecFile(argv[1]);
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "fail") process.exitCode = 2;
} else if (argv[0] === "visual-strategy-report") {
  const args = parseOptionalOutArg(argv, "visual-strategy-report");
  const { spec } = await compileSlideSpecFile(args.input, { themeId: parseThemeArg(argv) });
  const report = createVisualStrategyReport(spec);
  if (args.out) await writeVisualStrategyReport(report, args.out);
  console.log(JSON.stringify(report, null, 2));
} else {
  throw new Error(usage());
}
