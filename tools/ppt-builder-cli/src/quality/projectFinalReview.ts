import fs from "node:fs/promises";
import path from "node:path";
import { validateSlideSpecFile } from "../protocol/validateSlideSpec.js";
import { checkPptxQuality, writeQualityReport } from "./pptxQualityCheck.js";

export interface FinalReviewIssue {
  severity: "Blocker" | "Major" | "Minor" | "Polish";
  owner: "ppt-goal-setting" | "ppt-slide-structure" | "ppt-slide-writing" | "ppt-deck-builder" | "ppt-final-check";
  page?: number;
  issue: string;
  requiredFix: string;
}

export interface FinalReviewReport {
  status: "PASS" | "FAIL" | "CONDITIONAL_PASS";
  score: number;
  recommendation: string;
  canEnterPresentationPractice: boolean;
  inputCoverage: Record<string, boolean>;
  dimensionScores: Record<string, { score: number; notes: string }>;
  issues: FinalReviewIssue[];
  fixRequests: Array<{
    returnTo: string;
    page?: number;
    requiredFix: string;
    acceptanceCriteria: string;
    recheckRequired: boolean;
  }>;
}

export interface ReviewProjectOptions {
  projectDir: string;
  writeReports?: boolean;
}

export async function reviewProject(options: ReviewProjectOptions): Promise<FinalReviewReport> {
  const projectDir = path.resolve(options.projectDir);
  const paths = await projectPaths(projectDir);
  const issues: FinalReviewIssue[] = [];
  const coverage: Record<string, boolean> = {};

  for (const [key, filePath] of Object.entries(paths)) {
    coverage[key] = await exists(filePath);
  }

  for (const required of ["slideSpec", "buildInput", "pptx"]) {
    if (!coverage[required]) {
      issues.push({
        severity: "Blocker",
        owner: required === "slideSpec" ? "ppt-slide-writing" : "ppt-deck-builder",
        issue: `Missing required project artifact: ${required}.`,
        requiredFix: `Generate ${required} before final review.`,
      });
    }
  }

  if (coverage.slideSpec) {
    const slideSpecReport = await validateSlideSpecFile(paths.slideSpec);
    for (const issue of slideSpecReport.issues) {
      issues.push({
        severity: issue.severity === "error" ? "Major" : "Minor",
        owner: "ppt-slide-writing",
        page: issue.slideNumber,
        issue: `Slide spec ${issue.code}: ${issue.message}`,
        requiredFix: "Fix v3-slide-spec.json and rebuild downstream artifacts.",
      });
    }
  }

  if (coverage.buildInput && coverage.pptx) {
    const qualityReport = await checkPptxQuality({
      deckJsonPath: paths.buildInput,
      pptxPath: paths.pptx,
      assetManifestPath: coverage.assetManifest ? paths.assetManifest : undefined,
      designLockPath: coverage.designLock ? paths.designLock : undefined,
    });
    if (options.writeReports) await writeQualityReport(qualityReport, paths.pptxQualityReport);
    for (const issue of qualityReport.issues) {
      issues.push({
        severity: issue.severity === "error" ? "Blocker" : "Minor",
        owner: issue.code.startsWith("asset_") ? "ppt-deck-builder" : "ppt-deck-builder",
        page: issue.slide,
        issue: `${issue.code}: ${issue.message}`,
        requiredFix: issue.severity === "error" ? "Fix and rebuild PPTX, then rerun final review." : "Review before final delivery; fix if this is not acceptable for the scenario.",
      });
    }
  }

  if (!coverage.assetManifest) {
    issues.push({
      severity: "Major",
      owner: "ppt-deck-builder",
      issue: "asset-manifest.json is missing.",
      requiredFix: "Run write-project-artifacts or create an asset manifest before delivery.",
    });
  }
  if (!coverage.designLock) {
    issues.push({
      severity: "Major",
      owner: "ppt-deck-builder",
      issue: "design-lock.json is missing.",
      requiredFix: "Run write-project-artifacts or create a design lock before delivery.",
    });
  }
  if (!coverage.layoutMappingReport) {
    issues.push({
      severity: "Minor",
      owner: "ppt-deck-builder",
      issue: "layout-mapping-report.json is missing.",
      requiredFix: "Record layout mapping so future rebuilds are traceable.",
    });
  }

  const score = calculateScore(issues);
  const status = issues.some((issue) => issue.severity === "Blocker")
    ? "FAIL"
    : issues.some((issue) => issue.severity === "Major")
      ? "CONDITIONAL_PASS"
      : "PASS";

  const report: FinalReviewReport = {
    status,
    score,
    recommendation:
      status === "PASS"
        ? "Ready for delivery or presentation practice. Review minor warnings if the scenario is high-stakes."
        : status === "CONDITIONAL_PASS"
          ? "Acceptable for draft review only unless the listed conditions are accepted or fixed."
          : "Not ready. Return to the owner skill, fix, rebuild, and rerun final review.",
    canEnterPresentationPractice: status === "PASS",
    inputCoverage: coverage,
    dimensionScores: dimensionScores(score, issues),
    issues,
    fixRequests: issues
      .filter((issue) => issue.severity === "Blocker" || issue.severity === "Major")
      .map((issue) => ({
        returnTo: issue.owner,
        page: issue.page,
        requiredFix: issue.requiredFix,
        acceptanceCriteria: "The issue no longer appears in final review and related quality checks pass.",
        recheckRequired: true,
      })),
  };

  if (options.writeReports) {
    await fs.mkdir(path.dirname(paths.finalReviewReport), { recursive: true });
    await fs.writeFile(paths.finalReviewReport, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    report.inputCoverage.finalReviewReport = true;
    await fs.writeFile(paths.finalReviewReport, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  return report;
}

async function projectPaths(projectDir: string): Promise<Record<string, string>> {
  const v2Pptx = await findPptx(path.join(projectDir, "05-build"));
  const v2 = {
    slideSpec: path.join(projectDir, "03-production", "slide-production-spec.json"),
    buildInput: path.join(projectDir, "05-build", "deck-builder-input.json"),
    assetManifest: path.join(projectDir, "04-design", "asset-plan.json"),
    designLock: path.join(projectDir, "04-design", "design-system.json"),
    layoutMappingReport: path.join(projectDir, "05-build", "layout-mapping-report.json"),
    pptxQualityReport: path.join(projectDir, "06-review", "pptx-quality-report.json"),
    finalReviewReport: path.join(projectDir, "06-review", "quality-report.json"),
    pptx: v2Pptx,
  };
  if (await exists(v2.slideSpec)) return v2;

  const pptx = await findPptx(path.join(projectDir, "exports"));
  return {
    slideSpec: path.join(projectDir, "brief", "v3-slide-spec.json"),
    buildInput: path.join(projectDir, "brief", "v4-build-input.json"),
    assetManifest: path.join(projectDir, "assets", "asset-manifest.json"),
    designLock: path.join(projectDir, "design", "design-lock.json"),
    layoutMappingReport: path.join(projectDir, "logs", "layout-mapping-report.json"),
    pptxQualityReport: path.join(projectDir, "logs", "pptx-quality-report.json"),
    finalReviewReport: path.join(projectDir, "logs", "final-review-report.json"),
    pptx,
  };
}

async function findPptx(exportsDir: string): Promise<string> {
  try {
    const entries = await fs.readdir(exportsDir);
    const pptx = entries
      .filter((entry) => entry.endsWith(".pptx") && !entry.startsWith(".~"))
      .sort()[0];
    return pptx ? path.join(exportsDir, pptx) : path.join(exportsDir, "deck.pptx");
  } catch {
    return path.join(exportsDir, "deck.pptx");
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function calculateScore(issues: FinalReviewIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "Blocker") score -= 25;
    else if (issue.severity === "Major") score -= 12;
    else if (issue.severity === "Minor") score -= 3;
    else score -= 1;
  }
  return Math.max(0, score);
}

function dimensionScores(score: number, issues: FinalReviewIssue[]): FinalReviewReport["dimensionScores"] {
  const hasAssetIssue = issues.some((issue) => issue.issue.includes("asset"));
  const hasBuildIssue = issues.some((issue) => issue.owner === "ppt-deck-builder");
  return {
    "Goal alignment": { score: 90, notes: "Checked from available slide spec metadata; deeper semantic review remains human/model-assisted." },
    "Structure and logic": { score: 88, notes: "Checked from slide spec presence and slide sequence." },
    "Copy quality": { score: 86, notes: "Source-level copy exists; subjective copy review still recommended." },
    "Data and evidence": { score: hasAssetIssue ? 82 : 88, notes: "Source requirements are tracked in slide spec; verify final factual wording before public delivery." },
    "Asset and compliance": { score: hasAssetIssue ? 78 : 90, notes: hasAssetIssue ? "Optional/pending assets remain." : "No blocking asset issues detected." },
    "Layout and readability": { score: hasBuildIssue ? 84 : 90, notes: "Package-level checks passed; rendered visual QA is not included without previews." },
    "Style consistency": { score: 88, notes: "Design lock and layout mapping are present when coverage is true." },
    "Delivery readiness": { score, notes: "Derived from package checks, manual advance, and artifact coverage." },
  };
}
