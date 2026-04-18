# Phase Contracts

각 phase가 **무슨 산출물을 남기고 어디에 붙는지**만 정의한다.
브랜드 판단 기준은 active profile 문서를 따른다.

## 1. News

- main output: `오늘의 뉴스/YYYY-MM-DD.md`
- machine artifact: `오늘의 뉴스/YYYY-MM-DD.json`
- role: shortlist only
- next step: selected signal만 `content-os-research`

## 2. Research

- primary job: source normalization
- side effects:
  - 필요 source는 `raw/`에 보관
  - reusable context는 `wiki/`에 업데이트
- optional machine artifact:
  - `wiki/editorial-memory/head-artifacts/<run-id>/research-output.md`
- next step: `content-os-planner`

`ResearchOutput` should include:

- topic
- what happened
- usable points
- key quotes (optional)
- recurring themes (optional)
- direction cues
- risks or gaps
- source strength
- fact risk
- recommendation

## 3. Plan

- output path: `content/ideas/<slug>.md`
- role: editorial brief only
- next step: `content-os-writer`

`PlanOutput` should include:

- working title
- selected topic
- topic candidates
- core fact
- key insights
- selected angle
- angle candidates
- backup angles
- tension
- save reason
- selected format
- outline
- blockers

## 4. Draft

- output path:
  - Instagram: `content/instagram/drafts/<slug>.md`
  - Magazine: `content/magazine/drafts/<slug>.md`
- role: publishable draft
- next step: `content-os-reviewer`

`CopyOutput` should include:

- working title
- headline
- body / slide copy
- claims
- open questions
- confidence note

## 5. Review

- optional machine artifact:
  - `wiki/editorial-memory/head-artifacts/<run-id>/review-output.md`
- role: gate only
- verdicts:
  - `pass`
  - `fix`
  - `revise`

`ReviewOutput` should include:

- verdict
- axes coherence
- tone
- anti-richesse check
- source-backed check
- value focus
- next step

When verdict is:

- `pass`
  - ask before copying draft into matching `published/` folder
- `fix`
  - provide concrete line edits
- `revise`
  - send back to the correct prior phase
