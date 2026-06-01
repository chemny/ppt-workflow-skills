# Research Brief

`research-brief.json` is the structured output of topic and source research before slide structure is finalized.

Research exists to prevent basic conceptual errors and to make the deck structure sharper. It is not a generic essay.

## Location

```text
projects/<deck-slug>/01-research/
├── topic-research.md
├── official-sources.md
└── research-brief.json
```

## When Required

Create a research brief when:

- the topic is a product, model, API, platform, company, policy, market, law, standard, or technical concept
- the topic may have changed recently
- the user supplied official/reference material
- the deck depends on accurate claims, examples, capabilities, dates, or data
- structure choices require knowing what the topic really is

## Research Priorities

1. User-provided official or internal materials.
2. Official websites, docs, help centers, filings, reports, or product pages.
3. Primary datasets or authoritative institutions.
4. Reputable secondary sources.
5. General web summaries only when primary sources are unavailable.

## Schema

```json
{
  "version": "0.1",
  "topic": {
    "userLabel": "",
    "normalizedName": "",
    "category": "",
    "oneSentenceDefinition": "",
    "primaryCapabilityOrMeaning": "",
    "secondaryCapabilitiesOrAspects": [],
    "commonMisunderstandings": []
  },
  "sourcesInspected": [
    {
      "id": "src-001",
      "title": "",
      "url": "",
      "type": "official",
      "accessedAt": "",
      "whyItMatters": ""
    }
  ],
  "audienceImplications": [
    {
      "audienceNeed": "",
      "contentImplication": "",
      "structureImplication": ""
    }
  ],
  "structureImplications": {
    "mustExplain": [],
    "shouldDemonstrate": [],
    "shouldAvoidOverweighting": [],
    "recommendedCaseTypes": [],
    "riskOrBoundarySlides": []
  },
  "evidencePlan": [
    {
      "claim": "",
      "sourceId": "",
      "status": "verified",
      "recommendedSlideUse": ""
    }
  ],
  "openQuestions": []
}
```

## Output Principles

- Normalize incorrect or informal names, but keep a user-facing label if needed.
- State what the topic primarily does before listing secondary use cases.
- Identify misconceptions that would make the deck feel amateur.
- Convert research into structure implications.
- Record sources so Skill 3 can cite them.
- Mark unresolved facts instead of pretending certainty.

## Relationship To Skill 2

Skill 2 uses the research brief to choose:

- practical scenario pattern
- chapter order
- examples and demos
- case portfolio
- evidence-heavy vs writing-first path
- risk/boundary slides

If the research brief conflicts with the user's original assumption, Skill 2 should adapt the structure and explain the adjustment.

