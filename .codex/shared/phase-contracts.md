# Phase Contracts

각 phase가 다음 phase에 넘기는 **파일 포맷**을 정의한다. 스킬은 이 스키마를 따라 쓴다. frontmatter 키는 고정, 본문 구조는 권장.

BRAND_GUIDE가 정의한 5축은 모든 phase의 frontmatter에 일관되게 담는다: `category`, `format`, `user_value`, `depth`, `timing`.

---

## 1. Signal (news 출력)

**경로:** `01 Daily Brief/YYYY-MM-DD.md`

**파일 헤더 frontmatter:**

```yaml
---
phase: signals
date: YYYY-MM-DD
profile: richesse-club
count: <개수>
---
```

**본문 구조:** signal마다 아래 블록 반복.

```markdown
## [N]. <제목>

- [ ] selected

**source:** <source 이름>  |  **type:** rss|youtube|x|threads|naver|google_news|manual
**url:** <URL>
**category:** Business|Money|People|Ideas|Culture
**format (hint):** 뉴스형|케이스형|인사이트형|정리형|리스트형|비교형|입문형|큐레이션형|해설형
**user_value (hint):** 저장형|공유형|공감형|정보형|브랜딩형|동기형
**timing:** Now|Evergreen|Seasonal
**source_strength:** strong|medium|weak
**why it matters:** <한 줄>
**risks or gaps:** <한 줄, 없으면 -->
**recommendation:** send to content-os-research | send to wiki-ingest | skip
```

- `format (hint)`와 `user_value (hint)`는 news 단계 추측치. planner가 확정한다.
- 사용자는 `- [ ] selected`를 `- [x] selected`로 바꿔 한 건을 선택한다. research는 체크된 항목만 다룬다.

---

## 2. Research (research 출력)

**경로:** `03 Workshop/<slug>/research.md`
**side effect:** `05 Sources/...`에 원본, `06 Wiki/...`에 엔티티 업데이트 (별도 스키마).

**Frontmatter:**

```yaml
---
phase: research
slug: YYYY-MM-DD-<topic-slug>
profile: richesse-club
signal_ref: "01 Daily Brief/YYYY-MM-DD.md#N"
source_url: <URL>
source_type: rss|youtube|x|article|podcast|book
source_strength: strong|medium|weak
fact_risk: low|medium|high
wiki_refs: ["Companies/Figma", "People/Dylan Field"]
created: YYYY-MM-DDTHH:MMZ
---
```

**본문 섹션 (ResearchOutput 계약):**

- `# Topic`
- `## What Happened` — 사실 요약, source 인용
- `## Usable Points` — 콘텐츠로 쓸 만한 관찰 5~10개
- `## Key Quotes` (선택)
- `## Recurring Themes` (선택)
- `## Direction Cues` — 가능한 앵글 힌트
- `## Risks or Gaps`
- `## Recommendation` — `send to content-os-planner` | `stop`

---

## 3. Plan (planner 출력)

**경로:** `03 Workshop/<slug>/plan.md`

**Frontmatter (5축 확정):**

```yaml
---
phase: plan
slug: YYYY-MM-DD-<topic-slug>
profile: richesse-club
research_ref: "03 Workshop/<slug>/research.md"
category: Business|Money|People|Ideas|Culture
format: 뉴스형|큐레이션형|입문형|정리형|비교형|리스트형|케이스형|인사이트형|해설형
user_value_main: 저장형|공유형|공감형|정보형|브랜딩형|동기형
user_value_sub: <one of above or -->
depth: Light|Medium|Deep
timing: Now|Evergreen|Seasonal
working_title: <제목안>
plan_status: ready for content-os-writer | needs more research | stop
---
```

**본문 섹션 (PlanOutput 계약):**

- `# <Working Title>`
- `## Core Fact`
- `## Selected Topic` / `## Topic Candidates` (탈락안 2~3개)
- `## Selected Angle` / `## Angle Candidates` + `## Backup Angles`
- `## Tension` — 왜 흥미로운가
- `## Core Thesis`
- `## Save Reason` — 왜 저장·공유할까
- `## Outline` — 선택된 format에 맞는 슬라이드/섹션 스켈레톤
- `## Blockers` (없으면 -)

---

## 4. Draft (writer 출력)

**경로:** `03 Workshop/<slug>/draft.md`

**Frontmatter:**

```yaml
---
phase: draft
slug: YYYY-MM-DD-<topic-slug>
profile: richesse-club
plan_ref: "03 Workshop/<slug>/plan.md"
copy_status: ready | needs source clarification | needs plan clarification
confidence: high|medium|low
---
```

**본문 섹션 (CopyOutput 계약):**

- `# <Working Title>`
- `## Cover Headline` — 표지 1~2줄. 힘 있는 문어체 허용 (BRAND_GUIDE §3).
- `## Slides` — 슬라이드별 `### 슬라이드 N: <소제목>` + 본문 2~3줄. 본문은 절제 문어체.
- `## Claims` — 본문 주장 ↔ research의 source 역추적
- `## Open Questions`
- `## Confidence Note`

---

## 5. Review (reviewer 출력)

**경로:** `03 Workshop/<slug>/review.md`

**Frontmatter:**

```yaml
---
phase: review
slug: YYYY-MM-DD-<topic-slug>
profile: richesse-club
draft_ref: "03 Workshop/<slug>/draft.md"
verdict: pass | fix | revise
axes_ok: true|false
tone_ok: true|false
anti_richesse_ok: true|false
source_backed_ok: true|false
value_focus_ok: true|false
---
```

**Verdict 정의:**

- `pass` — 그대로 `04 Published/<slug>.md`로 이관 가능.
- `fix` — 몇 줄 수정만 하면 pass. 구체 라인 수정안 제시.
- `revise` — plan 또는 writer 재실행 필요. 이유와 돌아갈 단계 제시.

**본문 섹션:**

- `## Verdict` — 한 줄 판정 + 근거 요약
- `## Axes Coherence` — plan의 5축과 draft 정합성
- `## Tone` — 표지/헤드라인 vs 본문 톤 규칙 (BRAND_GUIDE §3) 준수 여부
- `## Anti-richesse Check` — BRAND_GUIDE §12, CONTENT_STRATEGY anti-patterns 블랙리스트
- `## Source-backed Check` — draft `Claims`의 research 역추적 가능성
- `## Value Focus` — main user value 1개에 수렴하는지
- `## Line Edits` — 구체 수정 제안 (fix일 때)
- `## Revise Instructions` — 되돌릴 단계와 이유 (revise일 때)
- `## Next Step` — `publish` | `edit draft and re-review` | `back to planner` | `back to research`

---

## Conventions

- 모든 파일은 UTF-8, frontmatter는 YAML.
- 날짜는 ISO 8601 (`YYYY-MM-DD`).
- slug는 소문자, 하이픈, 한글 허용 (`2026-04-17-figma-ipo` or `2026-04-17-나발-인터뷰`).
- 미정 필드는 `-` 또는 생략하지 않고 명시.
