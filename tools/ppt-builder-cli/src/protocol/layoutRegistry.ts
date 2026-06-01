export const genericLayoutIds = [
  "cover-typographic",
  "cover-visual",
  "section-divider",
  "big-statement",
  "two-column",
  "three-card",
  "four-card",
  "kpi-row",
  "comparison",
  "timeline",
  "step-flow",
  "diagram-first",
  "prompt-box",
  "screenshot-callout",
  "image-hero",
  "case-walkthrough",
  "checklist",
  "matrix",
  "summary",
  "closing",
] as const;

export type GenericLayoutId = (typeof genericLayoutIds)[number];

export interface GenericLayoutDefinition {
  id: GenericLayoutId;
  bestFor: string;
  requiredContent: string[];
  defaultVisualPolicy: "native" | "real_asset" | "generated_image" | "screenshot" | "chart" | "table" | "svg_component" | "none";
}

export const genericLayoutRegistry: GenericLayoutDefinition[] = [
  { id: "cover-typographic", bestFor: "formal cover without decorative image", requiredContent: ["title", "subtitle or promise", "metadata"], defaultVisualPolicy: "native" },
  { id: "cover-visual", bestFor: "product or event cover with meaningful visual", requiredContent: ["title", "subtitle", "visual asset"], defaultVisualPolicy: "real_asset" },
  { id: "section-divider", bestFor: "chapter transitions", requiredContent: ["section label", "title"], defaultVisualPolicy: "native" },
  { id: "big-statement", bestFor: "one strong claim or principle", requiredContent: ["statement", "short support"], defaultVisualPolicy: "native" },
  { id: "two-column", bestFor: "explanation plus evidence or concept plus example", requiredContent: ["left block", "right block"], defaultVisualPolicy: "native" },
  { id: "three-card", bestFor: "three principles, features, or steps", requiredContent: ["three cards"], defaultVisualPolicy: "native" },
  { id: "four-card", bestFor: "four capabilities, options, or criteria", requiredContent: ["four cards"], defaultVisualPolicy: "native" },
  { id: "kpi-row", bestFor: "key numbers", requiredContent: ["2-4 KPI items", "source note"], defaultVisualPolicy: "native" },
  { id: "comparison", bestFor: "option A/B, before/after, or competitor contrast", requiredContent: ["two panels", "criteria"], defaultVisualPolicy: "native" },
  { id: "timeline", bestFor: "chronological story or roadmap", requiredContent: ["3-6 dated steps"], defaultVisualPolicy: "native" },
  { id: "step-flow", bestFor: "process or operation path", requiredContent: ["3-6 steps"], defaultVisualPolicy: "native" },
  { id: "diagram-first", bestFor: "workflow, architecture, decision tree, or relationship map where the diagram is the main content", requiredContent: ["diagramPlan", "short explanation"], defaultVisualPolicy: "svg_component" },
  { id: "prompt-box", bestFor: "prompt or tutorial page", requiredContent: ["prompt fields", "usage notes"], defaultVisualPolicy: "native" },
  { id: "screenshot-callout", bestFor: "product UI or real workflow", requiredContent: ["screenshot", "callouts"], defaultVisualPolicy: "screenshot" },
  { id: "image-hero", bestFor: "meaningful large visual", requiredContent: ["image asset", "title or caption"], defaultVisualPolicy: "real_asset" },
  { id: "case-walkthrough", bestFor: "practical example", requiredContent: ["context", "input", "result", "evaluation"], defaultVisualPolicy: "native" },
  { id: "checklist", bestFor: "risk, quality, or delivery criteria", requiredContent: ["checklist rows", "advice"], defaultVisualPolicy: "native" },
  { id: "matrix", bestFor: "capability map, scoring, or decision grid", requiredContent: ["rows", "columns", "labels"], defaultVisualPolicy: "native" },
  { id: "summary", bestFor: "takeaways", requiredContent: ["3-5 takeaway items"], defaultVisualPolicy: "native" },
  { id: "closing", bestFor: "Q&A or final action", requiredContent: ["closing message", "next step"], defaultVisualPolicy: "native" },
];
