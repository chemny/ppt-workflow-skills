# Visual Lock

`visual-lock.json` is the execution lock for the `svg-native` route.

It absorbs the strongest idea from mature SVG slide workflows: every page must be generated from a stable visual contract, not from memory or one-off taste.

Unlike a full single-workflow lock, this project keeps the lock portable and JSON-based so Codex, Claude Code, OpenClaw, and other coding agents can read it consistently.

## Location

```text
projects/<deck-slug>/04-design/visual-lock.json
```

## Purpose

`visual-lock.json` prevents drift:

- colors do not mutate page by page
- typography stays consistent
- icon style stays consistent
- image generation follows one deck-level visual behavior
- page rhythm is explicit
- SVG output obeys PPTX compatibility constraints

Skill 4 must read `visual-lock.json` before generating or rebuilding each SVG page.

## Schema

```json
{
  "version": "0.1",
  "canvas": {
    "format": "pptx-16:9",
    "viewBox": "0 0 1280 720",
    "width": 1280,
    "height": 720
  },
  "route": "svg-native",
  "colors": {
    "background": "FAFAF8",
    "surface": "FFFFFF",
    "text": "0A0A0A",
    "muted": "737373",
    "line": "D4D4D2",
    "accent": "002FA7",
    "accent2": "00A676",
    "accent3": "FFD100"
  },
  "typography": {
    "fontFamily": "Microsoft YaHei",
    "latinFamily": "Arial",
    "monoFamily": "Consolas",
    "body": 20,
    "slideTitle": 38,
    "subtitle": 22,
    "caption": 12,
    "hero": 72
  },
  "icons": {
    "policy": "single-family",
    "library": "local-svg-line",
    "strokeWidth": 2,
    "inventory": []
  },
  "images": {
    "deckRendering": "custom",
    "deckPalette": "custom",
    "allowedUses": ["cover", "hero", "scene", "product", "lifestyle", "visual-reset"],
    "assets": []
  },
  "pageRhythm": {
    "P01": "anchor",
    "P02": "dense",
    "P03": "breathing"
  },
  "pageSvgRoles": {
    "P01": "full-background-and-title-frame",
    "P02": "diagram-and-card-frames"
  },
  "forbiddenSvgFeatures": [
    "foreignObject",
    "script",
    "style",
    "class",
    "mask",
    "textPath",
    "animation",
    "external-css",
    "font-face"
  ],
  "editableBoundary": {
    "pptNative": ["title", "subtitle", "body", "numbers", "sources", "data labels"],
    "svgAllowed": ["decorative micro-type", "icons", "visual labels duplicated in PPT-native text"]
  }
}
```

## Execution Rules

- Re-read this file before every SVG page generation or repair.
- Use only locked colors unless the lock is explicitly updated.
- Use only locked font families and size roles.
- Use one icon style per deck.
- Use only images listed in `images.assets` or asset-plan entries.
- Respect `pageRhythm` for every page.
- Body-page titles must remain PPT-native and one line.
- If a needed color, font, icon, or image is absent from the lock, update the lock deliberately before generating; do not invent values inside the SVG.

## Relationship To Other Files

| File | Role |
|---|---|
| `design-brief.json` | high-level design intent |
| `design-system.json` | theme/design tokens used by the builder |
| `visual-route.json` | route choice |
| `visual-page-plan.json` | page-by-page layer plan |
| `visual-lock.json` | execution truth for SVG generation |
| `asset-plan.json` | concrete asset status and sources |

`visual-lock.json` is the source of truth at SVG execution time. If it conflicts with `design-brief.json`, Skill 4 should update the lock intentionally or stop and report the conflict.
