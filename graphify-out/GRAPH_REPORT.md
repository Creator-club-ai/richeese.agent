# Graph Report - .  (2026-04-14)

## Corpus Check
- 7 files · ~8,675 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 112 nodes · 179 edges · 24 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `main()` - 11 edges
2. `command_refresh()` - 9 edges
3. `main()` - 8 edges
4. `print_handoff_summary()` - 8 edges
5. `ensure_memory_dir()` - 7 edges
6. `main()` - 7 edges
7. `load_cards()` - 6 edges
8. `main()` - 6 edges
9. `synthesize_research_artifacts()` - 6 edges
10. `build_snapshot()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `PhaseRun` --uses--> `RuntimeProfile`  [INFERRED]
  scripts\phase_artifacts.py → scripts\profile_runtime.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.2
Nodes (21): build_phase_plan(), detect_source_kind(), emit_plan(), extract_artifact_paths(), extract_json_block(), extract_research_title(), _extract_transcript_excerpts(), log_phase_event() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (12): article_keys(), count_cross_sources(), deduplicate(), fetch_feed(), is_relevant(), load_existing(), main(), normalize_title() (+4 more)

### Community 2 - "Community 2"
Cohesion: 0.26
Nodes (8): Card, ig_reach(), ig_saves(), load_cards(), parse_int(), parse_sections(), parse_simple_yaml(), split_frontmatter()

### Community 3 - "Community 3"
Cohesion: 0.35
Nodes (10): extract_video_id(), format_timestamp(), get_transcript(), get_video_meta(), main(), make_markdown(), parse_args(), save_to_vault() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (9): build_snapshot(), command_refresh(), ensure_memory_dir(), memory_dir(), top_counter(), write_log_markdown(), write_outcomes(), write_patterns() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (8): append_log(), command_log(), command_snapshot(), get_vault_path(), load_logs(), log_path(), main(), parse_args()

### Community 6 - "Community 6"
Cohesion: 0.43
Nodes (7): create_phase_run(), PhaseRun, scaffold_follow_on_templates(), slugify(), _write_artifact(), write_phase_template(), write_research_output()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (2): EditorialMemoryStageTests, HeadRunnerContractTests

### Community 8 - "Community 8"
Cohesion: 0.7
Nodes (4): _default_vault_path(), load_runtime_profile(), _parse_markdown_assignments(), RuntimeProfile

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (1): 사전 필터 통과 여부. True이면 보관.

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (1): 같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (1): 오늘 이미 저장된 JSON이 있으면 불러온다.

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (1): yt-dlp로 영상 제목, 채널, 날짜를 가져온다.

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (1): 자막 세그먼트 리스트, 사용 언어 반환.

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (1): 시간 간격 기준으로 세그먼트를 단락으로 묶는다.     gap_threshold초 이상 간격이 있으면 새 단락 시작.     중복/잘린 문장

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (1): Obsidian raw/ 저장용 마크다운 생성.

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): 사전 필터 통과 여부. True이면 보관.

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): 같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): 오늘 이미 저장된 JSON이 있으면 불러온다.

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (1): yt-dlp로 영상 제목, 채널, 날짜를 가져온다.

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (1): 자막 세그먼트 리스트, 사용 언어 반환.

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): 시간 간격 기준으로 세그먼트를 단락으로 묶는다.     gap_threshold초 이상 간격이 있으면 새 단락 시작.     중복/잘린 문장

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): Obsidian raw/ 저장용 마크다운 생성.

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): Current leaf scripts do not emit a full ResearchOutput yet.

## Knowledge Gaps
- **15 isolated node(s):** `사전 필터 통과 여부. True이면 보관.`, `같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.`, `오늘 이미 저장된 JSON이 있으면 불러온다.`, `yt-dlp로 영상 제목, 채널, 날짜를 가져온다.`, `자막 세그먼트 리스트, 사용 언어 반환.` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 9`** (1 nodes): `사전 필터 통과 여부. True이면 보관.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `오늘 이미 저장된 JSON이 있으면 불러온다.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `yt-dlp로 영상 제목, 채널, 날짜를 가져온다.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `자막 세그먼트 리스트, 사용 언어 반환.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `시간 간격 기준으로 세그먼트를 단락으로 묶는다.     gap_threshold초 이상 간격이 있으면 새 단락 시작.     중복/잘린 문장`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `Obsidian raw/ 저장용 마크다운 생성.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `사전 필터 통과 여부. True이면 보관.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `오늘 이미 저장된 JSON이 있으면 불러온다.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `yt-dlp로 영상 제목, 채널, 날짜를 가져온다.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `자막 세그먼트 리스트, 사용 언어 반환.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `시간 간격 기준으로 세그먼트를 단락으로 묶는다.     gap_threshold초 이상 간격이 있으면 새 단락 시작.     중복/잘린 문장`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `Obsidian raw/ 저장용 마크다운 생성.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Current leaf scripts do not emit a full ResearchOutput yet.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PhaseRun` connect `Community 6` to `Community 8`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `RuntimeProfile` connect `Community 8` to `Community 6`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `사전 필터 통과 여부. True이면 보관.`, `같은 토픽을 다룬 소스 수를 계산한다. source_count >= 2면 화제성 신호.`, `오늘 이미 저장된 JSON이 있으면 불러온다.` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._