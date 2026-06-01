import fs from "node:fs/promises";
import path from "node:path";
import { genericLayoutIds } from "./layoutRegistry.js";

export interface SlideSpecValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  slideNumber?: number;
}

export interface SlideSpecValidationReport {
  status: "pass" | "fail";
  file: string;
  slideCount: number;
  issues: SlideSpecValidationIssue[];
}

const allowedLayouts = new Set<string>(genericLayoutIds);
const allowedRhythms = new Set(["anchor", "dense", "breathing"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function hasNonEmptyStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => hasText(item));
}

function hasRenderableComponents(entry: Record<string, unknown>): boolean {
  return asArray(entry.componentPlan).length > 0 || asArray(entry.components).length > 0;
}

function hasRequiredAssets(entry: Record<string, unknown>): boolean {
  return asArray(entry.requiredAssets).length > 0;
}

function isUseTrue(value: unknown): boolean {
  return isRecord(value) && value.use === true;
}

function pushMissingText(issues: SlideSpecValidationIssue[], value: unknown, code: string, message: string, slideNumber?: number): void {
  if (!hasText(value)) issues.push({ severity: "error", code, message, slideNumber });
}

export async function validateSlideSpecFile(filePath: string): Promise<SlideSpecValidationReport> {
  const absolute = path.resolve(filePath);
  const raw = JSON.parse(await fs.readFile(absolute, "utf8")) as unknown;
  const issues: SlideSpecValidationIssue[] = [];

  if (!isRecord(raw)) {
    return {
      status: "fail",
      file: absolute,
      slideCount: 0,
      issues: [{ severity: "error", code: "invalid_root", message: "slide-spec.json root must be an object." }],
    };
  }

  if (raw.version !== "0.2") {
    issues.push({ severity: "warning", code: "version", message: "Expected slide-spec version 0.2." });
  }
  if (!isRecord(raw.meta) || !hasText(raw.meta.title)) {
    issues.push({ severity: "error", code: "meta_title", message: "slide-spec meta.title is required." });
  }
  if (!isRecord(raw.writingStrategy)) {
    issues.push({ severity: "warning", code: "writing_strategy", message: "writingStrategy is missing." });
  } else {
    for (const field of ["audienceNeed", "tone"]) {
      if (!hasText(raw.writingStrategy[field])) issues.push({ severity: "warning", code: `writing_${field}`, message: `writingStrategy.${field} should be filled.` });
    }
    if (!hasNonEmptyStringArray(raw.writingStrategy.narrativeSpine)) {
      issues.push({ severity: "warning", code: "writing_narrative_spine", message: "writingStrategy.narrativeSpine should contain at least one item." });
    }
  }
  if (!isRecord(raw.designDirection)) {
    issues.push({ severity: "warning", code: "design_direction", message: "designDirection is missing." });
  } else {
    for (const field of ["recommendedThemeFamily", "visualTone", "pageDensity"]) {
      if (!hasText(raw.designDirection[field])) issues.push({ severity: "warning", code: `design_${field}`, message: `designDirection.${field} should be filled.` });
    }
  }

  const slides = asArray(raw.slides);
  if (slides.length === 0) {
    issues.push({ severity: "error", code: "slides_missing", message: "slides[] must contain at least one slide." });
  }

  slides.forEach((entry, index) => {
    const slideNumber = index + 1;
    if (!isRecord(entry)) {
      issues.push({ severity: "error", code: "slide_shape", message: "Slide entry must be an object.", slideNumber });
      return;
    }
    const declaredNumber = typeof entry.slideNumber === "number" ? entry.slideNumber : slideNumber;
    if (declaredNumber !== slideNumber) {
      issues.push({ severity: "warning", code: "slide_number_sequence", message: `Expected slideNumber ${slideNumber}, got ${String(entry.slideNumber)}.`, slideNumber });
    }
    for (const field of ["sourceOutlineId", "pageType", "title", "coreMessage", "pageConclusion", "audienceQuestion"]) {
      if (!hasText(entry[field])) issues.push({ severity: "error", code: `missing_${field}`, message: `${field} is required.`, slideNumber });
    }
    if (!hasText(entry.pageRhythm)) {
      issues.push({ severity: "warning", code: "page_rhythm_missing", message: "pageRhythm should be set to anchor, dense, or breathing.", slideNumber });
    } else if (!allowedRhythms.has(String(entry.pageRhythm))) {
      issues.push({ severity: "warning", code: "page_rhythm_unknown", message: `Unknown pageRhythm: ${String(entry.pageRhythm)}.`, slideNumber });
    }
    if (!Array.isArray(entry.visibleBody)) {
      issues.push({ severity: "error", code: "visible_body", message: "visibleBody must be an array.", slideNumber });
    } else if (entry.pageType !== "section-divider" && entry.pageType !== "qa-closing" && !hasNonEmptyStringArray(entry.visibleBody)) {
      issues.push({ severity: "warning", code: "visible_body_empty", message: "visibleBody should contain useful visible copy.", slideNumber });
    }
    if (!Array.isArray(entry.supportingDetails)) issues.push({ severity: "warning", code: "supporting_details", message: "supportingDetails should be an array.", slideNumber });

    const layout = entry.layout;
    if (!isRecord(layout)) {
      issues.push({ severity: "error", code: "layout_missing", message: "layout object is required.", slideNumber });
    } else {
      if (!hasText(layout.intent)) issues.push({ severity: "error", code: "layout_intent", message: "layout.intent is required.", slideNumber });
      if (!hasText(layout.recommendedLayout)) {
        issues.push({ severity: "error", code: "layout_recommended", message: "layout.recommendedLayout is required.", slideNumber });
      } else if (!allowedLayouts.has(String(layout.recommendedLayout))) {
        issues.push({ severity: "warning", code: "layout_unknown", message: `Unknown generic layout: ${String(layout.recommendedLayout)}.`, slideNumber });
      }
      if (!Array.isArray(layout.readingOrder) || layout.readingOrder.length === 0) {
        issues.push({ severity: "warning", code: "reading_order", message: "layout.readingOrder should describe how the slide is read.", slideNumber });
      }
      if (!Array.isArray(layout.contentZones) || layout.contentZones.length === 0) {
        issues.push({ severity: "warning", code: "content_zones", message: "layout.contentZones should describe the slide regions.", slideNumber });
      }
      if (!hasText(layout.densityRule)) issues.push({ severity: "warning", code: "density_rule", message: "layout.densityRule should be filled.", slideNumber });
      if (!hasText(layout.visualPolicy)) issues.push({ severity: "warning", code: "visual_policy", message: "layout.visualPolicy should be filled.", slideNumber });
    }

    const visualStrategy = entry.visualStrategy;
    if (!isRecord(visualStrategy)) {
      issues.push({ severity: "warning", code: "visual_strategy_missing", message: "visualStrategy should explain the page-level visual choice before Skill 4 builds.", slideNumber });
    } else {
      for (const field of ["primaryVisualType", "decisionReason", "audienceValue", "fallback"]) {
        if (!hasText(visualStrategy[field])) issues.push({ severity: "warning", code: `visual_strategy_${field}`, message: `visualStrategy.${field} should be filled.`, slideNumber });
      }
      for (const field of ["aiImageUse", "mermaidUse", "nativeComponentUse"]) {
        if (!isRecord(visualStrategy[field])) {
          issues.push({ severity: "warning", code: `visual_strategy_${field}`, message: `visualStrategy.${field} should be an object.`, slideNumber });
        } else if (typeof visualStrategy[field].use !== "boolean" || !hasText(visualStrategy[field].reason)) {
          issues.push({ severity: "warning", code: `visual_strategy_${field}_decision`, message: `visualStrategy.${field} should include use and reason.`, slideNumber });
        }
      }
    }

    const components = asArray(entry.components);
    components.forEach((component, componentIndex) => {
      if (!isRecord(component)) {
        issues.push({ severity: "error", code: "component_shape", message: `Component ${componentIndex + 1} must be an object.`, slideNumber });
        return;
      }
      for (const field of ["id", "type", "role", "structure", "rendering"]) {
        if (!hasText(component[field])) issues.push({ severity: "error", code: `component_${field}`, message: `Component ${componentIndex + 1} missing ${field}.`, slideNumber });
      }
      if (!Array.isArray(component.content)) {
        issues.push({ severity: "warning", code: "component_content", message: `Component ${componentIndex + 1} should include content[].`, slideNumber });
      } else if (component.content.length === 0 && component.rendering !== "image-slot") {
        issues.push({ severity: "warning", code: "component_content_empty", message: `Component ${componentIndex + 1} has no renderable content.`, slideNumber });
      }
    });

    const componentPlan = asArray(entry.componentPlan);
    const primaryComponentCount = componentPlan.filter((component) => isRecord(component) && component.priority === "primary").length;
    if (primaryComponentCount > 1) {
      issues.push({
        severity: "warning",
        code: "multiple_primary_components",
        message: "A slide should normally have one primary visual component; make other components secondary/supporting.",
        slideNumber,
      });
    }
    componentPlan.forEach((component, componentIndex) => {
      if (!isRecord(component)) {
        issues.push({ severity: "error", code: "component_plan_shape", message: `componentPlan ${componentIndex + 1} must be an object.`, slideNumber });
        return;
      }
      for (const field of ["id", "type", "purpose", "rendering", "priority", "fallback"]) {
        if (!hasText(component[field])) issues.push({ severity: "warning", code: `component_plan_${field}`, message: `componentPlan ${componentIndex + 1} missing ${field}.`, slideNumber });
      }
      if (!Array.isArray(component.content)) {
        issues.push({ severity: "warning", code: "component_plan_content", message: `componentPlan ${componentIndex + 1} should include content[].`, slideNumber });
      }
    });

    const iconPlan = entry.iconPlan;
    if (isRecord(iconPlan) && iconPlan.enabled === true) {
      if (!Array.isArray(iconPlan.items) || iconPlan.items.length === 0) {
        issues.push({ severity: "warning", code: "icon_plan_items", message: "iconPlan.enabled is true but iconPlan.items is empty.", slideNumber });
      }
      if (!hasText(iconPlan.iconFamily) && !hasText(iconPlan.style)) {
        issues.push({ severity: "warning", code: "icon_plan_style", message: "iconPlan should define iconFamily or style for consistency.", slideNumber });
      }
    }

    if (isRecord(entry.diagramPlan)) {
      for (const field of ["type", "purpose", "rendering", "relationshipToSlideMessage", "fallback"]) {
        if (!hasText(entry.diagramPlan[field])) issues.push({ severity: "warning", code: `diagram_plan_${field}`, message: `diagramPlan missing ${field}.`, slideNumber });
      }
      if (entry.diagramPlan.type === "mermaid-diagram" && !hasText(entry.diagramPlan.syntax)) {
        issues.push({ severity: "warning", code: "mermaid_syntax", message: "Mermaid diagram plans should include syntax.", slideNumber });
      }
      if (isRecord(layout) && layout.recommendedLayout !== "diagram-first") {
        const hasPrimaryDiagram = componentPlan.some((component) => isRecord(component) && (component.type === "mermaid-diagram" || component.type === "architecture-diagram") && component.priority === "primary");
        if (!hasPrimaryDiagram) {
          issues.push({
            severity: "warning",
            code: "diagram_visibility",
            message: "diagramPlan may not be visible unless layout.recommendedLayout is diagram-first or a diagram component is primary.",
            slideNumber,
          });
        }
      }
    }

    if (isRecord(layout) && layout.recommendedLayout === "diagram-first" && !isRecord(entry.diagramPlan)) {
      issues.push({ severity: "error", code: "diagram_first_missing_plan", message: "diagram-first layout requires diagramPlan.", slideNumber });
    }

    if (isRecord(entry.chartPlan) && entry.chartPlan.needed === true) {
      for (const field of ["chartType", "dataSourceRequirement", "message", "fallback"]) {
        if (!hasText(entry.chartPlan[field])) issues.push({ severity: "warning", code: `chart_plan_${field}`, message: `chartPlan missing ${field}.`, slideNumber });
      }
    }

    const visual = entry.visual;
    if (!isRecord(visual)) {
      issues.push({ severity: "error", code: "visual_missing", message: "visual object is required.", slideNumber });
    } else {
      if (!hasText(visual.type)) issues.push({ severity: "error", code: "visual_type", message: "visual.type is required.", slideNumber });
      if (!hasText(visual.necessity)) issues.push({ severity: "warning", code: "visual_necessity", message: "visual.necessity should be filled.", slideNumber });
      if (!hasText(visual.role)) issues.push({ severity: "warning", code: "visual_role", message: "visual.role should be filled.", slideNumber });
      if (visual.type !== "none" && !hasText(visual.message)) {
        issues.push({ severity: "warning", code: "visual_message", message: "Non-empty visuals should explain their message.", slideNumber });
      }
      if (visual.type === "generated-image" && !isRecord(visual.prompt)) {
        issues.push({ severity: "error", code: "generated_prompt_missing", message: "Generated image slides require visual.prompt.", slideNumber });
      } else if (visual.type === "generated-image" && isRecord(visual.prompt)) {
        for (const field of ["purpose", "subject", "composition", "style", "aspectRatio", "textPolicy", "relationshipToSlideText", "fallbackIfWeak"]) {
          pushMissingText(issues, visual.prompt[field], `prompt_${field}`, `Generated image prompt missing ${field}.`, slideNumber);
        }
      }
      if (visual.type !== "generated-image" && visual.prompt !== null && visual.prompt !== undefined) {
        issues.push({ severity: "warning", code: "prompt_unneeded", message: "Non-generated visuals should normally set prompt to null.", slideNumber });
      }
      if (isRecord(visualStrategy)) {
        if (visual.type === "generated-image" && isRecord(visualStrategy.aiImageUse) && visualStrategy.aiImageUse.use === false) {
          issues.push({ severity: "error", code: "visual_strategy_conflict_ai_image", message: "visual.type is generated-image but visualStrategy.aiImageUse.use is false.", slideNumber });
        }
        if (isRecord(entry.diagramPlan) && isRecord(visualStrategy.mermaidUse) && visualStrategy.mermaidUse.use === false) {
          issues.push({ severity: "warning", code: "visual_strategy_conflict_mermaid", message: "diagramPlan exists but visualStrategy.mermaidUse.use is false.", slideNumber });
        }
        if (visualStrategy.primaryVisualType === "ai-generated-image" && visual.type !== "generated-image") {
          issues.push({ severity: "warning", code: "visual_strategy_primary_mismatch", message: "visualStrategy.primaryVisualType is ai-generated-image but visual.type is not generated-image.", slideNumber });
        }
        if (visualStrategy.primaryVisualType === "mermaid-diagram" && !isRecord(entry.diagramPlan)) {
          issues.push({ severity: "error", code: "visual_strategy_mermaid_missing_plan", message: "visualStrategy selects Mermaid as primary but diagramPlan is missing.", slideNumber });
        }
        if (visualStrategy.primaryVisualType === "ppt-native-component" && !hasRenderableComponents(entry)) {
          issues.push({
            severity: "error",
            code: "visual_strategy_native_missing_component",
            message: "visualStrategy selects PPT-native component as primary but componentPlan/components are missing.",
            slideNumber,
          });
        }
        if (visualStrategy.primaryVisualType === "screenshot" && visual.type !== "screenshot" && !hasRequiredAssets(entry)) {
          issues.push({
            severity: "error",
            code: "visual_strategy_screenshot_missing_asset",
            message: "visualStrategy selects screenshot as primary but no screenshot visual or required asset is present.",
            slideNumber,
          });
        }
        if (visualStrategy.primaryVisualType === "real-asset" && visual.type !== "real-image" && !hasRequiredAssets(entry)) {
          issues.push({
            severity: "error",
            code: "visual_strategy_real_asset_missing_asset",
            message: "visualStrategy selects real asset as primary but no real-image visual or required asset is present.",
            slideNumber,
          });
        }
        if (visualStrategy.primaryVisualType === "none" && visual.type !== "none") {
          issues.push({
            severity: "warning",
            code: "visual_strategy_none_has_visual",
            message: "visualStrategy selects no visual, but visual.type is not none.",
            slideNumber,
          });
        }
        if (isUseTrue(visualStrategy.nativeComponentUse) && !hasRenderableComponents(entry)) {
          issues.push({
            severity: "warning",
            code: "native_component_use_without_component",
            message: "visualStrategy.nativeComponentUse is true but no componentPlan/components are provided.",
            slideNumber,
          });
        }
      }
    }

    asArray(entry.requiredAssets).forEach((asset, assetIndex) => {
      if (!isRecord(asset)) {
        issues.push({ severity: "error", code: "asset_shape", message: `Required asset ${assetIndex + 1} must be an object.`, slideNumber });
        return;
      }
      for (const field of ["id", "type", "status", "purpose", "sourceOrInstruction", "fallback"]) {
        if (!hasText(asset[field])) issues.push({ severity: "warning", code: `asset_${field}`, message: `Required asset ${assetIndex + 1} missing ${field}.`, slideNumber });
      }
    });

    asArray(entry.dataSourceRequirements).forEach((source, sourceIndex) => {
      if (!isRecord(source)) {
        issues.push({ severity: "error", code: "source_shape", message: `Source requirement ${sourceIndex + 1} must be an object.`, slideNumber });
        return;
      }
      for (const field of ["claim", "sourceNeeded", "status"]) {
        if (!hasText(source[field])) issues.push({ severity: "warning", code: `source_${field}`, message: `Source requirement ${sourceIndex + 1} missing ${field}.`, slideNumber });
      }
    });
  });

  return {
    status: issues.some((issue) => issue.severity === "error") ? "fail" : "pass",
    file: absolute,
    slideCount: slides.length,
    issues,
  };
}
