# 06 PPT Building

Use this workflow to generate or modify an editable PPTX.

## When to use

Use when the user asks to create, generate, export, build, convert, or update a PPTX file.

## Inputs

- Slide writing plan.
- Visual design spec.
- Template PPT if available.
- Source materials and assets.
- User preference for speed vs control.

## Backend options

Do not assume a default backend until candidates have been tested.

Potential options:

- Presenton: full AI presentation generation and API.
- ppt-master: document-to-editable-PPTX generation.
- PptxGenJS: controlled programmatic PPTX generation.
- python-pptx: Python PPTX generation and modification.
- Marp CLI: fast Markdown-to-PPTX draft path.

## Process

1. Decide whether the task is generation, conversion, redesign, or modification.
2. Choose the simplest viable backend.
3. Preserve editability whenever possible.
4. Keep source files and asset paths.
5. Note any backend limitations clearly.
6. After building, send the output to `final-check`.

## Output format

```markdown
## PPT Build Plan
- Task type:
- Backend:
- Input files:
- Template:
- Output path:
- Assets:
- Known limitations:
- Next check:
```

## Handoff

Send generated or modified PPTX to `final-check`.

