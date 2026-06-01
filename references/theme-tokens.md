# Theme Tokens

Theme tokens are the stable visual contract for `ppt-deck-builder`.

They prevent a deck from changing style page by page and let the builder generate editable PPTX output deterministically.

## Recommended Location

Theme tokens may live inside:

```text
projects/<deck-slug>/04-design/design-system.json
```

or in a reusable theme preset inside the builder.

## Minimum Token Shape

```json
{
  "themeId": "blueprint-swiss",
  "font": {
    "body": "PingFang SC",
    "latin": "Inter",
    "mono": "JetBrains Mono"
  },
  "color": {
    "background": "FAFAF8",
    "surface": "FFFFFF",
    "text": "0A0A0A",
    "muted": "737373",
    "line": "D4D4D2",
    "accent": "002FA7",
    "accentOn": "FFFFFF",
    "success": "009B72",
    "warning": "FFD500",
    "danger": "E52535"
  },
  "typography": {
    "coverTitle": { "size": 54, "weight": 300, "lineHeight": 1.05 },
    "sectionTitle": { "size": 42, "weight": 300, "lineHeight": 1.08 },
    "slideTitle": { "size": 34, "weight": 600, "lineHeight": 1.15 },
    "subtitle": { "size": 15, "weight": 400, "lineHeight": 1.25 },
    "body": { "size": 14, "weight": 400, "lineHeight": 1.35 },
    "cardTitle": { "size": 20, "weight": 600, "lineHeight": 1.15 },
    "cardBody": { "size": 13.5, "weight": 400, "lineHeight": 1.3 },
    "caption": { "size": 8, "weight": 500, "lineHeight": 1.2 },
    "number": { "size": 42, "weight": 600, "lineHeight": 1.0 },
    "badge": { "size": 10, "weight": 700, "lineHeight": 1.0 }
  },
  "spacing": {
    "pageX": 0.72,
    "pageTop": 0.42,
    "titleToSubtitle": 0.55,
    "subtitleToContent": 0.62,
    "blockGap": 0.32,
    "cardGap": 0.22,
    "sectionGap": 0.62
  },
  "shape": {
    "radius": 0,
    "lineWidth": 0.8,
    "hairlineWidth": 0.35
  },
  "image": {
    "defaultFit": "cover",
    "neverStretch": true,
    "captionRequired": true
  },
  "motion": {
    "manualAdvance": true,
    "defaultTransition": "fade"
  }
}
```

## Rules

- Use at most two font families in one deck.
- Do not solve crowded pages by shrinking body text below the readable range.
- Keep title position stable across body pages unless the registered layout intentionally changes it.
- Image fit must come from the slot. Generate or crop assets to the slot ratio; never stretch photos.
- Cover, section, body, data, image, summary, and closing pages must have distinct but related treatments.
- If a user asks for a new style, update or create a new token set before rebuilding.

## Relationship To Other Artifacts

- `slide-spec.json` says what each page needs.
- `layout-registry.md` says which layout pattern should render the page.
- `design-lock.json` selects the theme and locks tokens.
- `ppt-deck-builder` applies these tokens through PPTGenJS.
