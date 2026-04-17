# Runtime Architecture

이 문서는 content-os 스킬이 **어떻게 이어 붙고, 어디에 출력을 쓰는가**를 정의한다. 브랜드 판단 기준은 여기에 없다 (브랜드는 `brands/<profile>/BRAND_GUIDE.md`).

## 1. 역할 분리

- **이 저장소 (`콘텐츠/`)** — 스킬 소스와 브랜드 문서가 사는 곳. 직접 작업하지 않는다.
- **Workspace (Obsidian vault)** — 실제 아티팩트가 쌓이는 곳. 스킬은 vault 안 폴더에 쓴다.
- **Active profile** — `ACTIVE_PROFILE.md`가 가리키는 브랜드. 현재는 `richesse-club`.

스킬은 `~/.agents/skills/`에 설치되어 어느 디렉토리에서 실행해도 동일하게 동작한다. vault에서 codex를 실행하면 vault의 `AGENTS.md`가 브랜드 문서를 참조하도록 안내한다.

## 2. 스킬 체인 (v1)

```
content-os-news  →  content-os-research  →  content-os-planner  →  content-os-writer  →  content-os-reviewer
```

- 한 번에 한 단계만 실행한다. 사용자가 명시적으로 다음 단계를 요청할 때만 이어 간다.
- news 단계에서 사용자가 **signal을 체크 박스로 선택**한 후 research가 그 한 건만 읽는다.
- reviewer는 `pass` 판정이 나면 아티팩트를 `04 Published/`로 이관한다. `fix` 또는 `revise`면 writer로 되돌린다.

## 3. Vault 폴더 규약

```
<vault>/
  01 Daily Brief/
    YYYY-MM-DD.md                ← content-os-news 출력
  03 Workshop/
    <slug>/
      research.md                 ← content-os-research
      plan.md                     ← content-os-planner
      draft.md                    ← content-os-writer
      review.md                   ← content-os-reviewer
  04 Published/
    <slug>.md                     ← reviewer pass 후 이관
  05 Sources/
    Articles/YYYY-MM-DD-<slug>.md
    YouTube/YYYY-MM-DD-<slug>.md
  06 Wiki/
    _schema.md
    Companies/ People/ Concepts/ Trends/
  07 Templates/                   ← 참조용, 스킬이 덮어쓰지 않음
```

- `<slug>`는 `YYYY-MM-DD-<topic-slug-kebab>` 형식. 예: `2026-04-17-figma-ipo`.
- `<vault>`는 workspace의 Obsidian vault 루트. 스킬은 현재 작업 디렉토리를 vault 루트로 간주한다.
- `03 Workshop/<slug>/` 폴더는 research 단계에서 처음 생성한다.

## 4. 핸드오프 방식

- 각 phase는 **다음 phase가 읽을 markdown 파일**을 낸다. 프론트매터는 `phase-contracts.md`가 정의한다.
- 다음 스킬은 경로로 핸드오프를 받는다. 예: `/content-os-planner 03 Workshop/2026-04-17-figma-ipo/research.md`.
- 중간에 사람이 파일을 열어 고치는 것을 전제한다. 스킬은 파일의 최신 상태를 다시 읽는다.

## 5. Wiki 업데이트 정책

- `content-os-research`만 `06 Wiki/` 를 쓴다. 다른 스킬은 읽기 전용.
- 규칙은 `06 Wiki/_schema.md`를 따른다 (기존 내용 덮어쓰지 않고 날짜와 함께 추가).
- planner와 writer는 Wiki를 읽어 인용 맥락을 확보하되, 쓰지 않는다.

## 6. What Is Not Here

- 브랜드 판단 (Category/Format/User Value/Depth/Timing, 톤, anti-patterns) → `brands/richesse-club/BRAND_GUIDE.md`
- 믹스·페이스 목표 → `brands/richesse-club/CONTENT_STRATEGY.md`
- Phase별 frontmatter 스키마 → `phase-contracts.md`
- 브랜드 가치 정의 (매거진 이름, 독자) → `brands/richesse-club/BRAND_GUIDE.md` §1
