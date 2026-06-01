# Skill 4 Slide Spec Build

This reference explains how `ppt-deck-builder` should consume `v3-slide-spec.json`.

Skill 4 should not reinterpret the deck. It should compile the Skill 3 contract into a deterministic PPTX render plan, build the editable deck, and run quality checks.

Skill 4 has two visual routes:

- `svg-native`: default route. Design page by page as SVG, quality-check the SVG, then convert/assemble into editable native PPTX objects. AI images are supporting assets, not whole-slide fallbacks.
- `template-native`: optional route. Use registered templates/layouts/components and PPTGenJS native rendering, especially when the user provides a strict corporate PPTX template or explicitly asks to套模板/稳定模式.

Route choice is recorded in `04-design/visual-route.json`. Do not silently use the template-native route when the expected route is `svg-native`.

## Build Sequence

Use this order:

1. Validate `v3-slide-spec.json`.
2. Read or create `design-brief.json` with the Design Router.
3. Read or create `visual-route.json`; default to `svg-native` unless the user explicitly chose `template-native`.
4. Read or create `design-lock.json`.
5. Read or create `visual-lock.json`.
6. Read or create `asset-manifest.json`.
7. For `svg-native`, create `visual-page-plan.json`, `page-design-plan.json`, and `05-build/svg-pages/`.
8. For `template-native`, resolve each slide's generic layout to a concrete registered renderer using the design brief.
9. Compile `v3-slide-spec.json` into `v4-build-input.json`.
10. Write project artifacts: `design-brief.json`, `visual-route.json`, `visual-lock.json`, `page-design-plan.json`, `visual-page-plan.json` when applicable, `asset-manifest.json`, `design-lock.json`, `visual-strategy-report.json`, and `layout-mapping-report.json`.
11. Build editable PPTX: SVG-native branch uses SVG-to-native-PPTX conversion/assembly; template-native branch uses PPTGenJS.
12. Run SVG quality check when SVG pages exist, then run PPTX quality check.
13. Return a v4 package and note any remaining visual/material limitations.

## CLI Flow

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts validate-slide-spec ../../projects/<deck-slug>/03-production/slide-production-spec.json
npx tsx src/cli.ts compile-slide-spec ../../projects/<deck-slug>/03-production/slide-production-spec.json \
  --out ../../projects/<deck-slug>/05-build/deck-builder-input.json
npx tsx src/cli.ts write-project-artifacts ../../projects/<deck-slug>/03-production/slide-production-spec.json \
  --out-dir ../../projects/<deck-slug>
npx tsx src/cli.ts check-svg ../../projects/<deck-slug>/05-build/svg-pages \
  --visual-lock ../../projects/<deck-slug>/04-design/visual-lock.json \
  --visual-page-plan ../../projects/<deck-slug>/04-design/visual-page-plan.json \
  --out ../../projects/<deck-slug>/06-review/svg-quality-report.json
npx tsx src/cli.ts build-slide-spec ../../projects/<deck-slug>/03-production/slide-production-spec.json \
  --out ../../projects/<deck-slug>/05-build/output.pptx
npx tsx src/cli.ts check ../../projects/<deck-slug>/05-build/deck-builder-input.json \
  --pptx ../../projects/<deck-slug>/05-build/output.pptx \
  --asset-manifest ../../projects/<deck-slug>/04-design/asset-plan.json \
  --design-lock ../../projects/<deck-slug>/04-design/design-system.json \
  --out ../../projects/<deck-slug>/06-review/pptx-quality-report.json
npx tsx src/cli.ts render-preview ../../projects/<deck-slug>/05-build/output.pptx \
  --out-dir ../../projects/<deck-slug>/06-review/previews \
  --report ../../projects/<deck-slug>/06-review/preview-report.json
```

The preview command is optional. It should skip cleanly when LibreOffice/OpenOffice is unavailable.

## Visual Route Resolution

| User/project condition | Route |
|---|---|
| No explicit choice and no strict corporate template | `svg-native` |
| User requests stronger design, poster-like pages, richer visual identity, page-by-page visual design, SVG, or image-enhanced design | `svg-native` |
| User supplies a `.pptx` template and asks to preserve it | `template-native` |
| User asks for fastest deterministic build with existing registered layouts | `template-native` |
| Existing PPT needs scoped edits | Usually `template-native`, unless the edit is a visual redesign |

Route output:

```json
{
  "version": "0.1",
  "route": "svg-native",
  "reason": "",
  "buildBranch": {
    "primary": "svg-page-design-to-native-pptx",
    "finalPptxMustBeEditable": true,
    "wholeSlideBitmapAllowed": false
  }
}
```

## SVG-Native Route Build

When `route = "svg-native"`, the compiler should build from `visual-page-plan.json` and `page-design-plan.json` instead of treating the layout registry as the primary design source.

Execution order:

```text
page-by-page visual plan
-> SVG page design
-> SVG quality check
-> SVG-to-native-PPTX conversion/assembly
-> PPTX QA
```

Rules:

- SVG owns the page-level visual composition: background fields, visual grammar, motifs, icon systems, shape diagrams, cards, frames, and page rhythm.
- Final PPTX must preserve editability where technically possible: text, lines, shapes, cards, icons, diagrams, numbers, and source notes should become native PowerPoint objects rather than a single bitmap.
- AI images own only high-value visual moments: cover/hero/scene/product/lifestyle/visual reset.
- The selected design lock constrains every page, but each page may have a custom composition.
- `page-design-plan.json` is mandatory before `deck-builder-input.json`.
- Do not render the whole slide as a flat bitmap. Whole-slide image output is allowed only as an explicit preview artifact, not as the final PPTX.
- Do not add generated images when the visual page plan says image role is `none`.
- If the SVG-native converter/assembler cannot preserve acceptable editability, report a Skill 4 renderer gap. Fall back to `template-native` only when the user explicitly accepts that downgrade.

Minimum project artifacts:

```text
04-design/visual-route.json
04-design/visual-lock.json
04-design/page-design-plan.json
04-design/visual-page-plan.json
05-build/svg-pages/
05-build/svg-native-output.pptx
05-build/deck-builder-input.json
05-build/output.pptx
```

## Template-Native Route Build

When `route = "template-native"`, the compiler maps generic layouts to registered renderers and builds the deck mostly with PPT-native shapes/text through PPTGenJS.

Use this route for strict template following, corporate PPTX inputs, and fast deterministic decks.

## Layout Resolution

This section applies primarily to the `template-native` route. In the `svg-native` route, registered layouts may be used as inspiration or capacity references, but the primary artifact is the page-level visual plan.

The compiler maps generic layouts to concrete registered renderers.

| Generic layout | Default renderer intent |
|---|---|
| `cover-typographic` | premium typographic cover |
| `cover-visual` | large visual cover, fallback to typographic if no visual exists |
| `section-divider` | sparse section/statement page |
| `big-statement` | one dominant statement plus support |
| `two-column` | balanced two-column explanation or comparison |
| `three-card` | hero statement plus three supporting cards |
| `four-card` | four equal cards |
| `kpi-row` | large KPI/spec page; uses stacked ledger for 4+ KPI items |
| `comparison` | two-panel comparison |
| `timeline` | horizontal time axis |
| `step-flow` | ordered process flow |
| `prompt-box` | prompt/practice layout |
| `screenshot-callout` | large visual area; fallback to native layout if no visual exists |
| `image-hero` | large image strip; fallback to native layout if no visual exists |
| `case-walkthrough` | case context plus evaluation points |
| `checklist` | statement plus list rows |
| `matrix` | compact or six-cell grid depending on item count |
| `summary` | closing/takeaway layout |
| `closing` | Q&A or next-action closing |

## Responsibility Rules

- Preserve slide count.
- Preserve visible title and body copy from Skill 3.
- Preserve and inspect `visualStrategy` before build.
- Preserve and inspect `design-brief.json` before final theme/layout/component selection.
- Preserve component content.
- Preserve component type semantics from `componentPlan`; do not flatten every component into the same card list.
- Preserve image purpose and prompt.
- Preserve source requirements and risk flags in the handoff package.
- Do not generate decorative images when `visual.type` is `none`.
- Do not stretch photos; crop or contain by slot.
- If the compiler cannot map a slide to a reasonable renderer, return to Skill 3 or add a reusable layout mapping.
- If the design brief requests a component pack that the renderer cannot express, report the renderer gap instead of pretending the generic template satisfies it.

## Native Component Rendering

The compiler must pass `componentPlan` into the build input. The renderer should dispatch by component type before falling back to generic layouts.

Minimum reusable component renderers:

| Component type | Native rendering requirement |
|---|---|
| `icon-card` | consistent editable card grid with icon/label badges, short titles, and concise body copy |
| `kpi-card` | large numeric values, short captions, source note, no dense paragraph above the KPI row |
| `process-flow` / `timeline` | editable rail/step sequence with stable spacing |
| `diagram-first` / `mermaid-diagram` | diagramPlan becomes the primary component; render Mermaid SVG/PNG if available, otherwise render editable PPT-native nodes and connectors |
| `comparison-matrix` | editable grid/table using the selected theme's line, fill, and type scale |
| `checklist` | large statement plus editable rows with badges/icons |
| `mermaid-diagram` / `architecture-diagram` | use local Mermaid SVG/PNG only when tooling exists; otherwise render a PPT-native fallback from the syntax/fallback |

## Layout Safety Gate

Run layout-capacity checks before treating a build as acceptable. Text overlap, body-title wrapping, and card overflow are build defects, not acceptable normal variation.

Current Blueprint Swiss capacity rules:

| Element | Capacity |
|---|---|
| Cover title | may use deliberate two-line typography; visual review required when > 42 Chinese chars |
| Body slide title | must be one line; <= 18 Chinese chars preferred; 19-22 is near capacity; > 22 is a hard failure |
| Subtitle | <= 72 Chinese chars |
| `icon-card` | <= 4 items; item title <= 18 chars; item body <= 34 chars |
| `kpi-card` | <= 4 items; item title <= 14 chars; item body <= 28 chars |
| `process-flow` / `timeline` | <= 5 items; step title <= 8 chars; step body <= 12 chars |
| `comparison-matrix` | <= 6 items; item title <= 16 chars; item body <= 22 chars |
| `checklist` | <= 5 items; row title <= 22 chars; row body <= 32 chars |
| `mermaid-diagram` / `architecture-diagram` fallback | <= 5 nodes; node title <= 14 chars |

If content exceeds these limits, do not hide the issue by shrinking text or forcing line breaks. Compress copy in Skill 3, move explanation into subtitle/body, split the slide, or switch to a higher-capacity layout.

## Current Limitation

The first V2 renderer supports the minimum native component set above. Mermaid is currently allowed to fall back to editable PPT-native diagrams when Mermaid tooling is unavailable. Mermaid must be visible only when it is the primary component or when the chosen layout reserves a diagram slot; supporting Mermaid components may be ignored by full-page primary renderers and should be treated as a spec issue. Improve this layer by adding reusable component renderers and theme-specific component skins, not by making one-off slides.
