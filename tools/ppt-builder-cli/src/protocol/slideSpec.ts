export type SlideSpecVersion = "0.2";

export type WorkflowPageType =
  | "cover"
  | "section-divider"
  | "learning-objectives"
  | "problem-example"
  | "concept-explain"
  | "capability-map"
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

export type WorkflowVisualPolicy =
  | "native"
  | "real_asset"
  | "generated_image"
  | "screenshot"
  | "chart"
  | "table"
  | "svg_component"
  | "svg_visual"
  | "none";

export type WorkflowComponentRendering = "ppt-native" | "svg-component" | "chart-native" | "image-slot" | "external-asset";

export type WorkflowPageRhythm = "anchor" | "dense" | "breathing";

export type WorkflowComponentPriority = "primary" | "secondary" | "supporting";

export type WorkflowDiagramRendering = "ppt-native" | "mermaid-svg" | "svg-component" | "image-slot";

export type WorkflowVisualType =
  | "ai-generated-image"
  | "svg-composition"
  | "real-asset"
  | "screenshot"
  | "mermaid-diagram"
  | "ppt-native-component"
  | "chart-table"
  | "none";

export interface WorkflowSlideSpecDeck {
  version: SlideSpecVersion;
  meta: {
    title: string;
    subtitle?: string;
    audience?: string;
    scenario?: string;
    durationMinutes?: number;
    language?: string;
  };
  writingStrategy: {
    audienceNeed: string;
    narrativeSpine: string[];
    tone: string;
    evidenceRules: string[];
    copyRules: string[];
  };
  designDirection: {
    recommendedThemeFamily: string;
    recommendedStyleTemplate?: string;
    recommendedVisualRoute?: "svg-native" | "template-native" | "editable-page-design" | "svg-visual" | "template";
    visualTone: string;
    pageDensity: string;
    preferredLayoutComponents: string[];
    imageStyle?: string;
    chartTableStyle?: string;
    avoid: string[];
  };
  slides: WorkflowSlideSpec[];
}

export interface WorkflowSlideSpec {
  slideNumber: number;
  sourceOutlineId: string;
  pageType: WorkflowPageType;
  title: string;
  subtitle?: string;
  coreMessage: string;
  pageConclusion: string;
  audienceQuestion: string;
  visibleBody: string[];
  supportingDetails: string[];
  speakerNote?: string;
  transition?: string;
  pageRhythm?: WorkflowPageRhythm;
  layout: WorkflowLayoutSpec;
  visualStrategy?: WorkflowVisualStrategy;
  components: WorkflowComponentSpec[];
  componentPlan?: WorkflowPlannedComponent[];
  iconPlan?: WorkflowIconPlan | null;
  chartPlan?: WorkflowChartPlan | null;
  diagramPlan?: WorkflowDiagramPlan | null;
  visual: WorkflowVisualSpec;
  requiredAssets: WorkflowRequiredAsset[];
  dataSourceRequirements: WorkflowSourceRequirement[];
  riskFlags: string[];
}

export interface WorkflowLayoutSpec {
  intent: string;
  recommendedLayout: string;
  contentZones: string[];
  textVisualRatio?: string;
  readingOrder: string[];
  densityRule: string;
  visualPolicy: WorkflowVisualPolicy;
}

export interface WorkflowVisualStrategy {
  needed: boolean;
  primaryVisualType: WorkflowVisualType;
  secondaryVisualType?: WorkflowVisualType | null;
  decisionReason: string;
  audienceValue: string;
  aiImageUse:
    | {
        use: true;
        reason: string;
        prompt: WorkflowImagePrompt;
      }
    | {
        use: false;
        reason: string;
      };
  mermaidUse:
    | {
        use: true;
        reason: string;
        diagramType: string;
        expectedOutput: string;
      }
    | {
        use: false;
        reason: string;
      };
  nativeComponentUse:
    | {
        use: true;
        reason: string;
        componentTypes: string[];
      }
    | {
        use: false;
        reason: string;
      };
  fallback: string;
}

export interface WorkflowComponentSpec {
  id: string;
  type: string;
  role: string;
  structure: string;
  content: Array<{ label?: string; text: string }>;
  editable: boolean;
  rendering: WorkflowComponentRendering;
  notesForBuilder?: string;
}

export interface WorkflowPlannedComponent {
  id: string;
  type:
    | "icon-card"
    | "kpi-card"
    | "process-flow"
    | "timeline"
    | "comparison-matrix"
    | "checklist"
    | "journey-map"
    | "architecture-diagram"
    | "decision-tree"
    | "prompt-box"
    | "screenshot-callout"
    | "case-card"
    | "quote-block"
    | "chart-native"
    | "mermaid-diagram"
    | "svg-composition"
    | string;
  purpose: string;
  content: Array<{ label?: string; text: string; icon?: string; value?: string }>;
  rendering: WorkflowComponentRendering | WorkflowDiagramRendering;
  priority: WorkflowComponentPriority;
  fallback: string;
}

export interface WorkflowIconPlan {
  enabled: boolean;
  iconFamily?: string;
  style?: "line" | "filled" | "duotone" | "solid";
  items: Array<{ targetId: string; icon: string; label?: string; purpose: string }>;
  fallback: string;
}

export interface WorkflowChartPlan {
  needed: boolean;
  chartType?: "bar" | "line" | "area" | "pie" | "donut" | "scatter" | "table" | "kpi" | "waterfall" | "radar" | string;
  dataSourceRequirement?: string;
  dataShape?: string;
  message?: string;
  sourceNote?: string;
  fallback: string;
}

export interface WorkflowDiagramPlan {
  type: "mermaid-diagram" | "native-diagram" | "architecture-diagram" | "process-flow" | "decision-tree" | "journey-map" | string;
  purpose: string;
  syntax?: string;
  aspectRatio?: string;
  rendering: WorkflowDiagramRendering;
  relationshipToSlideMessage: string;
  fallback: string;
}

export interface WorkflowVisualSpec {
  necessity: "must-have" | "recommended" | "optional" | "not_needed";
  role: "explain" | "demonstrate" | "compare" | "prove" | "navigate" | "focus" | "not_needed";
  message: string;
  type: "generated-image" | "real-image" | "screenshot" | "native-diagram" | "chart" | "table" | "svg-component" | "svg-visual" | "none";
  assetId?: string;
  prompt: WorkflowImagePrompt | null;
  fallback: string;
}

export interface WorkflowImagePrompt {
  purpose: string;
  subject: string;
  scene: string;
  keyElements: string[];
  composition: string;
  style: string;
  colorPalette: string;
  aspectRatio: string;
  targetSize?: string;
  mustInclude: string[];
  mustAvoid: string[];
  textPolicy: string;
  relationshipToSlideText: string;
  fallbackIfWeak: string;
}

export interface WorkflowRequiredAsset {
  id: string;
  type: string;
  status: "available" | "pending" | "generated" | "sourced" | "build-native" | "placeholder" | "missing";
  purpose: string;
  sourceOrInstruction: string;
  fallback: string;
  required?: boolean;
  risk?: string;
}

export interface WorkflowSourceRequirement {
  claim: string;
  sourceNeeded: string;
  status: "verified" | "pending" | "not_needed";
  risk?: string;
}
