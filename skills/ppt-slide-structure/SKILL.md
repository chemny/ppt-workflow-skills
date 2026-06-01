---
name: ppt-slide-structure
description: Use this skill after the presentation goal has been diagnosed, especially when the user needs a clear PPT structure, story flow, chapter plan, timing plan, or slide-by-slide skeleton. This skill chooses suitable thinking frameworks for the deck type, audience, goal, materials, delivery time, and desired experience, then turns them into a practical structure plan before slide copy is written.
---

# PPT Slide Structure

Use this skill to turn a diagnosed presentation goal into a clear structure strategy and slide skeleton.

For V2 project-mode runs, read `../../references/v2-architecture.md`, `../../references/source-intake.md`, and `../../references/research-brief.md`. This skill owns `01-research/research-brief.json` and `02-structure/structure-plan.json`.

This skill is not a generic outline generator. Its value is selecting and combining suitable structure frameworks for the deck's real job.

Frameworks are analysis tools, not the final product. Do not output a structure just because it matches a named framework. Use frameworks to reason about the user's goal, then produce a practical, tight, useful structure that can actually guide slide writing.

Before writing an outline, research and understand the user's topic enough to avoid basic factual or conceptual errors. Structure quality depends on topic understanding.

## Core job

Given a `Goal Diagnosis` from `ppt-goal-setting`, produce:

- a structure strategy
- selected thinking frameworks and why they fit
- chapter structure
- estimated slide count and timing
- slide-by-slide skeleton
- page rhythm for each slide: `anchor`, `dense`, or `breathing`
- evidence planning: what each slide needs to prove, what support exists, what gaps remain
- data, case, demo, interaction, or material needs
- recommended writing path: evidence-first, writing-first, or mixed
- structural risks and fixes

## What this skill does

Use this skill to:

- choose the best structure method for a PPT
- translate frameworks into a concrete structure pattern for the user's deck type
- convert goals and audience needs into a narrative flow
- estimate slide count from presentation length and content depth
- decide chapter order
- identify what each slide must accomplish
- mark where data, examples, cases, demos, or interactions are needed
- read provided reference materials and official sources enough to extract structure-shaping facts, examples, claims, and constraints
- perform lightweight topic research before outlining when the topic is unfamiliar, modern, factual, technical, product-related, industry-specific, or likely to change over time
- judge evidence dependency for the deck and each major section
- produce a reusable research brief when topic/source research affects the structure
- produce a structure plan artifact for Skill 3 instead of only a prose outline
- decide whether the next step should be evidence-first, writing-first, or mixed
- keep the deck from becoming a pile of materials
- keep frameworks from becoming abstract labels with no delivery value

## What this skill does not do

Do not:

- write polished slide copy
- design visual style
- generate PPTX files
- do exhaustive research unrelated to the structure
- write full speaker notes
- simulate Q&A

If these are needed, hand off to later skills.

## Required input

Prefer receiving `PPT Project Brief v1: Goal` from `ppt-goal-setting`.

Useful fields include:

- deck type
- real job of the deck
- target audience
- audience knowledge level
- audience familiarity with topic
- audience language preference
- audience sensitivity
- desired audience action
- main challenge
- recommended framing
- presentation length
- delivery format
- material summary
- audience concerns
- hidden success criteria
- desired experience
- constraints

If goal information is too weak, ask one clarification question or route back to `ppt-goal-setting`.

This skill should preserve useful v1 fields and add `PPT Project Brief v2: Structure` for the next workflow step.

In V2 project mode, also produce:

```text
01-research/research-brief.json
02-structure/structure-plan.md
02-structure/structure-plan.json
```

## Analysis dimensions

Before proposing the structure, analyze:

1. Task type: report, decision, teaching, sharing, launch, sales, pitch, review, proposal, workshop.
2. Audience state: what they know, care about, doubt, expect, and need next.
3. Desired action: understand, believe, decide, approve, buy, practice, share, align, or change behavior.
4. Material condition: data, cases, stories, product screenshots, user feedback, lesson notes, existing drafts.
5. Time capacity: 5, 10, 20, 30, 45, 60, 90 minutes or unknown.
6. Experience layer: serious, lively, interactive, story-driven, demo-driven, ceremonial, practical, analytical.

Audience needs have priority over reference style. A named reference style is optional context; adapt it only when it serves the audience, goal, and delivery scenario.

Audience profile should affect:

- structure depth
- explanation order
- terminology level
- interaction density
- story/case ratio
- evidence pressure
- pacing and slide count

Material condition should affect:

- whether the structure can include factual claims now
- whether the structure should reserve pages for official definitions, screenshots, data, cases, demos, or user examples
- whether writing should be evidence-first, writing-first, or mixed
- which chapters need source verification before slide copy is written
- which parts should use placeholders, examples to be generated later, or user-provided materials

## Concept Research Gate

Before choosing a structure pattern or writing an outline, understand the core concept, product, topic, or object in the user's request.

This is mandatory when the topic is:

- a modern product, model, API, tool, company, platform, or feature
- a named method, theory, policy, regulation, market, or technical concept
- anything whose name, capability, availability, or rules may have changed recently

Do not proceed to the outline until you can answer:

- What is the correct name?
- What is it primarily for?
- What are its core capabilities?
- What are its secondary capabilities?
- What is commonly misunderstood about it?
- What official or authoritative sources support this understanding?
- Which facts are still uncertain or need later verification?

For product/tool tutorials, the first structural judgment must distinguish the primary capability from secondary workflows. Do not let one secondary use case dominate the deck unless the user explicitly chose it.

Example:

- If the topic is `ChatGPT Images 2.0`, the primary capability is image generation. Editing existing images, local selection/editing, aspect-ratio control, and image management are supporting workflows. A structure that focuses mainly on "fixing generated images" is too narrow unless the user's stated goal is specifically image editing.

Name accuracy matters. If the user says an informal or slightly wrong name, normalize it in the brief and note the user-facing label to use.

Example:

- User says: "ChatGPT image two"
- Normalize to: `ChatGPT Images 2.0`
- If discussing API/model naming, verify whether `gpt-image-2` or another official model name applies before using it.

The concept research gate should produce a short internal grounding before the visible structure:

```markdown
### Concept Grounding
- Correct name:
- Primary capability:
- Secondary capabilities:
- Official sources inspected:
- Structure implications:
```

For project mode, persist this grounding in `01-research/research-brief.json`.

## Topic Research Before Outline

Do topic research before writing the structure when:

- the user names a specific product, model, API, software, company, person, policy, market, law, standard, or technical concept
- the topic may have changed recently
- the topic is outside common stable knowledge
- the deck depends on accurate definitions, capabilities, dates, data, examples, or official boundaries
- the user provided official/reference materials or asked to use them

Research depth should match the structure task:

- Read official or primary sources first.
- Extract only structure-shaping information at this stage.
- Do not perform exhaustive content writing research unless needed to choose the structure.
- Record source names/links in v2 so `ppt-slide-writing` can continue from them.

Research should answer:

- What exactly is the topic?
- What is the correct terminology?
- What are the core facts, capabilities, stages, components, or categories?
- What examples or use cases are prominent?
- What boundaries, cautions, or misconceptions matter?
- What does this imply for the PPT structure?

If reliable research cannot be completed in the current environment, do not pretend. Mark the structure as provisional and state what Skill 3 must verify before writing.

## Framework library

Choose a primary framework and one or more supporting frameworks. Do not expose framework jargon unless it helps the user understand the choice.

| Framework | Best for | Structural role |
|---|---|---|
| Pyramid Principle | executive reports, conclusion-first communication | lead with conclusion, then support it |
| SCQA | consulting-style analysis, strategy communication, problem diagnosis | situation, complication, question, answer |
| Problem-Solution | proposals, sales decks, solution introductions | move from pain to solution |
| AIDA | launches, marketing, sales presentations | attention, interest, desire, action |
| Feynman Technique | teaching, knowledge sharing, complex concepts | explain simply and concretely |
| 5E Teaching Model | classroom lessons, training | engage, explore, explain, elaborate, evaluate |
| I do / We do / You do | hands-on training, tool tutorials | demonstrate, guided practice, independent practice |
| Before-After-Bridge | transformation, product value, change narratives | current state, better future, bridge |
| Hero's Journey | brand stories, launch keynotes, emotional presentations | create story and emotional arc |
| Jobs To Be Done | product launches, user insight, customer proposals | explain product through user tasks |
| Demo-driven Structure | product demos, tool training | use demos as the main proof path |
| Case-based Structure | case studies, best practices, retrospectives | use cases to carry insight |
| Review-Retrospective | work reports, quarterly reviews, project retrospectives | goals, results, actions, problems, next plan |
| Decision Briefing | leadership decisions, budget requests, resource requests | conclusion, basis, options, risks, ask |
| Strategy Roadmap | annual planning, strategic plans | direction, priorities, roadmap, resources |
| Workshop Flow | interactive sharing, group discussions | input, discussion, practice, co-creation, summary |
| Product Launch | product release and keynote presentations | pain, reveal, demo, proof, action |
| Product Capability Tutorial | AI tools, software features, new platform capability sharing | what it is, why it matters, strengths, how to use, examples, limits, next actions |

## Framework selection rules

- Work report: usually `Review-Retrospective` + `Pyramid Principle`; add `Decision Briefing` if resources or approval are needed.
- Leadership decision: usually `Pyramid Principle` + `Decision Briefing` + risk control.
- Teaching deck: usually `5E Teaching Model` + `Feynman Technique`; add `I do / We do / You do` for practice.
- Knowledge sharing: usually `SCQA` or `Feynman Technique` + `Case-based Structure`.
- AI tool / product capability sharing: usually `Product Capability Tutorial` + `Demo-driven Structure` + `Feynman Technique`; add `I do / We do / You do` only after the audience understands what the tool is and why it matters.
- Product launch: usually `Product Launch` + `AIDA` + `Jobs To Be Done`; add `Demo-driven Structure` if product experience matters.
- Sales/proposal: usually `Problem-Solution` + `Jobs To Be Done` + proof/case structure.
- Pitch deck: usually `Problem-Solution` + market proof + traction + ask.
- Workshop: usually `Workshop Flow` + interaction design.

These are defaults, not rules. Adapt when the user's goal, audience, materials, or experience preference suggests a better structure.

## Structure Pattern Library

After selecting analytical frameworks, convert them into a concrete structure pattern. The user should receive a practical deck structure, not framework jargon.

First classify the deck into a common PPT scenario, then choose or adapt the matching structure pattern. This scenario library is the main practical backbone of Skill 2.

### Core PPT Scenario Library

Use this list as the default mental checklist before creating any structure:

| Scenario | Best for | Default practical arc |
|---|---|---|
| `work-report` | weekly/monthly/quarterly/annual reports, department or project summaries | goals/context -> result overview -> key achievements -> gap/problem -> cause analysis -> next plan -> support needed |
| `decision-briefing` | asking leaders for budget, resources, direction, approval, or tradeoff decisions | conclusion/request -> background/problem -> options -> recommendation -> evidence -> risks -> decision needed |
| `project-update` | milestone updates, project sync, progress/risk reporting | project goal -> current status -> completed work -> progress vs plan -> risks/blockers -> next steps -> decisions/support |
| `business-review` | growth, campaign, operations, sales, or activity retrospectives | target vs result -> performance data -> what worked -> what missed -> root causes -> lessons -> next optimization |
| `strategy-plan` | annual planning, business strategy, department roadmap | external change -> internal reality -> strategic judgment -> goals -> key initiatives -> roadmap -> resources/risks |
| `new-product-launch` | new product launch, new feature announcement, launch keynote | pain/trend -> product reveal -> core value -> feature highlights -> demo/scenarios -> proof/backing -> call to action |
| `product-introduction` | internal product training, customer product intro, product capability explanation | user problem -> product positioning -> core capabilities -> usage scenarios -> workflow -> cases -> limits/next step |
| `tool-tutorial-foundation` | beginner tool tutorials, onboarding, AI tool intro | pain/problem -> what it is -> why use it -> core functions -> first successful use -> common scenarios -> practice -> cautions -> summary |
| `tool-tutorial-advanced` | advanced tool training, optimization, skill improvement | pain/problem -> why current attempts fail -> success standard -> capability boundary -> method framework -> diagnostic checklist -> case walkthroughs -> guided practice -> risk/limits -> action plan |
| `classroom-teaching` | school lessons, courseware, textbook lesson, academic teaching | situation/hook -> learning goals -> prior knowledge -> new concept -> examples/exercises -> interaction -> summary -> homework/extension |
| `knowledge-sharing` | topic sharing, method sharing, trend sharing, public talk | hook/problem/phenomenon -> core viewpoint -> concept explanation -> case/proof -> method extraction -> implications -> takeaway/action |
| `special-topic-lecture` | expert lecture, external seminar, thematic training | topic background -> key question -> systematic explanation -> typical cases -> method/trend -> audience implication -> summary |
| `training-workshop` | interactive training, workshop, co-creation, bootcamp | goal/context -> problem activation -> method input -> group/individual practice -> sharing/feedback -> recap -> action plan |
| `sales-proposal` | customer proposal, commercial pitch, consulting proposal | customer pain -> desired outcome -> solution logic -> implementation path -> proof/case -> ROI/risk control -> next cooperation step |
| `fundraising-roadshow` | investor pitch, startup BP, fundraising roadshow | problem -> solution -> market opportunity -> product/technology -> business model -> traction -> team -> funding ask |
| `research-report` | industry research, market analysis, competitor analysis, insight report | research question -> executive conclusion -> analysis framework -> evidence/data -> key insights -> opportunities/risks -> recommendations |
| `solution-review` | technical/design/product solution review | background/objective -> constraints -> solution design -> key tradeoffs -> risk assessment -> review questions -> decision points |

### Pattern Adaptation Rules

- Start from the closest scenario pattern. Do not invent a new structure when a common pattern fits.
- If the user's goal is more specific than the scenario, adapt the pattern around that goal.
- If a deck mixes scenarios, choose one primary scenario and borrow only necessary modules from secondary scenarios.
- The structure should be recognizable for the scenario but not rigid. Remove sections that do not serve the user's goal.
- For teaching or training, decide whether the user needs foundation, advanced skill improvement, classroom teaching, or workshop practice. These produce different structures.
- For business/reporting decks, decide whether the audience needs information, confidence, alignment, or a decision. These produce different structures.
- For product decks, decide whether the task is introduction, launch, training, or sales. These produce different structures.

Pattern selection rules:

- If the deck teaches a tool to new users, start from `tool-tutorial-foundation`.
- If the deck aims to improve quality, judgment, iteration, or expert use, start from `tool-tutorial-advanced`.
- If the deck mainly explains a new product capability without deep practice, use `product-introduction`.
- If the deck announces or markets a new product, use `new-product-launch`.
- If the deck teaches a school subject or textbook lesson, use `classroom-teaching`.
- If the deck shares a method, concept, trend, or personal insight, use `knowledge-sharing`.
- If the deck asks a customer or partner to accept a solution, use `sales-proposal`.
- If the deck asks a leader to decide, approve, or allocate resources, use `decision-briefing`.
- If the deck summarizes work and future plans, use `work-report` or `business-review`.
- If the user goal mixes patterns, choose one primary pattern and borrow only the needed modules from another pattern.

The final chapter plan must be a practical adaptation of the pattern. Do not list every possible module if it weakens the goal or pace.

## Pattern Landing Rules

For every selected pattern, make it land:

- State the chosen practical pattern in plain language.
- Explain why this pattern fits the user's goal.
- Show the audience journey from opening problem to final action.
- Make each section answer one concrete question.
- Remove sections that do not directly serve the goal.
- Increase depth where the user's goal requires skill improvement, judgment, diagnosis, or decision-making.
- Keep the rhythm tight: problem, method, proof/example, practice, and summary should connect.
- Allocate more structure capacity to the user's real value zone. Do not distribute time evenly across intro, concepts, methods, cases, and summary.

A weak structure lists topics. A strong structure creates momentum.

Weak:

```text
产品介绍 -> 功能介绍 -> 提示词 -> 案例 -> 注意事项 -> 总结
```

Stronger for an advanced AI image tutorial:

```text
为什么你生成的图不好
-> 好图的判断标准是什么
-> ChatGPT Images 能帮你改什么、不能改什么
-> 如何把需求写成可控提示词
-> 如何诊断结果问题
-> 如何通过多轮修改优化画面
-> 多场景案例实操
-> 风险边界和练习路径
```

## Practical Training Capacity Rules

For tool tutorials, hands-on training, classroom exercises, and practical courses, the structure should favor doing over explaining.

Default principle:

```text
short concept setup -> dense method framework -> heavy case/practice/application -> concise risk/summary
```

For a 45-60 minute practical tool course:

| Module | Recommended share | Purpose |
|---|---:|---|
| Context / concept setup | 10-15% | clarify what the tool/topic is and why it matters |
| Method framework | 25-30% | teach the reusable thinking and operation method |
| Cases / demos / practice | 40-45% | make the method usable through concrete tasks |
| Risk / summary / next action | 10-15% | avoid misuse and guide continued practice |

For beginner courses, concept setup can be slightly higher, but should still be tied to immediate use.

For advanced practical courses, reduce product introduction and increase:

- failure diagnosis
- before/after comparison
- case walkthrough
- guided practice
- user scenario transfer
- review and correction
- scenario case variety based on the tool's real use cases

When the user wants a practical, useful, or hands-on PPT, avoid long standalone concept sections. Compress "what it is" and "why it matters" into a focused setup, then move quickly into methods and application.

Do not hard-code the number of cases. Decide case count and case types from:

- presentation length
- audience level
- product/tool capability breadth
- official examples and user-provided examples
- common life/work scenarios for the target audience
- how much time each case needs to be taught clearly
- whether cases should be deep walkthroughs, quick examples, or practice prompts

Default case selection priority, unless the user specifies otherwise:

1. High-frequency scenarios for the target audience
2. General usefulness across many users
3. Ability to showcase the product/tool's core strengths
4. Learning value: the case teaches transferable method, not just a one-off trick
5. Fit with available materials, official examples, or user-provided cases

Deep walkthrough cases should usually come from the top of this priority list. Niche, personal, or audience-specific cases can appear as quick examples, optional variants, or practice prompts unless the user explicitly asks to focus on them.

For a 45-60 minute practical product/tool session, use a case portfolio:

- `deep walkthrough cases`: 1-3 cases taught end to end
- `quick scenario examples`: several short examples to show breadth
- `practice cases`: 1-2 audience tasks when interaction is needed

Do not write "three cases" by default. Write "case portfolio" or "scenario case set", then specify why the count fits the time and product.

For AI image generation sessions, consider common audience scenarios such as:

- PPT illustration
- article or newsletter cover
- social media post image
- course/teaching illustration
- event poster or invitation
- product concept image
- character or scene exploration
- workflow/process diagram inspiration
- personal life image ideas such as travel plan, room decoration, gift card, profile/avatar, invitation, or family activity visuals
- image editing or enhancement from an uploaded image

Choose the final case mix based on the user's audience and goal. Avoid overfitting to the assistant's own work scenarios.

## Product Capability Tutorial Pattern

Use this pattern when the deck introduces a tool, AI capability, software feature, or platform update and the audience needs both understanding and hands-on ability.

Do not jump directly into prompts, workflows, or exercises. First establish the product/capability itself.

Default arc:

1. What it is: define the capability in plain language.
2. Why now / why use it: explain the problem it solves and why it matters to this audience.
3. Core advantages: show what is different or better than the old way.
4. Capability map: what it can do and what it cannot do.
5. How to start: entry points, prerequisites, first operation.
6. Core workflow: the repeatable steps.
7. Prompt / operation method: templates, commands, editing methods, iteration.
8. Cases and demos: show concrete before/after or task examples.
9. Limits and risks: accuracy, copyright, UI changes, availability, sensitive use.
10. Summary and action: what to try next.

For an AI product or OpenAI feature, explicitly plan an official-doc reference layer:

- official definition or feature description
- availability or platform constraints
- key operations supported
- limits or policy-sensitive areas
- verification date to be checked in later skills

The structure should make the audience want to continue: each section should answer one question and create the next question.

## Experience layer

Translate emotional or interaction preferences into structure.

Examples:

- "lively" -> use story, question, contrast, cases, or short activities.
- "more interaction" -> add interaction points every 8-15 minutes depending on length.
- "professional and concise" -> reduce warm-up, lead with conclusions, use fewer chapters.
- "ceremonial launch" -> build reveal, demo, proof, and action moments.
- "classroom teaching" -> add engage, explore, practice, and evaluation moments.

These preferences may be captured in goal-setting, but this skill must turn them into structural choices.

## Time and slide count

Treat presentation length as the main capacity constraint.

Slide count is flexible unless fixed by the user. Estimate it from:

- delivery time
- audience type
- complexity
- interaction needs
- data/chart density
- demo or practice time

Use these rough ranges carefully:

- 5 minutes: 3-5 slides
- 10 minutes: 6-8 slides
- 20 minutes: 10-15 slides
- 30 minutes: 14-22 slides
- 45 minutes: 20-35 slides
- 60 minutes: 28-45 slides
- 90 minutes: 40+ slides, often with activities or modules

If the user gives a fixed slide limit that conflicts with time or content depth, flag the conflict and propose a fix such as appendix slides, shorter coverage, or fewer examples.

## Evidence planning

Evidence planning belongs in this skill because each slide's structure determines what must be proven.

Do not perform exhaustive research here. But if the user provides reference materials, websites, official docs, screenshots, or source links, read them carefully enough to understand what should shape the structure. If the topic involves a modern product, API, regulation, market, or other time-sensitive facts and official sources are necessary for structure, inspect the relevant official sources before finalizing v2.

Then:

- judge how evidence-dependent the deck is
- mark which slides need support
- identify what type of support is needed
- map existing materials to slides
- flag evidence gaps
- decide whether writing can begin or evidence must be gathered first

Evidence dependency levels:

- `high`: leadership decisions, budget requests, business reviews, strategy, proposals, market claims, investor/pitch decks.
- `medium`: product launches, training with factual claims, knowledge sharing, project updates, case studies.
- `low`: personal stories, light internal sharing, creative talks, drafts where evidence can be checked later.

Recommended writing paths:

- `evidence-first`: use when core claims must be proven before wording is safe.
- `writing-first`: use when the deck is mainly teaching, storytelling, or already has enough source material.
- `mixed`: use when some sections need evidence first but others can be drafted immediately.

The next skill should usually be `ppt-slide-writing`. If evidence dependency is high, tell `ppt-slide-writing` which slides must not be written as strong claims until support is available.

## Reference and Material Integration

Skill 2 must explicitly carry forward the reference/material information from Skill 1. Do not let user-provided websites, official docs, old PPTs, screenshots, examples, or brand guidelines disappear between v1 and v2.

Skill 2 should not merely tell the user how materials will be used. It must read the relevant materials and incorporate them into the structure.

Before building the slide skeleton:

1. Read v1 `Materials`, `Reference source strategy`, `Missing materials`, and any user-provided links/files.
2. Classify materials:
   - `official-reference`: official websites, docs, product pages, policy pages, help center
   - `user-material`: old PPTs, notes, documents, screenshots, generated examples, datasets
   - `style-reference`: reference decks, brand guidelines, design examples
   - `case-material`: customer cases, personal examples, failed attempts, before/after materials
   - `data-source`: spreadsheets, market data, business metrics, research reports
3. Extract structure-shaping information:
   - official definitions, product positioning, and terminology
   - capability boundaries and usage constraints
   - feature groups or workflow steps that should become chapters or slides
   - examples, screenshots, cases, or failure modes that should become hooks, demos, or practice sections
   - claims that need evidence before they can be used as section conclusions
   - user-specific context that should change the default scenario pattern
4. Use the extracted information to adapt the structure:
   - add, remove, merge, or reorder sections when the material suggests a better path
   - replace generic chapters with material-specific chapters
   - make official capability boundaries visible in the structure
   - create case/demo/practice slots from real materials instead of abstract placeholders
   - keep source-sensitive claims cautious until verified
5. Map each material type to the structure:
   - official references -> definition, capability, boundary, risk, source-check slides
   - screenshots -> demo, callout, workflow, before/after slides
   - cases -> hook, proof, case walkthrough, practice slides
   - data -> evidence, chart, conclusion, decision slides
   - style references -> design direction note for later skills, not structure decoration
6. If materials are missing but structurally important, mark the exact slide or section that depends on them.
7. If official references are required, state which sections must be verified before Skill 3 writes strong copy.

For modern products, tools, APIs, market data, regulations, or time-sensitive claims, v2 must include official sources already inspected when possible. If source retrieval is unavailable or too broad for this step, include an `Official references to consult` list and state which structure decisions are provisional.

Do not use "reference needed" generically. Say what kind of reference is needed and why it affects the structure.

## Process

1. Read the Goal Diagnosis and Material Summary.
2. Identify the deck's real structural task.
3. Carry forward, classify, and read reference/material inputs from v1.
4. Run topic research before outlining when the topic requires it.
5. Produce concept grounding: correct name, primary capability/topic meaning, secondary capabilities, misconceptions, sources, and structure implications.
6. Extract structure-shaping facts, examples, constraints, and gaps from the materials/research.
7. Analyze audience path, persuasion/teaching path, materials, time, and desired experience.
8. Select a primary framework and supporting frameworks.
9. Convert frameworks into a practical structure pattern.
10. Adapt the pattern based on topic/material insights.
11. Explain why the pattern fits better than a loose topic outline.
12. Estimate slide count and time allocation.
13. Build chapter structure with tight section-to-section progression.
14. Build slide skeleton.
15. Judge evidence dependency and recommended writing path.
16. Mark support needs: data, case, story, quote, demo, interaction, chart, screenshot, exercise.
17. Map existing materials to slides and flag gaps.
18. Identify structural risks and fixes.
19. In `standard` and `deep` workflow modes, ask for a concise structure confirmation before handing off to `ppt-slide-writing`.
20. In `fast` mode, hand off to `ppt-slide-writing` without waiting, unless the structure has high-risk uncertainty.

## Confirmation Gate

This is a default confirmation gate in `standard` and `deep` modes.

After outputting v2, ask the user to confirm only the structure-level decisions:

- narrative route
- chapter order
- estimated slide count and timing
- page sequence and core messages
- major examples/demos/interactions

Do not ask the user to approve detailed copy or visual design here; those belong to later steps.

If the user confirms with phrases such as "对", "可以", "没问题", "继续", "按这个来", or equivalent, immediately proceed to `ppt-slide-writing`. Do not ask another confirmation question.

If the user is in `fast` mode or explicitly asks to continue automatically, mark the structure as accepted for drafting and proceed.

## Output format

```markdown
## PPT Project Brief v2: Structure

### Concept Grounding
- Correct name:
- User-facing label:
- Primary capability:
- Secondary capabilities:
- Common misunderstanding to avoid:
- Official sources inspected:
- Structure implications:

### Project
- Topic:
- Deck type:
- Real job:
- Desired audience action:
- Main challenge:
- Recommended framing:

### Audience
- Target audience:
- Audience concerns:
- Audience decision logic:
- Audience knowledge level:
- Audience familiarity with topic:
- Audience language preference:
- Audience sensitivity:

### Delivery
- Delivery format:
- Presentation length:
- Slide count status:
- Slide count constraint:
- Need speaker notes:
- Need Q&A:

### Materials
- Materials provided:
- Material classification:
- Materials read / inspected:
- Key facts extracted:
- Key examples or cases extracted:
- Capability / boundary notes extracted:
- Structure changes caused by materials:
- Useful facts:
- Existing data:
- Existing claims:
- Reusable content:
- Missing materials:
- Official references to consult:
- How materials affect the structure:

## Structure Strategy
- Primary framework:
- Supporting frameworks:
- Practical structure pattern:
- Experience layer:
- Why this combination fits:
- Why this pattern fits the user's goal:
- What this means for the deck:
- Narrative arc:
- Tightness principle:

## Capacity Plan
- Presentation length:
- Estimated slide count:
- Slide count status: fixed / flexible / conflict
- Timing principle:

## Chapter Structure
| Section | Purpose | Key question answered | Suggested slides | Time |
|---|---|---|---:|---:|

## Section Progression
| From | To | Why this transition is necessary |
|---|---|---|

## Audience Curiosity Path
| Section | Audience question created | How the next section answers it |
|---|---|---|

## Slide Skeleton
| Slide | Working title | Function | Core message | Page rhythm | Support needed |
|---:|---|---|---|---|---|

## Evidence Planning
- Evidence dependency: high / medium / low
- Recommended writing path: evidence-first / writing-first / mixed
- Why:
- Claims that need caution before evidence is available:

## Reference / Material Mapping
| Material or reference | Type | Used in section/slide | Why it matters | Gap / action for next skill |
|---|---|---|---|---|

## Interaction / Experience Design
- Opening:
- Interaction points:
- Story/case points:
- Demo/practice points:
- Emotional pacing:

## Data and Material Needs
| Slide/Section | Core message | Evidence or material needed | Existing material | Gap | Priority |
|---|---|---|---|---|---|

## Structure Risks
| Risk | Why it matters | Fix |
|---|---|---|

## Handoff
- Next recommended skill: ppt-slide-writing
- What the next skill should use:
- V2 artifacts:
  - `01-research/research-brief.json`
  - `02-structure/structure-plan.json`
- Slides to write first:
- Slides that need evidence caution:
- Open questions:
```

The `PPT Project Brief v2: Structure` heading is required for handoff. Carry forward only v1 fields that are useful for writing; do not bloat the brief with irrelevant conversation.

## Quality bar

A good structure should feel selected, not generated.

The user should understand:

- why this structure fits this PPT
- what each section is supposed to accomplish
- how time and slide count were estimated
- where data, examples, demos, or interactions are needed
- whether writing should start now or wait for key evidence
- what to do next

Avoid generic structures such as "background, current state, solution, summary" unless you explain why that structure is appropriate and adapt it to the user's goal.
