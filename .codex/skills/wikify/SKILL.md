---
name: wikify
description: Use to turn a new source, shortlist item, pasted memo, or ResearchOutput into updated wiki assets. Owns wiki routing, canonical note updates, index/log maintenance, contradiction surfacing, and capture-to-wiki promotion. Does not own editorial brief planning or copywriting.
---

# Wikify

## Master Source

This skill follows the repository's live operating docs and current wiki structure.

## Job

Turn one source or one normalized evidence packet into updated wiki assets.

Use this when the goal is maintaining the knowledge layer, not writing content yet.

## Read First

1. `AGENTS.md`
2. `content-os-schema.md`
3. `wiki/wiki-schema.md`
4. `wiki/index.md`
5. `wiki/capture/index.md`
6. the most related existing wiki note(s)
7. the source, shortlist item, or `ResearchOutput`
8. the user request

## Owns

- wiki routing
- canonical note creation or update
- dossier vs development vs concept vs brand vs people vs signal vs topic 판단
- contradiction and overlap surfacing
- index maintenance
- wiki log updates
- capture-to-wiki promotion
- health-check style maintenance suggestions

## Does Not Own

- deep source gathering across many links
- final editorial angle selection
- content brief writing
- draft copywriting
- publish review

## Workflow

1. Identify the unit of work.
   One source, one shortlist item, one memo, or one `ResearchOutput` only.

2. Search the wiki first.
   Find the closest related note before creating anything new.

3. Route the update.
   Choose the right target:
   - `people/`, `brands/`, `concepts/` for encyclopedic canonical notes
   - `developments/` for a single event
   - `dossiers/` when multiple sources need to be held under one topic
   - `signals/` only when a repeated pattern is already visible
   - `topics/` for coverage tracking
   - `angles/` only for reusable interpretation frames, not raw facts

4. Compile, do not dump.
   Extract the facts, numbers, names, dates, quotes, and tensions that matter.

5. Update the navigation layer.
   If you created or materially changed a note, update:
   - `wiki/index.md` when discoverability changes
   - `wiki/log.md` with a short chronological entry

6. If the source came from capture, preserve the capture/canonical distinction.
   Keep `wiki/capture/today/` as shortlist history.
   Promote only the parts that deserve canonical status.
   If a repeated stop/watchlist pattern matters, call it out as a possible brand/profile signal.

## Rules

- Prefer updating an existing note over creating a new one.
- Treat `raw/` as immutable.
- Keep `wiki/capture/` separate from canonical knowledge.
- Do not send source dumps into `wiki/`.
- Keep `people/`, `brands/`, and `concepts/` encyclopedic.
- Do not create a `signal` from a single observation.
- Keep every meaningful new note linkable from `wiki/index.md`.
- Add a concise `wiki/log.md` entry whenever the wiki meaningfully changes.
- Use Obsidian-flavored markdown: frontmatter, wikilinks, and callouts when helpful.
- Keep summaries readable to non-experts.

## Output Discipline

When you finish, report only:

- which note(s) were created or updated
- why they went to those folders
- what conflicts or gaps are still open

Do not drift into editorial brief or draft writing unless the user asks for that next step.
