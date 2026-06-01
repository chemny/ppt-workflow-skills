import type { WorkflowSlideSpecDeck } from "./slideSpec.js";
import type { VisualRoute } from "./visualRoute.js";

export interface PageDesignPlan {
  version: "0.1";
  route: "svg-native" | "template-native";
  editableFirst: true;
  deckRules: {
    designSystem: string;
    pageRhythm: string[];
    maxSameCompositionInRow: number;
    forbidden: string[];
  };
  slides: PageDesignPlanSlide[];
}

export interface PageDesignPlanSlide {
  slideNumber: number;
  pageType: string;
  title: string;
  pageRhythm: "anchor" | "dense" | "breathing";
  designQuestion: string;
  composition: string;
  nativeObjects: NativeObjectPlan[];
  localAssets: LocalAssetPlan[];
  visualMotifs: string[];
  qualityGate: string[];
}

export interface NativeObjectPlan {
  role: string;
  kind: "text" | "shape" | "line" | "icon" | "card" | "diagram" | "chart" | "table" | "image-frame";
  editable: true;
  contentSource: string;
}

export interface LocalAssetPlan {
  role: string;
  kind: "real-image" | "generated-image" | "screenshot" | "local-svg-component";
  required: boolean;
  editable: false;
  contentSource: string;
}

export function createPageDesignPlan(spec: WorkflowSlideSpecDeck, visualRoute: VisualRoute): PageDesignPlan {
  return {
    version: "0.1",
    route: visualRoute.route,
    editableFirst: true,
    deckRules: {
      designSystem: "Use global color, typography, spacing, motif, icon, and source rules from design-brief/design-system.",
      pageRhythm: ["anchor", "dense", "breathing"],
      maxSameCompositionInRow: 2,
      forbidden: [
        "full-slide rasterization",
        "silent fallback to template route",
        "critical text inside bitmap images",
        "same component skeleton repeated for every page",
      ],
    },
    slides: spec.slides.map((slide) => {
      const primaryComponent = slide.componentPlan?.find((component) => component.priority === "primary") ?? slide.componentPlan?.[0];
      const composition = compositionFor(slide, primaryComponent?.type);
      return {
        slideNumber: slide.slideNumber,
        pageType: slide.pageType,
        title: slide.title,
        pageRhythm: slide.pageRhythm ?? "dense",
        designQuestion: slide.audienceQuestion || slide.coreMessage,
        composition,
        nativeObjects: nativeObjectsFor(slide, primaryComponent?.type),
        localAssets: localAssetsFor(slide),
        visualMotifs: visualMotifsFor(slide, composition),
        qualityGate: [
          "body slide title stays one line",
          "all important slide copy remains editable PPT text",
          "cards/diagrams/checklists are built from PPT-native shapes and text",
          "images are local supporting assets only and never carry critical copy",
          "page must differ visibly from adjacent pages when message type changes",
        ],
      };
    }),
  };
}

function compositionFor(slide: WorkflowSlideSpecDeck["slides"][number], componentType?: string): string {
  if (slide.pageType === "cover") return "typographic-cover-native";
  if (slide.pageType === "interaction-prompt") return "left-statement-right-question-list";
  if (slide.pageType === "summary" || slide.pageType === "qa-closing") return "takeaway-board-with-native-cards";
  if (componentType === "process-flow" || componentType === "timeline") return "editable-rail-flow";
  if (componentType === "comparison-matrix") return "editable-comparison-grid";
  if (componentType === "checklist") return "editable-statement-plus-checklist";
  if (componentType === "kpi-card" || componentType === "chart-native") return "editable-kpi-ledger";
  if (slide.diagramPlan || componentType === "mermaid-diagram" || componentType === "architecture-diagram") return "editable-diagram-canvas";
  if (componentType === "icon-card") return "editable-card-system";
  if (slide.visual.type === "generated-image" || slide.visual.type === "real-image" || slide.visual.type === "screenshot") return "image-supported-editable-layout";
  return "custom-editable-page-composition";
}

function nativeObjectsFor(slide: WorkflowSlideSpecDeck["slides"][number], componentType?: string): NativeObjectPlan[] {
  const objects: NativeObjectPlan[] = [
    { role: "title", kind: "text", editable: true, contentSource: "slide.title" },
    { role: "subtitle", kind: "text", editable: true, contentSource: "slide.subtitle" },
    { role: "body copy", kind: "text", editable: true, contentSource: "slide.visibleBody/pageConclusion" },
    { role: "source note", kind: "text", editable: true, contentSource: "slide.dataSourceRequirements" },
  ];
  if (componentType) {
    const kind: NativeObjectPlan["kind"] = componentType.includes("diagram") || componentType.includes("mermaid")
      ? "diagram"
      : componentType.includes("chart")
        ? "chart"
        : componentType.includes("matrix")
          ? "table"
          : "card";
    objects.push({ role: componentType, kind, editable: true, contentSource: "slide.componentPlan" });
  }
  if (slide.iconPlan?.enabled || slide.componentPlan?.some((component) => component.content.some((item) => item.icon))) {
    objects.push({ role: "icons", kind: "icon", editable: true, contentSource: "slide.iconPlan/componentPlan icons" });
  }
  objects.push({ role: "motifs and rhythm marks", kind: "shape", editable: true, contentSource: "design-brief + pageDesignPlan.visualMotifs" });
  return objects;
}

function localAssetsFor(slide: WorkflowSlideSpecDeck["slides"][number]): LocalAssetPlan[] {
  if (slide.visual.type === "generated-image") {
    return [{ role: slide.visual.role, kind: "generated-image", required: true, editable: false, contentSource: "slide.visual.prompt/assetId" }];
  }
  if (slide.visual.type === "real-image") {
    return [{ role: slide.visual.role, kind: "real-image", required: true, editable: false, contentSource: "slide.visual.assetId/requiredAssets" }];
  }
  if (slide.visual.type === "screenshot") {
    return [{ role: slide.visual.role, kind: "screenshot", required: true, editable: false, contentSource: "slide.visual.assetId/requiredAssets" }];
  }
  if (slide.visual.type === "svg-component") {
    return [{ role: slide.visual.role, kind: "local-svg-component", required: false, editable: false, contentSource: "slide.visual.message" }];
  }
  return [];
}

function visualMotifsFor(slide: WorkflowSlideSpecDeck["slides"][number], composition: string): string[] {
  const motifs = ["native rules", "alignment grid", "accent blocks"];
  if (slide.pageRhythm === "anchor") motifs.push("large typographic field");
  if (slide.pageRhythm === "breathing") motifs.push("large curve or negative-space marker");
  if (composition.includes("diagram") || slide.diagramPlan) motifs.push("native connectors");
  if (composition.includes("card")) motifs.push("native card frames");
  if (slide.iconPlan?.enabled) motifs.push("editable pictogram marks");
  return motifs;
}
