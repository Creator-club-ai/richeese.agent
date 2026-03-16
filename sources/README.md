# Source Intake Layer

`sources/` is the layer where source-backed or topic-backed intakes are turned into owner-reviewable planning.

## Structure

```text
sources/
  <intake-id>/
    source.json
    planning.md
    assets/
```

## Flow

1. Register the intake in `source.json`.
2. Add transcript, normalized text, scout notes, or topic statement when available.
3. Write `planning.md`.
4. Show `planning.md` to the owner.
5. Set `source.json.analysis.mainCandidateId`.
6. Set `source.json.analysis.standaloneCandidateIds`.
7. Put only the immediate build queue into `source.json.analysis.approvedCandidateIds`.
8. Set `source.json.generation.spawnMode`.
9. Set `source.json.status` to `approved`.
10. Spawn approved child projects into `projects/`.

## Statuses

- `ingested`
- `analyzed`
- `approved`
- `spawned`
