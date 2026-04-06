---
name: source-intake
description: Use this skill first whenever the user provides a source or an idea. Handles YouTube URLs, article URLs, X posts, transcripts, interviews, notes, and vague topic memos. Extracts a normalized source packet, saves an immutable snapshot note to Obsidian raw/, runs wiki ingest, then stops for user approval before pitch.
---

# Source Intake

## Role

모든 raw input을 richesse.club이 쓸 수 있는 source packet으로 정리한다. YouTube 영상이면 자막을 직접 가져와서 LLM이 챕터를 구성하고 요약한다. 기사, X 글, 인터뷰, 메모, 막연한 아이디어도 바로 pitch로 넘기지 않고 먼저 intake에서 정규화한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자가 제공한 소스 또는 아이디어

## Start Rule

- YouTube URL / 영상
- 기사 URL
- X 포스트 / 스레드
- transcript / interview text
- 메모 / 아이디어
- feed-curator에서 사용자가 고른 signal

위 입력은 모두 `source-intake`를 먼저 거친다.

**pitch로 바로 넘기지 않는다.**

## Workflow

1. 입력 타입을 식별한다.
   - YouTube
   - article
   - X
   - transcript
   - memo / idea
   - curated signal

2. 가능한 경우 원문을 읽는다.
   - YouTube는 자막 추출
   - 기사 / X / 인터뷰는 제공된 원문 또는 링크를 기준으로 읽기
   - feed-curator signal이면 원본 URL과 signal 설명을 함께 읽기

3. source packet을 만든다.
   - source snapshot
   - chapter or section breakdown
   - core thesis
   - usable points
   - candidate angles
   - risks or gaps

4. source snapshot note를 Obsidian `raw/`에 append-only로 저장한다.
   - 이미 `raw/`에 원본 소스 파일이 있으면 수정하지 않는다.
   - intake 결과는 별도 note로만 추가한다.

5. `wiki` ingest를 즉시 실행한다.
   - 인물 / 브랜드 / 개념 / 시그널이 있으면 `06_wiki/` 반영
   - 새로 저장할 지식이 없으면 skip 가능

6. 채팅에 intake brief + wiki ingest 결과를 출력하고 멈춘다.

7. 사용자 승인 후에만 pitch로 넘어간다.

## YouTube URL 처리

### Step 1 — 자막 추출

```bash
python scripts/get_transcript.py "<youtube_url>" --lang ko en
```

한국어 자막 우선, 없으면 영어 자막 사용.

### Step 2 — LLM 챕터 구성

스크립트 출력의 `segments`와 `full_text`를 읽고, **YouTube 내장 챕터를 무시하고** 내용 흐름 기반으로 챕터를 직접 구성한다.

챕터 구성 기준:
- 주제나 흐름이 전환되는 지점을 기준으로 나눈다
- 너무 잘게 나누지 않는다. 보통 3~7개
- 각 챕터는 시작 타임스탬프 + 제목 + 2~3문장 요약
- 챕터 안에서 카드뉴스로 쓸 만한 핵심 발언이나 장면이 있으면 별도로 뽑는다

## 일반 소스 처리

YouTube가 아니면 스크립트 없이 바로 소스를 읽고 intake brief를 작성한다.

## Obsidian 저장 경로

- source snapshot note: `C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os/raw/YYYY-MM-DD-[slug]-intake.md`
- wiki: `C:/Users/HP/OneDrive/문서/Obsidian Vault/richesse-content-os/06_wiki/`

## Output Format

채팅에 출력한다. source snapshot note와 wiki artifact는 Obsidian에 저장한다.

### Source Snapshot

```
- source type: YouTube / article / x / transcript / memo / signal
- title:
- url or description:
- language:
- one-line summary:
```

### Chapter Breakdown

YouTube나 긴 텍스트면 사용한다.

```
## Chapter 1 — [제목]
타임스탬프 또는 구간: 0:00 ~ 3:24
요약: [2~3문장]
주목할 발언: [있으면]
```

### Core Thesis

이 소스가 말하는 핵심 주장 1~2개.

### Usable Points

카드뉴스로 옮길 수 있는 포인트. 각 포인트마다:
- `point`: 무엇인가
- `why it matters`: 왜 richesse.club 독자에게 의미 있는가
- `likely format`: 정리형 / 인사이트형 / 해설형 / 케이스형 등

### Candidate Angles

이 소스에서 가능한 richesse.club 포스트 방향. 각 각도마다:
- `working angle`: 제목 방향
- `why it can become a post`: 왜 포스트가 되는가
- `best format hint`: 추천 포맷

### Risks or Gaps

- 근거가 약한 부분
- 표현을 그대로 쓰면 위험한 부분
- 추가 확인이 필요한 부분

### Wiki Ingest Result

```
신규 / 업데이트된 people, brands, concepts, signals 요약
```

마지막 두 줄:

> source-intake와 wiki 반영이 끝났습니다.
> 이 packet으로 pitch에 들어갈까요?

## Hard Rules

- intake 단계에서 최종 topic을 확정하지 않는다.
- slide 구조나 원고를 먼저 쓰지 않는다.
- YouTube는 반드시 스크립트로 자막을 가져온다. 영상 내용을 추측하지 않는다.
- 챕터는 YouTube 내장 챕터가 아니라 내용 흐름 기반으로 LLM이 직접 구성한다.
- 소스가 richesse.club과 맞지 않으면 솔직하게 말한다.
- `raw/`에 있는 기존 소스 파일은 수정하지 않는다. intake 결과는 새 파일로만 추가한다.
- `pitch`로 자동 진행하지 않는다. 사용자 확인 후에만 넘긴다.
