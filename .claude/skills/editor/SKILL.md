---
name: editor
description: This skill should be used when the user has approved a content plan and is ready to write carousel copy. Take the approved direction and slide plan from content-planner, write headline + body copy for each slide following richesse.club tone rules, then stop for user approval after updating the operating card note. Invoke designer later only when design handoff is needed.
---

# Editor

## Purpose

승인된 구조를 실제 카피로 바꾼다. 각 슬라이드에는 메시지 하나만 남긴다. 정보량보다 저장 가치와 문장 압축을 우선한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 승인된 content plan
- 원문 source가 필요하면 다시 확인

## Workflow

1. content-planner의 방향과 구조를 다시 읽는다.
2. 슬라이드별 `headline`과 `body`를 쓴다.
3. 채팅에 초안을 보여주고 멈춘다.
4. 승인 후 copy note와 운영 카드의 `## Slide Copy`를 갱신한다.
5. 운영상 기본 종료점으로 멈춘다. `designer`는 나중에 필요할 때만 붙인다.

## Tone Rule

- 기본 문체는 격식체로 쓴다 (~다, ~한다).
- 자기계발 톤을 피한다.
- 원문을 번역체로 옮기지 않는다.
- slide마다 메시지 하나만 남긴다.
- closing은 과한 CTA 대신 관점을 남긴다.

## Body Writing Rule

각 슬라이드 body는 아래 흐름으로 쓴다.

1. **setup** — 독자가 아는 상식이나 전제를 먼저 놓는다
2. **contrast or context** — 그 전제를 뒤집거나 케이스로 들어간다
3. **case detail** — 구체적인 인물명, 숫자, 행동을 쓴다
4. **볼드 결론 문장** — 슬라이드의 핵심을 한 문장으로 박는다. 반드시 **bold** 처리.

body는 3~5문장. 억지로 늘리거나 줄이지 않는다.
헤드라인에는 `[번호]` 형식을 붙인다 (Rule 슬라이드 한정).
볼드 결론 문장은 슬라이드에서 저장되는 문장이다 — 가장 압축되고 강해야 한다.

## Length Rule

- cover: headline만. body 없음.
- closing: 짧게
- 일반 body slide: 밀도는 유지하되 과하게 길게 늘리지 않는다
- 확장 slide가 필요해도 한 슬라이드에 두 메시지를 넣지 않는다

## Output Format

```markdown
## Slide Copy

**Slide 1 - cover**
headline:
body:

**Slide 2 - [role]**
headline:
body:
```

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

승인 후 저장:

- `{vault}/04_copy/YYYY-MM-DD-[working-title].md`
- `{vault}/content/instagram/[working-title].md`

## Card Sync Rule

운영 카드에는 `## Slide Copy` 섹션을 유지한다.

이미 발행된 카피가 있으면 문구를 새로 쓰지 말고 구조만 정리한다.

## Rules

- content plan을 다시 설계하지 않는다.
- 사실이 약한 문장은 세게 쓰지 않는다.
- 승인 전에는 채팅 초안만 사용한다.
- 승인 후에도 기본적으로 여기서 멈춘다.
- `designer`는 실제 디자인 handoff나 Figma 제작이 필요할 때만 이어서 쓴다.
