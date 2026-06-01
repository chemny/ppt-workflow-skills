# Speaker Script

Skill 6 should support speaker scripts, but it should not default to a full word-for-word script for every deck.

## Script Modes

| Mode | Use when | Output |
|---|---|---|
| `none` | user only needs the PPTX | no script |
| `speaker_cards` | default for most presentations | slide objective, key sentence, talking points, transition, caution |
| `outline_script` | teaching, sharing, launch, or guided presentation | section-level spoken draft and transitions |
| `full_script` | formal speech, recording, new presenter, press/demo event | complete word-for-word script |

Default mode is `speaker_cards`.

Generate `outline_script` or `full_script` when the user asks for:

- 演讲稿
- 逐字稿
- 主持稿
- 讲稿
- 录课稿
- 发言稿
- "I need a script"
- "write out what I should say"

## Output Files

```text
projects/<deck-slug>/07-practice/
├── practice-report.md
├── speaker-cards.md
├── outline-script.md
└── full-script.md
```

Create only the files matching the requested mode.

## Script Structure

For `outline_script`, include:

- opening script
- section transition script
- slide-by-slide talking points
- closing script
- compressed version

For `full_script`, include:

- exact opening
- spoken paragraph per slide
- transition between slides
- planned audience interactions
- closing and call to action
- optional 10-minute and 3-minute compression

## Quality Rules

- Spoken language should match the user's scenario.
- Do not turn every visible bullet into a sentence mechanically.
- Explain what is not on the slide only when it helps the audience.
- Keep speaker cards concise enough to rehearse from.
- Full scripts should be generated in sections for long decks unless the user asks for the whole script.
- Avoid fake certainty around unverified claims; use source and risk notes from final review.

