import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export interface PreviewRenderOptions {
  pptxPath: string;
  outDir: string;
  reportPath?: string;
}

export interface PreviewRenderReport {
  status: "rendered" | "partial" | "skipped" | "failed";
  pptxPath: string;
  outDir: string;
  pdfPath?: string;
  pngDir?: string;
  slidePreviews: string[];
  tools: {
    office?: string;
    pdfToPng?: string;
  };
  issues: Array<{
    severity: "info" | "warning" | "error";
    code: string;
    message: string;
  }>;
}

async function commandPath(candidates: string[]): Promise<string | undefined> {
  for (const candidate of candidates) {
    const found = await run("sh", ["-lc", `command -v ${candidate}`], { allowFailure: true });
    const value = found.stdout.trim();
    if (value) return value.split(/\n/)[0];
  }
  return undefined;
}

async function run(
  command: string,
  args: string[],
  options: { cwd?: string; shell?: boolean; allowFailure?: boolean } = {},
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: options.shell ?? false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout?.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr?.on("data", (chunk) => stderr.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      const result = {
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
        code: code ?? 0,
      };
      if (!options.allowFailure && result.code !== 0) {
        reject(new Error(`${command} failed with code ${result.code}: ${result.stderr || result.stdout}`));
        return;
      }
      resolve(result);
    });
  });
}

async function findConvertedPdf(outDir: string, pptxPath: string): Promise<string | undefined> {
  const basename = path.basename(pptxPath, path.extname(pptxPath));
  const expected = path.join(outDir, `${basename}.pdf`);
  try {
    await fs.access(expected);
    return expected;
  } catch {
    const files = await fs.readdir(outDir).catch(() => []);
    const pdf = files.find((file) => file.toLowerCase().endsWith(".pdf"));
    return pdf ? path.join(outDir, pdf) : undefined;
  }
}

async function renderPdfToPng(pdfPath: string, pngDir: string, tool: string): Promise<string[]> {
  await fs.mkdir(pngDir, { recursive: true });
  const prefix = path.join(pngDir, "slide");
  await run(tool, ["-png", "-r", "144", pdfPath, prefix]);
  const files = await fs.readdir(pngDir);
  return files
    .filter((file) => file.endsWith(".png"))
    .sort()
    .map((file) => path.join(pngDir, file));
}

export async function renderPreview(options: PreviewRenderOptions): Promise<PreviewRenderReport> {
  const pptxPath = path.resolve(options.pptxPath);
  const outDir = path.resolve(options.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const report: PreviewRenderReport = {
    status: "skipped",
    pptxPath,
    outDir,
    slidePreviews: [],
    tools: {},
    issues: [],
  };

  const office = await commandPath(["soffice", "libreoffice"]);
  report.tools.office = office;
  if (!office) {
    report.issues.push({
      severity: "warning",
      code: "office_renderer_missing",
      message: "LibreOffice/OpenOffice CLI was not found. PPTX preview export was skipped.",
    });
    if (options.reportPath) await writePreviewReport(report, options.reportPath);
    return report;
  }

  try {
    await run(office, ["--headless", "--convert-to", "pdf", "--outdir", outDir, pptxPath]);
    const pdfPath = await findConvertedPdf(outDir, pptxPath);
    if (!pdfPath) {
      report.status = "failed";
      report.issues.push({ severity: "error", code: "pdf_missing", message: "Office renderer finished but no PDF was created." });
      if (options.reportPath) await writePreviewReport(report, options.reportPath);
      return report;
    }

    report.pdfPath = pdfPath;
    report.status = "partial";

    const pdfToPng = await commandPath(["pdftoppm"]);
    report.tools.pdfToPng = pdfToPng;
    if (!pdfToPng) {
      report.issues.push({
        severity: "info",
        code: "png_renderer_missing",
        message: "pdftoppm was not found. PDF preview was created, but PNG slide previews were skipped.",
      });
      if (options.reportPath) await writePreviewReport(report, options.reportPath);
      return report;
    }

    const pngDir = path.join(outDir, "slide-previews");
    report.slidePreviews = await renderPdfToPng(pdfPath, pngDir, pdfToPng);
    report.pngDir = pngDir;
    report.status = report.slidePreviews.length > 0 ? "rendered" : "partial";
    if (report.slidePreviews.length === 0) {
      report.issues.push({ severity: "warning", code: "png_missing", message: "PDF was created, but no PNG previews were produced." });
    }
  } catch (error) {
    report.status = "failed";
    report.issues.push({
      severity: "error",
      code: "preview_render_failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  if (options.reportPath) await writePreviewReport(report, options.reportPath);
  return report;
}

export async function writePreviewReport(report: PreviewRenderReport, reportPath: string): Promise<void> {
  const absoluteReportPath = path.resolve(reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
