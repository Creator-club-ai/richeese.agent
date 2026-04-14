# Editorial Memory Schema

The adaptive memory layer belongs in the Obsidian vault, not the project root.

## Directory

```text
{vault}/wiki/editorial-memory/
├── PROFILE.md
├── patterns.md
├── outcomes.md
├── log.md
└── log.jsonl
```

## `log.jsonl`

One JSON object per decision event.

```json
{
  "timestamp": "2026-04-12T03:55:00+00:00",
  "title": "2인 90일 - AI 스타트업의 새 공식",
  "stage": "planner",
  "verdict": "captured",
  "score": 0.82,
  "category": "Business",
  "pattern": "정리형",
  "tags": ["sharp-angle", "strong-save-value"],
  "notes": "숫자 훅 강함",
  "route": "editor"
}
```

Verdict semantics:

- `captured` = an artifact or phase snapshot was recorded, but no public approval gate has been passed yet
- `approved`, `revise`, `rejected`, `published` = actual judgment outcomes that may influence adaptive memory

## Card Frontmatter Extensions

Add these fields to working cards when available:

```yaml
automation_mode: autopilot
workflow_state: planning
source_strength: 0.78
angle_fit_score: 0.84
save_value_score: 0.81
novelty_score: 0.63
fact_risk_score: 0.22
last_verdict: approved
last_verdict_stage: planner
decision_tags:
  - sharp-angle
  - strong-save-value
memory_snapshot: 2026-04-12T10:30:00+09:00
```

These are optional at the beginning. The log is the primary memory source.

## Card Body Sections

Recommended additions:

- `## Decision Log`
- `## Review Findings`
- `## Outcome Signals`

Do not create extra root docs for this. Keep adaptive memory in the vault.
