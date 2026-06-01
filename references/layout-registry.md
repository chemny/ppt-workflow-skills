# Layout Registry

The layout registry is the bridge between slide intent and deterministic PPTX rendering.

Skill 3 chooses a recommended layout from the registry. Skill 4 maps that layout to a concrete PPTGenJS renderer and theme tokens.

## Core Rule

Do not invent a new visual structure for every slide.

Use a registered layout first. Create a new layout only when the pattern is reusable and clearly belongs to the selected style template.

## Generic Layout IDs

These IDs are style-agnostic. A theme may render the same layout differently.

| Layout ID | Best For | Required Content |
|---|---|---|
| `cover-typographic` | formal cover without decorative image | title, subtitle/promise, metadata |
| `cover-visual` | product or event cover with meaningful visual | title, subtitle, visual asset |
| `section-divider` | chapter transitions | section label, title, optional one-line promise |
| `big-statement` | one strong claim or principle | statement, short support |
| `two-column` | explanation + evidence, concept + example | left block, right block |
| `three-card` | three principles/features/steps | three cards with title/body |
| `four-card` | four capabilities/options/criteria | four cards with title/body |
| `kpi-row` | key numbers | 2-4 KPI items, source note |
| `comparison` | option A/B, before/after, competitor contrast | two panels and criteria |
| `timeline` | chronological story or roadmap | 3-6 dated steps |
| `step-flow` | process or operation path | 3-6 steps, labels, short text |
| `diagram-first` | workflow, architecture, decision tree, or relationship map where the diagram is the main content | `diagramPlan`, short explanation, fallback |
| `prompt-box` | prompt/tutorial page | prompt fields, usage notes |
| `screenshot-callout` | product UI or real workflow | screenshot, callouts, caution |
| `image-hero` | meaningful large visual | image asset, title/caption/KPI |
| `case-walkthrough` | practical example | context, input, result, evaluation |
| `checklist` | risk, quality, or delivery criteria | checklist rows and advice |
| `matrix` | capability map, scoring, decision grid | rows, columns, labels |
| `summary` | takeaways | 3-5 takeaway items |
| `closing` | Q&A or final action | closing message, next step, contact |

## Page Type Mapping

Default mapping:

| Page type | Preferred layouts |
|---|---|
| `cover` | `cover-typographic`, `cover-visual` |
| `section-divider` | `section-divider`, `big-statement` |
| `learning-objectives` | `three-card`, `checklist` |
| `problem-example` | `comparison`, `case-walkthrough` |
| `concept-explain` | `two-column`, `three-card`, `big-statement` |
| `capability-map` | `matrix`, `four-card`, `three-card` |
| `step-flow` | `step-flow`, `timeline` |
| diagram-heavy workflow/architecture page | `diagram-first`, `step-flow`, `matrix` |
| `prompt-template` | `prompt-box`, `two-column` |
| `live-demo` | `case-walkthrough`, `screenshot-callout` |
| `screenshot-callout` | `screenshot-callout` |
| `before-after` | `comparison` |
| `comparison` | `comparison`, `matrix` |
| `data-proof` | `kpi-row`, `matrix` |
| `case-example` | `case-walkthrough`, `image-hero` |
| `interaction-prompt` | `prompt-box`, `checklist` |
| `practice-task` | `prompt-box`, `case-walkthrough` |
| `risk-warning` | `checklist`, `big-statement` |
| `checklist` | `checklist` |
| `summary` | `summary`, `three-card` |
| `qa-closing` | `closing` |

## Theme-Specific Mapping

`design-lock.json` may map generic layouts to concrete registered layouts:

```json
{
  "layoutRegistry": {
    "cover-typographic": "blueprint-cover-01",
    "three-card": "blueprint-cards-03",
    "kpi-row": "blueprint-kpi-01",
    "image-hero": "blueprint-image-hero-01"
  }
}
```

Skill 4 should use the theme-specific mapping when available. If no mapping exists, choose the closest built-in renderer and record the choice in `05-build/deck-builder-input.json`.

## SVG Component Use

SVG is useful for local components, not as the default whole-slide strategy.

Good SVG component candidates:

- flow chart
- timeline
- system diagram
- capability matrix
- loop/cycle diagram
- relation map

Rules:

- Keep all critical slide copy as editable PPT text when practical.
- Use SVG only when the geometry is complex enough to justify it.
- Do not rasterize text-heavy slides into SVG.
- If the SVG contains labels, ensure Skill 5 can still review the text source from `slide-spec.json`.
