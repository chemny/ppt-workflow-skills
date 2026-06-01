import fs from "node:fs/promises";
import path from "node:path";
import type { WorkflowSlideSpecDeck, WorkflowVisualType } from "./slideSpec.js";

type StrategyUseValue = boolean | "missing";

export interface VisualStrategyReport {
  status: "pass" | "warning";
  slideCount: number;
  distribution: Record<string, number>;
  slides: Array<{
    slideNumber: number;
    title: string;
    primaryVisualType: WorkflowVisualType | "missing";
    secondaryVisualType?: WorkflowVisualType | null;
    aiImageUse: StrategyUseValue;
    mermaidUse: StrategyUseValue;
    nativeComponentUse: StrategyUseValue;
    decisionReason?: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
    slideNumber?: number;
  }>;
}

export function createVisualStrategyReport(spec: WorkflowSlideSpecDeck): VisualStrategyReport {
  const distribution: Record<string, number> = {};
  const warnings: VisualStrategyReport["warnings"] = [];

  const slides = spec.slides.map((slide) => {
    const strategy = slide.visualStrategy;
    const primary: WorkflowVisualType | "missing" = strategy?.primaryVisualType ?? "missing";
    distribution[primary] = (distribution[primary] ?? 0) + 1;

    if (!strategy) {
      warnings.push({
        code: "visual_strategy_missing",
        message: "Slide has no visualStrategy; Skill 4 will have to infer the visual path.",
        slideNumber: slide.slideNumber,
      });
    } else {
      if (strategy.primaryVisualType === "ai-generated-image" && slide.visual.type !== "generated-image") {
        warnings.push({
          code: "ai_strategy_without_generated_visual",
          message: "AI image is primary in visualStrategy, but visual.type is not generated-image.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "mermaid-diagram" && !slide.diagramPlan) {
        warnings.push({
          code: "mermaid_strategy_without_diagram",
          message: "Mermaid is primary in visualStrategy, but diagramPlan is missing.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "chart-table" && !slide.chartPlan?.needed) {
        warnings.push({
          code: "chart_strategy_without_chart_plan",
          message: "Chart/table is primary in visualStrategy, but chartPlan is not marked needed.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "ppt-native-component" && !hasRenderableComponents(slide)) {
        warnings.push({
          code: "native_strategy_without_component",
          message: "PPT-native component is primary in visualStrategy, but componentPlan/components are missing.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "screenshot" && slide.visual.type !== "screenshot" && slide.requiredAssets.length === 0) {
        warnings.push({
          code: "screenshot_strategy_without_asset",
          message: "Screenshot is primary in visualStrategy, but no screenshot visual or required asset is present.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "real-asset" && slide.requiredAssets.length === 0 && slide.visual.type !== "real-image") {
        warnings.push({
          code: "real_asset_strategy_without_asset",
          message: "Real asset is primary in visualStrategy, but no required asset or real-image visual is present.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.primaryVisualType === "none" && slide.visual.type !== "none") {
        warnings.push({
          code: "none_strategy_with_visual",
          message: "No visual is primary in visualStrategy, but visual.type is not none.",
          slideNumber: slide.slideNumber,
        });
      }
      if (strategy.nativeComponentUse.use && !hasRenderableComponents(slide)) {
        warnings.push({
          code: "native_use_without_component",
          message: "nativeComponentUse is true, but no componentPlan/components are present.",
          slideNumber: slide.slideNumber,
        });
      }
    }

    return {
      slideNumber: slide.slideNumber,
      title: slide.title,
      primaryVisualType: primary,
      secondaryVisualType: strategy?.secondaryVisualType,
      aiImageUse: useValue(strategy?.aiImageUse.use),
      mermaidUse: useValue(strategy?.mermaidUse.use),
      nativeComponentUse: useValue(strategy?.nativeComponentUse.use),
      decisionReason: strategy?.decisionReason,
    };
  });

  const dominant = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
  if (dominant && spec.slides.length >= 6 && dominant[1] / spec.slides.length > 0.72) {
    warnings.push({
      code: "visual_strategy_too_uniform",
      message: `Visual strategy is heavily dominated by ${dominant[0]} (${dominant[1]}/${spec.slides.length}). Check whether the deck needs more visual rhythm.`,
    });
  }

  return {
    status: warnings.length ? "warning" : "pass",
    slideCount: spec.slides.length,
    distribution,
    slides,
    warnings,
  };
}

function useValue(value: boolean | undefined): StrategyUseValue {
  return typeof value === "boolean" ? value : "missing";
}

function hasRenderableComponents(slide: WorkflowSlideSpecDeck["slides"][number]): boolean {
  return slide.componentPlan?.length ? true : slide.components.length > 0;
}

export async function writeVisualStrategyReport(report: VisualStrategyReport, outPath: string): Promise<void> {
  const absoluteOut = path.resolve(outPath);
  await fs.mkdir(path.dirname(absoluteOut), { recursive: true });
  await fs.writeFile(absoluteOut, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
