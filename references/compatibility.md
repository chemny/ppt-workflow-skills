# Compatibility

Target platforms:

- Codex
- Claude Code
- OpenClaw

## Current Status

- Codex: tested locally for skill discovery and PPTX builder execution.
- Claude Code: statically reviewed for skill layout compatibility; not tested in this local session.
- OpenClaw: statically reviewed for skill layout compatibility; not tested in this local session.

## Portable Assumptions

- `SKILL.md` files use YAML frontmatter.
- Child skills live under `skills/<skill-name>/SKILL.md`.
- Text-only workflow phases do not require platform-specific connectors.
- PPTX generation requires Node.js 18+, npm, and local file write permissions.
- Image generation is optional and platform-dependent.

## Runtime Requirements

For PPTX generation:

```bash
cd tools/ppt-builder-cli
npm install
npm run typecheck
```

If this cannot run on a platform, use the text workflow to produce the deck JSON and run the builder elsewhere.
