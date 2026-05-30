---
name: ppt-slide-writing
description: Use this skill after PPT structure is defined. It turns PPT Project Brief v2 into a complete page-by-page slide content specification, including final titles, visible body copy, page structure, layout intent, image/chart/screenshot suggestions, asset status, design notes, evidence requirements, speaker notes, and a handoff package for ppt-deck-builder.
---

# PPT Slide Writing

Use this skill to turn `PPT Project Brief v2: Slide Structure` into a complete `PPT Project Brief v3: Slide Content Specification`.

This skill is not just copywriting. It must produce the page-level content and design input that `ppt-deck-builder` needs to generate a real deck.

Write from the audience's point of view. A PPT is not a list of what the presenter wants to say; it is a guided experience that matches what the audience came to learn, solve, decide, or use.

## Core Job

Given `PPT Project Brief v2`, produce:

- overall writing strategy
- overall design direction for the deck
- page-by-page final titles
- page-by-page visible body copy
- page structure and information hierarchy
- page layout blueprint, layout intent, and component suggestions
- native component specifications for every editable diagram/card/checklist/table/flow built by Skill 4
- image, screenshot, chart, table, diagram, icon, or generated-image suggestions
- visual necessity, visual role, and complete image-generation prompts when images are needed
- asset status and fallback strategy
- data/source requirements
- speaker notes and transitions
- `PPT Project Brief v3: Slide Content Specification`

By the end of this skill, the deck's content should be clear enough that Skill 4 does not have to invent what each page means.

## Responsibility Boundary

This skill owns content and content-driven design requirements.

It should define:

- what each page says
- what each page is trying to prove or teach
- what the audience should notice first
- what visual/material is needed
- what layout pattern fits the content
- how the page should be arranged: columns, grids, hero layout, text/visual ratio, content zones, and visual hierarchy
- what native PPT components must be built when the slide does not use a raster image
- what design direction Skill 4 should follow

It should not define exact pixel positions, final font sizes, final colors, or PPTX implementation details. Those belong to `ppt-deck-builder`.

It may recommend a visual direction, but it must not define the final style system. Final template choice, font family, font size, line height, color tokens, spacing, component styling, and page-type visual treatment belong to `ppt-deck-builder`.

It must not change the structure decided by `ppt-slide-structure`.

Preserve from v2:

- slide count
- slide order
- chapter structure
- case selection
- page function
- core message
- timing and capacity plan

Skill 3 may rewrite page titles and visible copy, refine information hierarchy, specify layout blueprint, and define material/visual needs. It may not add, delete, merge, split, reorder, or replace slides.

If the structure is wrong, route back to `ppt-slide-structure`. If the goal or audience is unclear, route back to `ppt-goal-setting`.

## Required Input

Prefer receiving `PPT Project Brief v2: Slide Structure`.

Useful fields:

- topic, deck type, real job
- target audience and audience knowledge level
- delivery scenario and presentation length
- desired experience and optional reference style
- chapter structure
- slide skeleton
- page core messages
- evidence planning
- material needs
- structural risks

If v2 is incomplete but enough information exists, proceed with explicit assumptions.

## Core Principles

1. One slide, one main message.
2. Titles must carry meaning, not just category labels.
3. Every slide needs visible body content unless it is intentionally visual-only.
4. Every slide needs a page structure, not just copy.
5. Every slide needs a visual/material decision: use real asset, generate image, build native diagram, chart data, screenshot, icon, or no visual.
6. Every slide needs a material status and fallback strategy.
7. Audience drives language depth, examples, tone, and interaction.
8. Strong claims require sources; missing evidence must be marked.
9. Skill 3 gives content-driven layout intent; Skill 4 turns it into final visual design.
10. The deck must have narrative momentum. Each slide should make the next slide feel necessary.
11. Slide titles should be hook-driven and conclusion-led. Avoid plain labels like "Overview", "Prompt", or "Risk" unless paired with a strong claim.
12. For sharing/tutorial decks, do not write like a manual. Write like a clear live explanation that gives the audience a reason to continue.
13. Images exist to make the content easier to understand. Do not add images for decoration or "visual richness".
14. If a generated image is recommended, the slide spec must include a complete generation prompt tied to the slide's title, body copy, and conclusion.
15. Cover pages should not default to generated images. For professional/product/tutorial decks, prefer high-end typography, geometric composition, product/capability signals, and clean negative space unless a meaningful visual is required.
16. Copy must be concise, concrete, and high-density. Avoid generic motivational wording, vague claims, and low-signal labels.
17. Every slide must include a page layout blueprint detailed enough for Skill 4 to build without guessing.
18. Convert Skill 2 structure language into audience-facing copy. Do not expose internal outline labels as slide titles or body copy.
19. Every `build_native` visual must include a native component specification. Do not write only "native diagram", "checklist", "practice card", or "flow chart".

## Structure-To-Audience Copy Translation

Skill 2 outputs structural language. Skill 3 must translate it into language the audience finds useful.

Do not copy v2 section names, working titles, or skeleton labels directly into final slide copy. The final visible copy should sound like it is answering the audience's real concern, not reading the presenter's outline.

For each slide, translate:

```text
structure label -> audience question -> useful point -> clear title + useful body copy
```

Before writing visible text, ask:

- Why would the audience care about this page?
- What problem, confusion, decision, or task does this page help with?
- What does the audience know before this page?
- What should they understand or be able to do after this page?
- What objection or misunderstanding might they have?
- What is the shortest useful way to say it?

Do not organize the wording around the presenter's inventory of information. Organize wording around the audience's learning path or decision path.

For teaching and practical sharing:

- Start from the audience's pain, task, or desired result.
- Explain concepts only when they unlock action.
- Use examples that match common audience scenarios.
- Make each slide answer a likely audience question.
- Avoid pages that exist only because the presenter "should introduce" something.

Bad presenter-first logic:

```text
先介绍产品背景 -> 再介绍功能 -> 再介绍提示词 -> 再介绍案例
```

Better audience-first logic:

```text
你为什么生成不出想要的图
-> 你需要先判断这张图要用在哪里
-> 你要把用途、主体、场景和约束说清楚
-> 看一个高频任务怎么从需求变成提示词
-> 结果不对时怎么判断和修改
```

Title can stay clear and course-like. Audience value does not require every title to become a slogan or conclusion sentence. For practical tutorials, a direct title is often better because it helps the audience navigate the lesson.

Good titles:

```text
ChatGPT Images 2.0 是什么
图像提示词的 6 个要素
控制图片质量的关键变量
案例一：PPT 配图
生成后不满意怎么改
哪些图不能随便生成
```

The audience-facing work should happen in the visible body copy and speaker explanation:

```text
Title: 图像提示词的 6 个要素
Body: 用途决定画幅，主体决定焦点，场景决定关系，风格决定质感，构图决定阅读顺序，限制决定能不能直接用。
```

Avoid over-translating titles into clever claims when a simple title is clearer.

## Copy Quality Rules

Slide copy should be direct, useful, and specific. It should make the audience feel the deck understands the real task.

Title rules:

- Prefer clear, direct, course-friendly titles for practical tutorials.
- The title should tell the audience exactly what this page is about.
- Use concise nouns or short phrases when they are clearer than conclusion sentences.
- Use conclusion-led titles only when the page is making an argument, warning, or strong judgment.
- Avoid bland but vague titles such as "功能介绍", "使用方法", "案例展示", "注意事项", "今日目标" when they do not specify the topic.
- Avoid over-clever titles that hide the topic or sound like slogans.
- Avoid hype such as "开启新时代", "颠覆想象", "无限可能" unless the deck is explicitly promotional.
- The visible body copy must carry the usefulness: explain why the title matters, what to do, what to avoid, or how to judge.

Body copy rules:

- Use short, information-dense lines.
- Each bullet should add a real distinction, step, criterion, or decision.
- Avoid filler such as "提升效率", "赋能创作", "释放潜能" without concrete meaning.
- Prefer "用途 -> 画面 -> 约束 -> 评估" over broad statements like "掌握提示词技巧".
- Write for live explanation: visible copy should be compact, speaker notes can carry nuance.

Before finalizing each slide, run this check:

- Is the title specific enough that the slide would still make sense without a presenter?
- Does the visible copy teach something concrete?
- Can the audience tell why this page matters within 3 seconds?
- Can Skill 4 infer the page structure from the layout blueprint?

## Page Layout Blueprint Rules

`Layout intent` alone is not enough. Every slide must include a `Page layout blueprint` that describes the actual arrangement.

The blueprint must specify:

- layout pattern: cover hero, two-column, three-column, split visual/text, full-bleed typography, grid cards, step flow, before/after, case walkthrough, screenshot callout, checklist, etc.
- content zones: where title, subtitle, body, visual, source note, and callout areas should appear
- text/visual ratio: e.g. 60/40 text-to-visual, 35/65 prompt-to-result, or typography-only
- component list: prompt box, case card, comparison panel, number rail, callout labels, checklist, source note
- reading order: what the audience should see first, second, third
- density rule: max blocks, max bullets, or whether content should be sparse/high-density
- visual policy: typography/native shapes/screenshot/generated image/no image

Use concrete layout language:

- "Typography-only cover: large title left, thin vertical accent line, metadata bottom-left, small capability tags bottom-right."
- "Two-column case walkthrough: left 38% problem and prompt, right 62% generated result; bottom evaluation strip."
- "Three-card method grid: one row of 3 cards, each with label, rule, example; no image."
- "Before/after comparison: two equal panels, center arrow, bottom reason strip."

Avoid vague layout language:

- "Make it beautiful."
- "Use a modern layout."
- "Add a nice visual."
- "图文结合."

## Native Component Specification Rules

If `Preferred visual type` or an asset status is `build_native`, Skill 3 must describe what Skill 4 should build with editable PPT objects.

Native PPT objects include:

- text boxes
- rectangles/cards
- lines and arrows
- tables
- icon or symbol placeholders
- number rails
- callout labels
- checkboxes
- dividers
- accent bars
- source notes

For every native component, specify:

- component type: flow, checklist, comparison grid, practice card, prompt box, case card, decision tree, capability stack, evaluation matrix, etc.
- structure: number of columns/rows/cards/steps/items
- content: exact labels and text inside each component
- layout relation: where the component sits relative to title/body/visual
- editable requirement: all text and shapes editable; no rasterization
- visual hierarchy: which element is primary, secondary, supporting
- construction instruction for Skill 4: how to build it with PPT shapes/text

Examples:

```markdown
- Preferred visual type: native checklist
- Native component specification:
  - Component type: risk checklist
  - Structure: 5 rows; each row has checkbox, risk label, one-line handling advice
  - Content:
    1. 真实人物：确认授权和使用场景
    2. 品牌 Logo：避免伪造官方素材
    3. 新闻事件：避免让图片被误认为真实报道
    4. 商业素材：确认版权和使用范围
    5. 医疗法律：避免生成误导性专业建议
  - Layout relation: checklist occupies right 65%; left 35% has short warning statement
  - Editable requirement: all checkboxes, labels, and advice are editable PPT text/shapes
  - Visual hierarchy: warning title first, checklist second, source note third
  - Construction instruction for Skill 4: use five horizontal rows with small square checkbox icons, thin dividers, red accent for risk labels, source note at bottom
```

```markdown
- Preferred visual type: native practice card
- Native component specification:
  - Component type: classroom practice card + prompt template
  - Structure: left task card, right empty prompt template with 6 fields
  - Content:
    - Task: 把“帮我做一张 AI 分享会海报”改成图片提示词
    - Fields: 用途 / 主体 / 场景 / 风格 / 比例 / 限制
  - Layout relation: left 38% task, right 62% editable template
  - Editable requirement: all fields are editable text boxes
  - Visual hierarchy: task sentence first, fields second, time hint third
  - Construction instruction for Skill 4: use two cards, light background, numbered field labels, no generated image
```

If a native component cannot be specified clearly, the slide content is not ready for Skill 4.

## Cover Writing And Layout Rules

For professional tutorials, AI product sharing, business talks, and practical courses:

- Cover should look like a high-end presentation entry point, not a content page.
- Prefer clean typography and geometric composition over generated imagery.
- Use generated cover image only when the image directly clarifies the topic and is not decorative.
- Cover should include title, subtitle/promise, speaker/date/session if known.
- Title should be specific and useful, not vague or hype-driven.
- The cover should create authority through clarity, whitespace, alignment, and hierarchy.

Recommended cover options:

- `typographic-premium`: oversized title, concise subtitle, accent line, small metadata, no image.
- `typographic-with-signal`: text-led cover plus a small native prompt-to-image diagram or abstract geometric signal.
- `product-evidence-cover`: text-led cover plus real product/output screenshot if available.

For ChatGPT Images / AI product tutorials, default to `typographic-premium` or `typographic-with-signal`; do not default to a generated hero image.

## Narrative Momentum

Before writing slide specs, define the deck's content arc:

- opening hook
- central promise
- audience tension or pain
- curiosity path
- turning points
- demo/practice moments
- closing takeaway

For every slide, include:

- why this slide appears now
- the page conclusion
- the supporting detail that makes the conclusion credible
- the question or tension that leads to the next slide

If a slide does not create a useful next question, rewrite or remove it.

For product/capability tutorials, use this narrative spine unless v2 specifies another:

```text
What is it?
-> Why should I care?
-> What is better/different?
-> What can it do?
-> How do I start?
-> How do I use it well?
-> What examples prove it?
-> What should I watch out for?
-> What should I do next?
```

This prevents the deck from jumping straight into prompts or exercises before the audience understands the product/capability.

## Overall Design Direction

Before writing page specs, define a deck-level design direction for Skill 4.

Include:

- recommended theme family
- visual tone
- page density
- preferred layout components
- image style
- screenshot style
- chart/table style
- interaction style
- what to avoid

Examples:

- AI tool teaching: `teaching-toolkit`; clean, modern, screenshot-friendly; use steps, prompt boxes, callouts, practice cards, before/after examples.
- Business report: `business-report`; restrained, evidence-led, chart-safe; use conclusion titles, KPI blocks, data proof pages.
- Product launch: `product-launch`; product-centered, high rhythm, large visuals; use reveal pages, demo pages, feature-to-benefit pages.
- Literature teaching: `education-literary`; warm, readable, text-centered; use quote close-reading, timeline, discussion prompts.

## Page Types

Choose a `page_type` for each slide.

Common types:

- `cover`
- `learning-objectives`
- `problem-example`
- `concept-explain`
- `step-flow`
- `prompt-template`
- `live-demo`
- `screenshot-callout`
- `before-after`
- `comparison`
- `data-proof`
- `case-example`
- `quote-analysis`
- `interaction-prompt`
- `practice-task`
- `risk-warning`
- `checklist`
- `summary`
- `qa-closing`

Use page types to help Skill 4 choose the correct layout.

## Material Status

Every required visual/material must have one status:

| Status | Meaning | Skill 4 behavior |
|---|---|---|
| `ready` | User provided or source exists | Use it and record provenance |
| `missing_user_asset` | User must provide it | Do not fake it; request or placeholder |
| `can_generate` | AI-generated image is acceptable | Skill 4 should generate through installed image skill/tool |
| `build_native` | Should be built with editable shapes/text/charts | Skill 4 should not use a raster image |
| `placeholder_ok` | Placeholder acceptable for draft | Mark clearly for replacement |
| `must_verify` | Claim/source/product behavior must be checked | Do not present as final certainty |
| `not_needed` | Page works without an image | Skill 4 should not add decorative filler |

This field is mandatory. A PPT with no images may be acceptable only when every page explicitly says visuals are `not_needed` or `build_native`.

## Image And Visual Guidance

For each slide, specify one of:

- real screenshot
- generated image
- native diagram
- chart/table
- icon set
- quote/text block
- before/after visual
- no image needed

Before recommending any image, decide its content function:

- `explain`: make an abstract concept concrete
- `demonstrate`: show how an operation works
- `compare`: show before/after or good/bad contrast
- `prove`: support a claim with evidence, chart, data, or real artifact
- `navigate`: help the audience follow a process or structure
- `focus`: create a short emotional or attention reset
- `not_needed`: no image; use typography, native shapes, or whitespace

If the visual function is unclear, set visual status to `not_needed` or `build_native`. A weak decorative image is worse than no image.

Use this default priority for tutorial, product, and knowledge-sharing decks:

```text
real screenshot / user material
-> native editable diagram or flow
-> before/after example
-> chart/table with source
-> generated image with clear instructional role
-> no image
```

For generated images, the prompt is mandatory. A slide spec that only says "generate an AI image" is incomplete.

For generated images, include:

- purpose
- prompt intent
- style
- aspect ratio
- what must not appear
- factuality/copyright risk

Also include a complete prompt specification:

```markdown
- Image prompt specification:
  - Purpose:
  - Subject:
  - Scene:
  - Key elements:
  - Composition:
  - Style:
  - Color palette:
  - Aspect ratio:
  - Target size:
  - Must include:
  - Must avoid:
  - Text policy:
  - Relationship to slide text:
  - Fallback if image is weak:
```

`Relationship to slide text` must explicitly connect the image to the slide title, visible body copy, and page conclusion.

Do not ask Skill 4 to generate:

- fake product screenshots
- fake logos
- fake real people
- fake news or factual scenes
- factual charts
- text-heavy images that should be editable PPT text
- abstract mood images that do not explain, demonstrate, compare, prove, navigate, or focus the slide

## Required Slide Spec

For every slide, output this structure:

```markdown
### Slide X

- Page type:
- Final title:
- Hook / audience question:
- Core message:
- Page conclusion:
- Visible body copy:
  - 
- Supporting details:
  -
- Body sections:
  - 
- Why this slide now:
- Transition question:
- Layout intent:
- Page layout blueprint:
- Information hierarchy:
- Visual / asset recommendation:
- Visual necessity:
- Visual role:
- Visual message:
- Visual-to-text match:
- Preferred visual type:
- Native component specification:
- Image prompt specification:
  - Purpose:
  - Subject:
  - Scene:
  - Key elements:
  - Composition:
  - Style:
  - Color palette:
  - Aspect ratio:
  - Target size:
  - Must include:
  - Must avoid:
  - Text policy:
  - Relationship to slide text:
  - Fallback if image is weak:
- Required assets:
  - Asset:
    - Status:
    - Source / generation instruction:
    - Fallback:
    - Risk:
- Data / source requirement:
- Design note for Skill 4:
- Speaker note:
- Transition:
- Risk / placeholder:
```

Do not omit `Visible body copy`, `Page conclusion`, `Supporting details`, `Transition question`, `Layout intent`, `Visual / asset recommendation`, `Visual necessity`, `Visual role`, `Visual message`, `Visual-to-text match`, `Preferred visual type`, or `Required assets`.

If `Preferred visual type` is `generated image`, do not omit `Image prompt specification`. If the slide does not need a generated image, set `Image prompt specification: not applicable`.

## Layout Intent Examples

Good:

```markdown
- Layout intent: Left-right demo layout for prompt-to-result teaching.
- Page layout blueprint: Left 42% shows the full prompt in an editable prompt box. Right 58% shows the generated image or placeholder. Bottom has a 3-item evaluation strip. Reading order: title -> prompt -> result -> evaluation strip.
- Visual / asset recommendation: Use an actual generated cover image only if it demonstrates the visible prompt's result. Otherwise build a native before/after diagram.
- Visual necessity: must-have
- Visual role: demonstrate
- Visual message: The audience should see how a specific prompt turns into a usable image result.
- Visual-to-text match: The visual must correspond to the prompt shown on the left and support the page conclusion about prompt specificity.
- Preferred visual type: generated image
- Image prompt specification:
  - Purpose: Demonstrate the result of the exact prompt shown on this slide.
  - Subject: A beginner-friendly AI course cover image.
  - Scene: Clean online course cover design, no product UI.
  - Key elements: Course title area left blank, AI image-generation motif, simple learning symbols.
  - Composition: 16:9 horizontal cover, clear central subject, open space for PPT text overlay.
  - Style: Modern education keynote, clean, high contrast.
  - Color palette: dark navy, white, electric blue, small green accent.
  - Aspect ratio: 16:9.
  - Target size: 1792x1024 or equivalent.
  - Must include: clear visual hierarchy and usable empty text area.
  - Must avoid: logos, fake product UI, unreadable text, people, clutter.
  - Text policy: no embedded text; all text stays editable in PPT.
  - Relationship to slide text: The image is the output example for the prompt box and proves the slide's conclusion.
  - Fallback if image is weak: Use a native four-step prompt-to-image diagram.
```

Good:

```markdown
- Layout intent: Screenshot-callout layout for real product operation.
- Page layout blueprint: Main screenshot takes 65% width. Three numbered callouts point to the upload, edit, and save areas. A short caution note sits at the bottom. Reading order: title -> screenshot -> callouts -> caution.
- Visual / asset recommendation: Use real product screenshot only. Do not generate fake UI.
- Visual necessity: must-have
- Visual role: demonstrate
- Visual message: The audience should learn where to look and what to click in the real interface.
- Visual-to-text match: The numbered callouts must map to the three body-copy steps.
- Preferred visual type: real screenshot
- Image prompt specification: not applicable
```

Bad:

```markdown
- Layout intent: Make it beautiful.
- Visual: Add a nice picture.
- Image prompt: AI technology image.
```

## Batch Rule

For decks longer than 8 slides, output in batches of 3-5 slides unless the user asks for the full draft at once.

Each batch must still include complete slide specs. Do not output titles only.

In `standard` mode, batching is for readability, not a confirmation gate. After all batches are complete, output the full v3 handoff and continue to `ppt-deck-builder` if the handoff is complete. In `deep` or step-by-step mode, wait for user acceptance according to the workflow confirmation policy.

## Process

1. Read v2 and identify audience, scenario, structure, time, and slide skeleton.
2. Lock the v2 slide skeleton. Do not change slide count, order, chapter structure, case selection, or page function.
3. Define writing strategy and deck-level design direction.
4. For each v2 slide, write final title, hook/audience question, page conclusion, visible body copy, supporting details, and body sections.
5. Assign page type, layout intent, and page layout blueprint.
6. Decide visual necessity, role, message, and visual-to-text match.
7. If a generated image is needed, write the full prompt specification.
8. Specify material status, fallback strategy, data/source requirements, and risks.
9. Add speaker notes and transitions.
10. Summarize material collection plan and Skill 4 handoff.

## Handoff And Confirmation Policy

Step 3 is not a default confirmation gate in `standard` mode.

After producing `PPT Project Brief v3: Slide Content Specification`:

- If all required page specs, layout blueprints, material decisions, and image/native component instructions are complete, continue automatically to `ppt-deck-builder`.
- Do not ask the user to approve every slide's copy before building unless the user requested step-by-step control.
- In `deep` mode, show only the first 3-5 representative slide specs for confirmation before building. Use this to validate language style, page density, layout intent, and visual strategy.
- If Skill 3 discovers that v2 structure is wrong, do not silently rewrite it. Route back to `ppt-slide-structure`.
- If Skill 3 cannot specify required visuals/materials clearly enough for Skill 4, stop and ask for the missing material or route back to the correct owner.

## Output Format

```markdown
## PPT Project Brief v3: Slide Content Specification

### Writing Strategy
- Audience:
- Language rules:
- Evidence rules:
- Speaker-note rules:
- Narrative spine:
- Opening hook:
- Closing takeaway:

### Design Direction For Skill 4
- Recommended theme family:
- Visual tone:
- Page density:
- Preferred layout components:
- Image/screenshot style:
- Chart/table style:
- Interaction style:
- What to avoid:

### Slide Specs

### Slide 1
- Page type:
- Final title:
- Hook / audience question:
- Core message:
- Page conclusion:
- Visible body copy:
  -
- Supporting details:
  -
- Body sections:
  -
- Why this slide now:
- Transition question:
- Layout intent:
- Page layout blueprint:
- Information hierarchy:
- Visual / asset recommendation:
- Visual necessity:
- Visual role:
- Visual message:
- Visual-to-text match:
- Preferred visual type:
- Native component specification:
- Image prompt specification:
  - Purpose:
  - Subject:
  - Scene:
  - Key elements:
  - Composition:
  - Style:
  - Color palette:
  - Aspect ratio:
  - Target size:
  - Must include:
  - Must avoid:
  - Text policy:
  - Relationship to slide text:
  - Fallback if image is weak:
- Required assets:
  - Asset:
    - Status:
    - Source / generation instruction:
    - Fallback:
    - Risk:
- Data / source requirement:
- Design note for Skill 4:
- Speaker note:
- Transition:
- Risk / placeholder:

### Material Collection Plan
| Slide | Asset / material | Status | Owner | Fallback | Risk |
|---:|---|---|---|---|---|

### Source And Verification Plan
| Slide | Claim / data / product behavior | Source needed | Status | Risk |
|---:|---|---|---|---|

### Handoff To ppt-deck-builder
- Theme recommendation:
- Required layouts:
- Required generated images:
- Required image prompts:
- Required real screenshots:
- Native diagrams/charts/tables:
- Placeholder policy:
- Pages that must not be generated until assets are provided:
- Next recommended skill: `ppt-deck-builder`
```

## Quality Bar

A good v3 should let Skill 4 build a deck without guessing:

- the deck has a clear narrative spine
- the v2 slide skeleton is preserved unless the skill explicitly routes back to `ppt-slide-structure`
- each slide has a hook or audience question
- each slide states a real conclusion, not only a topic
- each slide gives supporting detail that makes the conclusion credible
- each slide creates a natural transition to the next slide
- every slide has real body content
- every slide has page type and layout intent
- every slide has a concrete page layout blueprint
- every slide has a visual/material decision
- every visual has a clear necessity, role, message, and relationship to the slide text
- every generated image has a complete prompt specification
- generated images are requested only when appropriate
- missing real assets are not faked
- design direction follows Skill 1 and Skill 2
- handoff makes the next build step executable
