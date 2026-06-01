import type { TeachingToolkitSlide } from "../schema.js";
import type { WorkflowPageType, WorkflowSlideSpec } from "./slideSpec.js";
import type { GenericLayoutId } from "./layoutRegistry.js";

export interface ResolvedLayoutMapping {
  genericLayout: string;
  registeredLayout: NonNullable<TeachingToolkitSlide["registeredLayout"]>;
  reason: string;
}

const layoutMap: Partial<Record<GenericLayoutId, ResolvedLayoutMapping>> = {
  "cover-typographic": {
    genericLayout: "cover-typographic",
    registeredLayout: "BP01",
    reason: "cover needs a high-impact typographic entry page",
  },
  "cover-visual": {
    genericLayout: "cover-visual",
    registeredLayout: "BP22",
    reason: "visual covers need a large image or native visual zone",
  },
  "section-divider": {
    genericLayout: "section-divider",
    registeredLayout: "BP09",
    reason: "section pages need a large statement with sparse content",
  },
  "big-statement": {
    genericLayout: "big-statement",
    registeredLayout: "BP12",
    reason: "statement pages need one dominant claim plus a supporting strip",
  },
  "two-column": {
    genericLayout: "two-column",
    registeredLayout: "BP08",
    reason: "two-column pages map to a duo comparison/explanation skeleton",
  },
  "three-card": {
    genericLayout: "three-card",
    registeredLayout: "BP13",
    reason: "three cards work well with a hero statement and three supporting blocks",
  },
  "four-card": {
    genericLayout: "four-card",
    registeredLayout: "BP19",
    reason: "four cards need a stable four-column grid",
  },
  "kpi-row": {
    genericLayout: "kpi-row",
    registeredLayout: "BP21",
    reason: "KPI rows need large numbers and a spec-sheet feel",
  },
  comparison: {
    genericLayout: "comparison",
    registeredLayout: "BP08",
    reason: "comparisons need two balanced panels",
  },
  timeline: {
    genericLayout: "timeline",
    registeredLayout: "BP11",
    reason: "timelines need a horizontal chronological axis",
  },
  "step-flow": {
    genericLayout: "step-flow",
    registeredLayout: "BP14",
    reason: "step flows need ordered steps plus a process visual",
  },
  "diagram-first": {
    genericLayout: "diagram-first",
    registeredLayout: "BP17",
    reason: "diagram-first pages need a central system/flow renderer",
  },
  "prompt-box": {
    genericLayout: "prompt-box",
    registeredLayout: "BP13",
    reason: "prompt pages need one strong instruction block and supporting fields",
  },
  "screenshot-callout": {
    genericLayout: "screenshot-callout",
    registeredLayout: "BP22",
    reason: "screenshots need the largest safe visual area",
  },
  "image-hero": {
    genericLayout: "image-hero",
    registeredLayout: "BP22",
    reason: "hero visuals need a dominant image strip",
  },
  "case-walkthrough": {
    genericLayout: "case-walkthrough",
    registeredLayout: "BP13",
    reason: "case walkthroughs need context plus three evaluation points",
  },
  checklist: {
    genericLayout: "checklist",
    registeredLayout: "BP10",
    reason: "checklists need a strong statement plus a right-side list",
  },
  matrix: {
    genericLayout: "matrix",
    registeredLayout: "BP04",
    reason: "matrices need a stable multi-cell grid",
  },
  summary: {
    genericLayout: "summary",
    registeredLayout: "BP10",
    reason: "summaries need a closing statement and concise takeaways",
  },
  closing: {
    genericLayout: "closing",
    registeredLayout: "BP10",
    reason: "closing pages need a strong final statement and next steps",
  },
};

const pageTypeFallbacks: Partial<Record<WorkflowPageType, GenericLayoutId>> = {
  cover: "cover-typographic",
  "section-divider": "section-divider",
  "learning-objectives": "three-card",
  "problem-example": "comparison",
  "concept-explain": "three-card",
  "capability-map": "matrix",
  "step-flow": "step-flow",
  "prompt-template": "prompt-box",
  "live-demo": "case-walkthrough",
  "screenshot-callout": "screenshot-callout",
  "before-after": "comparison",
  comparison: "comparison",
  "data-proof": "kpi-row",
  "case-example": "case-walkthrough",
  "quote-analysis": "two-column",
  "interaction-prompt": "prompt-box",
  "practice-task": "prompt-box",
  "risk-warning": "checklist",
  checklist: "checklist",
  summary: "summary",
  "qa-closing": "closing",
};

export function resolveSlideLayout(slide: WorkflowSlideSpec): ResolvedLayoutMapping {
  if (slide.diagramPlan && slide.layout.recommendedLayout === "diagram-first") {
    return {
      genericLayout: "diagram-first",
      registeredLayout: "BP17",
      reason: "explicit diagram-first layout with diagramPlan",
    };
  }

  const explicit = slide.layout.recommendedLayout as GenericLayoutId;
  const mapped = layoutMap[explicit];
  if (mapped) return tuneMappingForContent(slide, mapped);

  const fallbackLayout = pageTypeFallbacks[slide.pageType] ?? "three-card";
  const fallback = layoutMap[fallbackLayout] ?? layoutMap["three-card"];
  if (!fallback) {
    return { genericLayout: "three-card", registeredLayout: "BP13", reason: "fallback layout for unresolved slide" };
  }
  return tuneMappingForContent(slide, {
    ...fallback,
    reason: `fallback from pageType=${slide.pageType}; ${fallback.reason}`,
  });
}

function tuneMappingForContent(slide: WorkflowSlideSpec, mapping: ResolvedLayoutMapping): ResolvedLayoutMapping {
  if (mapping.genericLayout === "matrix") {
    const count = Math.max(slide.visibleBody.length, slide.componentPlan?.[0]?.content.length ?? 0, slide.components[0]?.content.length ?? 0);
    if (count <= 4) return { ...mapping, registeredLayout: "BP16", reason: "small matrix fits a compact multi-card layout" };
    return mapping;
  }

  if (mapping.genericLayout === "cover-visual" && slide.visual.type === "none") {
    return { genericLayout: "cover-typographic", registeredLayout: "BP01", reason: "cover requested visual layout but no visual asset is available" };
  }

  if ((mapping.genericLayout === "image-hero" || mapping.genericLayout === "screenshot-callout") && slide.visual.type === "none") {
    return { genericLayout: "three-card", registeredLayout: "BP13", reason: "visual layout requested but slide has no visual; using native content layout" };
  }

  if (mapping.genericLayout === "kpi-row") {
    const count = Math.max(slide.visibleBody.length, slide.componentPlan?.[0]?.content.length ?? 0, slide.components[0]?.content.length ?? 0);
    if (count >= 4) return { ...mapping, registeredLayout: "BP20", reason: "four or more KPI rows fit a stacked ledger layout" };
  }

  return mapping;
}
