# Template System V2

The V2 template system separates visual identity, page skeletons, components, and complete deck presets.

It is the primary reference for the optional `template-native` route. For new decks without strict template requirements, Skill 4 defaults to the `svg-native` route described in `svg-visual-route.md`.

Do not put every design rule into one large theme. Separate reusable layers so decks can be adapted without rewriting renderers.

## Layers

```text
themes/
layout-packs/
component-packs/
deck-templates/
icon-packs/
```

| Layer | Owns | Does not own |
|---|---|---|
| `theme` | colors, typography, spacing, line style, page chrome | slide sequence or page meaning |
| `layout-pack` | cover, section, content, closing skeletons | brand identity or specific copy |
| `component-pack` | visual components and their styling rules | deck narrative |
| `deck-template` | recommended combination for a scenario | source facts or user-specific content |
| `icon-pack` | icon family and usage rules | component logic |

## Registry Files

```text
references/templates/
├── theme-index.json
├── layout-pack-index.json
├── component-pack-index.json
├── deck-template-index.json
└── icon-pack-index.json
```

The current portable registry is documented in:

- `design-router.md`
- `design-brief.md`
- `component-pack-registry.md`

## Template Selection

Skill 4 should choose a template combination from:

- deck type
- audience
- delivery scenario
- page density
- visual tone
- source material
- user reference style
- need for screenshots, charts, or diagrams

In project mode, this decision should first be captured in:

```text
04-design/design-brief.json
```

The design brief is created by the Design Router. It should choose reusable parameters and packs rather than creating a one-off theme for a single case.

Example:

```json
{
  "version": "0.1",
  "theme": "blueprint-swiss-v2",
  "layoutPack": "swiss-editorial",
  "componentPack": "business-teaching-components",
  "iconPack": "lucide-line",
  "reason": "A product briefing needs clean typography, high contrast, icon cards, KPI blocks, and occasional image hero pages.",
  "constraints": [
    "cover should be typographic",
    "source notes must be visible but quiet",
    "avoid decorative generated images"
  ]
}
```

## Borrowed Lessons

Good template systems provide:

- explicit indexes
- clear separation between brand and layout
- chart/component templates
- style locks
- page rhythm variety
- reusable cover/content/closing rules

V2 should borrow these ideas while keeping native PPTX generation as the default output path. Native PPTX generation can assemble either SVG visual pages or template-based pages.

## Minimum V2 Implementation

First implementation should support:

- one theme: `blueprint-swiss-v2`
- one layout pack: `swiss-editorial`
- one component pack with:
  - icon-card
  - kpi-card
  - process-flow
  - comparison-matrix
  - mermaid-diagram
- one icon pack: line icons

Add more templates only after the first full workflow produces clearly better results.
