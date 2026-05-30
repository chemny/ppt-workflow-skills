---
name: ppt-presentation-practice
description: Use this skill after a PPT has been built and preferably final-checked. It helps the user rehearse and deliver the presentation by creating a speaking strategy, timing plan, slide-by-slide speaker cards, transitions, audience questions, pressure questions, answer strategies, and emergency talking points.
---

# PPT Presentation Practice

Use this skill after the PPT has passed `ppt-final-check` and the user needs to rehearse, present, defend, teach, pitch, or deliver it live.

This skill does not build or final-check the PPT. It helps the user turn the finished and approved deck into a confident live presentation.

This skill is optional in the full PPT workflow. Do not enter it automatically after `ppt-final-check` unless the user has asked for rehearsal, speaker notes, Q&A preparation, live delivery support, or a similar presentation-practice output. After v5 PASS, offer this skill as an optional next step.

## Core Job

Given a final-check-approved PPT package, produce:

- presentation strategy
- timing plan
- slide-by-slide speaker cards
- key lines and transition lines
- emphasis, pause, and interaction suggestions
- likely audience questions
- pressure questions and follow-up questions
- answer strategies and high-EQ response wording
- emergency talking points
- rehearsal plan
- `PPT Presentation Practice Report`

The central question is: can the presenter explain this approved PPT clearly, persuasively, and calmly in the real scenario?

## Entry Gate

Formal presentation practice requires `PPT Project Brief v5: Final Gate Report` with:

- `Status: PASS`
- `Can enter ppt-presentation-practice: yes`
- no unresolved `Blocker`
- no unresolved `Major`

If v5 is missing, recommend running `ppt-final-check` first.

If v5 status is `FAIL`, do not run formal rehearsal. Return to the owner skill named in the fix request.

If v5 status is `CONDITIONAL_PASS`, ask whether the user accepts the remaining risks before formal rehearsal. If not accepted, return to the owner skill.

You may offer a limited `content-flow preview` only when the user explicitly wants to rehearse ideas before fixes. Label it clearly as provisional and do not call it final presentation practice.

## Responsibility Boundary

Use this boundary strictly:

- `ppt-goal-setting`: audience, scenario, goal, or delivery constraints are unclear.
- `ppt-slide-structure`: the deck's narrative route or page sequence is wrong.
- `ppt-slide-writing`: slide copy, examples, data, or evidence are weak.
- `ppt-deck-builder`: layout, visual hierarchy, or generated PPT quality blocks delivery.
- `ppt-final-check`: the deck still needs formal pre-delivery QA or v5 is not PASS.
- `ppt-presentation-practice`: the deck is ready enough to rehearse and needs speaking strategy, timing, Q&A, and live-response preparation.

This skill may identify issues that should return to earlier skills, but it should not rewrite the whole PPT or regenerate the deck.

## Required Input

Prefer receiving:

- `PPT Project Brief v5: Final Gate Report`
- `PPT Project Brief v4: Built Deck`
- `deck-builder-input.json`
- slide previews or contact sheet
- presentation duration
- audience and scenario
- user role, such as teacher, manager, founder, sales, researcher, student, or product lead

If v5 is available, check gate status before producing practice materials.

If the presentation duration is missing, infer a provisional timing plan from slide count and scenario, then mark it as an assumption.

## Practice Modes

Choose one or more modes based on the user's scenario.

| Mode | When to use | Output focus |
|---|---|---|
| `speaker-notes` | User needs to know what to say page by page | Slide speaker cards, key lines, transitions |
| `timed-rehearsal` | User has a strict time limit | Time allocation, compression plan, priority pages |
| `leadership-qa` | Work report, strategy, review, decision meeting | Sharp questions, evidence defense, next-step answers |
| `teaching-rehearsal` | Courseware, lesson, knowledge sharing | Teaching path, interaction prompts, student questions |
| `pitch-rehearsal` | Product launch, sales, investor, demo | value story, objection handling, memorable lines |
| `defense-practice` | Thesis, competition, evaluation, expert review | challenge questions, logical defense, evidence boundaries |
| `emergency-response` | User worries about live uncertainty | fallback wording, time cuts, unknown-question handling |

Do not default to a full word-for-word script unless the user asks. Prefer speaker cards that are easier to rehearse and less stiff.

## Audience Role Simulation

Generate questions from realistic audience roles.

Common roles:

- leader
- customer
- investor
- teacher
- student
- parent
- judge
- expert
- media
- partner
- finance reviewer
- technical reviewer
- skeptical colleague

For each role, consider what they care about, what they doubt, and what answer would make them trust the presenter more.

## Question Levels

Use three levels:

| Level | Meaning |
|---|---|
| Basic | A normal listener may ask it after hearing the slide |
| Follow-up | A serious listener may ask it after the first answer |
| Pressure | A skeptical or senior listener may challenge the claim, data, feasibility, cost, priority, or risk |

Good practice should include pressure questions. Avoid only asking polite surface questions.

## Speaking Strategy

Before page-level notes, define the strategy:

- target outcome
- audience mindset
- presenter stance
- tone
- pacing
- main throughline
- what to emphasize
- what to avoid
- interaction plan
- risk points to prepare

Examples:

- Work report: concise, evidence-led, result-first, avoid vague credit claiming.
- Teaching deck: guided, clear, example-rich, leave room for student response.
- Product launch: confident, vivid, benefit-led, memorable but not overhyped.
- Investor pitch: sharp, credible, metric-aware, answer risks directly.

## Timing Plan

Allocate time across:

- opening
- context
- main sections
- key evidence pages
- interaction or demo
- conclusion
- Q&A

For each page or section, mark:

- recommended time
- maximum time
- whether it is skippable
- compression method if time runs short

The timing should match the deck purpose. Do not distribute time evenly if some pages are more important.

## Slide Speaker Cards

For each slide, produce a compact speaker card.

Each card should include:

- slide number and title
- speaking objective
- what to say
- key sentence
- transition to next slide
- emphasis or pause
- interaction prompt if useful
- possible question
- caution or risk

Keep cards practical. The presenter should be able to rehearse from them.

## Answer Strategy

For likely and pressure questions, provide answers with this structure:

- direct answer
- supporting reason or evidence
- boundary or caveat if needed
- return to main message
- next step or action if relevant

When the question is hostile or impossible to fully answer, do not fake certainty. Use a calm response that acknowledges the issue and redirects to what is known.

## Emergency Talking Points

Prepare fallback wording for:

- running out of time
- data being questioned
- unclear audience reaction
- a page being skipped
- a demo or media asset failing
- being interrupted
- being asked an unknown question
- being challenged on feasibility, cost, priority, or evidence

These should be natural spoken lines, not corporate slogans.

## Workflow

1. Read v5 final gate report and confirm `Status: PASS`.
2. Read v4 built deck summary and builder input.
3. Identify audience, scenario, speaker role, goal, and time limit.
4. Choose practice mode or modes.
5. Build the speaking strategy.
6. Create the timing plan.
7. Generate slide-by-slide speaker cards.
8. Generate likely audience questions by role.
9. Generate pressure questions and follow-up questions.
10. Write answer strategies and emergency talking points.
11. Produce a rehearsal plan.
12. Output `PPT Presentation Practice Report`.

If final gate status is not PASS, stop formal rehearsal and recommend returning to the relevant prior skill before rehearsal.

## Output Format

Use this structure:

```markdown
## PPT Presentation Practice Report

### Practice Setup
- Final gate status:
- Scenario:
- Audience:
- Speaker role:
- Total time:
- Practice mode:
- Main outcome:

### Speaking Strategy
- Throughline:
- Tone:
- Pacing:
- Emphasis:
- Interaction:
- Avoid:

### Timing Plan
| Section / Page | Suggested Time | Max Time | Priority | Compression Method |
|---|---:|---:|---|---|

### Slide Speaker Cards
| Page | Speaking Objective | Key Sentence | Transition | Risk / Caution |
|---:|---|---|---|---|

### Likely Questions
| Role | Level | Question | Answer Strategy |
|---|---|---|---|

### Pressure Questions
| Role | Question | Strong Response |
|---|---|---|

### Emergency Talking Points
- Time shortage:
- Data challenged:
- Unknown question:
- Audience confused:
- Interrupted:
- Demo or asset issue:

### Rehearsal Plan
- Round 1:
- Round 2:
- Round 3:

### Handoff
- Needs PPT revision:
- Return to skill:
- Ready for live presentation:
```

## Quality Bar

A good output should help the presenter rehearse immediately.

Avoid generic advice such as "speak confidently" or "use eye contact" unless tied to a concrete slide or risk. The output should tell the user what to say, what to emphasize, what questions may come, and how to respond under pressure.
