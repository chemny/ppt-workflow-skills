# Visual Component Registry

V2 decks can be built through either the default `svg-native` route or the optional `template-native` route.

In the `svg-native` route, SVG is the primary visual design layer and the final PPTX should preserve editable native objects wherever the conversion/assembly layer supports it. Images and Mermaid are useful, but they should not replace structured page design.

In the `template-native` route, native PPT components are the default visual language and SVG/Mermaid are local components.

This registry defines component intents that Skill 3 can request and Skill 4 can render.

## Component Principles

- Components must clarify content, not decorate empty space.
- Component text should remain editable whenever practical.
- Every component needs content, role, and fallback.
- Generated images are optional; use them only when realism, atmosphere, product feel, or visual impact adds meaning.
- Mermaid is a diagram component, not a whole-deck rendering strategy.
- One slide should normally have one primary visual object. Supporting icons, chips, labels, and background motifs may exist, but they must serve the primary object.
- If the slide explains an operation, decision, comparison, checklist, or example, prefer a native PPT component before considering a decorative image.
- If the slide needs a premium real-world feeling, use AI-generated image or real asset, but keep all factual labels and key copy as editable PPT text.

## SVG / Image / Native Split

| Layer | Best for | Avoid |
|---|---|---|
| SVG visual layer | page background, motifs, icon sets, abstract diagrams, card frames, maps, flows, visual metaphor, rhythm variation | long editable body copy, essential data labels, source notes |
| AI image layer | cover/hero atmosphere, realistic scene, product/lifestyle moment, premium visual impact, audience empathy | fake evidence, fake UI, dense text, random decoration |
| PPT-native editable layer | titles, body copy, KPI numbers, sources, chart/table values, editable callouts | complex decorative patterns better handled by SVG |

Decision rule:

```text
Need designed structure or icon/diagram language? -> SVG
Need realism, atmosphere, product/lifestyle impact? -> AI image
Need editable factual content? -> PPT-native
```

The best pages often combine all three, but each layer must have a clear job.

## Visual Responsibility Split

Skill 3 must decide the visual responsibility before writing component details. Do not leave this decision to Skill 4.

| Visual path | Use for | Skill 3 must provide | Skill 4 must do |
|---|---|---|---|
| AI-generated image | realistic scene, atmosphere, product-style moment, visual metaphor, attention reset | complete prompt, aspect ratio, safe area, avoid-list, relation to slide message | generate/place image, crop safely, keep titles and labels editable |
| SVG visual composition | style system, icons, motifs, diagrams, visual frames, page rhythm, abstract graphics | visual intent, composition notes, component/icon content, editable vs non-editable boundary | draw SVG layer, fuse with images, keep critical text editable |
| Mermaid diagram | logic flow, architecture, decision tree, relationship map, journey | diagram purpose, syntax, expected output, fallback | render Mermaid or PPT-native fallback visibly |
| PPT-native component | prompt boxes, cards, KPI rows, checklists, matrices, flows, teaching widgets | component type, exact content, role, priority, fallback | build editable shapes/text/icons |
| Real asset/screenshot | official product material, UI teaching, evidence, real examples | asset id, source/instruction, crop/callout need, fallback | place asset without distortion, add editable callouts |
| Chart/table | factual number, trend, comparison, proportion | data requirement, chart type, message, source note | render chart/table with source-aware labels |
| No visual | cover typography, section divider, strong statement, closing | reason why typography is enough | build typography/background treatment without adding random imagery |

Decision order:

```text
authenticity needed? -> real asset/screenshot
data is the point? -> chart/table
relationship/process is the point? -> SVG, Mermaid, or PPT-native diagram
editable teaching object is the point? -> PPT-native component
scene/emotion/premium atmosphere is the point? -> AI-generated image
none of the above? -> typography/native background
```

## Component Types

| Component | Use when | Best rendering |
|---|---|---|
| `icon-card` | 2-6 short concepts need quick recognition | PPT native cards + SVG icons |
| `kpi-card` | numbers or proof points matter | PPT native text + shapes |
| `process-flow` | steps, workflows, operations | PPT native arrows/blocks; Mermaid fallback for complex flows |
| `timeline` | events or sequence over time | PPT native line + milestones |
| `comparison-matrix` | options, competitors, before/after criteria | PPT native table/cards |
| `checklist` | rules, risks, readiness, action list | PPT native rows + icons |
| `journey-map` | user path, customer experience, learning path | PPT native path + stages |
| `architecture-diagram` | systems, modules, dependency map | Mermaid SVG or PPT native blocks |
| `decision-tree` | choices and outcomes | Mermaid SVG or PPT native branches |
| `prompt-box` | AI prompt, command, input/output teaching | PPT native code/prompt panel |
| `screenshot-callout` | real UI explanation | image slot + PPT native callouts |
| `case-card` | story or example walkthrough | PPT native card stack |
| `quote-block` | quote or text close reading | PPT native typography |
| `chart-native` | factual data visualization | PPT chart/table, source required |
| `mermaid-diagram` | complex flow, sequence, graph, architecture | Mermaid rendered SVG/PNG + native labels where practical |
| `svg-composition` | page needs custom visual structure beyond fixed templates | SVG layer + PPT-native text overlay |

## Page-Type Defaults

Use this table as the default mapping. The user can override it, but Skill 3 should not start from a blank page.

| Page type | Default primary visual | Typical component | Notes |
|---|---|---|---|
| `cover` | `svg-composition`, `none`, `real-asset`, or `ai-generated-image` | typography/background motif | Do not default to generated images. Use generated image only when the topic needs a meaningful hero scene. |
| `learning-objectives` | `ppt-native-component` | icon-card, checklist | Make goals concrete and audience-facing. |
| `problem-example` | `ppt-native-component` or `ai-generated-image` | before/after, case-card | Use image only if the problem is visual or situational. |
| `concept-explain` | `svg-composition` or `ppt-native-component` | icon-card, diagram, quote-block | Avoid long paragraphs. |
| `capability-map` | `ppt-native-component` | icon-card, matrix | Icons are useful here. |
| `step-flow` | `svg-composition`, `mermaid-diagram`, or `ppt-native-component` | process-flow, journey-map | Use SVG/Mermaid when relationships branch or converge. |
| `prompt-template` | `ppt-native-component` | prompt-box, checklist | Keep prompt fields editable. |
| `live-demo` | `screenshot` or `ppt-native-component` | screenshot-callout, process-flow | Real UI/screenshot outranks generated image. |
| `screenshot-callout` | `screenshot` | screenshot-callout | Must include source/crop/callout plan. |
| `before-after` | `ppt-native-component` or `real-asset` | comparison, case-card | Keep labels editable. |
| `comparison` | `ppt-native-component` | comparison-matrix | Use tables/cards, not decorative diagrams. |
| `data-proof` | `chart-table` | kpi-card, chart-native | Requires source requirement. |
| `case-example` | `ppt-native-component` or `ai-generated-image` | case-card, screenshot-callout | For common user scenarios, prefer concrete walkthroughs. |
| `interaction-prompt` | `ppt-native-component` | practice-card, checklist | Make task and expected output clear. |
| `practice-task` | `ppt-native-component` | practice-card, prompt-box | Include input, action, success criteria. |
| `risk-warning` | `ppt-native-component` | checklist, decision-tree | Mermaid only for branching decisions. |
| `checklist` | `ppt-native-component` | checklist | Use rows with icons/status markers. |
| `summary` | `ppt-native-component` or `none` | recap cards, next-step checklist | Keep sparse and memorable. |
| `qa-closing` | `none` | typography/background motif | Avoid unnecessary images. |

## Required Component Content Patterns

When Skill 3 chooses a component, it must provide content that Skill 4 can render directly.

| Component | Minimum content |
|---|---|
| `icon-card` | 2-6 items, each with `label`, `text`, and `icon` |
| `kpi-card` | number/value, label, explanation, source requirement |
| `process-flow` | ordered steps, connector meaning, start/end state |
| `comparison-matrix` | compared objects, criteria, cell summaries |
| `checklist` | checklist rows, pass/fail or priority cue, action meaning |
| `prompt-box` | prompt fields or full prompt, explanation of each field |
| `screenshot-callout` | asset id, callout labels, what each callout proves |
| `case-card` | scenario, input, action, output, lesson |
| `mermaid-diagram` | syntax, diagram purpose, fallback labels |
| `svg-composition` | visual intent, SVG element list, editable text boundary, fallback |

## Page Rhythm Fit

| Rhythm | Useful components |
|---|---|
| `anchor` | big statement, hero KPI, one visual metaphor, large quote, product reveal |
| `dense` | comparison matrix, KPI cards, table, checklist, screenshot callout, chart |
| `breathing` | one question, recap cards, transition diagram, closing action |

## Component Plan Schema

In `slide-production-spec.json`, each slide may include:

```json
{
  "pageRhythm": "dense",
  "componentPlan": [
    {
      "id": "capability-cards",
      "type": "icon-card",
      "purpose": "show four core capabilities at a glance",
      "content": [
        { "label": "续航", "text": "长途不确定性降低", "icon": "battery" },
        { "label": "座舱", "text": "信息更清楚", "icon": "monitor" }
      ],
      "rendering": "ppt-native",
      "priority": "primary",
      "fallback": "plain four-card grid"
    }
  ],
  "diagramPlan": {
    "type": "mermaid-diagram",
    "purpose": "explain the workflow",
    "syntax": "flowchart LR\nA[Input] --> B[Generate] --> C[Evaluate]",
    "rendering": "mermaid-svg",
    "fallback": "PPT native three-step process flow"
  }
}
```

## Mermaid Rules

Use Mermaid for:

- flowchart
- sequence diagram
- state diagram
- user journey
- architecture diagram
- decision tree

Avoid Mermaid for:

- dense tables
- factual charts
- decorative illustrations
- text-heavy slides
- anything that must be fully editable in PowerPoint

When Skill 3 requests Mermaid, it must provide:

- diagram purpose
- Mermaid syntax
- expected aspect ratio
- relationship to the slide message
- fallback if rendering fails

Skill 4 may render Mermaid to SVG/PNG and place it as a local visual component. Do not make the entire slide a Mermaid diagram by default.

Visibility rule:

- If Mermaid is the main value of the slide, set it as the primary component or use a diagram-first layout.
- If another component is primary, Mermaid may be used only when the page blueprint reserves a visible diagram slot.
- Do not attach Mermaid as an invisible supporting component. Current native PPTX renderers may ignore supporting diagrams when the primary renderer occupies the page.
- For project-mode slide specs, prefer `layout.recommendedLayout = "diagram-first"` when Mermaid is expected to be visible.

## Icon Rules

Icon usage should be systematic:

- one icon family per deck
- consistent line width or fill style
- icons support labels, not replace labels
- no random decorative icons
- use icons for repeated concept categories, steps, risks, tools, features, or actions

Recommended icon categories:

| Scenario | Icon examples |
|---|---|
| AI/tutorial | image, cursor, spark, prompt, refresh, check, warning |
| product/vehicle | battery, speed, shield, monitor, seat, route, charging |
| business report | target, chart, trend, risk, roadmap, team, money |
| teaching | book, question, pen, checklist, practice, discussion |

In the `svg-native` route, icons should usually be drawn or embedded in the SVG layer for consistency, then converted/assembled into editable PPT objects where possible. Keep icon labels editable in PPT when they carry important meaning.

## Quality Checks

Skill 5 should flag:

- slides with visual opportunity but no component
- Mermaid requested but missing fallback
- icon cards without consistent icon style
- chart-like claims rendered as decorative diagrams without data/source
- too many pages using the same component type
- component text missing from the slide spec
