# PPT Workflow Skills

An end-to-end AI agent skill collection for creating better PowerPoint decks: goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice.

[中文](./README.zh.md) | English

Compatible with Codex, Claude Code, and OpenClaw.

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
   Produce final slide titles, body copy, components, layout intent, and image prompts
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
| `ppt-workflow` | Main router for the full PPT workflow |
| `ppt-goal-setting` | Clarifies what PPT should be made and why |
| `ppt-slide-structure` | Builds a topic-aware, scenario-specific slide structure |
| `ppt-slide-writing` | Writes slide-level content, layout intent, components, and image prompts |
| `ppt-deck-builder` | Builds editable PPTX files with the optional PptxGenJS toolchain |
| `ppt-final-check` | Reviews logic, language, facts, data, layout, and visual risks |
| `ppt-presentation-practice` | Helps users rehearse and prepare for Q&A |

## Repository Structure

```text
ppt-workflow-skills/
├── SKILL.md
├── README.md
├── README.zh.md
├── LICENSE
├── references/
│   ├── compatibility.md
│   └── publish-checklist.md
├── skills/
│   ├── ppt-workflow/
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

Common locations:

```text
Codex:       ~/.agents/skills/ppt-workflow-skills/
Claude Code: ~/.claude/skills/ppt-workflow-skills/
OpenClaw:    ~/.openclaw/skills/ppt-workflow-skills/
```

Example:

```bash
git clone https://github.com/chemny/ppt-workflow-skills.git ~/.agents/skills/ppt-workflow-skills
```

After installation, start a fresh agent session and ask:

```text
Use ppt-workflow-skills to help me create a 20-minute product briefing deck.
```

## Usage

Run the full workflow when you are starting from scratch:

```text
Use ppt-workflow-skills to create a one-hour tutorial deck about ChatGPT Images for AI learners.
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
npx tsx src/cli.ts build ../../examples/iphone17/deck-builder-input.guizang-swiss.json --out ../../examples/iphone17/iphone17-demo.pptx
```

## Visual System

The builder currently includes a PPTGenJS-native `guizang-swiss` theme:

- registered layouts `S01-S22`
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

## Acknowledgements

The PPT style system in this skill collection is partly inspired by [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill), especially its Swiss-style presentation aesthetics and registered layout discipline. This project reimplements the workflow and PPT generation path with portable skills and a PPTGenJS-native builder.

## Safety

This repository should not contain API keys, private tokens, local user memory files, browser cookies, or machine-specific paths. Review the repository before publishing or redistributing modified versions.

## License

MIT
