import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("jszip");

function ensureTransition(xml: string): string {
  if (xml.includes("<p:transition")) {
    return xml.replace(/<p:transition\b[^>]*>[\s\S]*?<\/p:transition>|<p:transition\b[^/]*\/>/, '<p:transition spd="med" advClick="1"><p:push dir="l"/></p:transition>');
  }

  const transition = '<p:transition spd="med" advClick="1"><p:push dir="l"/></p:transition>';
  if (xml.includes("</p:clrMapOvr>")) return xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${transition}`);
  if (xml.includes("</p:cSld>")) return xml.replace("</p:cSld>", `</p:cSld>${transition}`);
  return xml;
}

function ensurePresentationShowPr(xml: string): string {
  const showPr = '<p:showPr showAnimation="1" useTimings="0"><p:present/></p:showPr>';
  if (xml.includes("<p:showPr")) {
    return xml.replace(/<p:showPr\b[^>]*>[\s\S]*?<\/p:showPr>|<p:showPr\b[^/]*\/>/, showPr);
  }
  if (xml.includes("</p:notesSz>")) return xml.replace("</p:notesSz>", `</p:notesSz>${showPr}`);
  if (/<p:notesSz\b[^/]*\/>/.test(xml)) return xml.replace(/(<p:notesSz\b[^/]*\/>)/, `$1${showPr}`);
  if (xml.includes("</p:sldSz>")) return xml.replace("</p:sldSz>", `</p:sldSz>${showPr}`);
  if (/<p:sldSz\b[^/]*\/>/.test(xml)) return xml.replace(/(<p:sldSz\b[^/]*\/>)/, `$1${showPr}`);
  return xml;
}

export async function ensureManualAdvanceAndSubtleTransitions(pptxPath: string): Promise<void> {
  const zip = await JSZip.loadAsync(await fs.readFile(pptxPath));
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0) - Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0));

  for (const slidePath of slidePaths) {
    const file = zip.file(slidePath);
    if (!file) continue;
    const xml = await file.async("string");
    zip.file(slidePath, ensureTransition(xml));
  }

  const presentation = zip.file("ppt/presentation.xml");
  if (presentation) {
    const xml = await presentation.async("string");
    zip.file("ppt/presentation.xml", ensurePresentationShowPr(xml));
  }

  const output = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await fs.writeFile(pptxPath, output);
}
