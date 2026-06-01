export type LayoutType = "title-image-split" | "two-perspective-contrast" | "rail-flow" | "teaching-toolkit";

export interface DeckSpec {
  meta: {
    title: string;
    subtitle?: string;
    author?: string;
    subject?: string;
    company?: string;
    date?: string;
    event?: string;
    lang?: string;
  };
  designBrief?: DeckDesignBrief;
  theme: {
    id: "literary-warm" | "teaching-toolkit" | "ai-product-swiss" | "swiss-minimal" | "automotive-deep-blue" | "blueprint-swiss";
    fontFace?: string;
    coverVariant?: "cobalt-blue" | "electric-violet" | "emerald-black" | "coral-red" | "graphite-lime";
  };
  assets?: Record<string, string>;
  slides: SlideSpec[];
}

export interface DeckDesignBrief {
  version?: string;
  visualRoute?: "svg-native" | "template-native" | "editable-page-design" | "svg-visual" | "template" | string;
  designMode?: string;
  scenario?: string;
  audience?: string[];
  goals?: string[];
  mood?: string[];
  designIntent?: string;
  colorSystem?: {
    primary?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    accent?: string[];
    risk?: string[];
  };
  typography?: {
    scale?: string;
    titleWeight?: string;
    bodyDensity?: string;
    rules?: string[];
  };
  layoutPack?: {
    id?: string;
    cover?: string;
    body?: string[];
    closing?: string;
  };
  componentPack?: {
    id?: string;
    required?: string[];
    optional?: string[];
  };
  iconPolicy?: {
    required?: boolean;
    style?: string;
    density?: string;
    allowedCategories?: string[];
    fallback?: string;
  };
  decorationPolicy?: {
    level?: string;
    motifs?: string[];
    rules?: string[];
  };
  imagePolicy?: {
    mode?: string;
    aiGenerated?: string;
    realAssets?: string;
    nativeIllustration?: string;
    rules?: string[];
  };
  svgPolicy?: {
    mode?: string;
    uses?: string[];
    editableBoundary?: string[];
  };
  rendererGuidance?: {
    preferredTheme?: string;
    fallbackTheme?: string;
    mustAvoid?: string[];
  };
}

export type SlideSpec = TitleImageSplitSlide | TwoPerspectiveContrastSlide | RailFlowSlide | TeachingToolkitSlide;

export interface BaseSlide {
  layout: LayoutType;
  slideNumber?: number;
}

export interface TitleImageSplitSlide extends BaseSlide {
  layout: "title-image-split";
  eyebrow: string;
  titleLines: string[];
  note: string;
  keywords?: string;
  image: string;
}

export interface TwoPerspectiveContrastSlide extends BaseSlide {
  layout: "two-perspective-contrast";
  title: string;
  label?: string;
  centerWord: string;
  left: PerspectiveBlock;
  right: PerspectiveBlock;
  footerPrompt: string;
}

export interface PerspectiveBlock {
  title: string;
  body: string;
  keyword: string;
}

export interface RailFlowSlide extends BaseSlide {
  layout: "rail-flow";
  title: string;
  subtitle: string;
  nodes: RailNode[];
  prompt: string;
}

export interface RailNode {
  label: string;
  title: string;
  body: string;
  tone: "red" | "brown" | "deep";
}

export interface TeachingToolkitSlide extends BaseSlide {
  layout: "teaching-toolkit";
  registeredLayout?:
    | "SM01"
    | "SM02"
    | "SM03"
    | "SM04"
    | "SM05"
    | "SM06"
    | "SM07"
    | "SM08"
    | "SM09"
    | "SM10"
    | "BP01"
    | "BP02"
    | "BP03"
    | "BP04"
    | "BP05"
    | "BP06"
    | "BP07"
    | "BP08"
    | "BP09"
    | "BP10"
    | "BP11"
    | "BP12"
    | "BP13"
    | "BP14"
    | "BP15"
    | "BP16"
    | "BP17"
    | "BP18"
    | "BP19"
    | "BP20"
    | "BP21"
    | "BP22";
  pageType:
    | "cover"
    | "section-divider"
    | "learning-objectives"
    | "concept-explain"
    | "capability-map"
    | "problem-example"
    | "step-flow"
    | "prompt-template"
    | "live-demo"
    | "screenshot-callout"
    | "before-after"
    | "comparison"
    | "data-proof"
    | "case-example"
    | "quote-analysis"
    | "interaction-prompt"
    | "practice-task"
    | "risk-warning"
    | "checklist"
    | "summary"
    | "qa-closing";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  items?: TeachingItem[];
  visualStrategy?: VisualStrategy;
  componentPlan?: PlannedComponent[];
  prompt?: string;
  visual?: {
    type: "generated-image" | "screenshot" | "placeholder" | "native-diagram" | "none";
    asset?: string;
    caption?: string;
  };
  sourceNote?: string;
}

export interface VisualStrategy {
  needed?: boolean;
  primaryVisualType: "ai-generated-image" | "svg-composition" | "real-asset" | "screenshot" | "mermaid-diagram" | "ppt-native-component" | "chart-table" | "none" | string;
  secondaryVisualType?: "ai-generated-image" | "svg-composition" | "real-asset" | "screenshot" | "mermaid-diagram" | "ppt-native-component" | "chart-table" | "none" | string | null;
  decisionReason?: string;
  audienceValue?: string;
  aiImageUse?: { use: boolean; reason?: string; prompt?: unknown };
  mermaidUse?: { use: boolean; reason?: string; diagramType?: string; expectedOutput?: string };
  nativeComponentUse?: { use: boolean; reason?: string; componentTypes?: string[] };
  fallback?: string;
}

export interface TeachingItem {
  label?: string;
  title: string;
  body?: string;
  icon?: string;
  value?: string;
  componentType?: string;
  tone?: "blue" | "green" | "yellow" | "red" | "muted";
}

export interface PlannedComponent {
  id: string;
  type: string;
  purpose?: string;
  content: TeachingItem[];
  rendering?: string;
  syntax?: string;
  priority?: "primary" | "secondary" | "supporting" | string;
  fallback?: string;
}

export function assertDeckSpec(value: unknown): asserts value is DeckSpec {
  if (!value || typeof value !== "object") throw new Error("Deck spec must be an object.");
  const deck = value as Partial<DeckSpec>;
  if (!deck.meta?.title) throw new Error("Deck spec missing meta.title.");
  if (
    deck.theme?.id !== "literary-warm" &&
    deck.theme?.id !== "teaching-toolkit" &&
    deck.theme?.id !== "ai-product-swiss" &&
    deck.theme?.id !== "swiss-minimal" &&
    deck.theme?.id !== "automotive-deep-blue" &&
    deck.theme?.id !== "blueprint-swiss"
  ) {
    throw new Error("Unsupported theme.id in this prototype.");
  }
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) throw new Error("Deck spec requires at least one slide.");
  for (const [index, slide] of deck.slides.entries()) {
    if (!slide || typeof slide !== "object" || typeof (slide as { layout?: unknown }).layout !== "string") {
      throw new Error(`Slide ${index + 1} missing layout.`);
    }
  }
}
