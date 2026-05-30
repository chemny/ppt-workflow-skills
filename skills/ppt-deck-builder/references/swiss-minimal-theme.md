# Swiss Minimal Theme

This file is the hard specification for the `swiss-minimal` PPT theme. Its purpose is to keep generated decks from looking like generic sparse document pages. The theme should feel strict, polished, typographic, and presentation-ready.

## Core Principle

`swiss-minimal` keeps the grid strict and the decoration restrained, but each slide still needs enough visual weight through typography, image/crop placement, native icons, number badges, compact diagrams, or meaningful official/user visuals.

Do not rely on `pageType` alone. `pageType` describes the content job; `registeredLayout` chooses the visual skeleton.

Before building any `swiss-minimal` slide, choose one registered layout ID from `SM01-SM10` and write it into the builder input as `registeredLayout`.

```json
{
  "layout": "teaching-toolkit",
  "registeredLayout": "SM10",
  "pageType": "concept-explain",
  "title": "第一眼就能看懂的产品力",
  "visual": {
    "type": "screenshot",
    "asset": "productHero",
    "caption": "official or user-provided product visual"
  }
}
```

If `registeredLayout` is missing, the generator may fall back to older generic rendering and the style will look unchanged.

## Global Rules

- Do not invent ad hoc Swiss body layouts during generation.
- If a slide does not fit one registered layout, first compress copy, change the content hierarchy, or choose the closest registered layout.
- Add a new registered layout only after it is reusable and explicitly belongs to the style system.
- Do not add decorative corner motifs or ornamental elements that do not clarify the slide.
- Use whitespace deliberately, but do not leave large empty panels with small text.
- Prefer larger text and fewer words over small explanatory paragraphs.
- If a slide feels empty, add a meaningful official/user image, native diagram, number rail, checklist rows, icon badges, or comparison matrix.
- Avoid stock-like decorative images. Images must explain, prove, show the product, or improve navigation.
- Keep all native components editable.
- Top-level Chinese titles default to left-aligned near the upper-left content axis.
- Do not center the main title on body pages unless the registered layout is a statement/cover layout.
- Determine the layout and image slot before generating or inserting images.
- Picture slots and generated image aspect ratios must match.
- Native diagrams should use editable shapes/text. Do not rasterize diagrams unless the user explicitly asks.

## Layout Starts

Use these defaults for 16:9 decks.

| Component | Default guidance |
|---|---|
| Header eyebrow | x 0.72, y 0.42, 9-10 pt |
| Slide title | x 0.70, y 0.74, 32-36 pt |
| Subtitle / lead | x 0.72, y 1.65, 14-17 pt |
| Checklist rows | first row y >= 2.55 |
| Card grid | card top y >= 2.20 |
| Flow cards | card top y >= 2.35 |
| Concept/map block | block top y around 2.25 unless the title/subtitle is unusually tall |
| Big Number lead | avoid extra body lead by default; keep the subtitle as the only explanatory lead unless the user explicitly needs a source statement |
| Big Number metrics | start y around 2.80 when no body lead is used; keep large numbers visually dominant |
| Native badge / label | square badge text 9.5-10 pt; keep labels readable even when the badge is small |
| Prompt / CTA strip | y around 6.35-6.55 |
| Source note | bottom-left, 7-9 pt |

## Registered Layouts

| ID | Layout | Use for | Required structure |
|---|---|---|---|
| `SM01` | Blue Pattern Cover | cover and formal entry | full-slide fashion color background, subtle dot/plus pattern, large white left-aligned title, small metadata; no vertical accent line; if the title contains a colon, split it into two lines and remove the colon; do not show page counters on the cover |
| `SM02` | Big Statement | transition or key judgment | oversized sentence, one support line, minimal small metadata; no cards |
| `SM03` | Feature Map | positioning/capability map | left strong statement block, right 3 evidence rows with native icon badges |
| `SM04` | Checklist Rows | decision criteria, risk, action list | row-based checklist; first row starts at y >= 2.55; alternating subtle row fills |
| `SM05` | Four Cards | four criteria, four dimensions, four options | 4 equal cards with number badge, title, one short body line |
| `SM06` | Three Cards | three takeaways, three audiences, three benefits | 3 equal cards with number/icon badge, title, one short body line |
| `SM07` | Horizontal Flow | process, method, sequence | horizontal cards or vertical steps; each step has number, title, one-line body |
| `SM08` | Comparison | before/after, tradeoff, option A/B | two panels or compact matrix; no large empty boxes |
| `SM09` | Big Number | data proof, KPI, key metric | large metrics with short labels; avoid adding a separate body paragraph above the numbers |
| `SM10` | Image Hero | product, screenshot, visual proof | large image crop plus compact text/KPI; avoid framed small image if a larger crop works; omit image captions unless they carry essential evidence |

## Layout Mapping Defaults

| Page type | Default registered layout |
|---|---|
| `cover` | `SM01` |
| `section-divider` | `SM02` |
| `concept-explain` | `SM03` or `SM10` when a strong image exists |
| `capability-map` | `SM03` |
| `learning-objectives` | `SM05` or `SM06` |
| `step-flow` / `prompt-template` | `SM07` |
| `screenshot-callout` / `live-demo` | `SM10` |
| `before-after` / `comparison` | `SM08` |
| `checklist` / `risk-warning` / `practice-task` | `SM04` |
| `summary` / `qa-closing` | `SM02` or `SM06` |

## Cover Variants

Use one cover variant per deck by default. The body pages remain `swiss-minimal`; the variant primarily controls the cover background and pattern color so the deck keeps a clean Swiss identity.

| Variant | Use when | Color behavior |
|---|---|---|
| `cobalt-blue` | default, technology, AI, business, product explainers | strong saturated blue, white title, pale blue pattern |
| `electric-violet` | creator talks, innovation, design, AI demos | vivid violet, white title, soft lavender pattern |
| `emerald-black` | premium, sustainability, finance, calm strategy | deep emerald, near-white title, mint pattern |
| `coral-red` | launch, marketing, energetic product story | vivid coral red, white title, warm pattern |
| `graphite-lime` | technical, engineering, cybersecurity, bold modern decks | graphite background, lime pattern, high contrast title |

## Image Slot Rules

- `SM10 Image Hero`: main image should use a wide slot, preferably `21:9` or `16:9` depending on the available official/user asset.
- `SM10 Image Hero`: use a large crop; do not place the image inside a small framed card when the slide's main job is visual proof.
- `SM10 Image Hero`: keep enough gap between subtitle and image. Place the image top around y 2.05-2.15 when a subtitle exists.
- `SM10 Image Hero`: do not add tiny captions directly under the image by default; use the normal source note area instead.
- Never stretch an image to fit a slot.
- Product/photos must use proportional cover/crop behavior.
- Screenshots or information-dense graphics may use proportional contain behavior.
- In the TypeScript + PptxGenJS builder, do not pass the slot ratio as the image's top-level `w/h`; read the image's natural pixel ratio first, pass that ratio as top-level `w/h`, and pass the slot as `sizing: { type: "cover", w, h }` for photos or `sizing: { type: "contain", w, h }` for screenshots/diagrams.
- A valid generated PPTX should contain non-zero `<a:srcRect .../>` crop values when the image and slot ratios differ.
- `SM05 Four Cards` and `SM06 Three Cards`: small icons or micro-illustrations are allowed inside cards, but do not turn every card into an unrelated image tile.
- `SM03 Feature Map`: if an image exists, use it only as a meaningful left/right proof area; otherwise use the left strong statement block plus native geometric marks.
- Multi-image grids should use one consistent ratio across the group. Do not mix tall, square, and wide images in one grid.
- Screenshots with dense text should use contain behavior conceptually; product/photo images should use crop behavior conceptually with the subject in the safe center.
- Generated images must be prompted for the selected slot ratio. Do not generate an image first and then invent a slot around it.

## Page Number Rules

- Cover pages do not show page counters.
- Body pages may show a small bottom-right page number.
- Do not use a top-right `01 / 01` style counter on `SM01`.

## Playback Rules

- Generated PPTX files must support manual click and keyboard advance.
- Every slide should include `advClick="1"` when post-processing PPTX XML.
- Presentation settings should include `showAnimation="1"` and `useTimings="0"` unless the user explicitly requests autoplay.
- Do not generate kiosk-only, auto-play-only, or no-manual-advance decks unless explicitly requested.
- For visible validation, use a restrained but detectable slide transition such as `push left`; if the user asks for a quieter formal deck, switch to no transition or a subtle fade after manual advance is confirmed.

## Forbidden List

- Do not use decorative corner motifs by default.
- Do not center body-page Chinese titles.
- Do not create unregistered body layouts such as random evidence walls, arbitrary three-circle diagrams, or ad hoc image splits.
- Do not use large empty boxes with small text.
- Do not shrink essential body text below 13 pt to fit content.
- Do not use unreadable badge text; native badge/label text should be 9.5-10 pt.
- Do not use image containers with a weak gray frame unless the frame is part of the registered layout.
- Do not rasterize editable text-heavy diagrams.
- Do not use images as decoration when they do not explain, prove, show the product, or improve navigation.
