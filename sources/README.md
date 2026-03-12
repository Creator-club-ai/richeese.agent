# Source Intake Layer

`sources/` is the layer where raw inputs are turned into owner-reviewable planning.

## Structure

```text
sources/
  <source-id>/
    source.json
    planning.md
    assets/
```

## Flow

1. Register the source in `source.json`.
2. Add transcript or normalized text when available.
3. Write `planning.md`.
4. Show `planning.md` to the owner.
5. Set `source.json.analysis.mainCandidateId`.
6. Set `source.json.analysis.standaloneCandidateIds`.
7. Put only the immediate build queue into `source.json.analysis.approvedCandidateIds`.
8. Set `source.json.status` to `approved`.
9. Spawn approved child projects into `projects/`.

## Statuses

- `ingested`
- `analyzed`
- `approved`
- `spawned`
