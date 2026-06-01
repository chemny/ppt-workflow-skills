import type { WorkflowSlideSpecDeck, WorkflowVisualType } from "./slideSpec.js";

export type DesignMode =
  | "business-report"
  | "executive-briefing"
  | "product-launch"
  | "brand-event"
  | "course-training"
  | "knowledge-sharing"
  | "sales-pitch"
  | "data-story";

export interface DesignBrief {
  version: "0.1";
  visualRoute: "svg-native" | "template-native";
  designMode: DesignMode;
  scenario: string;
  audience: string[];
  goals: string[];
  mood: string[];
  designIntent: string;
  colorSystem: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string[];
    risk: string[];
  };
  typography: {
    scale: "compact" | "standard" | "friendly-large" | "presentation-large";
    titleWeight: "regular" | "medium" | "bold" | "light";
    bodyDensity: "light" | "light-medium" | "medium" | "dense";
    rules: string[];
  };
  layoutPack: {
    id: string;
    cover: string;
    body: string[];
    closing: string;
  };
  componentPack: {
    id: string;
    required: string[];
    optional: string[];
  };
  iconPolicy: {
    required: boolean;
    style: "line" | "rounded-line" | "filled" | "duotone" | "minimal";
    density: "none" | "low" | "medium" | "high";
    allowedCategories: string[];
    fallback: string;
  };
  decorationPolicy: {
    level: "none" | "low" | "medium" | "high";
    motifs: string[];
    rules: string[];
  };
  imagePolicy: {
    mode: "none" | "selective" | "image-led";
    aiGenerated: "never" | "optional" | "preferred";
    realAssets: "not-needed" | "preferred-for-products" | "required-for-products";
    nativeIllustration: "none" | "optional" | "preferred-for-activities";
    rules: string[];
  };
  svgPolicy: {
    mode: "primary-visual-layer" | "local-component" | "none";
    uses: string[];
    editableBoundary: string[];
  };
  pageRhythm: {
    cover: "anchor" | "dense" | "breathing";
    bodyMix: Array<"anchor" | "dense" | "breathing">;
    maxSameLayoutInARow: number;
  };
  rendererGuidance: {
    preferredTheme: string;
    fallbackTheme: string;
    mustAvoid: string[];
  };
  diagnostics: {
    detectedSignals: string[];
    visualDistribution: Record<string, number>;
    rendererGaps: string[];
  };
}

export function createDesignBrief(spec: WorkflowSlideSpecDeck, themeOverride?: string): DesignBrief {
  const signals = collectSignals(spec);
  const designMode = detectDesignMode(spec, signals);
  const audience = detectAudience(spec);
  const goals = detectGoals(spec, signals, designMode);
  const mood = detectMood(spec, signals, designMode);
  const colorSystem = selectColorSystem(spec, designMode);
  const componentPack = selectComponentPack(designMode);
  const layoutPack = selectLayoutPack(designMode);
  const visualDistribution = visualDistributionFor(spec);
  const iconRequired = spec.slides.some((slide) => slide.iconPlan?.enabled || slide.componentPlan?.some((component) => component.content.some((item) => item.icon)));

  return {
    version: "0.1",
    visualRoute: isTemplateRoute(spec.designDirection.recommendedVisualRoute) ? "template-native" : "svg-native",
    designMode,
    scenario: spec.meta.scenario ?? designMode,
    audience,
    goals,
    mood,
    designIntent: designIntentFor(designMode, mood, audience),
    colorSystem,
    typography: typographyFor(designMode, audience),
    layoutPack,
    componentPack,
    iconPolicy: {
      required: iconRequired || designMode === "brand-event" || designMode === "course-training",
      style: designMode === "brand-event" ? "rounded-line" : "line",
      density: designMode === "brand-event" ? "medium" : iconRequired ? "medium" : "low",
      allowedCategories: iconCategoriesFor(designMode),
      fallback: "Use editable pictogram chips if SVG/icon rendering is unavailable.",
    },
    decorationPolicy: decorationFor(designMode, mood),
    imagePolicy: imagePolicyFor(designMode, visualDistribution),
    svgPolicy: svgPolicyFor(designMode),
    pageRhythm: {
      cover: "anchor",
      bodyMix: ["anchor", "dense", "breathing"],
      maxSameLayoutInARow: designMode === "brand-event" ? 2 : 3,
    },
    rendererGuidance: {
      preferredTheme: normalizePreferredTheme(spec, designMode),
      fallbackTheme: "teaching-toolkit",
      mustAvoid: [
        "one-template-fits-all",
        "letter chips replacing icons",
        "decorative images unrelated to message",
        "silent fallback to a generic business style",
      ],
    },
    diagnostics: {
      detectedSignals: themeOverride ? [...signals, `theme-override:${themeOverride}`] : signals,
      visualDistribution,
      rendererGaps: rendererGapsFor(designMode, iconRequired, themeOverride, normalizePreferredTheme(spec, designMode)),
    },
  };
}

function isTemplateRoute(route: string | undefined): boolean {
  return route === "template" || route === "template-native";
}

function svgPolicyFor(designMode: DesignMode): DesignBrief["svgPolicy"] {
  const usesByMode: Partial<Record<DesignMode, string[]>> = {
    "brand-event": ["background", "motifs", "icons", "frames", "route-map", "activity-visuals"],
    "course-training": ["background", "icons", "diagrams", "step-frames", "practice-widgets"],
    "product-launch": ["background", "product-frames", "feature-diagrams", "accent-motifs"],
    "knowledge-sharing": ["background", "concept-diagrams", "quote-frames", "section-rhythm"],
    "business-report": ["background", "kpi-frames", "comparison-structures", "chart-frames"],
  };

  return {
    mode: "primary-visual-layer",
    uses: usesByMode[designMode] ?? ["background", "motifs", "icons", "diagrams", "frames"],
    editableBoundary: ["title", "body", "numbers", "sources", "data labels remain PPT-native"],
  };
}

function collectSignals(spec: WorkflowSlideSpecDeck): string[] {
  const text = [
    spec.meta.title,
    spec.meta.subtitle,
    spec.meta.audience,
    spec.meta.scenario,
    spec.writingStrategy.audienceNeed,
    spec.writingStrategy.tone,
    spec.designDirection.recommendedThemeFamily,
    spec.designDirection.recommendedStyleTemplate,
    spec.designDirection.visualTone,
    spec.designDirection.imageStyle,
    ...spec.designDirection.preferredLayoutComponents,
    ...spec.designDirection.avoid,
    ...spec.slides.flatMap((slide) => [slide.pageType, slide.title, slide.subtitle, slide.coreMessage, slide.audienceQuestion, ...slide.visibleBody]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const signals: string[] = [];
  const entries: Array<[string, string[]]> = [
    ["children", ["儿童", "孩子", "亲子", "六一", "children", "kids", "family"]],
    ["brand-event", ["活动", "门店", "节日", "event", "campaign", "activation"]],
    ["training", ["教学", "课程", "教程", "workshop", "training", "practice"]],
    ["product", ["产品", "发布", "launch", "demo"]],
    ["business", ["汇报", "复盘", "经营", "strategy", "report"]],
    ["sales", ["销售", "转化", "下单", "proposal", "pitch"]],
    ["data", ["数据", "趋势", "指标", "market", "research"]],
    ["playful", ["童趣", "轻松", "活泼", "playful", "warm", "fun"]],
    ["premium", ["高端", "premium", "luxury"]],
    ["technical", ["技术", "ai", "模型", "system", "architecture"]],
  ];

  for (const [signal, keywords] of entries) {
    if (keywords.some((keyword) => text.includes(keyword))) signals.push(signal);
  }
  return [...new Set(signals)];
}

function detectDesignMode(spec: WorkflowSlideSpecDeck, signals: string[]): DesignMode {
  const theme = `${spec.designDirection.recommendedThemeFamily} ${spec.designDirection.recommendedStyleTemplate}`.toLowerCase();
  const explicitScenario = `${spec.meta.scenario ?? ""} ${spec.designDirection.recommendedThemeFamily ?? ""} ${spec.writingStrategy.tone ?? ""}`.toLowerCase();
  if (
    signals.includes("training") ||
    explicitScenario.includes("课堂") ||
    explicitScenario.includes("教学") ||
    explicitScenario.includes("课件") ||
    explicitScenario.includes("course") ||
    explicitScenario.includes("training")
  ) {
    return "course-training";
  }
  if (signals.includes("brand-event") || theme.includes("brand") || theme.includes("event")) return "brand-event";
  if (signals.includes("product")) return "product-launch";
  if (signals.includes("sales")) return "sales-pitch";
  if (signals.includes("data")) return "data-story";
  if (signals.includes("business")) return "business-report";
  return "knowledge-sharing";
}

function detectAudience(spec: WorkflowSlideSpecDeck): string[] {
  const audience = `${spec.meta.audience ?? ""} ${spec.writingStrategy.audienceNeed}`.toLowerCase();
  const result: string[] = [];
  if (audience.includes("家长") || audience.includes("parent")) result.push("parents");
  if (audience.includes("孩子") || audience.includes("儿童") || audience.includes("children") || audience.includes("kids")) result.push("children");
  if (audience.includes("管理") || audience.includes("老板") || audience.includes("executive")) result.push("executives");
  if (audience.includes("客户") || audience.includes("customer")) result.push("customers");
  if (audience.includes("学生") || audience.includes("learner")) result.push("learners");
  return result.length ? result : [spec.meta.audience ?? "general audience"];
}

function detectGoals(spec: WorkflowSlideSpecDeck, signals: string[], designMode: DesignMode): string[] {
  const goals: string[] = [];
  if (designMode === "brand-event") goals.push("brand-awareness", "participation");
  if (designMode === "course-training") goals.push("learning", "practice");
  if (designMode === "product-launch") goals.push("product-understanding", "desire");
  if (designMode === "sales-pitch") goals.push("conversion", "trust");
  if (designMode === "business-report") goals.push("alignment", "decision");
  if (signals.includes("sales")) goals.push("conversion");
  if (signals.includes("children")) goals.push("family-engagement");
  return [...new Set(goals.length ? goals : ["understanding"])];
}

function detectMood(spec: WorkflowSlideSpecDeck, signals: string[], designMode: DesignMode): string[] {
  const mood = new Set<string>();
  if (signals.includes("playful") || designMode === "brand-event") {
    mood.add("playful");
    mood.add("warm");
    mood.add("light");
  }
  if (signals.includes("premium") || designMode === "product-launch") mood.add("premium");
  if (signals.includes("technical")) mood.add("technical");
  if (designMode === "business-report" || designMode === "executive-briefing") {
    mood.add("professional");
    mood.add("calm");
  }
  for (const word of spec.designDirection.visualTone.split(/[,\s，、]+/).filter(Boolean).slice(0, 4)) mood.add(word);
  return [...mood].slice(0, 6);
}

function selectColorSystem(spec: WorkflowSlideSpecDeck, designMode: DesignMode): DesignBrief["colorSystem"] {
  const tone = `${spec.designDirection.visualTone} ${spec.designDirection.imageStyle ?? ""}`.toLowerCase();
  if (tone.includes("luckin") || tone.includes("瑞幸")) {
    return {
      primary: "003BFF",
      background: "F8FBFF",
      surface: "FFFFFF",
      text: "101828",
      muted: "667085",
      accent: ["FFD34D", "7A4A25", "7DD3FC"],
      risk: ["Keep contrast high when using yellow and light blue accents."],
    };
  }
  if (designMode === "brand-event") {
    return {
      primary: "1D4ED8",
      background: "F8FAFC",
      surface: "FFFFFF",
      text: "111827",
      muted: "6B7280",
      accent: ["FACC15", "FB7185", "38BDF8"],
      risk: ["Avoid making playful accents dominate all pages."],
    };
  }
  return {
    primary: "002FA7",
    background: "FAFAF8",
    surface: "FFFFFF",
    text: "0A0A0A",
    muted: "737373",
    accent: ["009B72", "FFD500", "E52535"],
    risk: ["Do not rely on color alone for meaning."],
  };
}

function typographyFor(designMode: DesignMode, audience: string[]): DesignBrief["typography"] {
  if (designMode === "brand-event" || audience.includes("children")) {
    return {
      scale: "friendly-large",
      titleWeight: "bold",
      bodyDensity: "light-medium",
      rules: ["Use larger body text and short lines.", "Body page titles stay on one line except cover."],
    };
  }
  if (designMode === "executive-briefing") {
    return {
      scale: "presentation-large",
      titleWeight: "medium",
      bodyDensity: "light",
      rules: ["Use few words per page.", "Prefer conclusion-led titles."],
    };
  }
  return {
    scale: "standard",
    titleWeight: "bold",
    bodyDensity: "medium",
    rules: ["Body page titles stay on one line except cover."],
  };
}

function selectLayoutPack(designMode: DesignMode): DesignBrief["layoutPack"] {
  const packs: Record<DesignMode, DesignBrief["layoutPack"]> = {
    "business-report": { id: "business-evidence", cover: "executive-cover", body: ["kpi-ledger", "comparison-grid", "risk-checklist"], closing: "decision-summary" },
    "executive-briefing": { id: "executive-brief", cover: "minimal-cover", body: ["big-statement", "kpi-row", "two-column"], closing: "action-close" },
    "product-launch": { id: "launch-story", cover: "hero-cover", body: ["image-hero", "feature-grid", "comparison"], closing: "launch-action" },
    "brand-event": { id: "event-storytelling", cover: "poster-cover", body: ["card-board", "route-map", "coupon-strip", "task-board"], closing: "warm-action" },
    "course-training": { id: "learning-path", cover: "course-cover", body: ["step-flow", "prompt-box", "practice-board"], closing: "recap-action" },
    "knowledge-sharing": { id: "editorial-explain", cover: "topic-cover", body: ["concept-card", "timeline", "case-walkthrough"], closing: "takeaway-close" },
    "sales-pitch": { id: "solution-selling", cover: "customer-cover", body: ["pain-solution", "proof-card", "action-plan"], closing: "next-step" },
    "data-story": { id: "data-narrative", cover: "data-cover", body: ["chart-hero", "ranking-list", "source-table"], closing: "evidence-summary" },
  };
  return packs[designMode];
}

function selectComponentPack(designMode: DesignMode): DesignBrief["componentPack"] {
  const packs: Record<DesignMode, DesignBrief["componentPack"]> = {
    "business-report": { id: "business-components", required: ["kpi-card", "chart-native", "comparison-matrix", "risk-checklist"], optional: ["timeline", "summary-card"] },
    "executive-briefing": { id: "business-components", required: ["kpi-card", "comparison-matrix", "risk-checklist"], optional: ["big-statement", "decision-card"] },
    "product-launch": { id: "launch-components", required: ["hero-cover", "image-hero", "feature-card", "comparison"], optional: ["reveal-list", "kpi-card"] },
    "brand-event": { id: "activity-components", required: ["task-card", "coupon-card", "badge-sticker", "route-map", "icon-card", "checklist"], optional: ["image-hero", "story-card", "kpi-card"] },
    "course-training": { id: "teaching-components", required: ["prompt-box", "step-flow", "practice-card", "checklist"], optional: ["summary-card", "screenshot-callout"] },
    "knowledge-sharing": { id: "story-components", required: ["story-card", "quote-block", "timeline", "concept-card"], optional: ["case-card", "recap-card"] },
    "sales-pitch": { id: "sales-components", required: ["pain-card", "solution-card", "proof-card", "case-card"], optional: ["action-plan", "comparison"] },
    "data-story": { id: "data-components", required: ["kpi-card", "chart-native", "table-card", "source-note"], optional: ["ranking-list", "comparison-matrix"] },
  };
  return packs[designMode];
}

function iconCategoriesFor(designMode: DesignMode): string[] {
  if (designMode === "brand-event") return ["activity", "reward", "family", "product", "store"];
  if (designMode === "course-training") return ["step", "practice", "tool", "warning", "success"];
  if (designMode === "product-launch") return ["feature", "product", "performance", "experience"];
  if (designMode === "business-report" || designMode === "executive-briefing") return ["metric", "risk", "team", "roadmap"];
  return ["concept", "story", "example", "summary"];
}

function decorationFor(designMode: DesignMode, mood: string[]): DesignBrief["decorationPolicy"] {
  if (designMode === "brand-event") {
    return {
      level: "medium",
      motifs: mood.includes("playful") ? ["dots", "stickers", "badges", "route-lines"] : ["dots", "badges"],
      rules: ["Decorations must not compete with slide titles or key numbers.", "Use motifs to guide attention, not fill empty space."],
    };
  }
  if (designMode === "product-launch") {
    return {
      level: "low",
      motifs: ["hero-lines", "product-glow", "spec-tags"],
      rules: ["Product or capability must remain the first visual signal."],
    };
  }
  return {
    level: "low",
    motifs: ["rules", "small-labels"],
    rules: ["Keep decoration subordinate to content."],
  };
}

function imagePolicyFor(designMode: DesignMode, visualDistribution: Record<string, number>): DesignBrief["imagePolicy"] {
  if (designMode === "product-launch") {
    return {
      mode: "image-led",
      aiGenerated: "optional",
      realAssets: "required-for-products",
      nativeIllustration: "optional",
      rules: ["Use real product assets whenever authenticity matters.", "Do not fake product photos."],
    };
  }
  if (designMode === "brand-event") {
    return {
      mode: visualDistribution["ai-generated-image"] ? "selective" : "selective",
      aiGenerated: "optional",
      realAssets: "preferred-for-products",
      nativeIllustration: "preferred-for-activities",
      rules: ["Use illustrations, stickers, icons, or route maps for activities.", "Do not generate fake logos or fake product photos."],
    };
  }
  return {
    mode: "selective",
    aiGenerated: "optional",
    realAssets: "preferred-for-products",
    nativeIllustration: "optional",
    rules: ["Images must explain or prove; avoid decorative filler."],
  };
}

function visualDistributionFor(spec: WorkflowSlideSpecDeck): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const slide of spec.slides) {
    const type: WorkflowVisualType | "missing" = slide.visualStrategy?.primaryVisualType ?? "missing";
    distribution[type] = (distribution[type] ?? 0) + 1;
  }
  return distribution;
}

function normalizePreferredTheme(spec: WorkflowSlideSpecDeck, designMode: DesignMode): string {
  if (designMode === "brand-event" || designMode === "course-training") return "teaching-toolkit";
  const raw = spec.designDirection.recommendedStyleTemplate ?? spec.designDirection.recommendedThemeFamily;
  return raw || "blueprint-swiss";
}

function designIntentFor(designMode: DesignMode, mood: string[], audience: string[]): string {
  if (designMode === "brand-event") {
    return `Make the deck feel like a branded live event for ${audience.join(" and ") || "the audience"}, with ${mood.join(", ")} visual energy.`;
  }
  if (designMode === "course-training") return "Make the deck feel like a clear, practical learning tool with visible practice moments.";
  if (designMode === "product-launch") return "Make the deck feel product-centered, visual, and persuasive without losing factual clarity.";
  if (designMode === "business-report") return "Make the deck feel evidence-led, restrained, and decision-ready.";
  return "Make the deck visually match the audience, purpose, and content type rather than using a generic template.";
}

function rendererGapsFor(designMode: DesignMode, iconRequired: boolean, themeOverride?: string, preferredTheme?: string): string[] {
  const gaps: string[] = [];
  if (designMode === "brand-event") {
    gaps.push("Renderer needs activity-style components such as task-card, coupon-card, badge-sticker, and route-map.");
  }
  if (iconRequired) {
    gaps.push("Renderer must turn iconPlan names into real icons, not letter chips.");
  }
  if (themeOverride && preferredTheme && themeOverride !== preferredTheme) {
    gaps.push(`Theme override (${themeOverride}) differs from routed preferred theme (${preferredTheme}); do not let override hide scenario-specific design needs.`);
  }
  return gaps;
}
