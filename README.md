# PPT Workflow Skills

An end-to-end skill collection for making better PowerPoint decks with AI agents.

It covers the full workflow: goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice.

Compatible with Codex, Claude Code, and OpenClaw.

## What This Is

This repository is a collection of portable agent skills, not a standalone SaaS app.

The skills help an agent work with the user step by step:

1. Clarify the PPT goal, audience, constraints, references, and success criteria.
2. Research the topic and choose a suitable structure for the scenario.
3. Write slide-level copy, layout intent, native components, and image prompts.
4. Generate an editable PPTX through TypeScript + PptxGenJS when available.
5. Review logic, facts, language, data, visual consistency, and delivery readiness.
6. Rehearse questions, risks, speaker notes, and response strategy.

## Repository Structure

```text
ppt-workflow-skills/
├── SKILL.md
├── README.md
├── README.zh.md
├── LICENSE
├── references/
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

After installation, start a fresh agent session and ask:

```text
Use ppt-workflow-skills to help me create a 20-minute product briefing deck.
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

## Included Visual System

The builder currently includes a PPTGenJS-native `guizang-swiss` theme:

- strict registered layouts `S01-S22`
- editable PPT shapes and text
- Swiss-style grid discipline
- IKB blue accent by default
- proportional image placement
- manual keyboard/click slide advance

The theme is inspired by Swiss International Style and implemented directly in PPTX. It does not generate HTML and does not convert HTML to PPT.

## Acknowledgements

The PPT style system in this skill collection is partly inspired by [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill), especially its Swiss-style presentation aesthetics and registered layout discipline. This project reimplements the workflow and PPT generation path with portable skills and a PPTGenJS-native builder.

## Platform Notes

Text-only skills should work across Codex, Claude Code, and OpenClaw.

PPTX generation depends on whether the current agent environment can run Node.js and write local files. If image-generation tools are not available, the workflow should output image prompts or placeholders instead of pretending that images were generated.

## Safety

This repository should not contain API keys, private tokens, local user memory files, browser cookies, or machine-specific paths. Review the repository before publishing or redistributing modified versions.

## License

MIT
