# Image Generation System

This project uses images selectively. The default `svg-native` route is SVG-led, not image-led.

The image system absorbs the useful structure of mature image-generation workflows while preserving this project's core distinction:

- SVG owns structure and visual identity.
- AI image owns realism, atmosphere, product/lifestyle moments, and high-impact visual resets.
- PPT-native owns editable factual content.

## Deck-Level Image Lock

When any generated image is needed, `visual-lock.json` must define:

```json
{
  "images": {
    "deckRendering": "custom",
    "deckRenderingBehavior": "Clean branded event illustration with soft geometric shapes and warm human context.",
    "deckPalette": "custom",
    "deckPaletteBehavior": "Primary brand blue dominates backgrounds, warm cream carries breathing space, yellow accent is used for activity/reward moments.",
    "allowedUses": ["cover", "hero", "scene", "product", "lifestyle", "visual-reset"],
    "assets": []
  }
}
```

Use one deck-level rendering behavior and one deck-level palette behavior for all AI-generated images in the same deck.

## Image Roles

| Role | Use | Avoid |
|---|---|---|
| `cover` | first impression, event mood, topic promise | fake UI, dense text |
| `hero` | one large product/concept/scene moment | multiple competing subjects |
| `scene` | store/classroom/workplace/user situation | generic stock-like images |
| `product` | product presence, product context | fake logos or unsupported product facts |
| `lifestyle` | human context and audience empathy | decorative people unrelated to message |
| `visual-reset` | rhythm break after dense pages | random abstract art |
| `local-support` | small illustration inside a structured page | long text or data inside image |

## Prompt Contract

Every generated image must be traceable to the slide message.

Required fields:

```json
{
  "assetId": "cover-scene",
  "slideNumber": 1,
  "role": "cover",
  "purpose": "",
  "subject": "",
  "scene": "",
  "composition": "",
  "aspectRatio": "16:9",
  "safeArea": "",
  "style": "",
  "colorPalette": "",
  "mustInclude": [],
  "mustAvoid": [],
  "textPolicy": "no embedded text",
  "relationshipToSlideText": "",
  "fallbackIfWeak": ""
}
```

Skill 4 may refine prompt wording for slot fit, but may not change the purpose.

## Composition Primitives

Use these primitives before inventing a new prompt structure:

| Primitive | Use |
|---|---|
| `single-subject-hero` | product/object/concept hero |
| `human-scene` | parent-child, classroom, team, customer, speaker |
| `atmospheric-backdrop` | cover or section image behind PPT-native text |
| `local-illustration` | small supporting illustration inside a card/section |
| `before-after-pair` | contrast visual when words alone are weak |
| `process-visual` | image-like process metaphor when SVG diagram is too dry |

## Text Policy

Default: no embedded text.

Embedded text is allowed only when:

- the text is decorative
- the wording is stable
- the text is short
- the PPT-native layer repeats or clarifies the important meaning

Never put:

- titles
- body copy
- source notes
- coupon rules
- QR codes
- numbers that must be precise
- UI labels that must be accurate

inside generated images.

## Asset Handling

Generated images must be copied to:

```text
projects/<deck-slug>/assets/
```

The deck-builder input should reference project-local assets only. Do not reference platform cache paths.

## Review Rules

Reject an image when:

- it does not match the slide message
- it introduces fake facts, fake UI, fake logos, or fake product details
- it contains unreadable or wrong text
- it fights the SVG visual system
- it is visibly only filling empty space
- the crop cuts off the intended subject

If an image fails, Skill 4 either regenerates it with a better prompt or removes it and strengthens the SVG/PPT-native composition.
