# PPT Workflow Skills

一组用于完整制作 PPT 的 AI Agent Skills，覆盖目标澄清、大纲结构、页面文案、可编辑 PPTX 生成、最终检查和汇报演练。

兼容 Codex、Claude Code 和 OpenClaw。

## 这是什么

这不是一个独立应用，而是一组可移植的 agent skills。

它帮助用户和 AI 按流程完成一份 PPT：

1. 明确 PPT 的目标、受众、约束、参考资料和成功标准。
2. 调研主题，并根据场景选择合适的结构框架。
3. 输出每页标题、正文、页面布局、组件说明和图片提示词。
4. 在本地环境支持时，用 TypeScript + PptxGenJS 生成可编辑 PPTX。
5. 检查逻辑、事实、语言、数据、视觉一致性和交付风险。
6. 模拟汇报问答，准备讲稿、应对话术和演练建议。

## 仓库结构

```text
ppt-workflow-skills/
├── SKILL.md
├── README.md
├── README.zh.md
├── LICENSE
├── references/
├── skills/
│   ├── ppt-workflow/
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

## 安装

把这个仓库 clone 或复制到你的 agent skills 目录。

常见路径：

```text
Codex:       ~/.agents/skills/ppt-workflow-skills/
Claude Code: ~/.claude/skills/ppt-workflow-skills/
OpenClaw:    ~/.openclaw/skills/ppt-workflow-skills/
```

安装后重新打开一个 agent 会话，输入：

```text
Use ppt-workflow-skills to help me create a 20-minute product briefing deck.
```

## 可选 PPTX 生成工具

前 3 个文字流程不依赖额外工具。生成可编辑 PPTX 时，需要使用仓库内置的 TypeScript builder。

要求：

- Node.js 18+
- npm

运行示例：

```bash
cd tools/ppt-builder-cli
npm install
npm run typecheck
npx tsx src/cli.ts build ../../examples/iphone17/deck-builder-input.guizang-swiss.json --out ../../examples/iphone17/iphone17-demo.pptx
```

## 内置视觉系统

当前 builder 内置了一个 PPTGenJS 原生实现的 `guizang-swiss` 主题：

- 22 个 registered layouts：`S01-S22`
- 所有元素尽量使用可编辑 PPT 形状和文字
- 瑞士国际主义网格系统
- 默认 IKB 蓝主色
- 图片比例裁切，不强行拉伸
- 支持方向键/点击翻页

这个主题是直接生成 PPTX，不先生成 HTML，也不做 HTML 到 PPT 的转换。

## 致谢

本项目中的部分 PPT 风格设计借鉴了 [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)，尤其是其中的瑞士风格审美和 registered layout 约束思路。本项目在此基础上，将流程组织为可移植的 skills，并使用 PPTGenJS 原生生成可编辑 PPTX。

## 平台说明

纯文本 skills 应该可以在 Codex、Claude Code、OpenClaw 中运行。

PPTX 生成取决于当前平台是否允许运行 Node.js、安装 npm 依赖并写入本地文件。如果平台没有图片生成能力，workflow 应输出图片提示词或占位说明，不应假装已经生成图片。

## 安全说明

发布前请确认仓库中没有 API key、私有 token、本地 memory、浏览器 cookie 或机器专属路径。修改后再次发布时也应该重新检查。

## License

MIT
