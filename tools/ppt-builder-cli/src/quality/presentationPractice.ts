import fs from "node:fs/promises";
import path from "node:path";
import type { WorkflowSlideSpec, WorkflowSlideSpecDeck } from "../protocol/slideSpec.js";
import type { FinalReviewReport } from "./projectFinalReview.js";

export interface PresentationPracticeOptions {
  projectDir: string;
  writeReports?: boolean;
}

export interface PresentationPracticeReport {
  status: "READY" | "BLOCKED";
  reason?: string;
  setup: {
    title: string;
    scenario?: string;
    audience?: string;
    durationMinutes?: number;
    practiceMode: string[];
    mainOutcome: string;
  };
  speakingStrategy: {
    throughline: string;
    tone: string;
    pacing: string;
    emphasis: string[];
    interaction: string[];
    avoid: string[];
  };
  timingPlan: Array<{
    slide: number;
    title: string;
    suggestedMinutes: number;
    maxMinutes: number;
    priority: "high" | "medium" | "low";
    compressionMethod: string;
  }>;
  speakerCards: Array<{
    slide: number;
    title: string;
    objective: string;
    whatToSay: string[];
    keySentence: string;
    transition: string;
    riskOrCaution: string;
  }>;
  likelyQuestions: Array<{
    role: string;
    level: "Basic" | "Follow-up" | "Pressure";
    question: string;
    answerStrategy: string;
  }>;
  emergencyTalkingPoints: Record<string, string>;
  rehearsalPlan: string[];
}

export async function generatePresentationPractice(options: PresentationPracticeOptions): Promise<PresentationPracticeReport> {
  const projectDir = path.resolve(options.projectDir);
  const paths = await resolvePracticePaths(projectDir);
  const slideSpec = await readJson<WorkflowSlideSpecDeck>(paths.slideSpec);
  const finalReview = await readJson<FinalReviewReport>(paths.finalReviewReport);

  if (!finalReview.canEnterPresentationPractice || finalReview.status !== "PASS") {
    const blocked = blockedReport(slideSpec, finalReview);
    if (options.writeReports) await writePracticeReports(paths, blocked);
    return blocked;
  }

  const report = buildPracticeReport(slideSpec);
  if (options.writeReports) await writePracticeReports(paths, report);
  return report;
}

function buildPracticeReport(deck: WorkflowSlideSpecDeck): PresentationPracticeReport {
  const slides = deck.slides;
  const duration = deck.meta.durationMinutes ?? inferDuration(slides.length);
  const mode = inferPracticeMode(deck);
  const timingPlan = allocateTiming(slides, duration);
  const zh = isChineseDeck(deck);

  return {
    status: "READY",
    setup: {
      title: deck.meta.title,
      scenario: deck.meta.scenario,
      audience: deck.meta.audience,
      durationMinutes: duration,
      practiceMode: mode,
      mainOutcome: deck.writingStrategy.audienceNeed,
    },
    speakingStrategy: {
      throughline: deck.writingStrategy.narrativeSpine.join(" -> "),
      tone: deck.writingStrategy.tone,
      pacing: pacingAdvice(duration, slides.length, zh),
      emphasis: emphasisFromSlides(slides, zh),
      interaction: interactionPlan(slides, zh),
      avoid: deck.designDirection.avoid.slice(0, 4),
    },
    timingPlan,
    speakerCards: slides.map((slide) => ({
      slide: slide.slideNumber,
      title: slide.title,
      objective: slide.coreMessage,
      whatToSay: compactLines([slide.pageConclusion, ...slide.visibleBody, ...slide.supportingDetails]).slice(0, 5),
      keySentence: slide.pageConclusion || slide.coreMessage,
      transition: slide.transition || defaultTransition(slide, zh),
      riskOrCaution: slide.riskFlags[0] || (zh ? "不要展开到偏离本页核心观点的细节。" : "Avoid expanding beyond this slide's core message."),
    })),
    likelyQuestions: buildQuestions(deck),
    emergencyTalkingPoints: {
      timeShortage: zh ? "如果时间不够，跳过次要案例，只保留本页结论和一个关键证据。" : "If time is tight, skip secondary examples and keep only the page conclusion plus one proof point.",
      dataChallenged: zh ? "先承认这个问题重要，再说明哪些信息来自已核实来源，哪些是基于事实的判断。" : "Acknowledge the question, point back to the cited source requirement, and separate verified facts from interpretation.",
      unknownQuestion: zh ? "明确说当前能确认什么、还需要补充核实什么，以及会在什么时候反馈。" : "Say what can be confirmed now, what needs follow-up, and when the answer will be provided.",
      audienceConfused: zh ? "用一句话重讲本页结论，再换一个最贴近听众的例子，不要继续堆概念。" : "Restate the slide in one sentence, then use the nearest concrete example instead of adding new concepts.",
      interrupted: zh ? "先简短回应问题，再把话题带回主线：问题、方法、例子、行动。" : "Answer briefly, then return to the throughline: problem, method, example, action.",
      assetIssue: zh ? "直接用语言说明图片本来要表达的信息，继续讲内容，不在现场处理素材问题。" : "Describe the visual's intended message verbally and continue; do not spend live time fixing media.",
    },
    rehearsalPlan: zh
      ? [
          "第一轮：完整讲一遍不中断，记录总时长和拖慢节奏的页面。",
          "第二轮：只练高优先级页面和转场，把低优先级页面压缩到一句结论。",
          "第三轮：用压力问题做模拟答辩，练习先回答、再给边界、最后回到主线。",
        ]
      : [
          "Round 1: full run without interruption; check total time and mark pages that feel slow.",
          "Round 2: rehearse only high-priority slides and transitions; compress low-priority pages.",
          "Round 3: simulate questions using the pressure-question list; practice direct answers with boundaries.",
        ],
  };
}

function blockedReport(deck: WorkflowSlideSpecDeck, finalReview: FinalReviewReport): PresentationPracticeReport {
  return {
    status: "BLOCKED",
    reason: `Final gate is ${finalReview.status}; fix required issues before formal presentation practice.`,
    setup: {
      title: deck.meta.title,
      scenario: deck.meta.scenario,
      audience: deck.meta.audience,
      durationMinutes: deck.meta.durationMinutes,
      practiceMode: [],
      mainOutcome: deck.writingStrategy.audienceNeed,
    },
    speakingStrategy: {
      throughline: deck.writingStrategy.narrativeSpine.join(" -> "),
      tone: deck.writingStrategy.tone,
      pacing: "Blocked before formal rehearsal.",
      emphasis: [],
      interaction: [],
      avoid: ["Do not rehearse as final before v5 PASS."],
    },
    timingPlan: [],
    speakerCards: [],
    likelyQuestions: [],
    emergencyTalkingPoints: {},
    rehearsalPlan: finalReview.fixRequests.map((request) => `Return to ${request.returnTo}: ${request.requiredFix}`),
  };
}

function inferPracticeMode(deck: WorkflowSlideSpecDeck): string[] {
  const scenario = `${deck.meta.scenario ?? ""} ${deck.meta.title}`.toLowerCase();
  const modes = ["speaker-notes", "timed-rehearsal"];
  if (/course|teach|lesson|class|training|教程|教学|课程|分享/.test(scenario)) modes.push("teaching-rehearsal");
  if (/launch|product|sales|pitch|发布|产品|销售|下单|用户见面/.test(scenario)) modes.push("pitch-rehearsal");
  if (/report|review|strategy|汇报|复盘|战略/.test(scenario)) modes.push("leadership-qa");
  modes.push("emergency-response");
  return Array.from(new Set(modes));
}

function allocateTiming(slides: WorkflowSlideSpec[], durationMinutes: number): PresentationPracticeReport["timingPlan"] {
  const zh = slides.some((slide) => /[\u4e00-\u9fff]/.test(slide.title));
  const weights = slides.map((slide) => slideWeight(slide));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let remaining = durationMinutes;
  return slides.map((slide, index) => {
    const isLast = index === slides.length - 1;
    const raw = isLast ? remaining : Math.max(0.5, roundOne((durationMinutes * weights[index]) / total));
    const suggested = isLast ? Math.max(0.5, roundOne(remaining)) : raw;
    remaining = Math.max(0, roundOne(remaining - suggested));
    return {
      slide: slide.slideNumber,
      title: slide.title,
      suggestedMinutes: suggested,
      maxMinutes: roundOne(suggested + 0.5),
      priority: slideWeight(slide) >= 1.35 ? "high" : slideWeight(slide) <= 0.8 ? "low" : "medium",
      compressionMethod: compressionMethod(slide, zh),
    };
  });
}

function slideWeight(slide: WorkflowSlideSpec): number {
  if (["case-example", "live-demo", "practice-task", "data-proof"].includes(slide.pageType)) return 1.5;
  if (["concept-explain", "capability-map", "step-flow", "comparison"].includes(slide.pageType)) return 1.2;
  if (["cover", "section-divider", "qa-closing"].includes(slide.pageType)) return 0.6;
  return 1;
}

function buildQuestions(deck: WorkflowSlideSpecDeck): PresentationPracticeReport["likelyQuestions"] {
  const zh = isChineseDeck(deck);
  const audience = deck.meta.audience || "audience";
  const highValueSlides = deck.slides.filter((slide) => slideWeight(slide) >= 1.2).slice(0, 5);
  const questions: PresentationPracticeReport["likelyQuestions"] = [
    {
      role: audience,
      level: "Basic",
      question: zh ? "听完以后，我第一步应该做什么？" : "After this presentation, what should I do first?",
      answerStrategy: zh ? "回到最后的行动页，给出一个明确的第一步，并指向对应案例或检查清单。" : "Return to the final action slide, name the first concrete action, and point to the example or checklist that supports it.",
    },
    {
      role: zh ? "谨慎型听众" : "skeptical listener",
      level: "Pressure",
      question: zh ? "这里哪些是已经核实的事实，哪些是你的建议？" : "Which part of this deck is verified fact, and which part is your recommendation?",
      answerStrategy: zh ? "把有来源的事实和自己的判断分开讲，说明来源依据，并明确建议的适用边界。" : "Separate sourced claims from interpretation, cite the relevant source requirement, and restate the recommendation boundary.",
    },
  ];
  for (const slide of highValueSlides) {
    questions.push({
      role: audience,
      level: slide.riskFlags.length ? "Follow-up" : "Basic",
      question: slide.audienceQuestion || `Why does "${slide.title}" matter to me?`,
      answerStrategy: zh ? `先讲第 ${slide.slideNumber} 页的结论，再用一个可见要点和一个例子支撑。` : `Use slide ${slide.slideNumber}'s conclusion first, then support it with one visible point and one example.`,
    });
  }
  return questions.slice(0, 8);
}

function emphasisFromSlides(slides: WorkflowSlideSpec[], zh: boolean): string[] {
  return compactLines(slides.filter((slide) => slideWeight(slide) >= 1.2).map((slide) => `${zh ? "第" : "Slide "}${slide.slideNumber}${zh ? "页" : ""}: ${slide.pageConclusion}`)).slice(0, 6);
}

function interactionPlan(slides: WorkflowSlideSpec[], zh: boolean): string[] {
  const interactive = slides.filter((slide) => ["interaction-prompt", "practice-task", "live-demo", "case-example"].includes(slide.pageType));
  if (!interactive.length) return [zh ? "在核心案例或重点页面后，问一个确认理解的问题。" : "Ask one check-for-understanding question after the main example section."];
  return interactive.slice(0, 4).map((slide) => `${zh ? "第" : "Slide "}${slide.slideNumber}${zh ? "页" : ""}: ${slide.audienceQuestion}`);
}

function compressionMethod(slide: WorkflowSlideSpec, zh: boolean): string {
  if (["cover", "section-divider"].includes(slide.pageType)) return zh ? "只讲标题和一句开场，快速进入正文。" : "Say only the title and move on.";
  if (slide.pageType === "case-example") return zh ? "保留一个最有代表性的案例，跳过次要细节。" : "Keep one example; skip secondary details.";
  if (slide.pageType === "data-proof") return zh ? "只讲指标和它说明的问题，跳过背景铺垫。" : "State the metric and implication; skip background explanation.";
  if (slide.pageType === "qa-closing") return zh ? "保留最终行动建议，其余放到问答。" : "Keep the final call to action; move remaining discussion into Q&A.";
  return zh ? "保留本页结论和一个关键证据。" : "Keep the page conclusion and one proof point.";
}

function defaultTransition(slide: WorkflowSlideSpec, zh: boolean): string {
  return zh ? `这一页回答的问题是：${slide.audienceQuestion}` : `This page answers: ${slide.audienceQuestion}`;
}

function pacingAdvice(durationMinutes: number, slideCount: number, zh: boolean): string {
  const avg = durationMinutes / Math.max(1, slideCount);
  if (avg < 1.2) return zh ? "节奏很紧：每页先讲结论，跳过次要细节。" : "Very tight: speak in conclusions first and skip secondary details.";
  if (avg > 3) return zh ? "时间相对充足：关键页面可以展开例子，转场后留短暂停顿。" : "Enough room: use examples and pause after key transitions.";
  return zh ? "中等节奏：每页控制在一个结论加一个证据点。" : "Moderate pace: keep each page to one conclusion plus one proof point.";
}

function isChineseDeck(deck: WorkflowSlideSpecDeck): boolean {
  return deck.meta.language?.toLowerCase().startsWith("zh") || /[\u4e00-\u9fff]/.test(`${deck.meta.title}${deck.meta.audience ?? ""}${deck.meta.scenario ?? ""}`);
}

function inferDuration(slideCount: number): number {
  return Math.max(10, Math.round(slideCount * 1.8));
}

function compactLines(lines: Array<string | undefined>): string[] {
  return lines.map((line) => line?.trim()).filter((line): line is string => Boolean(line));
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

function practicePaths(projectDir: string): Record<string, string> {
  return {
    slideSpec: path.join(projectDir, "03-production", "slide-production-spec.json"),
    finalReviewReport: path.join(projectDir, "06-review", "quality-report.json"),
    practiceMarkdown: path.join(projectDir, "07-practice", "practice-report.md"),
    practiceJson: path.join(projectDir, "07-practice", "practice-report.json"),
  };
}

function legacyPracticePaths(projectDir: string): Record<string, string> {
  return {
    slideSpec: path.join(projectDir, "brief", "v3-slide-spec.json"),
    finalReviewReport: path.join(projectDir, "logs", "final-review-report.json"),
    practiceMarkdown: path.join(projectDir, "brief", "v6-practice-report.md"),
    practiceJson: path.join(projectDir, "logs", "presentation-practice-report.json"),
  };
}

async function resolvePracticePaths(projectDir: string): Promise<Record<string, string>> {
  const v2 = practicePaths(projectDir);
  if (await exists(v2.slideSpec)) return v2;
  return legacyPracticePaths(projectDir);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writePracticeReports(paths: Record<string, string>, report: PresentationPracticeReport): Promise<void> {
  await Promise.all([
    fs.mkdir(path.dirname(paths.practiceMarkdown), { recursive: true }),
    fs.mkdir(path.dirname(paths.practiceJson), { recursive: true }),
  ]);
  await fs.writeFile(paths.practiceJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.writeFile(paths.practiceMarkdown, renderPracticeMarkdown(report), "utf8");
}

function renderPracticeMarkdown(report: PresentationPracticeReport): string {
  const lines = [
    "# PPT Presentation Practice Report",
    "",
    "## Practice Setup",
    `- Status: ${report.status}`,
    report.reason ? `- Reason: ${report.reason}` : undefined,
    `- Title: ${report.setup.title}`,
    `- Scenario: ${report.setup.scenario ?? "not specified"}`,
    `- Audience: ${report.setup.audience ?? "not specified"}`,
    `- Total time: ${report.setup.durationMinutes ?? "not specified"} minutes`,
    `- Practice mode: ${report.setup.practiceMode.join(", ") || "blocked"}`,
    `- Main outcome: ${report.setup.mainOutcome}`,
    "",
    "## Speaking Strategy",
    `- Throughline: ${report.speakingStrategy.throughline}`,
    `- Tone: ${report.speakingStrategy.tone}`,
    `- Pacing: ${report.speakingStrategy.pacing}`,
    `- Emphasis: ${report.speakingStrategy.emphasis.join(" / ") || "none"}`,
    `- Interaction: ${report.speakingStrategy.interaction.join(" / ") || "none"}`,
    `- Avoid: ${report.speakingStrategy.avoid.join(" / ") || "none"}`,
    "",
    "## Timing Plan",
    "| Page | Title | Suggested | Max | Priority | Compression |",
    "|---:|---|---:|---:|---|---|",
    ...report.timingPlan.map((item) => `| ${item.slide} | ${item.title} | ${item.suggestedMinutes}m | ${item.maxMinutes}m | ${item.priority} | ${item.compressionMethod} |`),
    "",
    "## Slide Speaker Cards",
    ...report.speakerCards.flatMap((card) => [
      `### ${card.slide}. ${card.title}`,
      `- Objective: ${card.objective}`,
      `- What to say: ${card.whatToSay.join(" / ")}`,
      `- Key sentence: ${card.keySentence}`,
      `- Transition: ${card.transition}`,
      `- Risk / caution: ${card.riskOrCaution}`,
      "",
    ]),
    "## Likely Questions",
    "| Role | Level | Question | Answer Strategy |",
    "|---|---|---|---|",
    ...report.likelyQuestions.map((item) => `| ${item.role} | ${item.level} | ${item.question} | ${item.answerStrategy} |`),
    "",
    "## Emergency Talking Points",
    ...Object.entries(report.emergencyTalkingPoints).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Rehearsal Plan",
    ...report.rehearsalPlan.map((item) => `- ${item}`),
    "",
  ].filter((line): line is string => line !== undefined);
  return `${lines.join("\n")}\n`;
}
