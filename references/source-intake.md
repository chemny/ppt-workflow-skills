# Source Intake

Use source intake whenever the user provides files, URLs, screenshots, data tables, old decks, brand guidelines, or long pasted material.

The goal is to make user material usable and traceable across structure, writing, build, review, and rehearsal.

## Core Rule

Do not let source material live only in chat memory.

For source-heavy or rebuildable decks, convert and record material under:

```text
projects/<deck-slug>/00-intake/
├── user-brief.md
├── source-index.json
├── source-summary.md
├── citations.json
├── extracted-tables/
└── extracted-images/
```

## Intake Responsibilities

| Step | Responsibility |
|---|---|
| Skill 1 | register material, summarize only goal-relevant context |
| Skill 2 | read source summaries and official/primary sources for structure decisions |
| Skill 3 | turn source facts, tables, cases, and images into page content and citations |
| Skill 4 | use registered assets and record generated/reused assets |
| Skill 5 | verify that claims and assets remain traceable |

## Source Types

| User provides | Intake action | Typical output |
|---|---|---|
| PDF | convert to markdown when possible; preserve page references | source summary, citations, extracted tables/images |
| DOCX / Word | convert to markdown; preserve headings and tables | structured notes, claims, reusable copy |
| XLSX / Excel | inspect sheets; summarize fields, metrics, time ranges, outliers | extracted tables, chart candidates |
| PPTX | extract slide titles, visible text, notes, and reusable assets | old-deck summary, reusable page ideas/assets |
| URL / website | fetch or summarize; prefer official/primary sources | official-source summary, citation records |
| screenshot/image | describe content, intended use, quality, rights risk | image asset record, screenshot-use note |
| brand guideline | extract colors, typography, logo rules, tone, forbidden uses | design input for Skill 4 |
| reference deck | extract layout rhythm, page types, density, tone | style reference, not copied content |

## Source Index Schema

`source-index.json` should be concise but complete enough for later skills:

```json
{
  "version": "0.1",
  "sources": [
    {
      "id": "src-001",
      "type": "pdf",
      "title": "Product Whitepaper",
      "originalPath": "sources/product-whitepaper.pdf",
      "convertedPath": "00-intake/product-whitepaper.md",
      "status": "converted",
      "owner": "user",
      "trustLevel": "official",
      "rightsNote": "user-provided internal material",
      "usedFor": ["definition", "data", "case"],
      "risk": ""
    }
  ]
}
```

## Citation Schema

`citations.json` records reusable facts, claims, data points, cases, and visual assets.

```json
{
  "version": "0.1",
  "citations": [
    {
      "id": "cite-001",
      "sourceId": "src-001",
      "kind": "fact",
      "claim": "The product supports three deployment modes.",
      "quoteOrData": "three deployment modes",
      "location": "page 8 / section 2.1",
      "confidence": "high",
      "recommendedUse": "capability map slide",
      "risk": ""
    }
  ]
}
```

## Source Summary

`source-summary.md` should answer:

- What is this source?
- Why does it matter for this PPT?
- Which facts, claims, examples, screenshots, or tables are reusable?
- Which parts should not be used or need caution?
- Which slides or sections may use it?

Keep the summary PPT-oriented. Do not produce a long generic document summary.

## Excel And Tables

For Excel files:

1. Identify sheets.
2. Summarize each sheet's subject, fields, units, time period, and missing values.
3. Extract chart candidates:
   - KPI cards
   - trend line
   - bar comparison
   - composition/stacked chart
   - ranking table
   - before/after table
4. Save clean table extracts under `extracted-tables/`.
5. Add data claims to `citations.json`.

Skill 3 should decide whether a table becomes a chart, KPI card, appendix, or source-only evidence.

## Official Sources

For modern products, APIs, law/regulation, pricing, market data, public-company data, or anything time-sensitive:

- Prefer official/primary sources.
- Record source URL and access date when available.
- Separate verified facts from interpretation.
- Mark uncertain claims as `pending` or `needs verification`.

## Material Use In Later Skills

Skill 2 should use sources to shape structure:

- official definitions -> concept grounding
- product capability docs -> chapter and slide functions
- screenshots -> demo/callout slides
- datasets -> data-proof slides
- case notes -> example or case walkthrough slides
- brand guidelines -> Skill 4 design constraints

Skill 3 should use sources to shape pages:

- cite every strong claim
- place data in chart/component plans
- map screenshots and examples to exact slides
- avoid fake screenshots or unsupported product behavior

Skill 5 should fail or conditionally pass when:

- key claims have no source
- source-sensitive facts are stale or unresolved
- asset provenance is missing
- generated visuals replace required real screenshots without approval

