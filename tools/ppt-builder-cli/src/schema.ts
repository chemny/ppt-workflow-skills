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
  theme: {
    id: "literary-warm" | "teaching-toolkit" | "ai-product-swiss" | "swiss-minimal" | "automotive-deep-blue" | "guizang-swiss";
    fontFace?: string;
    coverVariant?: "cobalt-blue" | "electric-violet" | "emerald-black" | "coral-red" | "graphite-lime";
  };
  assets?: Record<string, string>;
  slides: SlideSpec[];
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
    | "S01"
    | "S02"
    | "S03"
    | "S04"
    | "S05"
    | "S06"
    | "S07"
    | "S08"
    | "S09"
    | "S10"
    | "S11"
    | "S12"
    | "S13"
    | "S14"
    | "S15"
    | "S16"
    | "S17"
    | "S18"
    | "S19"
    | "S20"
    | "S21"
    | "S22";
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
  prompt?: string;
  visual?: {
    type: "generated-image" | "screenshot" | "placeholder" | "native-diagram" | "none";
    asset?: string;
    caption?: string;
  };
  sourceNote?: string;
}

export interface TeachingItem {
  label?: string;
  title: string;
  body?: string;
  tone?: "blue" | "green" | "yellow" | "red" | "muted";
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
    deck.theme?.id !== "guizang-swiss"
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
