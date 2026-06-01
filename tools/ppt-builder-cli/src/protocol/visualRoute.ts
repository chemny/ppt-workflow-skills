import type { WorkflowSlideSpecDeck } from "./slideSpec.js";
import type { DesignBrief } from "./designBrief.js";
import type { DesignLock } from "./compileSlideSpec.js";

export interface VisualRoute {
  version: "0.1";
  route: "svg-native" | "template-native";
  reason: string;
  buildBranch: {
    primary: "svg-page-design-to-native-pptx" | "pptgenjs-template-native";
    finalPptxMustBeEditable: true;
    wholeSlideBitmapAllowed: false;
  };
  editablePolicy: {
    criticalText: "ppt-native";
    numbersAndSources: "ppt-native";
    decorativeMicroText: "svg-allowed";
    charts: "ppt-native-or-source-aware-svg";
  };
  imagePolicy: {
    role: "selective-support";
    allowedUses: string[];
    forbiddenUses: string[];
  };
}

export interface VisualLock {
  version: "0.1";
  canvas: {
    format: "pptx-16:9";
    viewBox: string;
    width: number;
    height: number;
  };
  route: "svg-native" | "template-native";
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    latinFamily: string;
    monoFamily: string;
    body: number;
    slideTitle: number;
    subtitle: number;
    caption: number;
    hero: number;
  };
  icons: {
    policy: "single-family";
    library: string;
    strokeWidth: number;
    inventory: string[];
  };
  images: {
    deckRendering: "custom";
    deckRenderingBehavior: string;
    deckPalette: "custom";
    deckPaletteBehavior: string;
    allowedUses: string[];
    assets: Array<{ id: string; slideNumber: number; role: string; purpose: string }>;
  };
  pageRhythm: Record<string, "anchor" | "dense" | "breathing">;
  pageSvgRoles: Record<string, string>;
  forbiddenSvgFeatures: string[];
  editableBoundary: {
    pptNative: string[];
    svgAllowed: string[];
  };
}

export interface VisualPagePlan {
  version: "0.1";
  route: "svg-native" | "template-native";
  deckRhythm: {
    pattern: Array<"anchor" | "dense" | "breathing">;
    maxSameRhythmInRow: number;
    sectionResetEvery: string;
  };
  slides: VisualPagePlanSlide[];
}

export interface VisualPagePlanSlide {
  slideNumber: number;
  pageType: string;
  pageRhythm: "anchor" | "dense" | "breathing";
  pageRole: string;
  visualIntent: string;
  svgRole: string;
  imageRole: string;
  editableRole: string;
  composition: {
    grid: string;
    safeArea: string;
    density: "low" | "medium" | "high";
    dominantElement: string;
  };
  layering: {
    svg: "bottom";
    image: "middle when used";
    pptNative: "top for critical text and data";
  };
  svgElements: string[];
  imageAssets: string[];
  pptNativeElements: string[];
  qualityRules: string[];
}

export function createVisualRoute(spec: WorkflowSlideSpecDeck, designBrief: DesignBrief): VisualRoute {
  const requested = spec.designDirection.recommendedVisualRoute ?? designBrief.visualRoute ?? "svg-native";
  const route = requested === "template" || requested === "template-native" ? "template-native" : "svg-native";
  return {
    version: "0.1",
    route,
    reason:
      route === "svg-native"
        ? "Default route: page-by-page SVG visual design is converted into an editable native PPTX. Images are supporting assets, not whole-slide fallbacks."
        : "Template-native route selected because the deck requested strict template-style production or fast deterministic PPTGenJS output.",
    buildBranch: {
      primary: route === "svg-native" ? "svg-page-design-to-native-pptx" : "pptgenjs-template-native",
      finalPptxMustBeEditable: true,
      wholeSlideBitmapAllowed: false,
    },
    editablePolicy: {
      criticalText: "ppt-native",
      numbersAndSources: "ppt-native",
      decorativeMicroText: "svg-allowed",
      charts: "ppt-native-or-source-aware-svg",
    },
    imagePolicy: {
      role: "selective-support",
      allowedUses: ["cover", "hero", "scene", "product", "lifestyle", "visual-reset"],
      forbiddenUses: ["decorative filler", "fake evidence", "fake UI", "dense text"],
    },
  };
}

export function createVisualLock(spec: WorkflowSlideSpecDeck, designBrief: DesignBrief, designLock: DesignLock): VisualLock {
  const route = spec.designDirection.recommendedVisualRoute ?? designBrief.visualRoute ?? "svg-native";
  const pageRhythm: VisualLock["pageRhythm"] = {};
  const pageSvgRoles: Record<string, string> = {};
  const imageAssets: VisualLock["images"]["assets"] = [];

  for (const slide of spec.slides) {
    const key = pageKey(slide.slideNumber);
    pageRhythm[key] = slide.pageRhythm ?? "dense";
    pageSvgRoles[key] = svgRoleFor(slide);
    if (slide.visual.type === "generated-image" && slide.visual.assetId) {
      imageAssets.push({
        id: slide.visual.assetId,
        slideNumber: slide.slideNumber,
        role: imageRoleFor(slide),
        purpose: slide.visual.prompt?.purpose ?? slide.visual.message,
      });
    }
  }

  return {
    version: "0.1",
    canvas: {
      format: "pptx-16:9",
      viewBox: "0 0 1280 720",
      width: 1280,
      height: 720,
    },
    route: route === "template" || route === "template-native" ? "template-native" : "svg-native",
    colors: {
      background: designBrief.colorSystem.background ?? designLock.colors.background,
      surface: designBrief.colorSystem.surface ?? "FFFFFF",
      text: designBrief.colorSystem.text ?? designLock.colors.ink,
      muted: designBrief.colorSystem.muted ?? designLock.colors.muted,
      line: designLock.colors.line,
      accent: designBrief.colorSystem.primary ?? designLock.colors.accent,
      accent2: designBrief.colorSystem.accent[0] ?? designLock.colors.accent,
      accent3: designBrief.colorSystem.accent[1] ?? designLock.colors.accent,
    },
    typography: {
      fontFamily: designLock.font.body,
      latinFamily: designLock.font.latin,
      monoFamily: designLock.font.mono,
      body: 20,
      slideTitle: 38,
      subtitle: 22,
      caption: 12,
      hero: 72,
    },
    icons: {
      policy: "single-family",
      library: designBrief.iconPolicy.style,
      strokeWidth: 2,
      inventory: collectIconInventory(spec),
    },
    images: {
      deckRendering: "custom",
      deckRenderingBehavior: imageRenderingBehaviorFor(designBrief),
      deckPalette: "custom",
      deckPaletteBehavior: imagePaletteBehaviorFor(designBrief),
      allowedUses: ["cover", "hero", "scene", "product", "lifestyle", "visual-reset"],
      assets: imageAssets,
    },
    pageRhythm,
    pageSvgRoles,
    forbiddenSvgFeatures: ["foreignObject", "script", "style", "class", "mask", "textPath", "animation", "external-css", "font-face"],
    editableBoundary: {
      pptNative: ["title", "subtitle", "body", "numbers", "sources", "data labels"],
      svgAllowed: ["decorative micro-type", "icons", "visual labels duplicated in PPT-native text"],
    },
  };
}

export function createVisualPagePlan(spec: WorkflowSlideSpecDeck, visualRoute: VisualRoute): VisualPagePlan {
  return {
    version: "0.1",
    route: visualRoute.route,
    deckRhythm: {
      pattern: ["anchor", "dense", "breathing"],
      maxSameRhythmInRow: 2,
      sectionResetEvery: "3-5 slides when useful",
    },
    slides: spec.slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      pageType: slide.pageType,
      pageRhythm: slide.pageRhythm ?? "dense",
      pageRole: pageRoleFor(slide.pageType),
      visualIntent: slide.layout.intent || slide.visualStrategy?.decisionReason || slide.coreMessage,
      svgRole: svgRoleFor(slide),
      imageRole: imageRoleFor(slide),
      editableRole: "title, subtitle, body, numbers, source notes, data labels",
      composition: {
        grid: slide.pageRhythm === "breathing" ? "asymmetric breathing grid" : "12-column",
        safeArea: slide.pageType === "cover" ? "title and metadata must stay clear of image subject" : "body title must stay one line; content stays inside margins",
        density: densityFor(slide.pageRhythm ?? "dense"),
        dominantElement: dominantElementFor(slide),
      },
      layering: {
        svg: "bottom",
        image: "middle when used",
        pptNative: "top for critical text and data",
      },
      svgElements: svgElementsFor(slide),
      imageAssets: slide.visual.assetId ? [slide.visual.assetId] : [],
      pptNativeElements: ["title", "subtitle", "visible body", "component labels", "sources"],
      qualityRules: [
        "body titles must not wrap",
        "critical text stays PPT-native",
        "no image stretching",
        "SVG must use visual-lock colors and fonts",
      ],
    })),
  };
}

function pageKey(slideNumber: number): string {
  return `P${String(slideNumber).padStart(2, "0")}`;
}

function collectIconInventory(spec: WorkflowSlideSpecDeck): string[] {
  const icons = new Set<string>();
  for (const slide of spec.slides) {
    for (const item of slide.iconPlan?.items ?? []) icons.add(item.icon);
    for (const component of slide.componentPlan ?? []) {
      for (const item of component.content) {
        if (item.icon) icons.add(item.icon);
      }
    }
  }
  return [...icons].sort();
}

function svgRoleFor(slide: WorkflowSlideSpecDeck["slides"][number]): string {
  if (slide.layout.visualPolicy === "svg_visual" || slide.visualStrategy?.primaryVisualType === "svg-composition") return "page-level-visual-composition";
  if (slide.pageType === "cover" || slide.pageType === "section-divider" || slide.pageType === "qa-closing") return "background-and-typographic-frame";
  if (slide.diagramPlan || slide.visualStrategy?.primaryVisualType === "mermaid-diagram") return "diagram-and-connector-system";
  if (slide.componentPlan?.length || slide.iconPlan?.enabled) return "component-frames-icons-and-motifs";
  return "subtle-background-and-grid";
}

function imageRoleFor(slide: WorkflowSlideSpecDeck["slides"][number]): string {
  if (slide.visual.type === "generated-image") {
    if (slide.pageType === "cover") return "cover";
    if (slide.layout.recommendedLayout.includes("hero")) return "hero";
    return "local-support";
  }
  if (slide.visual.type === "real-image") return "real-asset";
  if (slide.visual.type === "screenshot") return "screenshot";
  return "none";
}

function pageRoleFor(pageType: string): string {
  if (pageType === "cover") return "first impression and promise";
  if (pageType === "section-divider") return "rhythm reset";
  if (pageType === "qa-closing") return "final action and memory point";
  if (pageType.includes("case") || pageType.includes("demo")) return "concrete example";
  if (pageType.includes("risk") || pageType.includes("checklist")) return "decision safety";
  return "content explanation";
}

function densityFor(rhythm: "anchor" | "dense" | "breathing"): "low" | "medium" | "high" {
  if (rhythm === "anchor") return "low";
  if (rhythm === "breathing") return "low";
  return "high";
}

function dominantElementFor(slide: WorkflowSlideSpecDeck["slides"][number]): string {
  if (slide.visual.type === "generated-image") return "image slot fused with SVG frame";
  if (slide.diagramPlan) return "diagram";
  if (slide.componentPlan?.length) return slide.componentPlan[0].type;
  return slide.pageType === "cover" ? "large typographic title" : "title and structured content";
}

function svgElementsFor(slide: WorkflowSlideSpecDeck["slides"][number]): string[] {
  const elements = ["background field", "grid alignment guides", "accent rules"];
  if (slide.iconPlan?.enabled || slide.componentPlan?.some((component) => component.type === "icon-card")) elements.push("consistent icon marks");
  if (slide.diagramPlan) elements.push("diagram skeleton", "connectors");
  if (slide.componentPlan?.length) elements.push("component frames");
  if (slide.visual.type === "generated-image" || slide.visual.type === "real-image" || slide.visual.type === "screenshot") elements.push("image frame or mask");
  return elements;
}

function imageRenderingBehaviorFor(designBrief: DesignBrief): string {
  return `Original visual system for ${designBrief.designMode}: ${designBrief.mood.join(", ")}; images should support the deck message and blend with the SVG layer.`;
}

function imagePaletteBehaviorFor(designBrief: DesignBrief): string {
  return `Primary ${designBrief.colorSystem.primary} anchors the visual system; background ${designBrief.colorSystem.background} provides breathing space; accents ${designBrief.colorSystem.accent.join(", ")} are used sparingly for emphasis.`;
}
