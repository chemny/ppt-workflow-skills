# Skill 6 Presentation Practice

Skill 6 turns a final-checked deck into rehearsal material. It must not repair the deck or bypass the final gate.

## Entry Gate

Formal rehearsal requires:

- `logs/final-review-report.json`
- `06-review/quality-report.json`
- `status: PASS`
- `canEnterPresentationPractice: true`

If the gate is missing or not PASS, return to `ppt-final-check` or the owner skill listed in the final review fix request.

## Project Command

From `tools/ppt-builder-cli`:

```bash
npx tsx src/cli.ts practice-project ../../projects/demo --out
```

This reads:

- `03-production/slide-production-spec.json`
- `06-review/quality-report.json`

It writes:

- `07-practice/practice-report.md`
- `07-practice/practice-report.json`

## Output Contract

The report should include:

- practice setup
- speaking strategy
- timing plan
- slide-by-slide speaker cards
- likely questions
- pressure questions where useful
- emergency talking points
- rehearsal plan

## Responsibility Boundary

Skill 6 may identify presentation risks, but it should not silently rewrite the deck.

- Content problem: return to `ppt-slide-writing`.
- Structure problem: return to `ppt-slide-structure`.
- Visual/build problem: return to `ppt-deck-builder`.
- Final gate problem: return to `ppt-final-check`.

## Timing Principle

Do not divide time evenly by default. Allocate more time to examples, demos, proof pages, and action pages. Compress cover, section-divider, and closing pages first when time is short.

## Speaker Card Principle

Speaker cards should be practical rehearsal aids, not full scripts. Each card should contain:

- page objective
- what to say
- key sentence
- transition
- risk or caution
