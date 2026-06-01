---
name: ppt-goal-setting
description: Use this skill whenever the user wants to start a PPT, PowerPoint, slide deck, report deck, proposal, pitch deck, training deck, course deck, or business presentation and needs help clarifying what the deck should achieve. This skill is not a questionnaire: it starts from the user's natural description and any uploaded materials, diagnoses the real job of the deck, asks one high-impact follow-up question at a time, and produces a Goal Diagnosis that prepares the next PPT workflow step.
---

# PPT Goal Setting

Use this skill before creating a slide structure, writing slide copy, designing visuals, or generating a PPTX.

For V2 project-mode runs, read `../../references/v2-architecture.md` and `../../references/source-intake.md` before handling source-heavy inputs. V2 keeps the same user-facing skill, but the preferred artifacts are `00-intake/user-brief.md`, `00-intake/source-index.json`, `00-intake/source-summary.md`, and `00-intake/citations.json`.

The goal is to help the user move from "I want to make a PPT about X" to a clear presentation direction:

- what the deck is really for
- who it is for
- what decision, action, understanding, or behavior it should create
- what intent sits behind the user's stated request
- what the user wants to do and what broad outcome they want to reach
- what constraints and materials already exist
- which source materials should be registered for later structure, copy, design, and review
- what the next PPT workflow step should use

This skill is a thinking partner, not a form.

The interaction should feel like a guided conversation, not data collection. Ask questions by giving the user meaningful choices and inviting them to explain in their own words. The goal is to help the user reveal intent, priorities, examples, and constraints through natural description.

## Core principle

Start from the user's own description. Do not begin with a fixed questionnaire.

The workflow is:

```text
user describes the PPT
-> inspect any provided materials
-> register source material when project mode is useful
-> reflect your understanding
-> diagnose the real job of the deck
-> identify the most important missing decision
-> ask one question
-> update the diagnosis
-> summarize the aligned understanding
-> ask the user to confirm or correct it
-> stop when there is enough direction for slide structure
```

## What this skill does

Use this skill to:

- interpret a vague PPT request
- infer the likely deck type
- diagnose the real job of the deck
- clarify the user's intent without prematurely quantifying it
- identify the audience's decision logic
- build an audience profile that guides language depth and explanation style
- surface hidden success criteria
- extract useful context from early materials
- create or update the source package for project-mode workflows
- proactively ask for reference materials, official websites, prior decks, screenshots, documents, or links that can improve the deck
- guide the user one step at a time
- use choice-based prompts that help the user express their thinking instead of answering a rigid form
- prepare a clear brief for `ppt-slide-structure`

## What this skill does not do

Do not:

- write a full slide outline
- generate page-by-page content
- design visual style
- generate PPTX files
- perform deep web research
- simulate presentation Q&A
- ask a long list of questions at once
- quantify the user's learning target, slide count, example count, practice count, or iteration count unless the user already stated those constraints

If the user asks for those tasks, complete goal-setting first, then recommend the relevant next skill.

## Inputs to consider

The user may provide:

- a short natural-language request
- pasted notes
- meeting requirements
- leader/client instructions
- existing PPT files
- Word/PDF documents
- spreadsheets or data tables
- brand or company requirements
- links or reference materials
- rough ideas, bullet points, or screenshots

If files or long materials are provided, inspect or summarize them before diagnosing. Extract only what matters for goal-setting; leave deep analysis for later skills.

For project-mode decks, do not leave files as loose chat context. Register them according to `../../references/source-intake.md`.

Minimum source package:

```text
00-intake/
├── user-brief.md
├── source-index.json
├── source-summary.md
└── citations.json
```

## Progressive diagnosis rules

1. First reflect the user's request in your own words.
2. Infer the likely deck type, but mark it as tentative if uncertain.
3. Diagnose the real job of the deck, not just the topic.
4. If materials are provided, register them in the source package and extract useful facts, constraints, claims, numbers, and reusable context.
5. Proactively remind the user that reference materials can materially improve the PPT, even if they have not mentioned any. Ask for official websites, reference links, old PPTs, documents, screenshots, brand guidelines, data files, or example cases when they would help the deck.
6. Check whether the desired outcome is concrete enough. If the user says only "介绍一下", "分享一下", "讲清楚", "教他们使用", or another broad goal, translate it into 2-4 possible audience outcomes and ask the user to confirm or choose.
7. If the user mentions multiple possible uses, ask which use case should be prioritized before creating the Goal Diagnosis.
8. Ask only one follow-up question at a time.
9. Ask the question that most changes the direction of the deck.
10. After the user answers, update the diagnosis instead of restarting.
11. When enough information is gathered, summarize the aligned understanding and ask the user to confirm or correct it before recommending `ppt-slide-structure`.
12. Only output a handoff-ready v1 brief after the user confirms or after they explicitly ask to continue with stated assumptions.
13. If the user wants speed, produce a "good enough" diagnosis and list open assumptions, but still show what assumptions will be carried forward.

## Conversational Questioning Style

Do not interrogate the user with bare information requests such as:

- "目标是什么？"
- "受众是谁？"
- "风格是什么？"
- "有没有资料？"

Instead, ask consultative questions that give the user useful choices and room to elaborate. Use this pattern:

```text
brief diagnosis -> 2-4 likely options -> recommended/default option if appropriate -> invite user to choose or describe their own version
```

Good question:

```markdown
你这个主题更像是一个教学型分享，但教学目标可以分几种。如果是给 AI 学习者听，我会优先考虑这三种方向：

1. 认知型：让大家知道 ChatGPT Images 能做什么，适合哪些场景。
2. 上手型：让大家掌握基础提示词写法，并能完成入门级生成任务。
3. 工作流型：让大家能把它用到公众号配图、PPT 配图、海报草图等真实任务里。

我建议优先按“上手型 + 工作流型”来做。你更希望这次分享偏哪一种？也可以直接说你的真实想法。
```

Bad question:

```markdown
你的分享目标是什么？
```

When asking about reference materials, also use choice-based prompting:

```markdown
这类 PPT 如果有资料，质量会提升很多。你现在手头有没有下面几类材料？

1. 官方资料：官网、官方文档、产品说明。
2. 教学材料：你以前写过的文章、课程笔记、提示词案例。
3. 视觉材料：截图、生成效果图、参考 PPT 或喜欢的风格。

有哪一类就先发哪一类；如果暂时没有，我会先按“官方资料优先核验”的方式继续。
```

The user should feel helped to think, not forced to fill fields.

Your reflection should include judgment. Do not merely repeat the user's words; explain what their request implies for the deck's purpose or direction.

Treat presentation length as a key constraint. Treat slide count as flexible unless the user states a fixed requirement. Do not force the user to decide the slide count during goal-setting. Let `ppt-slide-structure` estimate slide count from time, audience, content depth, and delivery format.

Audience is the primary driver of content depth, language style, examples, and explanation method. Reference style is optional and secondary. If the user names a reference style or person, record it, but do not let it override audience needs.

Do not predefine the number of examples, practice tasks, generated images, or iteration rounds in goal-setting unless the user explicitly states it. For teaching decks, Skill 1 should define the capability target; `ppt-slide-structure` should later decide the teaching path, example count, practice count, and iteration depth based on tool difficulty, audience level, time, and desired learning outcome.

## High-impact question priority

When information is missing, ask the first unanswered question from this priority list that would materially change the deck:

1. Who is the audience?
2. What should the audience do, decide, believe, understand, or practice after the presentation? If unclear, offer concrete options and ask the user to choose.
3. What is the real scenario: internal report, leadership decision, sales proposal, training, pitch, defense, review, or project update?
4. What materials or reference sources already exist, and can the user upload or paste them? Mention examples such as official websites, product docs, old PPTs, screenshots, brand guidelines, data files, case materials, or reference decks.
5. What constraints matter: presentation length, fixed slide limit, company style, data sensitivity, review requirements, or deadline?
6. What is the biggest risk if the PPT is framed incorrectly?

Do not ask about slide count, style, or format before the audience and desired outcome are clear, unless the user says those constraints are fixed. If presentation length is unknown and the audience/outcome are already clear, ask for the approximate speaking time before moving to slide structure.

## Outcome Clarification

A stated purpose is not always clear enough to guide the workflow. Before handing off to `ppt-slide-structure`, understand the user's intent and broad desired outcome clearly enough for structure planning.

Vague goals include:

- "介绍一下这个主题"
- "做一次分享"
- "讲清楚这个工具"
- "教大家怎么用"
- "让大家了解一下"

When the goal is vague, provide a short diagnosis and 2-4 direction options. Do not force the user to invent the wording from scratch. These options should clarify intent, not quantify the course design.

Example for an AI image generation tutorial:

```markdown
你现在的目标是“教大家使用”，但这个目标还可以再具体一点。不同目标会导致 PPT 结构不同：

1. 认知型：听完知道 ChatGPT Images 能做什么、适合什么场景。
2. 上手型：听完能掌握基础提示词写法，并完成入门级生成任务。
3. 工作流型：听完能把它用于文章配图、PPT 配图、海报草图等具体任务。
4. 进阶型：听完能判断图片质量，并通过多轮修改把结果变好。

这次分享你最希望优先达到哪一个？
```

After the user chooses, record the selected direction as the broad `Desired audience action` or `Desired audience change` and carry unselected directions as secondary goals or exclusions.

Do not convert an outcome into a fixed quantity too early. Avoid wording such as "complete one task", "generate one image", or "do 2-3 iterations" unless the user gave that constraint. Prefer capability wording:

- weak: "听众能够完成一次图像生成任务。"
- better: "听众能够理解图像生成任务的基本流程，并在入门任务中完成从提示词到结果评估的闭环。"
- weak: "听众能够针对一个真实场景做 2-3 轮优化。"
- better: "听众能够根据结果问题诊断原因，并通过多轮修改持续优化图片质量。"

Skill 1 defines the learning outcome. Skill 2 decides how many examples, scenes, practice tasks, and iterations are needed to teach that outcome well.

Skill 1 is not a measurement or curriculum-design step. Its job is to understand what the user wants to do, why they want this PPT, who they are speaking to, what broad change they hope to create, and what context/materials should shape the next step. It should not turn the user's early intent into hard numbers or a rigid teaching plan.

## Final Alignment Gate

Before moving to `ppt-slide-structure`, run a final alignment step. Do not silently proceed from diagnosis to structure.

The final alignment should:

- restate what the user wants to make
- restate the intended audience
- restate the broad purpose / desired audience change
- restate known constraints such as time, scenario, materials, and source strategy
- ask the user to confirm, correct, or add missing context

Use natural, concise language. Do not use field-like labels if prose is clearer. Do not include "assumptions to carry forward" or "if you do not add anything, I will..." in the user-facing confirmation.

```markdown
通过刚才的沟通，我先确认一下我的理解，确认没问题后我们再进入结构策划。

你要做的是一场关于 [主题] 的 [PPT 类型]。
这场分享主要讲给 [目标受众]。
本次分享最核心的目的，是 [用户希望达成的方向]。
目前已知的要求是：[时间/场景/资料/来源/其他约束]。
后续内容需要参考或核验：[资料策略或用户提供的资料]。

这个理解对吗？有没有哪一点需要改？
```

If the user confirms with phrases such as "对", "没问题", "不需要修改", "可以", or equivalent, immediately output `PPT Project Brief v1: Goal` and proceed to `ppt-slide-structure`. Do not ask another confirmation question.

If the user corrects anything, update the diagnosis first, then run the final alignment again if the correction materially changes the brief.

If the user explicitly says to proceed without confirmation, continue with the already stated understanding and mark unresolved items as open questions in the v1 brief.

## Reference Material Prompt

Reference materials are a high-leverage input for PPT quality. They improve factual accuracy, examples, page structure, screenshots, visual direction, and later source checks.

When the user starts a PPT and has not provided materials, include a short material reminder before producing the final v1 brief or before moving to `ppt-slide-structure`.

Use one concise question, for example:

```markdown
如果你有官网链接、官方文档、旧 PPT、截图、案例资料、品牌规范或参考风格，也可以先发给我。它们会直接影响后面的大纲、案例、配图和事实核验。你现在有这类资料要补充吗？
```

If the user says no, continue with assumptions and record `Materials provided: none` plus `Missing materials / recommended references`.

If the topic involves a modern product, API, law, data, market, or other time-sensitive facts, mark official/reference sources as required for later verification instead of relying on memory.

## Deck type diagnosis

Use these common deck types as labels, but do not force the user's request into a category:

- `executive-report`: leadership update or decision support
- `business-review`: business performance review or retrospective
- `strategy-plan`: strategic direction and roadmap
- `proposal`: internal or external solution proposal
- `sales-deck`: customer-facing sales presentation
- `pitch-deck`: investor, fundraising, or roadshow deck
- `training-deck`: training or enablement material
- `course-deck`: structured teaching or tutorial deck
- `academic-defense`: thesis, research, or academic defense
- `project-update`: project progress, risk, or milestone update
- `product-launch`: product introduction or launch communication
- `workshop-deck`: interactive workshop or discussion material

## Real job examples

Translate topics into jobs:

- "Q2 growth review" may really mean "explain the growth gap and secure support for next-quarter experiments."
- "AI tool training" may really mean "help zero-basis colleagues complete specific workflows without fear."
- "Project update" may really mean "keep leadership confidence and get a decision on blocked resources."
- "Customer proposal" may really mean "prove the plan reduces risk enough for the customer to approve next steps."
- "Annual summary" may really mean "turn scattered work into a credible narrative of impact."

## Material summary

When the user provides materials, summarize them through a PPT-goal lens:

- What facts or numbers are useful?
- What claims already exist?
- What constraints appear in the materials?
- What story angles are suggested?
- What materials should be reused later?
- What is still missing?

Do not over-analyze the materials in this skill. The purpose is to prepare the next step, not to finish the deck.

## PPT Project Brief

This skill should output `PPT Project Brief v1: Goal` when enough information is available.

In V2 project mode, also write or update:

- `00-intake/user-brief.md`
- `00-intake/source-index.json`
- `00-intake/source-summary.md`
- `00-intake/citations.json` when goal-relevant facts, claims, data, or cases are already identifiable

The brief is the handoff object for the rest of the PPT workflow. Later skills will read it instead of guessing from scattered conversation context.

## Output modes

### If critical information is missing

Output:

```markdown
## Current Diagnosis
- My understanding:
- Likely deck type:
- Real job of the deck:
- What seems clear:
- What is still unclear:
- Materials note:

## One Key Question
[Ask exactly one question, with a short reason why it matters.]
```

### If enough information is available

Output:

```markdown
## PPT Project Brief v1: Goal

### Project
- Topic:
- Deck type:
- Real job:
- Desired audience action:
- Main challenge:
- Hidden success criteria:
- Recommended framing:
- What to emphasize:
- What to avoid:

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
- Slide count status: fixed / flexible / unknown
- Slide count constraint:
- Need speaker notes:
- Need Q&A:

### Materials
- Materials provided:
- Useful facts:
- Existing data:
- Existing claims:
- Reusable content:
- Missing materials:

### Style Preferences
- Desired experience:
- Language style:
- Reference style: optional
- Reference style note:
- Constraints:

### Workflow
- Next recommended skill: ppt-slide-structure
- Open questions:
- Assumptions to carry forward:
```

You may also include this shorter diagnosis before the project brief when it helps the user understand the judgment:

```markdown
## Goal Diagnosis
- User request:
- Interpreted deck type:
- Real job of the deck:
- Target audience:
- Desired audience action:
- Main persuasion / teaching / decision challenge:
- Hidden success criteria:
- Recommended framing:
- What to emphasize:
- What to avoid:
- Delivery constraints:
  - Presentation length:
  - Slide count status: fixed / flexible / to be estimated
  - Slide count constraint:
  - Delivery format:
  - Need speaker notes:
  - Need Q&A:
- Key constraints:
- Confidence:

## Material Summary
- Materials provided:
- Useful facts:
- Existing data:
- Existing claims:
- Constraints from materials:
- Reusable content:
- Missing or unclear information:

## Next Step Brief
- Recommended next skill: ppt-slide-structure
- What the next skill should use:
- Questions already answered:
- Questions still open:
- Assumptions to carry forward:
```

The `PPT Project Brief v1: Goal` section is required for handoff even if you also include the shorter diagnosis.

## Quality bar

A good result should make the user think:

- "Yes, that is what I actually need this PPT to do."
- "This is clearer than my original request."
- "The next step can now create the structure without guessing."

Avoid generic outputs that simply repeat the user's words.
