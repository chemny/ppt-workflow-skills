---
name: ppt-workflow-skills
description: End-to-end PPT workflow skills for goal discovery, slide structure, slide writing, editable PPTX generation, final review, and presentation practice. Designed to be portable across Codex, Claude Code, and OpenClaw.
version: 0.1.0
---

# PPT Workflow Skills

Use this skill collection when the user wants to create, improve, review, or rehearse a PowerPoint/PPT deck through a structured workflow.

This repository contains a coordinated group of skills:

1. `ppt-goal-setting` - clarify PPT goal, audience, constraints, references, and success criteria.
2. `ppt-slide-structure` - research the topic and choose a suitable scenario-specific structure.
3. `ppt-slide-writing` - turn the approved structure into slide-level copy, layout intent, components, and image prompts.
4. `ppt-deck-builder` - build an editable PPTX with TypeScript + PptxGenJS when the local runtime is available.
5. `ppt-final-check` - review logic, language, facts, data, layout risks, and delivery readiness.
6. `ppt-presentation-practice` - rehearse questions, objections, speaker notes, and response strategy.

## Routing

If the user asks for the whole process, start with `skills/ppt-workflow/SKILL.md`.

If the user asks for a specific phase, use the matching child skill directly.

## Compatibility

Designed to be portable across Codex, Claude Code, and OpenClaw.

Text-only phases can run in any agent environment that supports local skills. PPTX generation requires Node.js and the included `tools/ppt-builder-cli` package.

## Tool Boundary

The skills are the product. The TypeScript builder is only an optional execution tool used by `ppt-deck-builder` to generate editable `.pptx` files.

Do not assume platform-specific connectors, private memory files, absolute local paths, or proprietary image-generation tools. When image generation is unavailable, produce structured image prompts or placeholders and record the limitation.
