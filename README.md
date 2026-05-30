# PPT Workflow Skills

一组用于完整制作 PPT 的 AI Agent Skills，覆盖目标澄清、大纲结构、页面文案、可编辑 PPTX 生成、最终检查和汇报演练。

An end-to-end AI agent skill collection for creating better PowerPoint decks: goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice.

[中文说明](./README.zh.md) | English

Compatible with Codex, Claude Code, and OpenClaw.

## 为什么做这个项目 / Why This Exists

很多 AI 做 PPT 的问题不是“不会生成文件”，而是前面的判断没有做好：

- 不清楚这份 PPT 到底讲给谁。
- 不清楚用户希望听众听完之后做什么。
- 大纲像目录，不像真正能讲清楚问题的结构。
- 每页只有标题，没有正文、布局、组件、图片和数据说明。
- 最后生成的 PPT 虽然可编辑，但风格不统一、信息密度低、图片不服务内容。

This project treats PPT creation as a workflow instead of a one-shot generation task. It separates goal discovery, structure, writing, design/build, review, and rehearsal into explicit skills so each phase can be improved independently.

## 核心能力 / Core Capabilities

- Clarify the PPT goal, target audience, reference materials, constraints, and success criteria.
- Research the topic before creating the structure.
- Choose scenario-specific frameworks for business reports, product launches, knowledge sharing, classroom teaching, tutorials, proposals, and more.
- Convert a slide structure into slide-level copy, layout intent, native components, and image prompts.
- Generate editable PPTX files with TypeScript + PptxGenJS when the runtime is available.
- Review logic, facts, data, language, visual consistency, and delivery readiness.
- Prepare presentation rehearsal questions, speaker notes, and response strategies.

## Workflow

```text
User Intent
  ↓
1. ppt-goal-setting
   Clarify topic, audience, goal, time, constraints, references
  ↓
2. ppt-slide-structure
   Research topic, choose scenario framework, produce slide outline
  ↓
3. ppt-slide-writing
   Produce final slide titles, body copy, components, layout intent, image prompts
  ↓
4. ppt-deck-builder
   Select visual system, generate/editable PPTX, apply transitions
  ↓
5. ppt-final-check
   Check logic, facts, data, language, layout, visual consistency
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
