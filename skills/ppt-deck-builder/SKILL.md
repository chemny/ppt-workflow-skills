---
name: ppt-deck-builder
description: Use this skill after PPT slide writing is approved to build an editable PowerPoint/PPTX from PPT Project Brief v3. It selects a theme family and page layouts from the content spec, generates or prepares needed images through available image skills/tools, builds an editable PPTX with TypeScript + PptxGenJS, applies playback/animation settings, runs build QA, and outputs PPT Project Brief v4: Built Deck.
---

# PPT Deck Builder

Use this skill to turn `PPT Project Brief v3: Slide Content Specification` into an editable `.pptx` delivery package.

This skill owns theme selection, layout selection, image generation/placement, typography, visual hierarchy, playback behavior, PPTX generation, and build QA.

## Responsibility Boundary

- If audience/scenario/goal is unclear, return to `ppt-goal-setting`.
- If page sequence or core messages are wrong, return to `ppt-slide-structure`.
- If page copy, page structure, layout intent, asset status, or visual recommendations are missing, return to `ppt-slide-writing`.
- If v3 is complete and the task is visual/build execution, continue here.

Do not hide weak content with design. Do not use one old template for every deck type.

This skill owns the final design system: style template selection, typography, colors, spacing, page-type templates, component rendering, visual rhythm, and export QA.

## Primary Toolchain

Default engine:

- TypeScript + PptxGenJS
- A reusable `ppt-builder-cli` style pipeline when available
- Structured builder JSON derived from v3
- Editable PPTX output

Optional:

- `pptx-automizer` for strict template-following from a provided PPTX.
- Platform preview/export tools such as Quick Look, LibreOffice, PowerPoint, Google Slides, or Codex presentation preview tools only when the user explicitly asks for preview images, screenshots, PDF export, or visual render verification.

Image generation:

- If v3 marks an asset as `can_generate`, call an installed image-generation skill/tool such as `nano-banana-image`, `baoyu-image-gen`, or the platform-native image tool.
- Use the full image prompt specification from v3. Do not invent unrelated prompts when v3 already provides the image purpose, subject, scene, composition, style, aspect ratio, size, and avoid-list.
- Do not hand-write ad hoc provider API code inside this skill.
- If image generation tools are unavailable, create a clearly marked placeholder and record the limitation.

## Required Input

Prefer:

- `PPT Project Brief v3: Slide Content Specification`
- user-provided assets/screenshots/templates if any
- source files or data if charts/tables are required

v3 must include for each slide:

- page type
- final title
- visible body copy
- body sections
- layout intent
- page layout blueprint
- native component specification for every editable diagram/card/checklist/table/flow
- visual/asset recommendation
- visual necessity, visual role, visual message, and visual-to-text match
- image prompt specification for every generated image
- required assets with material status
- design note for Skill 4
- data/source requirement
- risk/placeholder

If these fields are missing across many slides, do not build blindly. Return a fix request to `ppt-slide-writing`.

If a slide requests a generated image but does not include a complete image prompt specification, return to `ppt-slide-writing`. Skill 4 must not fill that gap by free-associating an image.

## Build Modes

| Mode | When to use | Rule |
|---|---|---|
| `create` | No template supplied | Select theme family and layouts from v3 |
| `template-following` | Company template supplied | Preserve template visual grammar |
| `reference-inspired` | Reference deck supplied | Borrow rhythm/taste, not exact copying |
| `targeted-edit` | Existing PPT needs specific changes | Preserve existing style and edit only scope |

## Theme Router

Choose a theme family from deck type, audience, scenario, and v3 design direction.

| Theme family | Best for | Visual behavior |
|---|---|---|
| `teaching-toolkit` | tool training, AI tutorials, courseware, beginner workshops | clean, modern, screenshot-friendly, low cognitive load, strong steps/practice blocks |
| `ai-product-swiss` | AI product/capability sharing, technical tutorials, demo-day style talks | Swiss-inspired, high contrast, full-screen hero cover, grid discipline, strong typographic hierarchy, restrained accent color |
| `business-report` | work reports, business reviews, executive updates | restrained, evidence-led, chart-safe, conclusion-first |
| `product-launch` | launches, product intros, demo keynotes | product-centered, high rhythm, large visuals, reveal moments |
| `knowledge-sharing` | topic sharing, methods, public talks | structured, example-rich, concept/case rhythm |
| `education-literary` | literature, humanities, close reading | warm, readable, text-centered, quote-friendly |
| `proposal-sales` | proposals, sales decks, customer plans | pain-solution-proof-action, trustworthy polish |

If v3 recommends a theme family, use it unless it conflicts with a provided corporate template.

## Style Template Registry

Theme family is not enough. A style template must define a complete visual system, not just colors.

Use this registry as the default candidate set. Start with the most appropriate template, then adapt only within its rules.

| Style template | Best for | Visual behavior |
|---|---|---|
| `swiss-minimal` | business, consulting, AI/product teaching, technology talks | strict grid, clear typography, high whitespace, one accent color; use native icons/illustrations or meaningful images to avoid empty pages |
| `ai-product-swiss` | AI product tutorials, technical demos, product capability sharing | Swiss grid plus product-teaching components: prompt boxes, demo strips, case walkthroughs |
| `business-minimal` | work reports, strategy, executive updates, business reviews | restrained, evidence-led, chart-safe, conclusion-first |
| `bento-grid` | SaaS/product feature overviews, AI tools, capability maps | modular cards, dense but organized, strong information grouping |
| `editorial-magazine` | knowledge sharing, storytelling, industry insight, brand/person topics | magazine rhythm, large titles, image/text contrast, narrative pages |
| `mondrian-de-stijl` | design topics, creative lectures, art/brand concept decks | black grid lines, primary color blocks, rectilinear composition |
| `bauhaus-functional` | design systems, methods, education, engineering concepts | geometric forms, functional hierarchy, playful but orderly |
| `glassmorphism-tech` | future tech, AI demos, SaaS showcases | dark background, glass panels, subtle glow; use sparingly |
| `neo-brutalism` | young brands, creator talks, bold marketing concepts | strong borders, high contrast, hard shadows, expressive labels |
| `nordic-minimal` | education, lifestyle, public-good, warm knowledge sharing | soft neutrals, calm spacing, understated visual language |
| `art-deco-luxe` | premium brands, ceremonies, luxury launches | symmetry, black/gold/ivory, fine line ornament, high formality |
| `architectural-blueprint` | technical plans, architecture, roadmaps, system design | blueprint grid, line drawings, annotations, precise structure |

Selection rules:

- Use `swiss-minimal` or `ai-product-swiss` for practical AI/tool teaching unless the user asks for a different style.
- Use `business-minimal` for executive reports and data-heavy reviews.
- Use `editorial-magazine` for narrative knowledge sharing or public talks.
- Use `bento-grid` when the deck needs many feature modules or capability cards.
- Use expressive templates such as `mondrian-de-stijl`, `bauhaus-functional`, `neo-brutalism`, or `glassmorphism-tech` only when they fit the audience and topic. Do not use them just to look different.
- A deck uses one style template by default. Do not mix style templates page by page unless building a deliberate section contrast and the user accepts it.

## Template Anatomy

Every style template must define how the following page types look. If the selected style does not define a required page type, choose the closest registered layout; do not improvise a random layout.

Required anatomy for each style template:

- cover page
- section divider
- normal content page
- method/process page
- case/example page
- prompt/demo page
- screenshot/callout page
- comparison/before-after page
- data/chart page
- checklist/risk page
- practice/interaction page
- summary page
- closing/Q&A page

For each page type, define:

- layout structure
- required components
- text density
- visual treatment
- best suited content
- what to avoid

Example anatomy:

```markdown
Style: swiss-minimal
- Cover: blue-background typography cover by default: strong blue field, subtle dot/plus pattern, large white left-aligned title, small metadata; no vertical accent line by default.
- Section: oversized section number + short title, high whitespace, one accent line.
- Content: title top-left, 2-3 structured blocks, strict grid alignment; include small native icon marks, number badges, or concise image/diagram zones when content would otherwise feel sparse.
- Method/process: horizontal or vertical step flow; each step has number, title, one-line explanation.
- Case/example: left problem/prompt, right result/evidence, bottom evaluation strip.
- Comparison: two equal panels, before/after labels, center divider.
- Checklist/risk: left warning statement, right editable checklist rows.
- Closing: three takeaways or one concise closing sentence + Q&A/contact.
```

### Swiss Minimal Theme

When using `swiss-minimal`, read and follow `references/swiss-minimal-theme.md` before building the deck.

Hard requirements:

- Use the registered-layout system and write `registeredLayout` (`SM01-SM10`) into every `swiss-minimal` slide.
- Do not rely on `pageType` alone; `pageType` describes the content job, while `registeredLayout` chooses the visual skeleton.
- Do not invent ad hoc Swiss body layouts during generation.
- Cover pages use `SM01`, split colon titles into two lines, remove the colon, and do not show page counters.
- Product/photos must use proportional cover/crop behavior; never stretch images.
- Generated PPTX files must support manual click/keyboard advance and include compatible slide transition settings.

### Guizang Swiss PPTX Theme

When using `guizang-swiss`, read and follow `references/guizang-swiss-pptx-theme.md` before building the deck.

Hard requirements:

- Generate directly with PPTGenJS; do not generate HTML and convert it to PPT.
- Use `registeredLayout` values from the Guizang Swiss `S01-S22` system.
- Use the Guizang Swiss registered layout system `S01-S22`; each layout has a PPTGenJS-native renderer.
- Recreate the static Swiss visual system: strict grid, IKB/single-accent color, light large typography, hairlines, square badges, dot matrices, and proportional image crop.
- Do not attempt to recreate WebGL or Motion One effects inside PPTX.

## Global Style Tokens

Every style template must define tokens for:

- color
- typography
- spacing
- shape
- line
- component treatment
- page chrome and source notes

Minimum token set:

```json
{
  "color": {
    "background": "",
    "surface": "",
    "text": "",
    "muted": "",
    "line": "",
    "accent": "",
    "accentOn": "",
    "success": "",
    "warning": "",
    "danger": ""
  },
  "typography": {
    "fontFamilyZh": "",
    "fontFamilyEn": "",
    "fontFamilyMono": "",
    "coverTitle": { "size": 52, "weight": 300, "lineHeight": 1.05 },
    "sectionTitle": { "size": 42, "weight": 300, "lineHeight": 1.08 },
    "slideTitle": { "size": 30, "weight": 600, "lineHeight": 1.15 },
    "subtitle": { "size": 15, "weight": 400, "lineHeight": 1.25 },
    "body": { "size": 14, "weight": 400, "lineHeight": 1.35 },
    "cardTitle": { "size": 17, "weight": 600, "lineHeight": 1.15 },
    "caption": { "size": 8, "weight": 500, "lineHeight": 1.2 },
    "number": { "size": 34, "weight": 600, "lineHeight": 1.0 }
  },
  "spacing": {
    "pageX": 0.72,
    "pageTop": 0.42,
    "blockGap": 0.32,
    "sectionGap": 0.62
  },
  "shape": {
    "radius": 0,
    "lineWidth": 0.8
  }
}
```

## Typography Rules

Use these rules adapted from the proven Guizang Swiss and magazine PPT systems. Convert the ideas to PPTX units; do not copy HTML `vw/vh` values directly.

- One deck should use at most two font families: one display/body family plus optional mono/numeric family.
- Use clean sans-serif for Swiss, business, AI product, bento, and tech templates.
- Use serif title + sans body only for editorial or academic/narrative styles.
- Large titles may use lighter weight; small text must use stronger weight for readability.
- Do not use thin weight for small captions, labels, or body text.
- Chinese titles are visually heavier than English titles; reduce size or shorten text when the title is long.
- Do not solve overcrowding by shrinking text. Compress copy, split the page, or choose a layout with more capacity.
- Cover title must be visibly larger than body-page titles.
- Body text should generally stay within 13-16 pt for presentation readability.
- Caption/source text can be 7-10 pt, but must not carry essential content.
- Keep a stable hierarchy: title, subtitle/key claim, body, caption/source. Avoid more than 3-4 text levels on one page.

Suggested PPTX hierarchy for 16:9:

| Text role | Size | Weight | Notes |
|---|---:|---:|---|
| Cover title | 44-58 pt | 300-700 | weight depends on style; Swiss can be lighter |
| Section title | 36-48 pt | 300-700 | short, high impact |
| Slide title | 26-34 pt | 600-700 | stable across body pages |
| Subtitle / lead | 14-18 pt | 400-500 | do not overuse |
| Body | 13-16 pt | 400-500 | primary readable copy |
| Card title | 15-20 pt | 600-700 | short labels |
| Caption/source | 7-10 pt | 500-600 | readable but quiet |
| KPI / large number | 34-64 pt | 300-700 | use only with real numbers |

For `swiss-minimal`, use a slightly larger, more presentation-friendly hierarchy by default:

| Text role | Default size |
|---|---:|
| Body-page title | 32-36 pt |
| Subtitle / lead | 14-17 pt |
| Card title | 20-24 pt |
| Card body | 13-15 pt |
| Checklist row title | 16-18 pt |
| Checklist row body | 12.5-14 pt |
| Native badge / label text | 9.5-10 pt |

`swiss-minimal` should not look like a sparse document page. If a slide has few words, enrich the page with one of:

- official or user-provided image crop
- native icon badges
- number rail
- thin grid/axis line
- compact comparison matrix
- native schematic illustration

Do not add decorative stock images. The visual must clarify the message, organize information, or create a stronger presentation rhythm.

Chinese title length guide:

| Title shape | Guidance |
|---|---|
| 1 line, <= 8 Chinese chars | can use largest title size |
| 1 line, 9-14 Chinese chars | use normal title size or split naturally |
| 2 lines, each <= 8 Chinese chars | acceptable for cover/section |
| 2 lines with long phrases | shorten the title before reducing size |
| 3+ lines | rewrite or split page; do not force-fit |

## Theme Rhythm Rules

Plan visual rhythm before building.

- Cover and closing must be visually distinct from body pages.
- Avoid 3+ consecutive pages with the same visual rhythm.
- For decks longer than 10 slides, insert section/statement/hero pages every 3-5 content pages when it helps pacing.
- Alternate dense method pages with lighter case/demo/statement pages.
- Do not make the whole deck a sequence of identical cards.
- Use dark/light, sparse/dense, text/visual, and method/case changes deliberately.
- Before building, create a rhythm plan: page number -> page type -> style layout -> density -> visual role.

## Layout Registry Rules

Do not invent a new visual structure for every slide. Each style template must have registered layouts for common page types.

Rules:

- Map v3 `page_type` and `page layout blueprint` to a registered layout.
- If the registered layout cannot fit the content, first compress content or choose another registered layout.
- If no registered layout fits, create a new layout only when it can be reused or clearly belongs to the style template.
- Keep layout names stable so future decks can reuse them.
- Native components from v3 must be built as editable PPT objects using the selected style's component rules.
- Do not rasterize native diagrams/checklists/flows.

## Component Rendering Rules

For `build_native` assets from v3, Skill 4 must construct the specified components:

- flow: editable cards/steps + lines/arrows
- checklist: rows with checkbox/symbol, label, advice
- prompt box: editable text box with field labels and optional annotation
- practice card: task card + answer/template area
- comparison grid: before/after or option A/B panels
- decision tree: branches built with lines, labels, and condition cards
- capability stack/map: layers/groups with labels and short explanations
- evaluation matrix: rows/columns with editable criteria

Each component should inherit the selected template's typography, spacing, line, fill, and accent rules.

If v3 says `build_native` but does not specify component structure/content, return to `ppt-slide-writing`.

## Layout Router

Map v3 `page_type` and `layout intent` to reusable layouts.

| Page type | Typical layout |
|---|---|
| `cover` | `cover-hero`: full-screen first impression with large title, subtitle, speaker, date/session, and strong background or large visual |
| `learning-objectives` | objective cards or outcome checklist |
| `problem-example` | bad example vs better example |
| `concept-explain` | definition + example + caution |
| `step-flow` | horizontal/vertical step flow |
| `prompt-template` | structured editable prompt box + annotated fields |
| `live-demo` | prompt panel + result image/screenshot + evaluation strip |
| `screenshot-callout` | large screenshot + numbered callouts |
| `before-after` | two-panel comparison |
| `practice-task` | task card + timer/steps + template |
| `risk-warning` | warning strip + examples + mitigation |
| `checklist` | large checklist with status icons |
| `summary` | key takeaway blocks |
| `qa-closing` | closing message + Q&A prompt |

Do not repeatedly use one layout unless the content intentionally repeats.

## Cover Hero Rules

The cover is not a normal content page.

For formal sharing, tutorial, launch, or report decks, the cover must include:

- main title
- subtitle or promise
- speaker / organization if known
- date, session, or event context if known
- strong first-viewport signal of the topic

Cover style requirements:

- use a full-screen or large-bleed composition
- avoid small card-like inner-page layouts
- avoid dense body text
- avoid three-column card grids
- make the title the dominant visual element
- use one strong image/background/typographic system, not many small elements

If speaker/date/session are missing, mark them as placeholders in v4 rather than omitting the metadata silently.

For AI product/tutorial decks, prefer an `ai-product-swiss` or `teaching-toolkit` cover with:

- large clean typography
- one accent color
- abstract product/capability visual or real product screenshot if appropriate
- minimal metadata
- no fake product UI

## Visual Style Principles

Use these distilled principles from high-quality magazine/Swiss-style slide systems:

- Choose the style first, then choose layouts. Do not mix unrelated themes.
- Use one theme family and one accent palette across the deck.
- For technology, AI, engineering, and data-driven sharing, prefer Swiss-inspired grid, strong type hierarchy, and restrained high-contrast accent.
- For humanistic or narrative sharing, a warmer editorial style may fit better.
- Plan theme rhythm before building: cover/hero, content pages, demo pages, warning pages, and closing should not all look identical.
- Avoid more than 3 consecutive pages with the same visual rhythm.
- Insert a hero/section/statement page every 3-4 pages when the deck is longer than 10 slides.
- Cover and closing pages must be designed separately from body pages.
- Image slot ratio comes from the layout. Generate or crop images to fit the slot, not the other way around.
- If a page needs images/screenshots and none are available, mark the deck as visually incomplete.
- After generation, inspect previews only when the user explicitly asks for rendered screenshots/PDF/preview images or when final visual acceptance depends on a rendered export. Do not invoke Keynote, PowerPoint, LibreOffice, or any other renderer by default.

## Theme Requirements

Each theme family must define:

- cover style
- cover metadata treatment: speaker, date, session, organization
- section divider style
- normal content page style
- demo/screenshot page style
- chart/table style
- warning/checklist style
- closing page style
- typography direction
- color palette
- image treatment
- page chrome and source-note style
- theme rhythm plan

For `teaching-toolkit`, prioritize:

- real screenshots when required
- editable prompt boxes
- numbered callouts
- practice cards
- step bars
- before/after frames
- readable large text
- light background and high contrast

For `ai-product-swiss`, prioritize:

- full-screen hero cover
- large sans-serif title with strong hierarchy
- restrained palette: neutral background plus one accent
- grid-based body layouts
- sparse, high-signal text
- screenshot/callout pages with disciplined margins
- demo pages with one large visual and minimal explanation
- closing page with three crisp takeaways

### AI Product Swiss Design System

Use this system when the deck is about an AI product, AI capability, AI workflow, technical product tutorial, or product demo for adult learners or professional audiences.

This is not a generic "technology blue" template. It is a disciplined product-teaching system: strong title, clear grid, low decoration, real examples, screenshots when useful, and visuals that explain the product rather than merely making the page look full.

#### Core Design Contract

- One slide, one job. Each page must teach, prove, compare, demonstrate, warn, or summarize one clear point.
- The audience should understand the page hierarchy in 3 seconds: title first, visual or main claim second, supporting detail third.
- Prefer product evidence over atmosphere: screenshot, workflow diagram, prompt/result pair, comparison table, or concrete example beats abstract generated art.
- Use generated images only when they make an idea easier to understand and v3 provides a complete image prompt specification.
- No decorative tech backgrounds, floating particles, random devices, fake dashboards, fake ChatGPT UI, fake logos, or irrelevant futuristic objects.
- Keep the page editable except real screenshots and generated images.

#### Page Type Rules

| Page type | Required structure | Visual rule | Density rule |
|---|---|---|---|
| `cover` | large title + subtitle/promise + speaker/date/session metadata + one topic signal | full-bleed typography or one meaningful hero visual; no card-grid cover | title 8-18 Chinese chars or 4-9 English words when possible; subtitle <= 28 Chinese chars |
| `section-divider` | section number + section title + one sentence transition | typography-first; optional small product/capability mark | no body paragraphs |
| `concept-explain` | one-sentence definition + why it matters + minimum example | native diagram, screenshot crop, or icon/label system | max 3 support blocks; each block <= 28 Chinese chars |
| `capability-map` | capability groups + what each group enables | editable map/table; avoid generated illustration | 3-5 groups only |
| `step-flow` | action sequence + user decision points + expected output | editable horizontal/vertical flow, not decorative image | 3-6 steps; each step title <= 10 Chinese chars |
| `prompt-template` | prompt formula + fields + example line | editable prompt box with field labels | prompt example can be longer, but annotate only key parts |
| `live-demo` | task/prompt + result/screenshot + observation/evaluation strip | large real screenshot/result image; generated image only for output example | explanation <= 3 bullets |
| `screenshot-callout` | screenshot + numbered callouts + key takeaway | real screenshot preferred; callouts must point to visible UI areas | 3-5 callouts |
| `before-after` | weak example vs improved example + reason | two balanced panels; result image allowed if it proves difference | each side <= 3 bullets |
| `practice-task` | task goal + materials + steps + success criteria | worksheet/card style; optional small example | must be actionable in class |
| `risk-warning` | risk statement + failure example + mitigation | warning strip/table; no dramatic stock image | max 4 risks |
| `summary` | three takeaways + next action | typography/card hybrid; no generic thank-you image | exactly 3 takeaways unless user asks otherwise |
| `qa-closing` | closing sentence + Q&A prompt + contact/next step if known | clean closing page, not another content page | sparse by default |

#### Cover Rules for AI Product Swiss

The cover must look like the entry point of a product/tutorial talk, not an inner content page.

Required elements:

- Main title: product or capability name plus the teaching angle.
- Subtitle or promise: what the audience will be able to do after the session.
- Speaker, date/session/event metadata. If unknown, show a clear placeholder and record it in v4.
- One first-screen topic signal: product screenshot crop, meaningful generated concept visual, or pure typographic hero.

Layout constraints:

- Use either `left-title / right-visual` or `center-title / background-visual`; do not use normal body cards.
- Title area should occupy at least 45% of the visual weight.
- Metadata should be small and aligned to the grid, usually bottom-left or top-left.
- Do not use more than one hero visual.
- Do not place a random image on the cover only because an image is available.

Good cover directions:

- A clean product-teaching cover: large title, short promise, speaker/date, one screenshot or product-output example.
- A Swiss typographic cover: oversized title, accent vertical rule, no image if no meaningful visual exists.
- A capability cover: one generated visual that directly represents the capability being taught, such as "prompt to image workflow", not abstract AI energy.

Bad cover directions:

- Three-card summary cover.
- Small centered title with a large unrelated image.
- Fake product interface or fake OpenAI/ChatGPT screen.
- Dense agenda text on the cover.

#### Body Page Rules

For normal body pages, use one of these structures:

- Claim + evidence: large conclusion title, one evidence block, one small source note.
- Explain + example: definition on left, concrete example or diagram on right.
- Steps + output: numbered steps with expected result.
- Problem + fix: weak practice, improved practice, reason.
- Principle + checklist: rule statement plus 3-5 checks.

Body page constraints:

- Title should be a conclusion or learning point, not a vague label.
- Avoid page titles such as "功能介绍", "案例展示", or "注意事项" unless the subtitle or body gives a concrete angle.
- Body copy should be scannable: prefer short blocks, labels, and callouts over paragraphs.
- Do not put more than 5 independent text blocks on one page.
- Do not use the same card layout for more than 3 consecutive pages.

#### Demo and Screenshot Rules

Demo pages are the most important pages in AI product tutorials.

Required structure:

- Task: what the user is trying to accomplish.
- Input: prompt, operation, or starting material.
- Output: screenshot, generated result, or expected product response.
- Observation: what the audience should notice.

Visual priority:

1. Real product screenshot from user or official source.
2. User-provided generated output.
3. Editable mock flow with explicit "schematic" label.
4. Generated illustrative output, only when it is not pretending to be UI.
5. Placeholder with missing asset note.

Never create fake UI screenshots. If the exact UI is unavailable, build an editable schematic or ask for the screenshot.

#### Prompt Page Rules

Prompt pages should teach reusable method, not dump long prompts.

Use this structure:

- Formula: role/task + subject + constraints + style + output requirements.
- Example: one realistic prompt, with only the key parts highlighted.
- Why it works: 2-3 short annotations.
- Try next: one small variation for audience practice.

Keep prompt text editable. Use monospace-like visual treatment if the font supports it, but do not turn the prompt into an image.

#### Visual and Image Prompt Rules

For `ai-product-swiss`, Skill 4 must classify every visual before building:

- `product-evidence`: screenshot, official product image, actual output, benchmark, chart.
- `instructional-diagram`: workflow, decision tree, prompt formula, capability map.
- `comparison`: before/after, bad/good, option A/B.
- `generated-example`: generated image used as the learning example itself.
- `atmosphere`: decorative mood image.

Only the first four are acceptable by default. `atmosphere` is allowed only on cover or section divider, and only when it directly reinforces the topic.

If v3 requests a generated image, the prompt must specify:

- slide purpose and exact conclusion supported
- subject and scene
- key elements to show
- composition and crop ratio
- style and color palette matching `ai-product-swiss`
- target size/aspect ratio
- text policy
- must-avoid list, including fake UI/logos/unreadable text
- fallback if the generated image is weak

Reject images that are beautiful but do not explain the slide.

#### Typography and Spacing Rules

- Use a clean sans-serif font, defaulting to the configured deck font.
- Use strong hierarchy: title, subtitle/key claim, body, caption/source.
- Prefer large title and fewer words over small dense paragraphs.
- Leave stable margins; do not run content to the slide edge except intentional full-bleed cover visuals.
- Keep source notes and captions small but readable.
- Use accent color for hierarchy, not decoration.

Suggested hierarchy for 16:9 slides:

- Cover title: 38-54 pt depending on title length.
- Section title: 34-46 pt.
- Body title: 24-34 pt.
- Body text: 13-18 pt.
- Caption/source: 7-10 pt.

#### Color Rules

Default palette behavior:

- Background: near-white or deep near-black.
- Text: high-contrast ink/white.
- Accent: one primary accent, usually blue.
- Status colors: green/yellow/red only for meaning, not decoration.
- Lines and frames: subtle neutral.

Do not make the deck read as a single flat blue block. Use whitespace, black/white contrast, and limited accent instead of filling every shape with blue.

#### Rhythm Rules

For AI product tutorial decks longer than 10 slides:

- Start with cover.
- Add an agenda or promise page only when it helps the audience follow the session.
- Insert a section divider or statement page every 3-4 content pages.
- Alternate among concept, workflow, demo, comparison, practice, and risk pages.
- Close with three takeaways and next practice, not only "Q&A".

Recommended rhythm for a 1-hour AI tool tutorial:

1. Cover
2. Why this product/capability matters
3. What it is and what it is not
4. Core capability map
5. Basic workflow
6. Prompt formula
7. Demo 1
8. Before/after improvement
9. Demo 2 or practice
10. Common failure modes
11. Usage boundaries and risks
12. Summary and next practice

#### AI Product Swiss QA

Before exporting, check:

- Does the cover look like a real cover rather than a body page?
- Does every body page have one clear learning point?
- Are screenshots/results/diagrams used where they teach better than images?
- Are generated images tied to a specific slide conclusion?
- Are there any decorative images that can be removed without reducing understanding?
- Are prompt pages editable and annotated?
- Are demo pages built around input, output, and observation?
- Does the deck avoid repetitive card pages?
- Does the deck feel like an AI product tutorial rather than a generic business deck?

## Asset Execution Rules

For every required asset in v3:

- `ready`: use it and record path/source.
- `missing_user_asset`: do not fake it; ask for it or use a clearly marked placeholder if draft mode is acceptable.
- `can_generate`: generate through available image skill/tool; record prompt, tool, path, and risk.
- `build_native`: build as editable PPT shapes/text/chart/table.
- `placeholder_ok`: use a labeled placeholder and record that it must be replaced.
- `must_verify`: do not present as final until checked.
- `not_needed`: do not add decorative filler.

If a deck requires visuals and none are generated, provided, or built natively, mark the build as incomplete.

Do not generate fake product UI, fake logos, fake real people, fake news scenes, fake charts, or fake screenshots.

## Visual Fit Gate

Before generating or inserting any visual, run this gate:

1. What slide conclusion does this visual support?
2. What exact sentence or body section does it help the audience understand?
3. Is the visual role one of `explain`, `demonstrate`, `compare`, `prove`, `navigate`, or `focus`?
4. Would removing the visual make the slide less understandable?
5. Is a native editable diagram, screenshot, table, or typography-only layout more accurate than a generated image?

Reject the visual if it is mainly decorative, abstract without instructional meaning, or unrelated to the page conclusion. In that case, use the v3 fallback, build a native diagram, or create a no-image layout.

Generated images are allowed only when the image prompt specification is complete:

```markdown
- Purpose
- Subject
- Scene
- Key elements
- Composition
- Style
- Color palette
- Aspect ratio
- Target size
- Must include
- Must avoid
- Text policy
- Relationship to slide text
- Fallback if image is weak
```

After generation, inspect the image against the prompt and the slide content:

- Does the subject match?
- Does the composition fit the intended layout slot?
- Does it avoid fake UI, logos, unreadable text, or irrelevant objects?
- Does it clarify the slide instead of competing with the copy?
- Does it match the deck's theme family?

If the generated image fails, regenerate once with a tightened prompt. If it still fails, do not insert it; use the fallback from v3.

If a missing real screenshot is not essential to the learning objective, redesign the slide as a native method/diagram page instead of leaving a known blocker. For example, replace a missing product UI screenshot with an editable "operation formula", "decision tree", or "before/after instruction" page. Only keep a screenshot blocker when the user's explicit goal is to demonstrate that exact UI.

If an asset is marked `can_generate` but image tooling is unavailable, create a clearly documented draft-quality concept asset or placeholder and record it as `fallback`, not as a final generated asset. Do not repeatedly leave the same known issue unresolved when a design fallback can serve the current draft.

## Editability Rules

Keep editable:

- titles and body text
- prompt boxes
- callouts
- diagrams
- checklists
- tables
- charts when practical

Raster images are acceptable for:

- generated illustrations
- screenshots
- photo-like examples
- mood/cover images

Never flatten a whole slide into one image unless explicitly accepted.

## Playback and Animation Rules

Skill 4 owns presentation playback behavior because it is part of the built PPTX file, not upstream content writing.

### Manual Advance

Every generated deck should support normal presenter navigation by default.

- Set every slide to allow manual advance by click/keyboard when the backend supports it.
- For PPTX XML post-processing, inject or preserve a transition node equivalent to:

```xml
<p:transition advClick="1"/>
```

- Do not generate kiosk-only, auto-play-only, or no-manual-advance decks unless the user explicitly asks for unattended playback.
- If auto-advance timing is requested, keep manual advance enabled unless the user explicitly says it must be locked.

### Animation Policy

Use animation to improve teaching rhythm, not to decorate the deck.

Default policy:

```json
{
  "slideTransition": "subtle-fade",
  "contentReveal": "none",
  "defaultTrigger": "onClick",
  "manualAdvance": true
}
```

Supported levels:

| Level | Use when | Behavior |
|---|---|---|
| `none` | formal reports, dense reference decks, user asks for no animation | no page transition beyond manual advance |
| `subtle` | default for tutorials, sharing, product demos | light page transition, no distracting movement |
| `instructional` | teaching pages, process pages, checklist pages | subtle transition plus limited step/bullet reveal |
| `cinematic` | launch/keynote moments only | stronger section/hero transitions, still restrained |

Recommended behavior:

- Cover, section divider, summary, and closing pages may use a subtle fade transition.
- Normal content pages should use no transition or subtle fade.
- Step-flow, checklist, prompt-template, and practice pages may use click-to-reveal by section when the reveal helps the audience follow the explanation.
- Demo/result pages may reveal input, output, and observation in order.
- Avoid fly-in, spin, bounce, excessive zoom, path animation, or more than one animation style on a single page.
- Keep animation optional and non-blocking: if a viewer does not support the animation, the slide should still be readable.

### Element Animation Constraints

Element-level animation is more fragile than slide transitions. Use it only when the generated backend can maintain stable shape IDs and compatible PPTX timing XML.

Allowed first-phase element animations:

- title appears with page
- bullet or section reveal on click
- image/result fade-in on click
- step cards reveal left-to-right or top-to-bottom

Not supported by default:

- motion paths
- rotating/scaling objects
- complex chained timelines
- animations that hide essential content until many clicks

If the backend cannot safely implement element animation, fall back to slide-level transitions and record the limitation in v4. Do not fake animation by duplicating many near-identical slides unless the user explicitly accepts that approach.

## Build Workflow

1. Read v3 and inspect provided assets/templates.
2. Run completeness gate: page copy, layout intent, visual recommendation, and asset status must be present.
3. Choose build mode.
4. Choose theme family using the theme router.
5. Choose a style template from the style template registry.
6. Load or define the style template anatomy and global style tokens.
7. Create a theme rhythm plan: page number, page type, registered layout, density, visual role.
8. Map every page type and page layout blueprint to a registered layout.
9. Create an asset plan from v3.
10. Run the Visual Fit Gate for every visual.
11. Generate only the assets marked `can_generate` and only from complete v3 prompt specifications.
12. Inspect generated images; reject or regenerate weak images before inserting them.
13. Build native diagrams, prompt boxes, callouts, checklists, and charts as editable elements using v3 native component specifications.
14. Choose playback and animation policy from deck scenario and user preference.
15. Generate PPTX using TypeScript + PptxGenJS or the selected backend.
16. Apply PPTX post-processing for manual advance and supported slide transitions/element animations.
17. Do not export `slide-previews/`, screenshots, PDFs, or contact sheets unless the user explicitly asks for them.
18. Run build QA and fix visual/build issues before handing off.
19. Output the full delivery package and `PPT Project Brief v4: Built Deck`.

## Handoff And Confirmation Policy

Step 4 is not a default confirmation gate in `standard` mode.

After building the editable PPTX:

- Run local build QA first. If the issue belongs to Skill 4, fix and rebuild before handing off.
- Continue automatically to `ppt-final-check` when the delivery package is complete.
- Do not ask the user to confirm the built deck before final check unless the user requested manual review, preview screenshots, or a specific visual variant decision.
- If the build reveals upstream content, structure, or goal problems, route back to the owner skill instead of hiding the problem visually.
- Optional previews, screenshots, contact sheets, and PDF exports are generated only when the user explicitly asks or when final check requires rendered visual verification.

## Required Delivery Package

Produce a task-specific folder:

```text
ppt-delivery-package/
├── deck.pptx
├── project-brief-v4.md
├── deck-builder-input.json
└── asset-log.json
```

Optional files, only when explicitly requested:

```text
ppt-delivery-package/
├── contact-sheet.png
└── slide-previews/
    ├── slide-001.png
    ├── slide-002.png
    └── ...
```

Do not use Keynote, PowerPoint, LibreOffice, or any renderer to create previews unless the user asks for rendered previews or visual export.

## QA Gates

Before delivery, check:

- theme matches deck type and audience
- selected style template matches deck type and audience
- global typography tokens are applied consistently
- title/body/caption sizes stay within the chosen template's hierarchy
- long Chinese titles are shortened or sized according to typography rules
- cover looks like a real cover, not an inner page
- cover metadata is present or explicitly marked as missing
- cover, section, body, case, risk, summary, and closing pages follow the selected template anatomy
- theme rhythm is planned and visible
- cover, body pages, demo pages, practice pages, and closing page have distinct appropriate layouts
- no more than 3 consecutive pages use the same visual rhythm unless intentionally repeated
- text does not overlap or overflow
- text density is appropriate for a presentation, not a document
- every slide has a clear visual focus
- required images/screenshots are present or explicitly marked as placeholders
- `build_native` components are built from editable PPT text/shapes and match v3 native component specifications
- generated images are appropriate and documented
- charts/tables have source notes
- text and shapes remain editable
- playback supports manual click/keyboard advance
- animation policy is appropriate, restrained, and recorded
- if previews were requested, contact sheet shows a coherent but not repetitive deck

If build QA finds a Skill 4 issue, fix it here and rebuild. Do not pass obvious layout errors to Skill 5.

## Output Format

```markdown
## PPT Project Brief v4: Built Deck

### Deliverables
- PPTX:
- Builder input:
- Asset log:
- Contact sheet:
- Slide previews:
- Output directory:

### Build Summary
- Mode:
- Toolchain:
- Theme family:
- Style template:
- Global style tokens:
- Theme rhythm plan:
- Playback/animation policy:
- Slide count:
- Layouts used:
- Cover metadata:
- Generated images:
- Placeholders:

### Asset Log
| Slide | Asset | Status | Visual role | Source / Tool | Prompt source | Editable? | Risk |
|---:|---|---|---|---|---|---|---|

For generated images, include the final prompt or a path to the prompt record. The log must be sufficient to understand why the image exists and how it was produced.

### Build QA
- Theme fit:
- Layout variety:
- Readability:
- Asset completeness:
- Visual-to-content fit:
- Generated image prompt compliance:
- Editability:
- Manual advance:
- Animation behavior:
- Preview coverage, if requested:
- Fixes applied:
- Remaining risks:

### Handoff
- Recommended next skill: `ppt-final-check`
- Pages needing user review:
- Missing materials:
- Pages that must be rebuilt after assets arrive:
```

## Quality Bar

A good Skill 4 output is not just an editable file. It must look like the right kind of PPT for the scenario.

An AI tool teaching deck should look like a tool-training deck. A business report should look like a business report. A product launch should look like a launch. Do not reuse an unrelated old theme.
