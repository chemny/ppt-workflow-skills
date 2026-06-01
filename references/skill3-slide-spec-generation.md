# Skill 3 Slide Spec Generation

This reference explains how `ppt-slide-writing` should turn Skill 2's structure into `v3-slide-spec.json`.

For V2 project-mode runs, write the same contract to `03-production/slide-production-spec.json`. Include page rhythm, component plan, icon plan, chart plan, and diagram/Mermaid plan when relevant.

The goal is not to write a pretty outline. The goal is to create a complete page contract that `ppt-deck-builder` can render without guessing.

## Generation Sequence

Use this order for every Skill 3 run:

1. Lock the v2 slide skeleton.
2. Create the deck-level writing strategy.
3. Create the deck-level design direction.
4. For each slide, translate the v2 page function into audience-facing copy.
5. Select `pageType`.
6. Select `layout.recommendedLayout` from `layout-registry.md`.
7. Write visible body copy.
8. Define page rhythm: `anchor`, `dense`, or `breathing`.
9. Define `visualStrategy`: decide whether the slide uses AI-generated image, real asset, screenshot, Mermaid, PPT-native component, chart/table, or no visual.
10. Select the primary visual object and reserve a visible layout slot for it.
11. Define native components, generated images, screenshots, charts, Mermaid diagrams, icons, or no-visual decisions according to `visualStrategy`.
12. Write component-level content that Skill 4 can render without inventing labels or card text.
13. Add source requirements and risk flags.
14. Assemble `v3-slide-spec.json` or V2 `slide-production-spec.json`.
15. Validate the JSON before handing off to Skill 4.

## V2 To V3 Translation

For every v2 slide, fill this decision chain:

```text
v2 page function
-> audience question
-> useful answer
-> page conclusion
-> visible title
-> body copy
-> layout
-> visual strategy
-> components / visuals / sources
-> page rhythm / component plan / diagram plan
```

Do not skip the audience question. It is the simplest way to avoid presenter-first pages.

## What Skill 3 May Change

Allowed:

- Rewrite slide titles.
- Rewrite visible body copy.
- Make vague structure language more useful to the audience.
- Choose page type and layout.
- Choose components and visuals.
- Mark missing evidence or material.

Not allowed:

- Add slides.
- Delete slides.
- Merge slides.
- Split slides.
- Reorder slides.
- Replace Skill 2's case selection or core message.
- Hide a weak structure by inventing a different deck.

If v2 is wrong, route back to `ppt-slide-structure`.

## Layout Selection Rules

Prefer simple registered layouts:

| Need | Layout |
|---|---|
| premium title page | `cover-typographic` |
| product/venue/person with meaningful visual | `cover-visual` |
| one concept with example | `two-column` |
| three features, reasons, or steps | `three-card` |
| four features, criteria, or use cases | `four-card` |
| evidence numbers | `kpi-row` |
| before/after or option comparison | `comparison` |
| process | `step-flow` |
| tutorial prompt | `prompt-box` |
| real UI operation | `screenshot-callout` |
| practical example | `case-walkthrough` |
| risk or delivery standard | `checklist` |
| capability/decision grid | `matrix` |
| ending recap | `summary` or `closing` |

If none fits, choose the closest registered layout and explain the limitation in `riskFlags`.

## Copy Rules

Titles:

- Use clear, direct, audience-readable titles.
- Practical tutorial titles may stay course-like.
- Argument pages may use conclusion-led titles.
- Do not expose internal outline labels as titles.

Body:

- Use concrete distinctions, criteria, steps, examples, or cautions.
- Keep each visible line short.
- Put nuance in speaker notes, not dense slide text.
- Avoid filler such as "提升效率", "赋能", "全方位", "开启新时代" unless made concrete.

## Visual Strategy Rules

Before selecting a component or writing an image prompt, decide the visual strategy for the slide.

Use this decision table:

| Need | Primary visual choice |
|---|---|
| real scene, premium atmosphere, product-style scenario, audience emotion | AI-generated image or real asset |
| official product, real UI, source evidence | real asset or screenshot |
| workflow, architecture, decision tree, relationship, journey | Mermaid or PPT-native diagram |
| editable concepts, steps, checklists, KPI, matrices, prompt fields | PPT-native component |
| factual number, trend, comparison, proportion | chart/table with source |
| strong statement or section transition | no visual or native typography/background motif |

Rules:

- Mermaid is for clarity and structure, not realism or premium scene quality.
- AI-generated images are for scenario, atmosphere, visual appeal, and concrete illustration, not exact data or system logic.
- PPT-native components are the default for editable instructional content.
- Real assets/screenshots outrank generated images when authenticity matters.
- Chart/table outranks AI image when data is the point.

Every slide should include:

- `visualStrategy.primaryVisualType`
- whether AI image is used and why
- whether Mermaid is used and why
- whether native component is used and why
- fallback if the preferred visual path fails

Then create the component or asset details required by that decision:

- `ai-generated-image` requires `visual.type = "generated-image"` and a complete `visual.prompt`.
- `real-asset` requires `requiredAssets[]` with source or upload instruction.
- `screenshot` requires an asset, crop/callout plan, and `screenshot-callout` component when annotations are needed.
- `mermaid-diagram` requires `diagramPlan.syntax`, visible layout slot, and fallback.
- `ppt-native-component` requires `componentPlan[]` and/or `components[]` with renderable content.
- `chart-table` requires `chartPlan.needed = true` and a source requirement.
- `none` requires a clear reason and stronger typography/background intent.

Do not mark a strategy without the downstream fields. A strategy without renderable detail is not a handoff.

## Visual Decision Rules

Use this priority:

```text
real user/official material
-> native editable component
-> chart/table with source
-> generated image with instructional purpose
-> no image
```

Generated images are only appropriate when they explain, demonstrate, compare, prove, navigate, or create a short attention reset.

Do not generate:

- fake UI screenshots
- fake product images
- factual charts
- fake real people
- decorative mood images unrelated to the message
- text-heavy images that should be editable PPT text

## Page-Type Visual Defaults

Use `visual-component-registry.md` as the default mapping between page types and visual paths.

Common defaults:

- `cover`: typography/native background first; generated image only when it meaningfully carries the topic.
- `learning-objectives`, `capability-map`, `prompt-template`, `practice-task`, `checklist`: `ppt-native-component`.
- `step-flow`: `mermaid-diagram` when the logic branches/converges; otherwise `ppt-native-component`.
- `live-demo` and `screenshot-callout`: `screenshot` or real asset first.
- `data-proof`: `chart-table`.
- `case-example`: `ppt-native-component` for walkthroughs; generated image only for a real scenario or result visualization.
- `qa-closing`: `none` with strong typography.

If you choose a different visual path, explain why in `visualStrategy.decisionReason`.

## Component Rules

Every component must define:

- `id`
- `type`
- `role`
- `structure`
- `content`
- `editable`
- `rendering`
- `notesForBuilder`

If the component is a checklist, matrix, prompt box, KPI row, or practice card, its text belongs in `components[].content`, not only in prose.

For each slide, choose at most one primary component. Supporting components are allowed, but they should not compete with the primary component.

Minimum component examples:

```json
"componentPlan": [
  {
    "id": "prompt-six-fields",
    "type": "prompt-box",
    "purpose": "teach the six fields that make an image prompt usable",
    "content": [
      { "label": "用途", "text": "图片最终放在哪里", "icon": "target" },
      { "label": "主体", "text": "画面第一焦点是什么", "icon": "image" },
      { "label": "场景", "text": "主体处在什么环境和关系里", "icon": "layout" },
      { "label": "风格", "text": "质感、光线、色彩和审美方向", "icon": "palette" },
      { "label": "构图", "text": "横竖比例、视角和留白", "icon": "frame" },
      { "label": "限制", "text": "不要出现什么、哪些信息必须准确", "icon": "shield" }
    ],
    "rendering": "ppt-native",
    "priority": "primary",
    "fallback": "Use a six-cell text grid without icons."
  }
]
```

If the slide uses icons, also provide `iconPlan.items` that map each icon to a component target. Do not ask Skill 4 to "add some icons".

## Source Rules

Use `dataSourceRequirements[]` for:

- product specs
- financial or market numbers
- legal/compliance claims
- medical, safety, or technical claims
- public facts that may change

Use `riskFlags[]` when a claim or asset is not yet verified.

## Validation Gate

Before handing off to Skill 4, validate:

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts validate-slide-spec ../../projects/<deck-slug>/03-production/slide-production-spec.json
```

If validation fails, fix Skill 3 output before calling `ppt-deck-builder`.

## Good Slide Spec Traits

A good slide spec:

- keeps the v2 skeleton intact
- answers a real audience question
- has useful visible copy
- names a registered layout
- has concrete content zones and reading order
- specifies native component content when needed
- specifies page rhythm and planned visual components
- avoids decorative images
- uses Mermaid only for real diagram needs and provides fallback
- requires prompts for generated images
- marks sources and risks
- can be rendered by Skill 4 without interpretation
