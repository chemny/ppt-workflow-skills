# PPT-Maker

中文 | [English](./README.md)

一组用于完整制作 PPT 的 AI Agent Skills，覆盖目标澄清、大纲结构、页面文案、可编辑 PPTX 生成、最终检查和汇报演练。

它不是一个独立应用，也不是一个单纯的 PPT 生成脚本，而是一套可以在 Codex、Claude Code、OpenClaw 等 agent 环境中使用的 PPT 制作工作流。

## 项目定位

很多 AI 生成 PPT 的问题，不在于不能生成 PPT 文件，而在于前面的判断链条没有建立起来：

- 不清楚 PPT 面向谁。
- 不清楚本次汇报或分享最终想达成什么目的。
- 没有根据场景选择合适的结构。
- 大纲只是标题列表，不像真实可讲的内容。
- 每页缺少正文、布局、组件、图片、数据和素材说明。
- 生成的 PPT 可编辑，但风格不统一，页面信息密度不稳定，图片和内容关联弱。

这套 skills 的目标是把 PPT 制作拆成一条可复用、可检查、可迭代的工作流，让 AI 不只是“生成 PPT”，而是帮助用户把一份 PPT 从需求、结构、内容、设计、检查到演练完整做出来。

## 适合什么场景

这套 workflow 适合：

- 工作汇报
- 业务复盘
- 新品发布
- 产品介绍
- 用户见面会
- 知识分享
- 教程课件
- 课堂教学
- 方案汇报
- 销售提案
- 公开演讲

不同场景会采用不同的结构框架。例如：

- 工作汇报：目标、进展、结果、问题、原因、下一步。
- 新品发布：痛点、定位、核心卖点、场景、证据、行动。
- 知识分享：问题导入、概念解释、方法框架、案例实操、注意事项、总结。
- 课堂教学：学习目标、背景导入、知识讲解、例题/案例、互动练习、课堂小结。

## 完整工作流

```text
用户提出 PPT 需求
  ↓
1. ppt-goal-setting
   明确主题、受众、目的、时长、约束、参考资料
  ↓
2. ppt-slide-structure
   调研主题，选择场景框架，生成 PPT 大纲
  ↓
3. ppt-slide-writing
   生成每页标题、正文、组件、布局意图、配图提示词和 slide-spec
  ↓
4. ppt-deck-builder
   选择视觉系统，生成可编辑 PPTX
  ↓
5. ppt-final-check
   检查逻辑、事实、数据、语言、排版和视觉一致性
  ↓
6. ppt-presentation-practice
   生成讲稿、模拟问答、风险问题和应对话术
```

## 每个 Skill 的职责

| Skill | 作用 |
|---|---|
| `PPT-Maker` | 总入口，负责串联完整 PPT 工作流 |
| `ppt-goal-setting` | 通过启发式沟通明确 PPT 目标、受众、约束和参考资料 |
| `ppt-slide-structure` | 基于主题调研和场景框架生成 PPT 大纲 |
| `ppt-slide-writing` | 将大纲转化为每页可落地的文字、组件、布局、素材说明和结构化 slide-spec |
| `ppt-deck-builder` | 基于内容规格生成可编辑 PPTX |
| `ppt-final-check` | 对逻辑、语言、事实、数据、视觉和交付风险做最终检查 |
| `ppt-presentation-practice` | 帮助用户进行汇报演练、问答预判和话术准备 |

## 仓库结构

```text
PPT-Maker/
├── SKILL.md
├── README.md
├── README.zh.md
├── LICENSE
├── references/
│   ├── compatibility.md
│   ├── publish-checklist.md
│   ├── slide-spec.md
│   ├── skill3-slide-spec-generation.md
│   ├── skill4-slide-spec-build.md
│   ├── skill6-presentation-practice.md
│   ├── layout-registry.md
│   └── theme-tokens.md
├── skills/
│   ├── PPT-Maker/
│   ├── ppt-goal-setting/
│   ├── ppt-slide-structure/
│   ├── ppt-slide-writing/
│   ├── ppt-deck-builder/
│   ├── ppt-final-check/
│   └── ppt-presentation-practice/
├── tools/
│   └── ppt-builder-cli/
└── examples/
    └── iphone17/
```

## 安装方式

把本仓库 clone 或复制到你的 agent skills 目录。
安装后需要确保 `SKILL.md` 位于 skill 根目录。

常见路径：

```text
Codex:       ~/.agents/skills/PPT-Maker/
Claude Code: ~/.claude/skills/PPT-Maker/
OpenClaw:    ~/.openclaw/skills/PPT-Maker/
```

Codex 示例：

```bash
git clone https://github.com/chemny/PPT-Maker.git ~/.agents/skills/PPT-Maker
```

安装后重新打开一个 agent 会话，然后输入：

```text
Use PPT-Maker to help me create a 20-minute product briefing deck.
```

验证提示词：

```text
Use PPT-Maker to explain its six-step PPT workflow.
```

也可以直接说中文：

```text
请使用 PPT-Maker，帮我做一份 20 分钟的新品介绍 PPT。
```

## 使用方式

### 方式一：跑完整流程

适合从 0 开始制作 PPT。

```text
我想做一次分享，主题是 ChatGPT Images，面向 AI 学习者，分享时间 1 小时，请帮我从需求澄清开始完整做一份 PPT。
```

### 方式二：只调用某一个阶段

适合用户已经有部分内容，只想完成某一步。

```text
我已经有 PPT 大纲，请用 ppt-slide-writing 帮我补全每页正文、布局和配图建议。
```

```text
我已经有每页内容，请用 ppt-deck-builder 帮我生成可编辑 PPTX。
```

```text
我已经有 PPT，请用 ppt-final-check 帮我做最后审核。
```

```text
PPT 最终检查已经通过，请用 ppt-presentation-practice 帮我准备讲稿和问答演练。
```

## 可选 PPTX 生成工具

前 3 个文字流程不依赖额外工具。真正生成可编辑 PPTX 时，需要使用仓库内置的 TypeScript + PptxGenJS 工具链。

要求：

- Node.js 18+
- npm

运行示例：

```bash
cd tools/ppt-builder-cli
npm install
npm run typecheck
npx tsx src/cli.ts build ../../examples/iphone17/deck-builder-input.blueprint-swiss.json --out ../../examples/iphone17/iphone17-demo.pptx
```

运行基础质量检查：

```bash
npx tsx src/cli.ts check ../../examples/iphone17/deck-builder-input.blueprint-swiss.json --pptx ../../examples/iphone17/iphone17-demo.pptx
```

运行项目级最终审核和演练报告：

```bash
npx tsx src/cli.ts review-project ../../projects/<deck-slug> --out
npx tsx src/cli.ts practice-project ../../projects/<deck-slug> --out
```

生成文件：

```text
examples/iphone17/iphone17-demo.pptx
```

## 项目模式

对于长 PPT、资料较多、需要反复返工或后续续跑的项目，可以使用轻量项目目录：

```text
projects/<deck-slug>/
├── 00-intake/
├── 01-research/
├── 02-structure/
├── 03-production/
├── 04-design/
├── 05-build/
├── 06-review/
└── 07-practice/
```

项目模式会增加几类约束：

- `00-intake`：记录用户资料、资料摘要、引用、表格和图片素材。
- `01-research`：记录会影响结构的主题调研和官方来源。
- `02-structure`：记录场景框架、叙事主线、时间分配、页面骨架和页面节奏。
- `03-production/slide-production-spec.json`：Skill 3 到 Skill 4 的结构化页面生产规格。
- `04-design`：锁定设计系统、模板选择和素材计划。
- `05-build`：存放 builder input、生成素材和可编辑 PPTX。
- `06-review`：存放质量报告和修复请求。
- `07-practice`：存放演练材料和可选演讲稿。

其中 `source package + research brief + structure plan + slide production spec + component registry + template system` 是 V2 的核心协议层：Skill 3 决定每页要表达什么、用什么组件和推荐版式；Skill 4 按固定版式、组件和设计 token 生成可编辑 PPTX。

## 内置视觉系统

Skill 4 当前支持两条生成分支：

- `svg-native`：默认路线，按页生成 SVG 视觉设计，并尽可能组装为可编辑 PPT 原生对象。
- `template-native`：可选路线，使用 PPTGenJS 模板和布局生成稳定的可编辑 PPTX。

当前 template-native 分支内置了一个 PPTGenJS 原生实现的 `blueprint-swiss` 主题。

核心特点：

- 一套可复用的结构化页面布局
- 所有元素尽量使用可编辑 PPT 形状和文字
- 瑞士国际主义网格系统
- 默认 IKB 蓝主色
- 大标题轻字重，高留白，强网格
- 图片按比例裁切，不强行拉伸
- 支持方向键/点击翻页
- 不先生成 HTML，也不做 HTML 到 PPT 的转换

## 兼容性说明

纯文本 skills 理论上可以在 Codex、Claude Code、OpenClaw 中运行。

PPTX 生成取决于当前平台是否允许：

- 运行 Node.js
- 安装 npm 依赖
- 写入本地文件
- 访问或生成图片素材

当前兼容状态：

| 平台 | 状态 |
|---|---|
| Codex | 已在本地测试 |
| Claude Code | 已做静态结构检查，尚未实机测试 |
| OpenClaw | 已做静态结构检查，尚未实机测试 |

如果所在平台没有图片生成能力，workflow 应该输出图片提示词或占位说明，而不是假装已经生成图片。

## License

MIT
