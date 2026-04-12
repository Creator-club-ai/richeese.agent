---
name: source-intake
description: This skill should be used first when the user provides a YouTube URL, article URL, X post, transcript, interview, memo, idea, or a selected news signal. Extract a normalized source packet, save an immutable snapshot note to Obsidian raw/, run wiki ingest, and in automated PDCA mode continue toward content-planner unless the source is too weak or fact-risk is still critical.
---

# Source Intake

## Purpose

모든 raw input을 richesse.club용 source packet으로 정규화한다. 이 단계에서는 아직 카드 구조를 만들지 않는다. 소스의 핵심 논지, usable points, 한계만 분명히 만든다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- `brands/richesse-club/CONTENT_STRATEGY.md`
- 사용자가 준 원문 링크, 텍스트, 메모
- `python scripts/editorial_memory.py snapshot` when running under automated PDCA

## Start Rule

아래 입력은 모두 먼저 `source-intake`를 거친다.

- YouTube URL
- 기사 URL
- X 포스트
- 인터뷰 텍스트
- transcript
- 메모
- 아이디어
- `morning-brew`에서 고른 신호

## Workflow

1. 입력 타입을 식별한다.
2. 가능한 범위에서 원문을 확보한다.
3. source packet을 만든다.
4. snapshot note를 `raw/`에 append-only로 저장한다.
5. 가치 있는 개념이 있으면 `wiki` ingest를 실행한다.
6. 소스 강도와 리스크를 판단한다.
7. manual mode면 packet 요약을 채팅에 보여주고 멈춘다.
8. automated PDCA mode면 blocker가 없을 때 `content-planner`로 넘긴다.

## YouTube Rule

YouTube는 먼저 자막을 추출하고 **반드시 `--save` 플래그로 저장**한다.

```bash
python scripts/get_transcript.py "<youtube_url>" --lang ko en --save
```

- `--save`를 쓰면 전체 자막이 타임스탬프 포함 `raw/YYYY-MM-DD-[slug].md`에 저장된다.
- intake packet(`raw/YYYY-MM-DD-[slug]-intake.md`)과 별도 파일로 공존한다.
- 에디터와 content-planner는 이 transcript 파일을 원문 참조로 쓴다.
- 자동 챕터가 아니라 실제 내용 전환을 기준으로 3-7개 챕터를 직접 잡는다.

## Source Packet

항상 아래 항목을 포함한다.

- source type
- title
- url or description
- one-line summary
- core thesis
- usable points
- direction cues
- risks or gaps
- source strength
- fact risk

필요하면 챕터 또는 섹션 breakdown도 붙인다.

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

저장 경로:

- `{vault}/raw/YYYY-MM-DD-[slug].md` — 전체 자막 원문 (YouTube일 때, get_transcript.py --save가 생성)
- `{vault}/raw/YYYY-MM-DD-[slug]-intake.md` — source packet 요약
- `{vault}/wiki/` — wiki ingest 결과

## Output Format

채팅에는 아래 형식으로 보여준다.

```markdown
## Source Snapshot
- source type:
- title:
- url or description:
- one-line summary:

## Core Thesis

## Usable Points
- 

## Direction Cues
- 

## Risks or Gaps
- 
```

## Rules

- `raw/`에 저장한 snapshot은 수정하지 않는다.
- raw source에서 정규화 없이 `content-planner`로 바로 넘어가지 않는다.
- 해석이 빈약한 소스는 빈약하다고 말한다.
- 원문에 없는 사실은 추가하지 않는다.

## Automation Rule

When running under `head`:

- mini model may extract sections, quotes, and factual claims
- full model must decide `core thesis`, `direction cues`, `source strength`, and `fact risk`
- route forward only when the source is usable

Use these rough thresholds:

- `source strength < 0.55` → stop and report weakness
- `fact risk > 0.40` → do one repair pass or stop
- otherwise route to `content-planner`
