---
name: richesse-topic-curator
description: Use this skill when the user asks to choose, narrow, brainstorm, curate, score, package, or validate Instagram card-news topics for richesse.club. Trigger on requests such as 주제 선정, topic curation, topic ideation, angle finding, topic recommendation, or when Codex needs to turn a vague idea, article, interview, notes, or source material into strong richesse.club topic directions before content planning or copywriting.
---

# Richesse Topic Curator

## Overview

richesse.club에 맞는 카드뉴스 주제를 고르고 우선순위를 정한다. 막연한 아이디어, 원문 소스, 혹은 이미 적어둔 후보 리스트를 richesse다운 주제 후보와 1순위 방향으로 압축하되, 각 후보를 `Category / Format / User Value / Depth / Timing`으로 분류해 유연하게 패키징한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자 요청
- `richesse-source-intake` 결과물이 있으면 먼저 읽는다.
- 사용자가 제공한 기사, 인터뷰, 메모, 후보 주제 리스트

## Use Cases

### 1. Blank-slate ideation

사용자가 아무 소스 없이 "주제 추천", "이번 주 카드뉴스 뭐 하지?"처럼 묻는 경우다.

### 2. Source-to-topic

기사, 인터뷰, 영상 메모, 인물, 브랜드 사례가 있고 여기서 richesse.club다운 각도를 고르는 경우다.
가능하면 먼저 `richesse-source-intake` 결과물을 읽고 시작한다.

### 3. Topic triage

사용자가 이미 후보를 여러 개 갖고 있고, 그중 무엇을 밀어야 할지 결정해야 하는 경우다.

## Workflow

1. 브랜드 기준을 먼저 고정한다.
   - richesse.club은 wealth를 넓게 다루는 브랜드라는 점을 먼저 고정한다.
   - 무거운 인사이트형만 정답이라고 가정하지 않는다.
2. 입력을 구체적으로 읽는다.
   - 사람, 브랜드, 장면, 선택, 가격 전략, 문장 같은 구체 대상이 있는지 찾는다.
   - 추상 명사만 있는 주제는 바로 밀지 않는다.
3. 먼저 `Category`를 잡는다.
   - Places
   - Taste
   - Business
   - Money
   - People
   - Culture
4. 후보를 최소 5개 이상 만든다.
   - 같은 말만 바꾼 얇은 파생 후보는 세지 않는다.
   - 서로 다른 각도와 저장 포인트가 있어야 한다.
5. 각 후보의 `Format`을 정한다.
   - 큐레이션형
   - 스팟 소개형
   - 정리형
   - 비교형
   - 입문형
   - 리스트형
   - 케이스형
   - 인사이트형
   - 해설형
6. 각 후보의 `User Value`와 `Depth`를 정한다.
   - User Value는 메인 1개를 먼저 정하고, 필요하면 서브 1개까지만 붙인다.
   - 저장형 / 공유형 / 공감형 / 정보형 / 브랜딩형
   - Light / Medium / Deep
7. 각 후보의 `Timing`을 정한다.
   - Now / Evergreen / Seasonal
8. 각 후보를 점수화한다.
   - brand fit
   - format fit
   - save-worthiness
   - freshness
   - slide expandability
9. 상위 후보를 고른 뒤 하나를 추천한다.
   - 왜 이 주제가 richesse.club에 맞는지
   - 왜 이 포맷이 맞는지
   - 왜 이 timing이 맞는지
   - 왜 지금 올릴 만한지
   - 카드뉴스로 풀었을 때 어떤 리듬이 나오는지까지 함께 제시한다.

## Candidate Rules

모든 후보에는 아래 항목이 있어야 한다.

- `workingTitle`
- `category`
- `format`
- `user value`
- `depth`
- `timing`
- `core thesis`
- `why it fits richesse.club`
- `why people would save it`
- `slide promise`

`slide promise`는 전체 원고를 쓰지 말고, 카드뉴스가 어떤 4~7개의 논리로 전개될지만 짧게 보여준다.

## Scoring Rules

각 후보를 아래 기준으로 `1~5점`으로 본다.

- `brand fit`: richesse.club의 큰 세계 안에 자연스럽게 들어오는가
- `format fit`: 이 주제에 맞는 포맷을 골랐는가
- `save-worthiness`: 저장할 관점이 남는가
- `freshness`: 뻔한 자기계발 문법이나 얕은 럭셔리 추천을 벗어나는가
- `slide expandability`: 4~7장 카드로 밀도 있게 풀 수 있는가

점수 외에 `Timing`은 별도로 반드시 표시한다.
- `Now`: 지금 올릴 이유가 분명한가
- `Evergreen`: 상시 재고로 쌓아둘 가치가 있는가
- `Seasonal`: 계절이나 특정 시기에 맞춰 꺼내야 하는가

총점이 높아도 아래 중 하나면 추천하지 않는다.

- generic self-help
- pure news recap
- shouty wealth flex
- format mismatch
- 정보는 있지만 richesse다운 패키징이 없는 주제

## Output Format

기본 출력은 아래 순서를 따른다.

기본 출력 위치는 chat이다.

중간 planning 문서는 기본적으로 만들지 않는다. 저장은 design 직전 `final_report.md` 한 번만 허용한다.

### Topic Board

- `workingTitle`
- `category`
- `format`
- `user value`
- `depth`
- `timing`
- `one-line angle`
- `save reason`
- `score`

### Recommended Route

- 1순위 주제
- 왜 이 주제가 이기는지
- cover/title 방향 2~3개
- 4~7장 `slide promise`

### Hold or Reject

- 보류할 후보
- 버릴 후보
- 왜 richesse.club과 어긋나는지

## Tone Rules

- 한국어로 쓴다. 사용자가 다른 언어를 원할 때만 바꾼다.
- 주제에 따라 제목 문법을 바꾼다.
- 큐레이션형, 정리형, 리스트형은 직접적이고 저장하기 좋게 쓴다.
- 인사이트형, 해설형은 질문형, 관찰형, 대비형을 우선한다.
- 과장된 동기부여 톤을 피한다.
- `무조건`, `반드시`, `미친`, `폭발` 같은 자극어를 피한다.
- 독자를 몰아붙이기보다 기준을 높여 주는 톤을 유지한다.

## Hard Rules

- 후보가 약하면 개수를 채우려고 억지로 늘리지 않는다.
- source가 좋아도 원문 요약으로 끝내지 않는다.
- 모든 주제를 인사이트형으로 억지 변환하지 않는다.
- Places와 Taste는 큐레이션형, 소개형, 입문형이 자연스러운지 먼저 본다.
- Business와 Money는 정리형, 케이스형, 인사이트형이 자연스러운지 먼저 본다.
- User Value를 세 개 이상 붙이지 않는다.
- Timing 없이 후보를 끝내지 않는다.
- 사용자가 후보 하나만 원하면 여러 개를 길게 늘어놓지 말고 1순위와 차선책만 준다.
- 이 스킬은 주제 선정과 패키징 방향까지만 담당한다. 슬라이드 기획이나 전체 원고를 먼저 써버리지 않는다.
- 기본 산출물은 chat topic board다. 저장이 필요하면 design 직전 `final_report.md`에만 합친다.
