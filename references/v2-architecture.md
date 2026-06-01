# PPT-Maker V2 Architecture

V2 keeps the six user-facing skills, but rebuilds the internal workflow around durable project artifacts.

The goal is not "generate slides from a topic". The goal is to turn user intent, source material, research, structure, copy, components, and design into an editable PPTX that can be reviewed and rehearsed.

## Product Direction

V2 is a native-PPT workflow:

```text
source material
-> research brief
-> structure plan
-> slide production spec
-> design system + template selection
-> PptxGenJS native components
-> final review
-> presentation practice
```

Do not use whole-slide SVG as the default path. SVG and Mermaid may be used as local components when they improve understanding, but the deck should remain editable wherever practical.

## Project Structure

```text
projects/<deck-slug>/
├── 00-intake/
│   ├── user-brief.md
│   ├── source-index.json
│   ├── source-summary.md
│   ├── citations.json
│   ├── extracted-tables/
│   └── extracted-images/
├── 01-research/
│   ├── topic-research.md
│   ├── official-sources.md
│   └── research-brief.json
├── 02-structure/
│   ├── structure-plan.md
│   └── structure-plan.json
├── 03-production/
│   ├── slide-production-spec.json
│   └── slide-copy.md
├── 04-design/
│   ├── design-system.json
│   ├── template-selection.json
│   └── asset-plan.json
├── 05-build/
│   ├── deck-builder-input.json
│   ├── generated-assets/
│   └── output.pptx
├── 06-review/
│   ├── quality-report.json
│   └── fix-requests.json
└── 07-practice/
    ├── practice-report.md
    └── full-script.md
```

For quick decks, these folders can be created lazily, but the artifact names and responsibility boundaries should remain the same.

## Skill Ownership

| Skill | V2 responsibility | Primary artifacts |
|---|---|---|
| `ppt-goal-setting` | Clarify user intent and register supplied material | `00-intake/user-brief.md`, `source-index.json` |
| `ppt-slide-structure` | Use source material and research to decide the structure | `01-research/research-brief.json`, `02-structure/structure-plan.json` |
| `ppt-slide-writing` | Produce page-level content, evidence, components, visuals, and layout intent | `03-production/slide-production-spec.json` |
| `ppt-deck-builder` | Select design system, template, assets, and build editable PPTX | `04-design/*`, `05-build/*` |
| `ppt-final-check` | Validate content, source use, components, design lock, build quality, and readiness | `06-review/*` |
| `ppt-presentation-practice` | Generate rehearsal plan, speaker cards, optional full script, Q&A, and emergency responses | `07-practice/*` |

## Core Artifacts

### Source Package

The source package records user-provided and researched material. It must make later claims traceable.

- `source-index.json`: all user files, URLs, screenshots, tables, and reference decks.
- `source-summary.md`: concise summary of what each source contributes to the PPT.
- `citations.json`: reusable fact/data/case records with source identifiers.
- `extracted-tables/`: table data extracted from Excel, PDF, Word, or web sources.
- `extracted-images/`: reusable images, screenshots, and asset notes.

### Research Brief

`research-brief.json` answers structure-shaping questions:

- correct topic/product/concept name
- official definition and capability boundary
- audience-relevant use cases
- common misconceptions
- source-sensitive claims
- examples or cases worth using
- implications for deck structure

Research is not a generic web summary. It exists to support structure, copy, evidence, and visual decisions.

### Structure Plan

`structure-plan.json` owns:

- deck type and scenario pattern
- audience journey
- narrative spine
- chapter plan
- slide count and timing
- per-slide function and core message
- evidence/material needed per slide
- page rhythm per slide: `anchor`, `dense`, or `breathing`

### Slide Production Spec

`slide-production-spec.json` is the most important Skill 3 output. It owns page-level production details:

- final title and visible copy
- page conclusion and speaker note
- evidence and citations
- component plan
- visual plan
- icon plan
- chart plan
- Mermaid plan
- layout intent
- required assets
- fallback and risk flags

Skill 4 should not invent content, cases, component structure, or image purpose that is absent from this spec.

### Design System

`design-system.json` locks:

- theme tokens
- typography scale
- spacing scale
- icon style
- chart style
- component styling
- motion policy
- page chrome

### Template Selection

`template-selection.json` should select from:

- `theme`
- `layout-pack`
- `component-pack`
- `deck-template`

Template selection is a decision layer, not hard-coded theme guessing.

## Page Rhythm

Every slide should include a page rhythm:

| Rhythm | Meaning | Typical use |
|---|---|---|
| `anchor` | high-emphasis page with one strong idea | cover, section opener, major claim, product reveal |
| `dense` | information-rich page | data proof, comparison, checklist, feature table |
| `breathing` | lighter page that gives the audience a pause | transition, recap, reflective question, closing |

Good decks mix rhythm. If most slides are the same rhythm and layout, the deck will feel thin or monotonous.

## Component-First Visual Strategy

V2 should avoid choosing between "text-only" and "image-heavy". Use components as the default visual language:

```text
icon card
KPI card
process flow
timeline
comparison matrix
checklist
journey map
architecture diagram
Mermaid diagram
chart/table
real screenshot
generated image
```

Generated images should be used only when they clarify, demonstrate, compare, prove, navigate, or create a deliberate focus moment. Decorative images should be avoided.

## Quality Gate

Final review should check the whole chain:

- user goal and audience fit
- source material actually used
- research-sensitive facts verified
- structure follows the selected scenario
- slide production spec is complete
- page rhythm is varied enough
- visual components are present where useful
- required assets are available or have acceptable fallback
- PPTX builds and advances manually
- deck can enter presentation practice only after PASS

