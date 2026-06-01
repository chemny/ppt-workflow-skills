---
name: PPT-Maker
description: End-to-end PPT workflow skills for goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice. Designed to be portable across Codex, Claude Code, and OpenClaw.
version: 0.1.0
---

# PPT-Maker

Use this skill collection when the user wants to create, improve, review, or rehearse a PowerPoint/PPT deck through a structured workflow.

This repository contains a coordinated group of skills:

1. `ppt-goal-setting` - clarify PPT goal, audience, constraints, references, and success criteria.
2. `ppt-slide-structure` - research the topic and choose a suitable scenario-specific structure.
3. `ppt-slide-writing` - turn the approved structure into slide-level copy, layout intent, components, and image prompts.
4. `ppt-deck-builder` - build an editable PPTX with TypeScript + PptxGenJS when the local runtime is available.
5. `ppt-final-check` - review logic, language, facts, data, layout risks, and delivery readiness.
6. `ppt-presentation-practice` - rehearse questions, objections, speaker notes, and response strategy.

## Routing

If the user asks for the whole process, start with `skills/PPT-Maker/SKILL.md`.

If the user asks for a specific phase, use the matching child skill directly.

## Compatibility

Designed to be portable across Codex, Claude Code, and OpenClaw.

Text-only phases can run in any agent environment that supports local skills. PPTX generation requires Node.js and the included `tools/ppt-builder-cli` package.

## Tool Boundary

The skills are the product. The TypeScript builder is only an optional execution tool used by `ppt-deck-builder` to generate editable `.pptx` files.

Do not assume platform-specific connectors, private memory files, absolute local paths, or proprietary image-generation tools. When image generation is unavailable, produce structured image prompts or placeholders and record the limitation.

## Project Mode

For decks that need files, assets, rebuilds, or later review, use the lightweight project structure in `references/project-structure.md`.

Key project artifacts:

- `00-intake/user-brief.md`
- `00-intake/source-index.json`
- `01-research/research-brief.json`
- `02-structure/structure-plan.json`
- `03-production/slide-production-spec.json`
- `04-design/design-brief.json`
- `04-design/design-system.json`
- `04-design/template-selection.json`
- `05-build/deck-builder-input.json`
- `06-review/quality-report.json`
- `07-practice/practice-report.md`

Use project mode for long decks, source-heavy decks, generated assets, or any deck that may need resume/rebuild cycles.

## Protocol Layer

For new or rebuildable projects, keep Skill 3 and Skill 4 connected through stable protocol files:

- `references/v2-architecture.md` defines the V2 artifact flow.
- `references/source-intake.md` defines source package and citation handling.
- `references/research-brief.md` defines the research brief.
- `references/visual-component-registry.md` defines components, icons, charts, and Mermaid usage.
- `references/template-system-v2.md` defines theme/layout/component/template layering.
- `references/design-router.md` defines how scenario, audience, goal, and mood become design parameters.
- `references/design-brief.md` defines the deck-level design decision contract.
- `references/component-pack-registry.md` defines reusable component pack choices.
- `references/slide-spec.md` defines `03-production/slide-production-spec.json`.
- `references/skill3-slide-spec-generation.md` defines how Skill 3 should generate the contract from v2.
- `references/layout-registry.md` defines reusable layout IDs.
- `references/theme-tokens.md` defines the visual token system.

Treat these files as the first phase of the architecture. They make the workflow portable across agent platforms and reduce model guesswork during PPTX generation.
