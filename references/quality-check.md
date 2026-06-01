# PPTX Quality Check

The lightweight quality checker validates basic delivery risks before final review.

## Tool

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts check <deck.json> --pptx <deck.pptx>
```

Optional:

```bash
npx tsx src/cli.ts check <deck.json> \
  --pptx <deck.pptx> \
  --asset-manifest ../../projects/demo/04-design/asset-plan.json \
  --design-lock ../../projects/demo/04-design/design-system.json \
  --out ../../projects/demo/06-review/pptx-quality-report.json
```

## What It Checks

- PPTX file exists and can be opened as a zip package.
- Slide count matches the builder input.
- Each slide has manual click/keyboard advance transition metadata.
- Required visual asset files referenced in builder input exist.
- PPT media exists when asset-backed visuals are used.
- Visible placeholder text is not present in slide XML.
- Public-facing slide text does not leak obvious internal labels.
- Slide titles and native component content stay within known layout capacity limits.
- Optional `asset-manifest.json` has no missing/pending placeholder assets.
- Optional `design-lock.json` exists and can be parsed.

## Slide Spec Validation

Before building, validate the Skill 3 to Skill 4 contract:

```bash
npx tsx src/cli.ts validate-slide-spec ../../projects/demo/03-production/slide-production-spec.json
```

This catches missing page intent, missing layout recommendations, incomplete native components, and generated-image slides without prompt objects.

To compile the contract into builder input:

```bash
npx tsx src/cli.ts compile-slide-spec ../../projects/demo/03-production/slide-production-spec.json \
  --out ../../projects/demo/05-build/deck-builder-input.json
```

To inspect the deck-level visual strategy before building:

```bash
npx tsx src/cli.ts visual-strategy-report ../../projects/demo/03-production/slide-production-spec.json \
  --out ../../projects/demo/04-design/visual-strategy-report.json
```

This summarizes which slides use AI-generated images, Mermaid diagrams, real assets, screenshots, PPT-native components, charts/tables, or no visual. Use it to catch overuse of one visual mode before building.

To build directly from the contract:

```bash
npx tsx src/cli.ts build-slide-spec ../../projects/demo/03-production/slide-production-spec.json \
  --out ../../projects/demo/05-build/output.pptx
```

For the final project gate:

```bash
npx tsx src/cli.ts review-project ../../projects/demo --out
```

## Optional Render Preview

Rendered preview is optional. Use it when the user asks to see page screenshots/PDF output, or when visual acceptance depends on rendered verification.

```bash
npx tsx src/cli.ts render-preview ../../projects/demo/05-build/output.pptx \
  --out-dir ../../projects/demo/06-review/previews \
  --report ../../projects/demo/06-review/preview-report.json
```

Behavior:

- If `soffice` or `libreoffice` exists, the command exports a PDF.
- If `pdftoppm` also exists, the command exports per-slide PNG previews.
- If preview tools are missing, the command writes a `skipped` report and does not block build QA.
- Preview output is an auxiliary visual check, not the source of truth for PPTX editability.

## Relationship To `ppt-final-check`

The checker does not replace human/AI final review. It is a source-level and package-level guardrail that `ppt-final-check` can use before making a delivery decision.

If the checker reports `fail`, return to the owner skill before formal delivery.
