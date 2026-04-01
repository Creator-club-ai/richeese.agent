---
name: richesse-source-intake
description: Use this skill when the user provides a source such as a YouTube URL, article URL, interview, transcript, podcast, notes, or raw reference and wants to build richesse.club content from it. Trigger before topic curation when Codex needs to extract the source thesis, notable points, reusable angles, and content-worthy moments from raw material. For YouTube URLs, use the bundled subtitle-first workflow to pull captions quickly, split the video into official or generated chapters, and build a summary-ready intake brief without downloading the full video unless fallback transcription is truly necessary.
---

# Richesse Source Intake

## Overview

Turn a raw source into a chat-first intake brief for richesse.club.

Do not stop at generic recap. Extract the source thesis, reusable moments, expandable claims, and content-worthy angles that can later become a stronger topic package.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- the user's request
- the source itself
  - YouTube URL
  - article URL
  - transcript
  - interview notes
  - memo

## Start Condition

- The topic is not locked yet and the user needs source-based angle finding.
- The source is too raw to jump straight into topic curation.
- You need to decide whether the whole source is useful or only a narrow slice is worth carrying forward.

## Workflow

1. Identify the source type first.
   - YouTube URL
   - article
   - transcript
   - notes
2. For YouTube URLs, run the subtitle-first script before writing the intake brief.
3. Read the structured output and isolate:
   - the main thesis
   - notable moments
   - reusable points
   - angle candidates
4. Judge brand fit before expanding anything.
   - Does it sit inside richesse.club's definition of wealth?
   - Is it too generic, too self-help, or too recap-heavy?
5. Decide the extraction width.
   - whole source
   - one chapter only
   - two or three specific moments only
6. Write the intake brief in chat unless the user explicitly asks for a file.

## YouTube Subtitle-First Mode

Use this mode when the source is a YouTube URL and the goal is to understand the full content quickly.

### Run

```bash
cd "c:/Users/dasar/Desktop/콘텐츠마케팅팀/.agent/skills/richesse-source-intake/scripts"
python analyze_youtube.py "<youtube-url>"
```

Optional language priority:

```bash
python analyze_youtube.py "<youtube-url>" --languages "ko,en"
```

Optional fixed output path:

```bash
python analyze_youtube.py "<youtube-url>" --output-dir "C:/temp/richesse-youtube"
```

If subtitle access is rate-limited, try browser cookies explicitly:

```bash
python analyze_youtube.py "<youtube-url>" --cookies-from-browser edge
```

### What the script does

- pulls video metadata with `yt-dlp`
- prefers manual subtitles, then automatic captions
- does not download the full video
- uses official chapters when available
- otherwise creates generated chapter candidates from caption timing and topic-shift signals
- retries subtitle download with local browser cookies if direct caption access is rate-limited
- saves summary-ready outputs to a temp folder or the path you passed in

### Dependency

Install once if needed:

```bash
pip install yt-dlp
```

### What to read after running

- `summary.json`
- `chapter_notes.md`
- `output/latest_youtube_summary.md` inside the project for the shortest human-readable final output
- `full_transcript.txt` only when you need the complete wording

See `references/youtube-output-schema.md` for the field meanings.

### YouTube rules

- Prefer subtitles over video download.
- Use official chapters if they exist.
- If official chapters do not exist, treat generated chapters as working structure, not final editorial truth.
- Summarize by chapter, then merge into a whole-video understanding.
- If YouTube rate-limits subtitle access, rely on the script's browser-cookie fallback before giving up.
- If subtitles are missing or clearly broken, say so plainly before suggesting fallback transcription.
- Do not pretend screen-only information is present in the subtitles.

## Output Format

Keep the default output in chat.

### Source Snapshot

- `source type`
- `source title`
- `source link` or `source description`
- `one-line summary`

### Chapter Summaries

For YouTube sources only. One entry per chapter from the script output.

- `chapter index` — `timestamp range`
- `chapter title`
- `2–3 sentence summary of what was said`
- `one standout line or moment if it exists`

Merge very short chapters (under 60 seconds) into the adjacent one before summarizing. Skip chapters that are pure intro/outro filler with no content.

### Core Thesis

- the source's main claim or central idea

### Notable Moments

- memorable scenes or turns
- lines that can become card-news points
- moments that are likely to expand into a sharper angle

### Usable Points

- `point`
- `why it matters`
- `likely format`

### Candidate Angles

- `working angle`
- `why it can become a post`
- `best format hint`

### Recommended Extraction

- whole source or partial extraction
- which chapter or moment matters most
- what direction fits richesse.club best

### Risks or Gaps

- what still needs confirmation
- what is weak in the source
- what might be overstated if copied too literally

## Hard Rules

- Do not lock the final topic inside intake.
- Do not jump to slide planning inside intake.
- Do not turn source intake into a flat recap.
- Separate strong points from filler.
- Say clearly when the source is weak or off-brand.
- Keep the default deliverable in chat unless the user explicitly asks for a saved file.
