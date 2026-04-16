# Topic Sprint Second Brain Design

Date: 2026-04-15

## Current Decision

Topic sprint support should follow the four-skill Content OS surface.

```text
content-os-news -> content-os-research -> content-os-planner -> content-os-writer
```

## Topic Sprint Pipeline

Entry points:

- `content-os-news` when the user wants candidates around a topic.
- `content-os-research` when the user already has one topic, source, URL, transcript, or signal.

Pipeline:

```text
topic or source
  -> content-os-news, if discovery is needed
  -> content-os-research
  -> content-os-planner
  -> content-os-writer
```

## Storage

Second-brain storage is optional.

Use it only when the active profile needs durable artifacts or the user asks for saved files.

Useful locations:

- `wiki/<topic>/sources/`
- `wiki/<topic>/index.md`
- `daily/YYYY-MM-DD.md`
- `content/instagram/`

## Out Of Scope For V0

- Head runner
- review/refine loop
- mandatory memory refresh
- mandatory vault writes
- global CLI
