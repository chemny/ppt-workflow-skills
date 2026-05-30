# 08 Presentation Practice

Use this workflow to simulate live presentation questions and prepare strong answers.

## When to use

Use when the user wants to rehearse, practice, simulate Q&A, prepare for leadership questions, investor questions, customer objections, defense questions, or meeting pushback.

## Inputs

- PPT file or slide content.
- Audience role.
- Presentation goal.
- Time limit.
- Question intensity: mild, normal, sharp.
- User's role and constraints.

## Process

1. Identify what each audience role cares about.
2. Extract risky claims, weak assumptions, and likely objections.
3. Generate slide-level questions.
4. Prepare direct answers first.
5. Add high-EQ wording for sensitive situations.
6. Add fallback answers when data is missing.
7. Identify slides that need strengthening before delivery.

## Output format

```markdown
## Presentation Practice
### Audience Role
- Role:
- Likely concerns:
- Question intensity:

### Slide-level Q&A
| Slide | Likely question | Suggested answer | Fallback answer | Need to strengthen? |
|---:|---|---|---|---|

### Opening and Closing
- Opening line:
- Closing line:

### Risk Notes
- [Risk and preparation advice]
```

## Handoff

If practice exposes weak evidence, route to `data-research`. If it exposes unclear logic, route to `slide-structure` or `slide-writing`.

