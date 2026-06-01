# Design Brief Contract

`design-brief.json` is the deck-level design decision artifact between Skill 3 and Skill 4.

It is not a theme file and not a slide spec. It tells Skill 4 which reusable visual system to assemble for this deck.

## Recommended Location

```text
projects/<deck-slug>/04-design/design-brief.json
```

## Schema

```json
{
  "version": "0.1",
  "visualRoute": "svg-native",
  "designMode": "brand-event",
  "scenario": "Children's Day store activation",
  "audience": ["parents", "children"],
  "goals": ["brand-awareness", "store-participation"],
  "mood": ["playful", "warm", "light"],
  "designIntent": "Make the deck feel like a branded parent-child event board, not a corporate briefing.",
  "colorSystem": {
    "primary": "003BFF",
    "background": "F8FBFF",
    "surface": "FFFFFF",
    "text": "101828",
    "muted": "667085",
    "accent": ["FFD34D", "7A4A25", "7DD3FC"],
    "risk": ["Do not reduce contrast for playful colors."]
  },
  "typography": {
    "scale": "friendly-large",
    "titleWeight": "bold",
    "bodyDensity": "light-medium",
    "rules": ["Body pages keep title on one line except cover."]
  },
  "layoutPack": {
    "id": "event-storytelling",
    "cover": "poster-cover",
    "body": ["card-board", "route-map", "coupon-strip", "task-board"],
    "closing": "warm-action"
  },
  "componentPack": {
    "id": "activity-components",
    "required": ["icon-card", "task-card", "coupon-card", "badge-sticker", "route-map", "checklist"],
    "optional": ["image-hero", "story-card", "kpi-card"]
  },
  "iconPolicy": {
    "required": true,
    "style": "rounded-line",
    "density": "medium",
    "allowedCategories": ["activity", "reward", "coffee", "family"],
    "fallback": "Use simple editable line icons or colored pictogram chips."
  },
  "decorationPolicy": {
    "level": "medium",
    "motifs": ["dots", "stickers", "badges", "coffee-beans"],
    "rules": ["Decorations must not compete with slide title or key numbers."]
  },
  "imagePolicy": {
    "mode": "selective",
    "aiGenerated": "optional",
    "realAssets": "preferred-for-products",
    "nativeIllustration": "preferred-for-activities",
    "rules": ["Do not generate fake logos or fake product photos."]
  },
  "svgPolicy": {
    "mode": "primary-visual-layer",
    "uses": ["background", "motifs", "icons", "diagrams", "frames", "page-rhythm"],
    "editableBoundary": ["title", "body", "numbers", "sources", "data labels remain PPT-native"]
  },
  "pageRhythm": {
    "cover": "anchor",
    "bodyMix": ["anchor", "dense", "breathing"],
    "maxSameLayoutInARow": 2
  },
  "rendererGuidance": {
    "preferredTheme": "blueprint-swiss",
    "fallbackTheme": "teaching-toolkit",
    "mustAvoid": ["one-template-fits-all", "letter chips replacing icons", "decorative images unrelated to message"]
  }
}
```

## Required Fields

- `designMode`
- `visualRoute`
- `audience`
- `goals`
- `mood`
- `designIntent`
- `colorSystem`
- `layoutPack.id`
- `componentPack.id`
- `iconPolicy`
- `decorationPolicy`
- `imagePolicy`
- `svgPolicy`
- `rendererGuidance`

## Relationship To Other Artifacts

- `slide-production-spec.json` owns slide meaning, copy, and page-level component needs.
- `visual-strategy-report.json` checks whether each slide's visual path is coherent.
- `design-brief.json` owns deck-level visual direction and reusable design parameters.
- `visual-route.json` records whether Skill 4 uses the default `svg-native` route or the optional `template-native` route.
- `visual-page-plan.json` owns page-by-page SVG/image/native-layer execution when the SVG-native route is selected.
- `design-system.json` locks the actual tokens used by the renderer.
- `deck-builder-input.json` is the compiled input that Skill 4 renders.

Skill 4 should read `design-brief.json` before selecting renderers. If the current renderer cannot honor the design brief, it should report the gap instead of silently falling back to a generic business style.
