# PPT-Maker

An end-to-end AI agent skill collection for creating better PowerPoint decks: goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice.

[中文](./README.zh.md) | English

Designed to be portable across Codex, Claude Code, and OpenClaw.

## Why This Exists

Many AI-generated PPT decks fail before the file is created:

- The target audience is unclear.
- The desired audience action is unclear.
- The outline looks like a table of contents instead of a real presentation structure.
- Slides only have titles, without body copy, layout intent, components, images, or data requirements.
- The final PPTX may be editable, but the visual style is inconsistent, the information density is weak, and images do not support the content.

This project treats PPT creation as a workflow instead of a one-shot generation task. It separates goal discovery, structure, writing, design/build, review, and rehearsal into explicit skills so each phase can be improved independently.

## Core Capabilities

- Clarify the PPT goal, target audience, reference materials, constraints, and success criteria.
- Research the topic before creating the structure.
- Choose scenario-specific frameworks for business reports, product launches, knowledge sharing, classroom teaching, tutorials, proposals, and more.
- Convert a slide structure into slide-level copy, layout intent, native components, and image prompts.
- Generate editable PPTX files with TypeScript + PptxGenJS when the runtime is available.
- Review logic, facts, data, language, visual consistency, and delivery readiness.
- Prepare presentation rehearsal questions, speaker notes, and response strategies.

## Workflow

```text
User intent
  ↓
1. ppt-goal-setting
   Clarify topic, audience, goal, time, constraints, and references
  ↓
2. ppt-slide-structure
   Research the topic, choose a scenario framework, and produce the slide outline
  ↓
3. ppt-slide-writing
   Produce final slide titles, body copy, components, layout intent, image prompts, and slide-spec
  ↓
4. ppt-deck-builder
   Select the visual system, generate editable PPTX, and apply transitions
  ↓
5. ppt-final-check
   Check logic, facts, data, language, layout, and visual consistency
  ↓
6. ppt-presentation-practice
   Rehearse questions, speaker notes, objections, and responses
```

## Included Skills

| Skill | Purpose |
|---|---|
| `PPT-Maker` | Main router for the full PPT workflow |
| `ppt-goal-setting` | Clarifies what PPT should be made and why |
| `ppt-slide-structure` | Builds a topic-aware, scenario-specific slide structure |
| `ppt-slide-writing` | Writes slide-level content, layout intent, components, image prompts, and structured slide-spec |
| `ppt-deck-builder` | Builds editable PPTX files through the default SVG-native branch or the optional PptxGenJS template-native branch |
| `ppt-final-check` | Reviews logic, language, facts, data, layout, and visual risks |
| `ppt-presentation-practice` | Helps users rehearse and prepare for Q&A |

## Repository Structure

```text
PPT-Maker/
├── SKILL.md
├── README.md
├── README.zh.md
├── LICENSE
├── references/
│   ├── compatibility.md
│   ├── publish-checklist.md
│   ├── slide-spec.md
│   ├── skill3-slide-spec-generation.md
│   ├── skill4-slide-spec-build.md
│   ├── skill6-presentation-practice.md
│   ├── layout-registry.md
│   └── theme-tokens.md
├── skills/
│   ├── PPT-Maker/
│   ├── ppt-goal-setting/
│   ├── ppt-slide-structure/
│   ├── ppt-slide-writing/
│   ├── ppt-deck-builder/
│   ├── ppt-final-check/
│   └── ppt-presentation-practice/
├── tools/
│   └── ppt-builder-cli/
└── examples/
    └── iphone17/
```

## Install

Clone or copy this repository into your agent skills directory.
`SKILL.md` must remain at the skill root after installation.

Common locations:

```text
Codex:       ~/.agents/skills/PPT-Maker/
Claude Code: ~/.claude/skills/PPT-Maker/
OpenClaw:    ~/.openclaw/skills/PPT-Maker/
```

Example:

```bash
git clone https://github.com/chemny/PPT-Maker.git ~/.agents/skills/PPT-Maker
```

After installation, start a fresh agent session and ask:

```text
Use PPT-Maker to help me create a 20-minute product briefing deck.
```

Verification prompt:

```text
Use PPT-Maker to explain its six-step PPT workflow.
```

## Usage

Run the full workflow when you are starting from scratch:

```text
Use PPT-Maker to create a one-hour tutorial deck about ChatGPT Images for AI learners.
```

Use a specific phase when you already have partial materials:

```text
Use ppt-slide-writing to turn this outline into slide-level copy, layout intent, and image prompts.
```

```text
Use ppt-deck-builder to generate an editable PPTX from this slide content specification.
```

```text
Use ppt-final-check to review this deck before delivery.
```

```text
Use ppt-presentation-practice to prepare speaker notes and Q&A after the deck passes final check.
```

## Optional PPTX Builder

The text workflow works without extra tools. Editable PPTX generation uses the included TypeScript builder.

Requirements:

- Node.js 18+
- npm

Run the example:

```bash
cd tools/ppt-builder-cli
npm install
npm run typecheck
npx tsx src/cli.ts build ../../examples/iphone17/deck-builder-input.blueprint-swiss.json --out ../../examples/iphone17/iphone17-demo.pptx
```

Run the package-level quality check:

```bash
npx tsx src/cli.ts check ../../examples/iphone17/deck-builder-input.blueprint-swiss.json --pptx ../../examples/iphone17/iphone17-demo.pptx
```

Run a project-level final review and practice report:

```bash
npx tsx src/cli.ts review-project ../../projects/<deck-slug> --out
npx tsx src/cli.ts practice-project ../../projects/<deck-slug> --out
```

## Project Mode

For longer decks, source-heavy decks, or decks that may need rebuilds, use the lightweight project folder standard:

```text
projects/<deck-slug>/
├── 00-intake/
├── 01-research/
├── 02-structure/
├── 03-production/
├── 04-design/
├── 05-build/
├── 06-review/
└── 07-practice/
```

Project mode adds these guardrails:

- `00-intake` records user material, source summaries, citations, extracted tables, and extracted images.
- `01-research` records topic and official-source research that affects structure.
- `02-structure` records scenario pattern, narrative spine, timing, slide skeleton, and page rhythm.
- `03-production/slide-production-spec.json` is the structured page contract from Skill 3 to Skill 4.
- `04-design` locks design system, template selection, and asset plan.
- `05-build` stores builder input, generated assets, and editable PPTX.
- `06-review` stores quality report and fix requests.
- `07-practice` stores rehearsal materials and optional scripts.

The core protocol layer is `source package + research brief + structure plan + slide production spec + component registry + template system`: Skill 3 decides what each slide means, what components it needs, and which layout it recommends; Skill 4 renders the editable PPTX through stable layouts, components, and design tokens.

## Visual System

The builder supports two Skill 4 build branches:

- `svg-native`: the default page-by-page SVG design route, assembled into editable native PPTX objects where supported.
- `template-native`: the optional PPTGenJS template route for deterministic theme/layout rendering.

The current template-native branch includes a PPTGenJS-native `blueprint-swiss` theme:

- a reusable library of structured slide layouts
- editable PPT shapes and text
- Swiss-style grid discipline
- IKB blue accent by default
- large lightweight titles and strong whitespace
- proportional image placement
- manual keyboard/click slide advance

The theme is inspired by Swiss International Style and implemented directly in PPTX. It does not generate HTML and does not convert HTML to PPT.

## Platform Notes

Text-only skills should work across Codex, Claude Code, and OpenClaw.

PPTX generation depends on whether the current agent environment can run Node.js and write local files. If image-generation tools are not available, the workflow should output image prompts or placeholders instead of pretending that images were generated.

Current compatibility status:

| Platform | Status |
|---|---|
| Codex | Tested locally |
| Claude Code | Static reviewed, not yet tested in this repository |
| OpenClaw | Static reviewed, not yet tested in this repository |

## License

MIT
