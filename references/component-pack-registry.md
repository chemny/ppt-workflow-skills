# Component Pack Registry

Component packs are reusable groups of visual components. They let the deck change style by configuration instead of creating one theme per case.

## Principles

- A component pack defines what visual components are preferred for a scenario.
- Component packs are reusable across brands and topics.
- A component changes appearance through design tokens, icon policy, and decoration policy.
- Skill 3 requests components; Skill 4 renders them according to the selected component pack.

## Standard Packs

| Pack ID | Best for | Required components |
|---|---|---|
| `business-components` | work reports, executive updates | kpi-card, chart-native, comparison-matrix, risk-checklist |
| `launch-components` | product launches, keynotes | hero-cover, image-hero, feature-card, comparison, reveal-list |
| `teaching-components` | tutorials, workshops, classes | prompt-box, step-flow, practice-card, checklist, summary-card |
| `activity-components` | brand events, store activations, festivals, parent-child activities | task-card, coupon-card, badge-sticker, route-map, icon-card, checklist |
| `sales-components` | proposals and customer presentations | pain-card, solution-card, proof-card, case-card, action-plan |
| `data-components` | research and analysis decks | kpi-card, chart-native, table-card, ranking-list, source-note |
| `story-components` | knowledge sharing and narrative talks | story-card, quote-block, timeline, concept-card, recap-card |

## Component Definitions

| Component | Purpose | Minimum content |
|---|---|---|
| `hero-cover` | strong first page | title, subtitle, metadata, motif/image policy |
| `icon-card` | quick concept recognition | 2-6 label/text/icon items |
| `task-card` | activity or exercise | task name, instruction, success cue, icon |
| `coupon-card` | promotion or benefit | value, rule, eligibility note, disclaimer |
| `badge-sticker` | playful emphasis or status | short label, icon, color role |
| `route-map` | event or learning path | 3-6 ordered stops, connector meaning |
| `kpi-card` | numeric proof | value, label, explanation, source |
| `process-flow` | workflow | ordered steps, start/end, connector meaning |
| `comparison-matrix` | contrast | compared options, criteria, cell summaries |
| `checklist` | rules or readiness | rows, action meaning, priority/status cue |
| `prompt-box` | AI/tool teaching | fields or prompt text, usage notes |
| `practice-card` | learner action | input, action, expected output, success criterion |
| `story-card` | narrative example | setting, conflict, action, result |
| `image-hero` | visual proof or atmosphere | image asset/prompt, caption, safe crop rule |

## Pack Selection Defaults

| Design mode | Default component pack |
|---|---|
| `business-report` | `business-components` |
| `executive-briefing` | `business-components` |
| `product-launch` | `launch-components` |
| `brand-event` | `activity-components` |
| `course-training` | `teaching-components` |
| `knowledge-sharing` | `story-components` |
| `sales-pitch` | `sales-components` |
| `data-story` | `data-components` |

## Rendering Rule

The same component should adapt through tokens:

```text
task-card + business-report -> square, restrained, small icon
task-card + brand-event -> rounded, playful, sticker accent
task-card + course-training -> large readable instruction block
```

Do not duplicate `task-card` into separate `luckin-task-card`, `xiaomi-task-card`, or `kids-task-card` components. Use configuration.

