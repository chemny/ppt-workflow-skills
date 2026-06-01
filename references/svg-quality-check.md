# SVG Quality Check

The `svg-native` route requires SVG checks before SVG-to-native-PPTX assembly.

## Required Command

When the local builder is available:

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts check-svg ../../projects/<deck-slug>/05-build/svg-pages \
  --visual-lock ../../projects/<deck-slug>/04-design/visual-lock.json \
  --visual-page-plan ../../projects/<deck-slug>/04-design/visual-page-plan.json \
  --out ../../projects/<deck-slug>/06-review/svg-quality-report.json
```

## Checks

Minimum checks:

- SVG directory exists.
- Every `.svg` is readable.
- `viewBox` matches `visual-lock.json`.
- forbidden SVG features are absent.
- no external network images.
- no `rgba(...)` values.
- image elements use `preserveAspectRatio`.
- required SVG pages from `visual-page-plan.json` exist.

Recommended checks:

- colors come from `visual-lock.json`.
- SVG text does not contain critical slide title/body/source content.
- icon stroke width matches the lock.
- images are local project assets.
- page count matches deck input.

## Status

The report status is:

- `pass`: no errors
- `fail`: one or more errors

Warnings should still be fixed when they affect visual quality, but errors block PPTX assembly.

## Ownership

SVG quality failures are Skill 4 defects unless the failure is caused by missing content or missing image prompts from Skill 3.

Skill 4 should fix the SVG/page plan and rerun the check before handing off to Skill 5.
