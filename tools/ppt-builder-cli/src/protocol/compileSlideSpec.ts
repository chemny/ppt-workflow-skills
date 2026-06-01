import fs from "node:fs/promises";
import path from "node:path";
import type { DeckSpec, PlannedComponent, TeachingItem, TeachingToolkitSlide } from "../schema.js";
import type { WorkflowSlideSpec, WorkflowSlideSpecDeck } from "./slideSpec.js";
import { validateSlideSpecFile } from "./validateSlideSpec.js";
import { resolveSlideLayout } from "./slideSpecLayoutMap.js";
import { createVisualStrategyReport, type VisualStrategyReport } from "./visualStrategyReport.js";
import { createDesignBrief, type DesignBrief } from "./designBrief.js";
import { createVisualLock, createVisualPagePlan, createVisualRoute, type VisualLock, type VisualPagePlan, type VisualRoute } from "./visualRoute.js";
import { createPageDesignPlan, type PageDesignPlan } from "./pageDesignPlan.js";

export interface CompileSlideSpecOptions {
  themeId?: string;
}

export interface CompileSlideSpecResult {
  deck: DeckSpec;
  rootDir: string;
  artifacts: ProjectArtifacts;
  spec: WorkflowSlideSpecDeck;
}

export interface ProjectArtifacts {
  assetManifest: AssetManifest;
  designLock: DesignLock;
  designBrief: DesignBrief;
  visualRoute: VisualRoute;
  visualLock: VisualLock;
  visualPagePlan: VisualPagePlan;
  pageDesignPlan: PageDesignPlan;
  layoutMappingReport: LayoutMappingReport;
  visualStrategyReport: VisualStrategyReport;
}

export interface AssetManifest {
  assets: Array<{
    id: string;
    type: string;
    status: string;
    purpose: string;
    requiredBySlides: number[];
    source: string;
    license?: string;
    fallback: string;
    required: boolean;
    risk?: string;
  }>;
}

export interface DesignLock {
  themeId: string;
  font: {
    body: string;
    latin: string;
    mono: string;
  };
  colors: {
    background: string;
    ink: string;
    accent: string;
    muted: string;
    line: string;
  };
  layoutRules: {
    titleAxis: string;
    noRoundedCards: boolean;
    noGradients: boolean;
    imageFit: string;
  };
  layoutRegistry: Record<string, string>;
  forbiddenPatterns: string[];
}

export interface LayoutMappingReport {
  themeId: string;
  slides: Array<{
    slideNumber: number;
    pageType: string;
    recommendedLayout: string;
    registeredLayout: string;
    reason: string;
  }>;
}

const tones: NonNullable<TeachingItem["tone"]>[] = ["blue", "green", "yellow", "red", "muted"];

function pickTheme(spec: WorkflowSlideSpecDeck, override?: string): DeckSpec["theme"]["id"] {
  if (override) return normalizeTheme(override);
  return normalizeTheme(spec.designDirection.recommendedStyleTemplate ?? spec.designDirection.recommendedThemeFamily);
}

function normalizeTheme(value: string): DeckSpec["theme"]["id"] {
  const normalized = value.toLowerCase().trim();
  if (normalized === "teaching-toolkit") return "teaching-toolkit";
  if (normalized === "ai-product-swiss") return "ai-product-swiss";
  if (normalized === "swiss-minimal") return "swiss-minimal";
  if (normalized === "automotive-deep-blue") return "automotive-deep-blue";
  if (normalized === "literary-warm") return "literary-warm";
  if (normalized === "blueprint-swiss") return "blueprint-swiss";
  return "blueprint-swiss";
}

function eyebrow(slide: WorkflowSlideSpec): string {
  const source = slide.pageType.replace(/-/g, " ");
  return source.toUpperCase();
}

function sourceNote(slide: WorkflowSlideSpec): string | undefined {
  const pending = slide.dataSourceRequirements.find((item) => item.sourceNeeded);
  return pending ? `Source needed: ${pending.sourceNeeded}` : undefined;
}

function splitText(text: string): { title: string; body?: string } {
  const [first, ...rest] = text.split(/[:：]/);
  if (rest.length === 0) return { title: text };
  return { title: first.trim(), body: rest.join("：").trim() };
}

function componentItems(slide: WorkflowSlideSpec): TeachingItem[] {
  if (slide.componentPlan?.length) {
    const primaryPlan = slide.componentPlan.find((component) => component.content.length > 0);
    if (primaryPlan) {
      return primaryPlan.content.map((entry, index) => ({
        label: entry.label ?? entry.value ?? String(index + 1).padStart(2, "0"),
        title: entry.label ?? entry.value ?? entry.text,
        body: entry.label || entry.value ? entry.text : undefined,
        icon: entry.icon,
        value: entry.value,
        componentType: primaryPlan.type,
        tone: tones[index % tones.length],
      }));
    }
  }

  const primary = slide.components.find((component) => component.content.length > 0);
  if (primary) {
    return primary.content.map((entry, index) => {
      const parsed = splitText(entry.text);
      return {
        label: entry.label ?? String(index + 1).padStart(2, "0"),
        title: entry.label ? parsed.title : parsed.title,
        body: parsed.body ?? (entry.label ? entry.text : undefined),
        tone: tones[index % tones.length],
      };
    });
  }

  return slide.visibleBody.map((line, index) => {
    const parsed = splitText(line);
    return {
      label: String(index + 1).padStart(2, "0"),
      title: parsed.title,
      body: parsed.body,
      tone: tones[index % tones.length],
    };
  });
}

function plannedComponents(slide: WorkflowSlideSpec): PlannedComponent[] | undefined {
  const diagramIsPrimary = Boolean(slide.diagramPlan && (slide.layout.recommendedLayout === "diagram-first" || !slide.componentPlan?.some((component) => component.priority === "primary")));
  const components: PlannedComponent[] = (slide.componentPlan ?? []).map((component) => ({
    id: component.id,
    type: component.type,
    purpose: component.purpose,
    content: component.content.map((entry, index) => ({
      label: entry.label ?? entry.value ?? String(index + 1).padStart(2, "0"),
      title: entry.label ?? entry.value ?? entry.text,
      body: entry.label || entry.value ? entry.text : undefined,
      icon: entry.icon,
      value: entry.value,
      componentType: component.type,
      tone: tones[index % tones.length],
    })),
    rendering: component.rendering,
    priority: component.priority,
    fallback: component.fallback,
  }));

  if (slide.diagramPlan) {
    const diagramComponent: PlannedComponent = {
      id: `${slide.sourceOutlineId}-diagram`,
      type: slide.diagramPlan.type,
      purpose: slide.diagramPlan.purpose,
      content: diagramItems(slide),
      rendering: slide.diagramPlan.rendering,
      syntax: slide.diagramPlan.syntax,
      priority: diagramIsPrimary ? "primary" : "supporting",
      fallback: slide.diagramPlan.fallback,
    };
    if (diagramIsPrimary) components.unshift(diagramComponent);
    else components.push(diagramComponent);
  }

  return components.length ? components : undefined;
}

function diagramItems(slide: WorkflowSlideSpec): TeachingItem[] {
  if (!slide.diagramPlan) return [];
  const labels = extractMermaidLabels(slide.diagramPlan.syntax ?? "");
  if (labels.length) {
    return labels.map((label, index) => ({
      label: String(index + 1).padStart(2, "0"),
      title: label,
      componentType: slide.diagramPlan?.type,
      tone: tones[index % tones.length],
    }));
  }
  return [
    {
      label: "diagram",
      title: "结构图",
      body: slide.diagramPlan.fallback,
      componentType: slide.diagramPlan.type,
      tone: "blue",
    },
  ];
}

function extractMermaidLabels(syntax: string): string[] {
  const labels = [...syntax.matchAll(/[A-Za-z][A-Za-z0-9_]*\[([^\]]+)\]/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  return [...new Set(labels)].slice(0, 6);
}

function visual(slide: WorkflowSlideSpec): TeachingToolkitSlide["visual"] {
  if (slide.visual.type === "none") return { type: "none" };
  if (slide.visual.type === "screenshot") return { type: "screenshot", asset: slide.visual.assetId, caption: slide.visual.message };
  if (slide.visual.type === "generated-image" || slide.visual.type === "real-image") {
    return { type: slide.visual.type === "generated-image" ? "generated-image" : "placeholder", asset: slide.visual.assetId, caption: slide.visual.message || slide.visual.prompt?.purpose };
  }
  if (slide.visual.type === "native-diagram" || slide.visual.type === "svg-component") return { type: "native-diagram", caption: slide.visual.message };
  return { type: "none" };
}

function pageType(slide: WorkflowSlideSpec): TeachingToolkitSlide["pageType"] {
  if (slide.pageType === "data-proof" || slide.pageType === "case-example" || slide.pageType === "quote-analysis" || slide.pageType === "interaction-prompt") {
    return slide.pageType;
  }
  return slide.pageType;
}

function toTeachingSlide(slide: WorkflowSlideSpec): TeachingToolkitSlide {
  const items = componentItems(slide);
  const body = slide.pageType === "cover" ? slide.visibleBody.join(" | ") : slide.pageConclusion || slide.visibleBody.join("\n");
  const mapping = resolveSlideLayout(slide);
  return {
    layout: "teaching-toolkit",
    registeredLayout: mapping.registeredLayout,
    pageType: pageType(slide),
    slideNumber: slide.slideNumber,
    eyebrow: eyebrow(slide),
    title: slide.title,
    subtitle: slide.subtitle,
    body,
    items,
    visualStrategy: slide.visualStrategy,
    componentPlan: plannedComponents(slide),
    prompt: slide.transition,
    visual: visual(slide),
    sourceNote: sourceNote(slide),
  };
}

function createAssetManifest(spec: WorkflowSlideSpecDeck): AssetManifest {
  const assets = new Map<string, AssetManifest["assets"][number]>();

  for (const slide of spec.slides) {
    for (const asset of slide.requiredAssets) {
      const existing = assets.get(asset.id);
      if (existing) {
        if (!existing.requiredBySlides.includes(slide.slideNumber)) existing.requiredBySlides.push(slide.slideNumber);
        continue;
      }
      assets.set(asset.id, {
        id: asset.id,
        type: asset.type,
        status: asset.status,
        purpose: asset.purpose,
        requiredBySlides: [slide.slideNumber],
        source: asset.sourceOrInstruction,
        license: asset.type.includes("official") ? "official source; verify usage rights before public distribution" : undefined,
        fallback: asset.fallback,
        required: asset.required ?? !asset.purpose.toLowerCase().includes("optional"),
        risk: asset.risk,
      });
    }

    if (slide.visual.type === "generated-image" && slide.visual.assetId && !assets.has(slide.visual.assetId)) {
      assets.set(slide.visual.assetId, {
        id: slide.visual.assetId,
        type: "generated-image",
        status: "pending",
        purpose: slide.visual.prompt?.purpose ?? slide.visual.message,
        requiredBySlides: [slide.slideNumber],
        source: "generated from slide-spec visual.prompt",
        fallback: slide.visual.fallback,
        required: true,
        risk: "Generated image must be reviewed for factuality and text artifacts.",
      });
    }
  }

  return { assets: [...assets.values()] };
}

function createDesignLock(spec: WorkflowSlideSpecDeck, themeId: DeckSpec["theme"]["id"]): DesignLock {
  const layoutRegistry: Record<string, string> = {};
  for (const slide of spec.slides) {
    const mapping = resolveSlideLayout(slide);
    layoutRegistry[mapping.genericLayout] = mapping.registeredLayout;
  }

  return {
    themeId,
    font: {
      body: themeId === "blueprint-swiss" ? "Hiragino Sans GB" : "PingFang SC",
      latin: "Inter",
      mono: "JetBrains Mono",
    },
    colors: {
      background: "FAFAF8",
      ink: "0A0A0A",
      accent: "002FA7",
      muted: "737373",
      line: "D4D4D2",
    },
    layoutRules: {
      titleAxis: "top-left",
      noRoundedCards: true,
      noGradients: true,
      imageFit: "cover-or-contain-by-slot",
    },
    layoutRegistry,
    forbiddenPatterns: [
      "decorative image unrelated to slide message",
      "tiny body text to solve overcrowding",
      "manual theme changes page by page",
      "fake product screenshot or fake product photo",
    ],
  };
}

function createLayoutMappingReport(spec: WorkflowSlideSpecDeck, themeId: DeckSpec["theme"]["id"]): LayoutMappingReport {
  return {
    themeId,
    slides: spec.slides.map((slide) => {
      const mapping = resolveSlideLayout(slide);
      return {
        slideNumber: slide.slideNumber,
        pageType: slide.pageType,
        recommendedLayout: slide.layout.recommendedLayout,
        registeredLayout: mapping.registeredLayout,
        reason: mapping.reason,
      };
    }),
  };
}

export async function compileSlideSpecFile(filePath: string, options: CompileSlideSpecOptions = {}): Promise<CompileSlideSpecResult> {
  const validation = await validateSlideSpecFile(filePath);
  if (validation.status === "fail") {
    throw new Error(`slide-spec validation failed: ${validation.issues.filter((issue) => issue.severity === "error").map((issue) => issue.code).join(", ")}`);
  }

  const absolute = path.resolve(filePath);
  const spec = JSON.parse(await fs.readFile(absolute, "utf8")) as WorkflowSlideSpecDeck;
  const themeId = pickTheme(spec, options.themeId);
  const designBrief = createDesignBrief(spec, options.themeId);
  const designLock = createDesignLock(spec, themeId);
  const visualRoute = createVisualRoute(spec, designBrief);
  const pageDesignPlan = createPageDesignPlan(spec, visualRoute);
  const deck: DeckSpec = {
    meta: {
      title: spec.meta.title,
      subtitle: spec.meta.subtitle,
      subject: spec.meta.scenario,
      lang: spec.meta.language ?? "zh-CN",
    },
    designBrief,
    theme: {
      id: themeId,
      fontFace: themeId === "blueprint-swiss" ? "Hiragino Sans GB" : "PingFang SC",
      coverVariant: "cobalt-blue",
    },
    slides: spec.slides.map(toTeachingSlide),
  };

  return {
    deck,
    rootDir: path.dirname(absolute),
    artifacts: {
      assetManifest: createAssetManifest(spec),
      designLock,
      designBrief,
      visualRoute,
      visualLock: createVisualLock(spec, designBrief, designLock),
      visualPagePlan: createVisualPagePlan(spec, visualRoute),
      pageDesignPlan,
      layoutMappingReport: createLayoutMappingReport(spec, themeId),
      visualStrategyReport: createVisualStrategyReport(spec),
    },
    spec,
  };
}
