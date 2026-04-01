# YouTube Output Schema

`analyze_youtube.py` writes the raw outputs plus one project-visible final markdown.

## `summary.json`

Primary machine-readable output.

### Top-level fields

- `video`
  - title, url, channel, duration, upload date, description preview
- `subtitle_track`
  - language, source (`manual` or `auto`), extension
- `transcript_stats`
  - cue count, chapter count, total words
- `chapters`
  - structured chapter list
- `files`
  - saved file paths
- `notes`
  - extraction warnings or gaps

### Chapter fields

- `index`
- `source`
  - `official` or `generated`
- `title`
- `title_hint`
  - only a working label when generated
- `start_seconds`
- `end_seconds`
- `start`
  - human-readable timestamp
- `end`
  - human-readable timestamp
- `duration_seconds`
- `boundary_reason`
  - why a generated chapter was cut
- `text_preview`
  - quick skim string
- `transcript`
  - full chapter text

## `chapter_notes.md`

Human-readable skim document.

Use this when you want to understand the video fast without opening JSON first.

## `full_transcript.txt`

Full transcript in timestamped blocks.

Open this only when chapter-level text is not enough or a quote needs checking.

## `output/latest_youtube_summary.md`

Shortest human-readable output inside the project.

Use this file when you only want the final skim document visible in the repo or IDE.
