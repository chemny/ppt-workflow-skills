# Design Lock

`design-lock.json` is a lightweight design contract for Skill 4. It prevents theme drift when building or rebuilding a deck.

## Recommended Location

```text
projects/<deck-slug>/04-design/design-system.json
```

## Example

```json
{
  "themeId": "blueprint-swiss",
  "font": {
    "body": "PingFang SC",
    "latin": "Inter",
    "mono": "JetBrains Mono"
  },
  "colors": {
    "background": "FAFAF8",
    "ink": "0A0A0A",
    "accent": "002FA7",
    "muted": "737373",
    "line": "D4D4D2"
  },
  "layoutRules": {
    "titleAxis": "top-left",
    "contentTop": 2.26,
    "noRoundedCards": true,
    "noGradients": true,
    "imageFit": "cover-or-contain-by-slot"
  },
  "themeTokens": {
    "typography": {
      "slideTitle": { "size": 34, "weight": 600, "lineHeight": 1.15 },
      "body": { "size": 14, "weight": 400, "lineHeight": 1.35 }
    },
    "image": {
      "defaultFit": "cover",
      "neverStretch": true
    }
  },
  "layoutRegistry": {
    "cover-typographic": "blueprint-cover-01",
    "comparison": "blueprint-compare-01",
    "checklist": "blueprint-checklist-01",
    "summary": "blueprint-summary-01"
  },
  "forbiddenPatterns": [
    "decorative image unrelated to slide message",
    "tiny body text to solve overcrowding",
    "manual theme changes page by page"
  ]
}
```

## Rules

- Skill 4 should read `design-lock.json` before generating or rebuilding the deck.
- If the requested deck style changes, update `design-lock.json` first, then rebuild.
- Do not silently change fonts, colors, or layout grammar mid-deck.
- If a slide cannot fit the locked design, route back to `ppt-slide-writing` to reduce or restructure content.

## Relationship To Slide Content

Skill 3 owns content-driven layout intent. Skill 4 owns final visual implementation.

`design-lock.json` does not replace the slide content spec. It constrains how the spec is rendered.

For the full token model, see `theme-tokens.md`. For reusable layout IDs, see `layout-registry.md`.
