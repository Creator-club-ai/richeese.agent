# richesse.club Runtime Profile

This file defines the active profile overlay for the shared editorial runtime.

## Identity

- profile_name: `richesse-club`
- profile_root: `brands/richesse-club/`
- brand_guide: `brands/richesse-club/BRAND_GUIDE.md`
- content_strategy: `brands/richesse-club/CONTENT_STRATEGY.md`

## Storage

- vault_env: `RICHESSE_VAULT_PATH`
- default_vault_name: `richesse-content-os`
- raw_dir: `raw/`
- latest_signals_dir: `오늘의 뉴스/`
- wiki_dir: `wiki/`
- editorial_memory_dir: `wiki/editorial-memory/`
- working_cards_dir: `content/instagram/`

## Public Loop

- primary_runner: `head`
- default_phases: `research -> analyze -> write -> review -> refine`
- design_handoff: explicit only

## Routing Overlay

- latest_signals_requests: optional `morning-brew` discovery, then one selected signal into `research`
- direct_source_requests: `research` via `research-desk`
- selected_signal_requests: `research` via `research-desk`
- plan_requests: `analyze`
- copy_requests: `write`
- gate_requests: `review`
- repair_requests: `refine`

## Output Standard

- primary_deliverable: approved copy under the public loop
- design_deliverable: `final_report.md` only on explicit handoff
- note: `final_report.md` is not part of the default editorial loop

## Stop Overlay

Stop when:

- the source is too weak for richesse.club
- the angle is generic, soft, or off-brand
- critical fact risk remains after one serious repair pass
- editorial memory strongly matches rejected patterns

Otherwise keep moving through the public phases.
