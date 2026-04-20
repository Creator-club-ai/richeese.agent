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
- latest_signals_dir: `wiki/capture/today/`
- wiki_dir: `wiki/`
- editorial_memory_dir: `wiki/editorial-memory/`
- working_cards_dir: `wiki/editorial/instagram/drafts/`

## Signal Discovery

- signal_sources_path: `config/richesse-signal-sources.json`
- signal_max_items: `20`
- signal_lookback_days: `3`
- signal_allowed_categories: `Business, People, Money, Strategy`
- signal_include_keywords: `startup, founder, business, strategy, ai, product, venture, capital, market, growth, company, brand, money, wealth, 부자, 창업, 스타트업, 사업, 전략, 브랜드, 자산, 투자`
- signal_exclude_keywords: `sports, entertainment, celebrity, gossip, recipe, travel deal`

## Public Desks

- routing_helper: `head`
- suggested_desks: `source-desk -> angle-desk -> draft-desk -> gate-desk -> repair-desk`
- compatibility_aliases: `research`, `analyze`, `write`, `review`, `refine`
- design_handoff: explicit only

## Routing Overlay

- latest_signals_requests: optional `morning-brew` discovery, then one selected signal into `source-desk`
- direct_source_requests: `source-desk`
- selected_signal_requests: `source-desk`
- plan_requests: `angle-desk`
- copy_requests: `draft-desk`
- gate_requests: `gate-desk`
- repair_requests: `repair-desk`

## Output Standard

- primary_deliverable: approved output from the requested desk or manually chosen desk sequence
- design_deliverable: `final_report.md` only on explicit handoff
- note: `final_report.md` is not part of the default editorial desk kit

## Stop Overlay

Stop when:

- the source is too weak for richesse.club
- the angle is generic, soft, or off-brand
- critical fact risk remains after one serious repair pass
- editorial memory strongly matches rejected patterns

Otherwise complete the requested desk and name the next useful desk.
