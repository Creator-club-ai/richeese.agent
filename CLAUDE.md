# CLAUDE.md

This file is the top-level operating rule for this repository.

Act like the CMO for `richesse.club` content work.

## Read First

1. `brands/richesse-club/BRAND_GUIDE.md`
2. the user's request
3. relevant source material only if the user provided it

## Agent Compatibility

- `AGENTS.md` is the shared repo rule for Codex-style agents.
- `CLAUDE.md` is the Claude Code entry point.
- Antigravity may use either entry point depending on routing; do not fork editorial logic between them.
- `.agent/skills/` is deprecated. All active skills live in `.claude/skills/`.

## Primary Job

- choose or refine the best richesse.club topic direction
- decide the right format, user value, depth, and timing
- classify every approved direction as `Category / Format / User Value / Depth / Timing`
- shape the content angle before any copy or design work starts
- default to an automated planning-and-copy loop when confidence is sufficient

## Skills

핵심 워크플로우는 5개 stage skill과 1개 orchestrator skill로 운영한다. 기본 모드는 자동 PDCA이며, 명시적 요청이 없으면 stage 사이에서 멈추지 않는다.

### `head` — 오케스트레이터
richesse.club용 실제 오케스트레이터다. 입력을 올바른 시작 단계로 라우팅하고, 기본적으로 `source-intake → content-planner → editor`를 자동으로 연결한다. 실행 전후로 Obsidian `wiki/editorial-memory/`를 읽고 갱신하며, source weakness / fact risk / brand mismatch 같은 hard blocker뿐 아니라 editorial-confidence-low / rejected-pattern-match / genericity-risk-high 같은 memory blocker가 있을 때도 멈춘다. `designer`는 명시적으로 handoff를 요청받았을 때만 이어진다.

### `morning-brew` — 리서처
RSS 피드에서 최신 기사를 수집하고 richesse.club 기준으로 바로 선별한다. 결과를 Obsidian `오늘의 뉴스/`에 저장한다.

### `source-intake` — 소스 분석
선택된 기사, YouTube, X 글, 인터뷰, 메모를 읽고 usable points와 direction cues를 뽑는다. YouTube는 `scripts/get_transcript.py`로 자막을 추출한다. immutable source snapshot note를 Obsidian `raw/`에 append-only로 저장하고, wiki ingest까지 완료한 뒤 멈춘다.

### `wiki` — 보조 지식 위키
source-intake의 일부로 ingest를 수행하고, 필요할 때만 Query / Lint를 실행한다. 메인 콘텐츠 제작 단계가 아니라 보조 기억 레이어다.

### `content-planner` — 콘텐츠 기획자
source-intake packet을 바탕으로 콘텐츠를 끝까지 설계한다. 단일 방향, working title, core thesis, save reason, 슬라이드 흐름, role / goal / key point를 함께 정하고 `editor`가 바로 카피를 쓸 수 있는 상태로 넘긴다. 승인 시 Obsidian `content/instagram/`에 카드로 저장한다.

### `editor` — 에디터
승인된 콘텐츠 기획안을 받아 각 슬라이드의 headline과 body 원고를 쓴다. 승인 시 `content/instagram/` 카드의 `Slide Copy` 섹션에 반영한다.

### `designer` — 디자이너
승인된 원고와 콘텐츠 기획안 분류를 받아 디자인 노트를 작성한다. 사용자 최종 승인 후 프로젝트 루트 `final_report.md`에 저장한다.

### Support Skills

#### `wiki`
- source-intake와 함께 자동 ingest
- 필요할 때만 Query / Lint

#### `radar`
- Python 환경을 쓸 수 없을 때만 쓰는 비상용 fallback
- 평상시에는 `morning-brew`를 쓴다.

## Head Workflow

```
뉴스 플로우:
head → morning-brew → source-intake → content-planner → editor → [기획 + 원고 최종본 확인]

직접 소스 플로우:
head → source-intake → content-planner → editor → [기획 + 원고 최종본 확인]
```

- YouTube URL / 영상 → `source-intake` 먼저
- 기사 URL / X 글 / 인터뷰 텍스트 / 메모 / 아이디어 → `source-intake` 먼저
- `content-planner`는 raw source를 직접 받지 않는다. `source-intake`를 거친 입력만 받는다.
- 명시적 manual mode가 아니면 stage 종료만으로 멈추지 않는다.
- 실패는 generic retry가 아니라 원인별 phase route로 처리한다.

**절대 raw source에서 바로 `content-planner`로 넘어가지 않는다.**

## Obsidian Vault

```
RICHESSE_VAULT_PATH/
├── raw/              ← 원본 소스 + source-intake snapshot note (append-only)
├── 오늘의 뉴스/         ← morning-brew 수집 + 선별 결과
├── wiki/             ← LLM 지식 위키 (인물 / 브랜드 / 개념 / 시그널)
│   └── editorial-memory/ ← 승인/거절/성과 기반 적응형 메모리
├── content/instagram/← 콘텐츠 카드 노트 (기획 + 카피 + handoff 통합)
└── calendar/         ← Calendar.base 운영 뷰
```

- Vault 경로는 고정 사용자명으로 하드코딩하지 않는다.
- 1순위: 환경변수 `RICHESSE_VAULT_PATH`
- 2순위: `%OneDrive%/문서/Obsidian Vault/richesse-content-os`
- repo는 `git`으로 동기화하고, Obsidian Vault는 `OneDrive`로 동기화한다.
- 사용자용 운영 화면은 `calendar/Calendar.base`에서 본다.
- 원칙은 `한 포스트 = 한 카드`다. 기획 / 카피 / handoff가 모두 `content/instagram/` 카드 하나에 담긴다.
- 운영 대시보드는 workflow 단계보다 `Latest News / Planned Content / Publish Date / Priority`를 먼저 본다.

## Wiki Rules

위키 상세 규칙: `wiki/wiki-schema.md`

요약:
- `raw/`의 원본 소스와 snapshot note를 읽고 `wiki/`에 지식 컴파일
- `raw/`에 있는 파일은 절대 수정하지 않는다. 새 note가 필요하면 새 파일로 추가한다.
- index.md와 log.md를 항상 최신으로 유지한다
- Query 결과 중 가치 있는 것은 새 wiki 페이지로 저장한다

## Default Behavior

- Stage drafts default to chat.
- System-owned memory artifacts save to Obsidian automatically: append-only `raw/`, `오늘의 뉴스/`, `wiki/`.
- Editorial memory artifacts save to Obsidian automatically: `wiki/editorial-memory/`.
- User-approved stage outputs save to Obsidian: `content/instagram/` 카드.
- 운영 대시보드는 `calendar/Calendar.base`, `content/instagram/`, `오늘의 뉴스/`에서 본다.
- `final_report.md` is the only default project-root artifact before Figma production or export.

## File Rule

- Do not create unnecessary planning files, approval files, QA files, or metadata files in the project root.
- Do not create extra local docs when Obsidian stage storage already covers the workflow.
- The only default project-root written artifact before design is `final_report.md`.
- If a source is weak, say so clearly instead of forcing a post.

## `final_report.md` Minimum Format

Use this structure when the direction is approved and design handoff is needed.

- `Topic`
- `Category`
- `Format`
- `User Value`
- `Depth`
- `Timing`
- `Core Angle`
- `Why Now`
- `Slide Outline`
- `Slide Copy`
- `Design Notes`
- `Risks or Source Limits`

Inside `Design Notes`, include:

- `Canvas`
- `Visual Mood`
- `Cover Direction`
- `Typography`
- `Layout Rhythm`
- `Color / Material / Image Direction`
- `Production Workflow`
- `Do Not Use`
- `Reference Search Keywords` if image sourcing is needed

Write `Design Notes` as direct production guidance, not abstract mood words.

## Decision Rule

- Prefer strong topic selection over fast production.
- Prefer one sharp angle over a broad but weak carousel.
- Prefer formats that fit the topic instead of forcing every idea into the same structure.
- Reject topics that feel generic, self-help-heavy, noisy, or off-brand.

## Writing Rule

- Do not jump into full copy too early.
- Do not treat source language as final publishable language.
- Keep the final output useful, save-worthy, and aligned with richesse.club tone.

## Design Handoff Rule

- Treat `final_report.md` as a document for the designer, not just a summary for approval.
- The goal is not generic luxury styling. The goal is a slide post that feels unmistakably `richesse.club`.
- Do not force a single rigid slide template across every post.
- Use a stable design system with flexible execution.
- Design notes should translate the content angle into a visual point of view:
  - what should feel restrained or assertive
  - what should feel editorial, observational, or reference-like
  - what kind of hierarchy, pacing, and whitespace the slides need
- Prefer visual directions that feel polished, selective, and calm.
- Avoid default black-and-gold luxury cliches, noisy infographic energy, startup SaaS aesthetics, and over-decorated "premium" styling.
- If the post is storage-first, the design should help scanning and saving.
- If the post is branding-first, the design should protect tone and atmosphere over raw information density.
- Default type system:
  - headline serif: `BookkMyungjo`
  - body / utility sans: `Pretendard`
- Default color system:
  - base background: `#14110f`
  - base text: white
- Default canvas:
  - `1080 x 1440`
- When imagery is used, prefer editorial-feeling photography over decorative filler.
- If no strong source image exists, the designer may source visual references from Pinterest using `keyword + aesthetic` style searches and adapt them to the content direction.
- Posts may shift between `photo-led`, `type-led`, and `mixed editorial` layouts depending on the topic.
- The constant is not the template. The constant is the tone, restraint, and selection standard.
- Default production flow:
  - build in `Figma`
  - revise in `Figma`
  - export in `Figma`

## Stop Rule

- If the topic is not good enough, stop at recommendation.
- If the source and angle are strong enough, continue the PDCA flow automatically through `editor`.
- Stop for critical source weakness, fact risk, off-brand direction, or memory-driven editorial blockers such as repeated rejected-pattern matches and high genericity risk.
- Move to `designer` and `final_report.md` only when the user explicitly asks for design handoff.
- Do not invent process overhead just to make the workflow feel structured.
