---
name: ppt-final-check
description: Use this skill after ppt-deck-builder has produced a PPT delivery package. It acts as a final quality gate, not just a review report: it checks content, logic, copy, data/source, assets, compliance, visuals, layout, and delivery readiness; outputs PASS, FAIL, or CONDITIONAL_PASS; generates fix requests for the responsible prior skill; and only allows ppt-presentation-practice after PASS.
---

# PPT Final Check

Use this skill as the final quality gate before a PPT is delivered or rehearsed.

This skill is not a passive reviewer. If it finds blocking issues, it must send the work back to the responsible skill and require recheck.

## Core Job

Given a Skill 4 delivery package, produce:

- final check status: `PASS`, `FAIL`, or `CONDITIONAL_PASS`
- delivery score
- launch/delivery recommendation
- issue list by page
- severity level
- owner skill
- required fix request
- recheck requirement
- `PPT Project Brief v5: Final Gate Report`

Only `PASS` allows formal entry into `ppt-presentation-practice`.

## Required Input

Prefer a complete delivery package:

```text
ppt-delivery-package/
├── deck.pptx
├── project-brief-v4.md
├── v3-slide-spec.json
├── deck-builder-input.json
├── asset-log.json
├── asset-manifest.json
├── design-lock.json
└── pptx-quality-report.json
```

Minimum for content/source check:

- `project-brief-v4.md`
- `v3-slide-spec.json` or equivalent v3 slide spec section
- `deck-builder-input.json`
- `asset-log.json`

Optional for rendered visual final check, only when the user requested preview/export artifacts:

- `contact-sheet.png` or complete `slide-previews/`

If preview images are missing, do not automatically fail the deck. Run source-level checks from `deck-builder-input.json`, asset log, and v4 brief. Mark rendered visual QA as incomplete only when the user explicitly requested rendered previews/screenshots/PDF, when the delivery requirement demands visual render verification, or when source-level checks cannot reasonably evaluate the risk.

If `pptx-quality-report.json` is available, read it before manual review. If it is missing and the local Node.js builder is available, run:

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts check <deck-builder-input.json> --pptx <deck.pptx> --out <pptx-quality-report.json>
```

Treat checker `error` issues as potential `Blocker` or `Major` findings unless the user explicitly accepts the risk.

For project-mode decks, prefer the project-level review command when the local builder is available:

```bash
cd tools/ppt-builder-cli
npx tsx src/cli.ts review-project <project-dir> --out
```

This reads `03-production/slide-production-spec.json`, `05-build/deck-builder-input.json`, `04-design/asset-plan.json`, `04-design/design-system.json`, build reports, and the PPTX under `05-build/`, then writes `06-review/quality-report.json`.

Use `v3-slide-spec.json` as the reference for whether Skill 4 preserved page intent, copy, required components, visual purpose, and source requirements. If the PPTX/build input diverges from v3 without an explicit reason, assign the issue to `ppt-deck-builder`. If v3 itself is incomplete or wrong, assign it to `ppt-slide-writing` or `ppt-slide-structure` depending on ownership.

## Responsibility Boundary

Assign issues to the correct owner:

- `ppt-goal-setting`: purpose, audience, scenario, delivery time, or success criteria.
- `ppt-slide-structure`: narrative sequence, chapters, page order, slide count logic, page core messages.
- `ppt-slide-writing`: final copy, examples, data/source needs, image descriptions, material status, slide-spec completeness.
- `ppt-deck-builder`: theme, layout registry mapping, theme-token application, typography, images, chart rendering, editability, playback/manual advance, animation settings, optional preview generation, PPTX build quality.
- `ppt-final-check`: final prioritization, severity grading, delivery gate, and recheck result.

Do not fix upstream problems silently. Generate a fix request for the owner skill.

## Check Dimensions

Check eight dimensions:

1. Goal alignment: matches audience, scenario, time, and outcome.
2. Structure and logic: story flow, section order, page purpose, transitions.
3. Copy quality: typos, awkward wording, vague claims, empty slogans, audience fit.
4. Data and evidence: sources, units, chart logic, claim support, misleading visuals.
5. Asset and compliance: image provenance, generated asset labeling, screenshots, copyright, sensitive content.
6. Layout and readability: overlap, overflow, font size, contrast, chart labels, source note visibility.
7. Style consistency: theme fit, layout variety, image style, chart grammar, and rendered coherence when previews are available.
8. Delivery readiness: can present, navigate, send, edit, and trust the deck.

## Severity Levels

| Severity | Meaning | Gate effect |
|---|---|---|
| `Blocker` | Cannot deliver safely or clearly | Always `FAIL` |
| `Major` | Clearly weakens communication, trust, compliance, or usability | Usually `FAIL`; may be `CONDITIONAL_PASS` only if accepted by user |
| `Minor` | Small quality issue | Can still `PASS` |
| `Polish` | Optional improvement | Can still `PASS` |

Examples of `Blocker`:

- title/text overlap on a main slide
- missing required source for a key claim
- fake screenshot/product image presented as real
- wrong audience/scenario
- incomplete deck or missing core pages
- no visual previews when rendered visual QA was explicitly requested or required
- manual slide advance is disabled or uncertain in the generated PPTX

## Gate Status Rules

Use exactly one:

- `PASS`: no Blocker, no unresolved Major, required visual QA complete, score usually >= 85.
- `CONDITIONAL_PASS`: no unresolved content/compliance Blocker, only limited Major issues that are acceptable for draft review or can be fixed before final delivery, score usually 75-84.
- `FAIL`: any Blocker, multiple unresolved Major issues, required visual QA incomplete, or score < 75.

If status is `FAIL`, do not recommend moving to `ppt-presentation-practice`. Recommend returning to the owner skill and re-running final check after fixes. If status is `CONDITIONAL_PASS`, make clear whether it permits draft review only or formal rehearsal.

## Fix Request Rules

When status is `FAIL` or `CONDITIONAL_PASS`, output a fix request.

The fix request must include:

- return-to skill
- page number
- issue
- required fix
- acceptance criteria
- whether recheck is required

If multiple owner skills are involved, group fix requests by owner.

## Workflow

1. Identify available files in the delivery package.
2. Check whether rendered visual preview coverage was requested or required.
3. In project mode, run or read `logs/final-review-report.json`.
4. Read v3 slide spec, v4 builder input, asset manifest, design lock, layout mapping, and quality report.
5. Inspect contact sheet and slide previews when available; otherwise use source-level layout and asset checks.
6. Check playback: manual click/keyboard advance should be enabled; animation policy should be recorded and restrained.
7. Run eight-dimension checks.
8. Assign severity and owner skill for each issue.
9. Calculate score.
10. Decide `PASS`, `FAIL`, or `CONDITIONAL_PASS`.
11. If `FAIL`, generate fix request and stop forward progression; route back to the owner skill for repair, then rerun final check.
12. If `CONDITIONAL_PASS`, list remaining conditions and do not call it final delivery-ready unless the user accepts those risks.
13. If `PASS`, allow handoff to `ppt-presentation-practice`.

## Confirmation Gate

Step 5 is a default confirmation gate in all modes.

After final check:

- If `PASS`, present the delivery decision, key checks passed, residual risks, and delivery recommendation. Ask whether the user wants optional `ppt-presentation-practice`; do not enter Step 6 automatically unless the user requested rehearsal earlier.
- If `FAIL`, route back to the owner skill with a fix request. The workflow should fix, rebuild if needed, and rerun final check before asking the user to accept delivery.
- If `CONDITIONAL_PASS`, clearly state whether this is acceptable for draft review only or can be accepted by the user for the current scenario. Ask for user acceptance only when the remaining risk is genuinely a judgment call.
- Do not output a report and abandon the deck. A failed final check is an instruction to repair through the owner skill and recheck.

## Output Format

```markdown
## PPT Project Brief v5: Final Gate Report

### Gate Status
- Status: PASS / FAIL / CONDITIONAL_PASS
- Score:
- Recommendation:
- Can enter ppt-presentation-practice: yes / no
- Main reason:

### Input Coverage
- Project brief:
- Builder input:
- Asset log:
- PPTX:
- Contact sheet:
- Slide previews:
- Visual QA completeness:
- Manual advance:
- Animation policy:

### Dimension Scores
| Dimension | Score | Notes |
|---|---:|---|
| Goal alignment |  |  |
| Structure and logic |  |  |
| Copy quality |  |  |
| Data and evidence |  |  |
| Asset and compliance |  |  |
| Layout and readability |  |  |
| Style consistency |  |  |
| Delivery readiness |  |  |

### Issue List
| Page | Severity | Issue | Owner Skill | Required Fix |
|---:|---|---|---|---|

### Final Check Fix Request
| Return To | Page | Required Fix | Acceptance Criteria | Recheck Required |
|---|---:|---|---|---|

### Must Fix Before Delivery
-

### Optional Improvements
-

### Handoff
- If PASS: next skill is `ppt-presentation-practice`
- If FAIL: return to:
- Regenerate PPT:
- User review needed:
```

## Quality Bar

A good final check makes a decision. It does not merely comment.

If the PPT is not ready, say so, send it back to the responsible skill, and define what must be fixed before recheck.
