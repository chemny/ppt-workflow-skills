# SVG Technical Standards

These are the SVG rules for the `svg-native` route. They are intentionally strict because SVG must survive native PPTX assembly and future editing.

## Canvas

Default PPTX canvas:

```xml
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
```

Rules:

- `width`, `height`, and `viewBox` must match the selected canvas.
- Every SVG must include a background rectangle.
- Coordinate systems must be page-local; do not depend on CSS or external layout.

## Forbidden Features

Do not use:

- `<foreignObject>`
- `<script>` or event handlers
- `<style>` or `class`
- external CSS
- `@font-face`
- `<mask>`
- `<symbol>`
- animated SVG elements
- `textPath`
- iframe or embedded HTML
- remote network resources
- `rgba(...)` color strings

Use inline SVG attributes only.

## Text Rules

Critical text belongs in PPT-native layers, not SVG.

SVG text is allowed for:

- decorative micro-type
- visual labels that are also represented in PPT-native text
- non-critical tiny coordinate labels or visual ornaments

SVG text is not allowed for:

- titles
- long body copy
- KPI values
- source notes
- editable labels
- chart values requiring updates

XML escaping:

- Use `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;` for XML-reserved characters.
- Do not use HTML named entities such as `&nbsp;`, `&mdash;`, or `&bull;`.

## Color Rules

- Use HEX colors only.
- Use `fill-opacity` / `stroke-opacity` for transparency.
- Do not use `rgba(...)`.
- Prefer colors listed in `visual-lock.json`.
- If a new color is needed, update `visual-lock.json` first.

## Font Rules

- Use PPT-safe fonts or project-approved fonts.
- Do not use `@font-face`.
- Do not rely on browser-only fonts.
- Keep SVG font declarations aligned with `visual-lock.json`.

## Image Rules

SVG images may reference local files only:

```xml
<image href="../assets/hero.png" x="0" y="0" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/>
```

Rules:

- No remote image URLs.
- Use `preserveAspectRatio`.
- Use `slice` for crop slots and `meet` for screenshots/data images.
- Do not use image opacity directly; overlay a rectangle when needed.
- Do not stretch images.

## Icon Rules

- One icon family per deck.
- Same stroke width or fill weight across the deck.
- SVG icons are allowed in the SVG visual layer.
- Icon labels remain PPT-native when they carry meaning.

## Diagram Rules

- Use simple paths, lines, rectangles, circles, polygons, and text-light labels.
- Connector arrows may use simple marker definitions only when the converter supports them; otherwise draw arrowheads as polygons.
- Complex process or system diagrams should remain visually simple enough for PPTX conversion.

## Quality Requirements

Each SVG page must pass:

- XML-like structural sanity check.
- matching canvas/viewBox.
- forbidden feature scan.
- local image reference scan.
- title/body critical content not trapped in SVG.
- no unknown colors when strict lock checking is enabled.

If a page fails, Skill 4 fixes the SVG or visual page plan before building PPTX.
