# PPT Project Structure

Use this project folder when a deck may need source intake, research, rebuild, review, or collaboration.

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
│   ├── design-brief.json
│   ├── design-system.json
│   ├── visual-route.json
│   ├── visual-lock.json
│   ├── visual-page-plan.json
│   ├── template-selection.json
│   ├── visual-strategy-report.json
│   └── asset-plan.json
├── 05-build/
│   ├── deck-builder-input.json
│   ├── svg-pages/
│   ├── generated-assets/
│   └── output.pptx
├── 06-review/
│   ├── quality-report.json
│   ├── pptx-quality-report.json
│   ├── svg-quality-report.json
│   ├── preview-report.json
│   ├── previews/
│   └── fix-requests.json
└── 07-practice/
    ├── practice-report.md
    └── full-script.md
```

## Purpose

- `00-intake/`: user intent, source index, source summaries, citations, extracted tables, and extracted images.
- `01-research/`: topic research, official source notes, and research brief.
- `02-structure/`: structure strategy, slide skeleton, page rhythm, timing, and evidence needs.
- `03-production/`: page-level copy, component plan, visual plan, source requirements, and production spec.
- `04-design/`: design brief, design system, template selection, visual strategy report, and asset plan.
- `05-build/`: builder input, generated assets, and editable PPTX output.
- `06-review/`: package quality report, optional rendered preview report, and fix requests.
- `07-practice/`: speaker cards, rehearsal report, and optional full script.

## Resume Rule

When resuming a deck, read the newest available brief in this order:

```text
07-practice/practice-report.md
06-review/quality-report.json
05-build/deck-builder-input.json
03-production/slide-production-spec.json
02-structure/structure-plan.json
01-research/research-brief.json
00-intake/user-brief.md
```

Resume from the earliest missing or failed stage. Do not ask the user to restate information already present in the project folder.

## File Ownership

| File | Owner |
|---|---|
| `00-intake/user-brief.md` | `ppt-goal-setting` |
| `00-intake/source-index.json` | `ppt-goal-setting` |
| `00-intake/source-summary.md` | `ppt-goal-setting` + `ppt-slide-structure` |
| `00-intake/citations.json` | `ppt-slide-structure` + `ppt-slide-writing` |
| `01-research/research-brief.json` | `ppt-slide-structure` |
| `02-structure/structure-plan.json` | `ppt-slide-structure` |
| `03-production/slide-production-spec.json` | `ppt-slide-writing` |
| `04-design/design-brief.json` | `ppt-deck-builder` |
| `04-design/design-system.json` | `ppt-deck-builder` |
| `04-design/visual-route.json` | `ppt-deck-builder` |
| `04-design/visual-lock.json` | `ppt-deck-builder` |
| `04-design/visual-page-plan.json` | `ppt-deck-builder` |
| `04-design/template-selection.json` | `ppt-deck-builder` |
| `04-design/asset-plan.json` | `ppt-deck-builder` |
| `04-design/visual-strategy-report.json` | `ppt-slide-writing` + `ppt-deck-builder` |
| `05-build/deck-builder-input.json` | `ppt-deck-builder` |
| `05-build/svg-pages/` | `ppt-deck-builder` |
| `05-build/output.pptx` | `ppt-deck-builder` |
| `06-review/quality-report.json` | `ppt-final-check` |
| `06-review/pptx-quality-report.json` | `ppt-deck-builder` + `ppt-final-check` |
| `06-review/svg-quality-report.json` | `ppt-deck-builder` + `ppt-final-check` |
| `06-review/preview-report.json` | `ppt-deck-builder` |
| `06-review/fix-requests.json` | `ppt-final-check` |
| `07-practice/practice-report.md` | `ppt-presentation-practice` |
| `07-practice/full-script.md` | `ppt-presentation-practice` |

## Protocol Contracts

Use these references for the project artifacts:

- `v2-architecture.md`: V2 architecture and artifact flow.
- `source-intake.md`: source package and citation rules.
- `research-brief.md`: research artifact schema.
- `visual-component-registry.md`: component plan and Mermaid rules.
- `template-system-v2.md`: theme/layout/component/template layering.
- `svg-visual-route.md`: default SVG-native route architecture.
- `visual-lock.md`: execution lock for the SVG-native route.
- `svg-technical-standards.md`: SVG compatibility rules.
- `image-generation-system.md`: image model usage and prompt contract.
- `svg-quality-check.md`: SVG QA command and report expectations.
- `design-router.md`: scenario-to-design decision rules.
- `design-brief.md`: deck-level design decision contract.
- `component-pack-registry.md`: reusable component pack definitions.
- `slide-spec.md`: Skill 3 to Skill 4 content contract.
- `skill3-slide-spec-generation.md`: Skill 3 operating guide for generating the contract.
- `skill4-slide-spec-build.md`: Skill 4 operating guide for compiling and building from the contract.
- `layout-registry.md`: stable layout IDs and page-type mapping.
- `theme-tokens.md`: typography, color, spacing, image, and motion tokens.
- `design-lock.md`: project-level design lock that selects and freezes a theme.
- `asset-manifest.md`: material, image, screenshot, chart, and component tracking.
- `skill6-presentation-practice.md`: Skill 6 project-level rehearsal output.
- `speaker-script.md`: speaker-card, outline-script, and full-script modes.

## Minimal Mode

For quick one-off decks, the workflow can still operate with only the current-stage artifacts. Use the full project folder when any of these apply:

- the deck is longer than 10 slides,
- the user provides files or many references,
- generated images or screenshots are needed,
- the deck may need review/rebuild cycles,
- the user may resume in a later session.
