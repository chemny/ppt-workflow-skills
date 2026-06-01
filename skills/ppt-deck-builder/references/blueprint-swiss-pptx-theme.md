# Blueprint Swiss PPTX Theme

This is the PPTGenJS-native implementation guide for a blueprint-style Swiss International Style deck. It does not generate HTML and does not convert HTML to PPTX. It recreates the static visual system directly with editable PPT objects.

## Scope

The goal is to replicate the design system, not the browser stack.

PPTGenJS can replicate:

- strict registered layouts
- typography hierarchy
- IKB / single-accent color system
- dot/cross matrix motifs
- hairline separators
- native editable cards, labels, KPI, timelines, comparison, and image slots
- proportional image cover/crop
- slide transitions and manual advance settings

PPTGenJS cannot fully replicate:

- WebGL backgrounds
- Motion One timing nuance
- browser-native horizontal swipe interactions
- live CSS responsive behavior

## Theme Tokens

Default accent is IKB.

| Token | Value | Use |
|---|---|---|
| paper | `#FAFAF8` | main background |
| ink | `#0A0A0A` | main text |
| grey-1 | `#F0F0EE` | neutral block |
| grey-2 | `#D4D4D2` | hairline |
| grey-3 | `#737373` | helper text |
| accent | `#002FA7` | IKB anchor |
| accent-on | `#FFFFFF` | text on accent |

Rules:

- Use one accent color per deck.
- Do not use gradients, shadows, rounded cards, or mixed accent colors.
- Keep shapes rectangular, flat, and opaque.
- Use near-white and near-black, not pure white/black when possible.

## Typography

- Chinese and body fallback: `Hiragino Sans GB` for stable macOS/LibreOffice preview. If unavailable, use the closest platform CJK sans-serif such as `PingFang SC`, `Microsoft YaHei`, or `Noto Sans CJK SC`.
- If available in the host environment, prefer Inter / Helvetica Neue for Latin text.
- Large text should be light, not heavy.
- Small text should be heavier enough to remain readable.

| Text type | PPTX default |
|---|---:|
| Cover title | 52-58 pt, regular/light |
| Body slide title | 28-34 pt, regular/light, one line only |
| Statement title | 38-44 pt, regular/light |
| KPI number | 38-48 pt, regular/light |
| Card title | 16-20 pt, semibold |
| Body text | 11-14 pt |
| Meta / kicker | 7-9 pt, bold, uppercase, char spacing |

## PPTX Calibration Tokens

Use these proportions unless a specific registered layout states otherwise:

- Body page left axis: `x = 0.72in`.
- Kicker: `y = 0.42in`, `8pt`, bold uppercase, slight character spacing.
- Body title: `y = 0.78in`, `28-34pt`, light/regular, left aligned, one line only.
- Subtitle: `y = 1.68in`, `13-14pt`, muted.
- Main content top: around `2.26in`.
- Source note: around `7.03in`, small but readable.
- Body slides should keep visible air between title/subtitle and content; do not pull grids up to fill space.
- Small explanatory text should generally stay above `10pt`; prefer shorter copy over shrinking type.
- Cover pages may use deliberate two-line typography. Body pages must not wrap titles; rewrite long titles and move detail into subtitle/body copy.

## Registered Layouts

The PPTGenJS-native renderer supports all 22 registered Swiss layouts. Use these IDs directly in `registeredLayout`; do not invent unregistered page structures.

| ID | Layout | PPTX implementation |
|---|---|---|
| `BP01` | Cover | full IKB background, dot/plus matrix, large two-line title, no page number |
| `BP02` | Vertical Timeline + KPI | left vertical timeline plus right KPI/stat block |
| `BP03` | Split Statement | half black/half grey, large statement left, explanation right |
| `BP04` | Six Cells | 3x2 cells, hairline top rules, square badges |
| `BP05` | Three Layers | three stepped rectangular layers |
| `BP06` | KPI Tower | uneven-height KPI tower with title/explanation split |
| `BP07` | Horizontal Bar | horizontal bar chart/list for real ranked values |
| `BP08` | Duo Compare | two columns, center divider, before/after or choice comparison |
| `BP09` | KPI Statement | left-aligned title axis plus optional KPI row; no decorative dot matrix on content slides |
| `BP10` | Split Closing | split closing statement plus right-side takeaways |
| `BP11` | Horizontal Timeline | horizontal timeline axis with sequenced milestones |
| `BP12` | Manifesto + Ink Banner | large manifesto statement plus bottom ink banner |
| `BP13` | Three Forces | left black statement block, right three evidence rows |
| `BP14` | Loop Form | left four-step list plus right geometric loop |
| `BP15` | Matrix + Hero Stat | 6x2 matrix plus large hero statistic |
| `BP16` | Multi-card Brief | compact 3x2 brief cards, supports multi-image grid adaptation |
| `BP17` | System Diagram | central system node plus connected outer modules |
| `BP18` | Why Now | three-column urgency reasoning plus bottom hero statement |
| `BP19` | Four Cards | four equal strict cards with top line and square badge |
| `BP20` | Stacked KPI Ledger | vertical ledger-style KPI rows |
| `BP21` | Tech Spec Sheet | three KPI specs plus right-side matrix mark and bottom note |
| `BP22` | Image Hero | wide product/evidence image strip, bottom compact KPI cards |

Fallback rule for malformed input:

- If an unsupported `Sxx` has a visual asset, render as `BP22`.
- If it has 1-2 items, render as `BP08`.
- If it has 3 items, render as `BP13`.
- Otherwise render as `BP19`.

## Mapping From Existing Workflow Page Types

| Page type | Default Blueprint Swiss layout |
|---|---|
| `cover` | `BP01` |
| `section-divider` | `BP03` or `BP09` |
| `learning-objectives` | `BP19` |
| `capability-map` | `BP13` |
| `concept-explain` with strong visual | `BP22` |
| `concept-explain` without visual | `BP13` or `BP09` |
| `checklist` / `risk-warning` | `BP04` |
| `comparison` / `before-after` | `BP08` |
| `summary` / `qa-closing` | `BP03`, `BP09`, or `BP13` |

## Image Rules

- Single strong product/evidence image uses `BP22`.
- Image slot is decided before generation or insertion.
- Product photos use proportional cover/crop, never stretch.
- Screenshots or text-dense graphics may use contain behavior.
- Do not add decorative image frames unless the image edge is unreadable.
- Do not put a tiny caption directly under a hero image by default; use source notes.

## Validation Checklist

- Every slide has a `registeredLayout` beginning with `BP`.
- Cover has no page number.
- Body title is left aligned.
- Body title is one line and concise.
- No rounded cards.
- No gradients or shadows.
- No arbitrary unregistered layout.
- Photos are not stretched.
- There is no top-right decorative page counter unless explicitly part of a future registered layout.
- PPTX supports manual click/keyboard advance.
