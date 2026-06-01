# Slide Spec Contract

`slide-spec.json` is the handoff contract between `ppt-slide-writing` and `ppt-deck-builder`.

Skill 3 writes the contract. Skill 4 consumes it. Skill 4 should not guess missing page intent, copy, component structure, image requirements, or source requirements.

## Recommended Location

```text
projects/<deck-slug>/03-production/slide-production-spec.json
```

For quick one-off runs, a standalone `v3-slide-spec.json` can still be passed to the builder, but project-mode runs should write `03-production/slide-production-spec.json`.

## Deck Shape

```json
{
  "version": "0.2",
  "meta": {
    "title": "",
    "subtitle": "",
    "audience": "",
    "scenario": "",
    "durationMinutes": 20,
    "language": "zh-CN"
  },
  "writingStrategy": {
    "audienceNeed": "",
    "narrativeSpine": [],
    "tone": "",
    "evidenceRules": [],
    "copyRules": []
  },
  "designDirection": {
    "recommendedThemeFamily": "",
    "recommendedStyleTemplate": "",
    "recommendedVisualRoute": "svg-native",
    "visualTone": "",
    "pageDensity": "",
    "preferredLayoutComponents": [],
    "imageStyle": "",
    "chartTableStyle": "",
    "avoid": []
  },
  "slides": []
}
```

## Required Slide Fields

Every slide entry must include:

```json
{
  "slideNumber": 1,
  "sourceOutlineId": "v2-slide-1",
  "pageType": "cover",
  "title": "",
  "subtitle": "",
  "coreMessage": "",
  "pageConclusion": "",
  "audienceQuestion": "",
  "pageRhythm": "anchor",
  "visibleBody": [],
  "supportingDetails": [],
  "speakerNote": "",
  "transition": "",
  "layout": {
    "intent": "",
    "recommendedLayout": "",
    "contentZones": [],
    "textVisualRatio": "",
    "readingOrder": [],
    "densityRule": "",
    "visualPolicy": "native"
  },
  "visualStrategy": {
    "needed": true,
    "primaryVisualType": "ppt-native-component",
    "secondaryVisualType": null,
    "decisionReason": "",
    "audienceValue": "",
    "aiImageUse": { "use": false, "reason": "" },
    "mermaidUse": { "use": false, "reason": "" },
    "nativeComponentUse": { "use": true, "reason": "", "componentTypes": [] },
    "fallback": ""
  },
  "components": [],
  "componentPlan": [],
  "iconPlan": null,
  "chartPlan": null,
  "diagramPlan": null,
  "visual": {
    "necessity": "not_needed",
    "role": "not_needed",
    "message": "",
    "type": "none",
    "assetId": "",
    "prompt": null,
    "fallback": ""
  },
  "requiredAssets": [],
  "dataSourceRequirements": [],
  "riskFlags": []
}
```

## Ownership Rules

- Skill 2 owns slide count, slide order, chapter structure, page function, and core message.
- Skill 3 must preserve Skill 2's slide count and order.
- Skill 3 may rewrite visible titles and body copy to make them audience-facing.
- Skill 3 must not add, delete, merge, split, or reorder slides.
- Skill 3 must map every v2 slide to exactly one `slides[]` entry.
- Skill 4 must not silently change page intent, copy, slide count, or case selection.
- If Skill 4 cannot render a slide from this contract, route back to Skill 3.

## Page Type Values

Use stable page types so Skill 4 can map them to registered layouts:

```text
cover
section-divider
learning-objectives
problem-example
concept-explain
capability-map
step-flow
prompt-template
live-demo
screenshot-callout
before-after
comparison
data-proof
case-example
quote-analysis
interaction-prompt
practice-task
risk-warning
checklist
summary
qa-closing
```

## Visual Policy Values

```text
native
real_asset
generated_image
screenshot
chart
table
svg_component
svg_visual
none
```

Use `svg_component` for local visual components such as flow charts, timelines, matrices, loops, and system diagrams.

Use `svg_visual` when Skill 4 should create a page-level SVG visual layer as part of the default SVG-native route. This does not mean rasterizing the whole slide. Critical titles, body copy, numbers, data labels, and sources should be preserved as editable native PPT elements after conversion/assembly whenever technically possible.

## Page Rhythm Values

```text
anchor
dense
breathing
```

- `anchor`: one strong idea, high emphasis, more whitespace.
- `dense`: information-rich page, charts, comparison, KPI, checklist, matrix.
- `breathing`: transition, recap, reflection, closing, or light page.

Use rhythm to avoid monotonous decks.

## Visual Strategy

Every slide should decide the visual strategy before Skill 4 builds.

`visualStrategy` coordinates SVG visual composition, AI-generated images, Mermaid, native PPT components, screenshots, real assets, and charts.

Allowed `primaryVisualType` / `secondaryVisualType` values:

```text
ai-generated-image
svg-composition
real-asset
screenshot
mermaid-diagram
ppt-native-component
chart-table
none
```

Decision rules:

- Use AI-generated images for real scenes, atmosphere, premium feel, product-style scenarios, attention resets, or metaphorical visuals that support the message.
- Use SVG composition for page-level style, icons, diagrams, visual motifs, structured frames, and visual rhythm.
- Use Mermaid for workflows, architecture, decision trees, relationships, user journeys, or logic maps. Mermaid should clarify structure, not create realism.
- Use PPT-native components for editable cards, KPI rows, matrices, process steps, checklists, prompt boxes, icon groups, and concise diagrams.
- Use real assets or screenshots for official product material, UI explanation, evidence, or anything where authenticity matters.
- Use chart/table when the page makes a factual data claim.
- Use no visual when typography and layout are enough.

Required downstream fields:

| `primaryVisualType` | Required companion fields |
|---|---|
| `ai-generated-image` | `visual.type = "generated-image"` and complete `visual.prompt` |
| `svg-composition` | `layout.visualPolicy = "svg_visual"` or a `componentPlan[]` item of type `svg-composition`; include visual intent, SVG elements, and editable boundary |
| `real-asset` | `requiredAssets[]` or `visual.type = "real-image"` |
| `screenshot` | `requiredAssets[]` or `visual.type = "screenshot"`; add `screenshot-callout` component when labels are needed |
| `mermaid-diagram` | `diagramPlan` with syntax, purpose, expected aspect ratio, and fallback |
| `ppt-native-component` | `componentPlan[]` and/or `components[]` with renderable content |
| `chart-table` | `chartPlan.needed = true` and source requirement |
| `none` | `visual.type = "none"` and a layout/background typography plan |

Example:

```json
"visualStrategy": {
  "needed": true,
  "primaryVisualType": "mermaid-diagram",
  "secondaryVisualType": "ppt-native-component",
  "decisionReason": "The slide explains a logic relationship, not a real-world scene. Mermaid is clearer than AI-generated imagery.",
  "audienceValue": "Audience can see how three inputs converge into one outcome.",
  "aiImageUse": { "use": false, "reason": "AI image would add atmosphere but not clarify the logical relationship." },
  "mermaidUse": {
    "use": true,
    "reason": "The page needs a visible convergence diagram.",
    "diagramType": "flowchart",
    "expectedOutput": "Three input nodes converge into one value node."
  },
  "nativeComponentUse": {
    "use": true,
    "reason": "The renderer should keep labels editable in PPT.",
    "componentTypes": ["mermaid-diagram", "native-diagram-fallback"]
  },
  "fallback": "Use PPT-native boxes and connectors if Mermaid rendering is unavailable."
}
```

## Component Contract

Each component should be explicit enough for Skill 4 to build it without inventing content.

```json
{
  "id": "prompt-six-fields",
  "type": "prompt-box",
  "role": "teach the structure of an image prompt",
  "structure": "six labeled fields in two rows",
  "content": [
    { "label": "用途", "text": "图片用在哪里" },
    { "label": "主体", "text": "画面第一焦点是什么" }
  ],
  "editable": true,
  "rendering": "ppt-native",
  "notesForBuilder": "Use editable text boxes and thin dividers."
}
```

Allowed rendering values:

```text
ppt-native
svg-component
chart-native
image-slot
external-asset
```

## V2 Component Plan

`componentPlan` is the preferred V2 field for visual components. `components` remains the lower-level renderable content field.

```json
{
  "id": "quality-kpi-cards",
  "type": "kpi-card",
  "purpose": "show the three proof points behind the claim",
  "content": [
    { "label": "续航", "value": "835km", "text": "最高 CLTC 续航" },
    { "label": "补能", "value": "12min", "text": "10%-80% 最快充电时间" }
  ],
  "rendering": "ppt-native",
  "priority": "primary",
  "fallback": "three text cards"
}
```

Use component types from `visual-component-registry.md`.

## Diagram Plan

Use `diagramPlan` when a slide needs a flow, journey, architecture, or decision diagram.

```json
{
  "type": "mermaid-diagram",
  "purpose": "explain the content workflow",
  "syntax": "flowchart LR\nA[输入] --> B[生成] --> C[评估]",
  "aspectRatio": "16:9",
  "rendering": "mermaid-svg",
  "relationshipToSlideMessage": "The diagram turns the slide's three-step method into a visible workflow.",
  "fallback": "PPT-native three-step process flow"
}
```

Mermaid is a local component, not the default slide renderer.

When the Mermaid diagram is expected to be visible, set:

```json
"layout": {
  "recommendedLayout": "diagram-first",
  "visualPolicy": "svg_component"
}
```

`diagram-first` makes the diagram the primary component during compilation. If another component remains primary, the diagram may be treated as supporting context and may not be visible in the PPTX renderer.

## Image Prompt Contract

Generated images require a complete prompt object:

```json
{
  "purpose": "",
  "subject": "",
  "scene": "",
  "keyElements": [],
  "composition": "",
  "style": "",
  "colorPalette": "",
  "aspectRatio": "16:9",
  "targetSize": "1792x1024",
  "mustInclude": [],
  "mustAvoid": [],
  "textPolicy": "no embedded text",
  "relationshipToSlideText": "",
  "fallbackIfWeak": ""
}
```

If no generated image is needed, set `visual.type` to `none`, `native-diagram`, `screenshot`, `chart`, or another concrete non-generated value and set `prompt` to `null`.

## Quality Rules

A complete `slide-spec.json` passes these checks:

- slide count equals the approved v2 structure
- every slide has a specific title and body or a deliberate visual-only reason
- every slide has a page type
- every slide has a page rhythm
- every slide has a layout intent and recommended layout
- every slide with a visual opportunity has a component plan or a clear reason for no component
- every native component contains structure and content
- every required image has a purpose, relation to slide text, and fallback
- every generated image has a complete prompt object
- every factual claim or data point has a source requirement or risk flag
- every missing material is represented in `asset-manifest.json`

When the TypeScript builder is available, run:

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts validate-slide-spec ../../projects/<deck-slug>/03-production/slide-production-spec.json
```
