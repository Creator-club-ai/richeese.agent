---
name: richesse-content-planner
description: Use this skill when the user asks to plan a richesse.club Instagram carousel after the topic is already chosen. Trigger on requests such as 콘텐츠 기획, 카드뉴스 기획, slide flow, carousel structure, outline, planning, or when Codex needs to turn an approved richesse.club topic, angle, source material, or curated route into a clear 4-7 slide content plan before copywriting.
---

# Richesse Content Planner

## Overview

선정된 richesse.club 주제를 실제 카드뉴스 구조로 바꾼다. 주제는 이미 정해져 있다는 전제로, audience, hook, slide flow, key points, closing note까지 정리된 기획안을 만든다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자 요청
- `richesse-topic-curator` 결과물이나 승인된 주제 메모
- 기사, 인터뷰, 메모, 레퍼런스가 있다면 함께 읽는다.

## Start Condition

- 주제의 큰 방향은 이미 정해져 있어야 한다.
- 아직 주제 후보가 여러 개인 상태라면 `richesse-topic-curator`를 먼저 쓴다.
- 이 스킬은 `무슨 주제를 할지`보다 `이 주제를 어떻게 카드뉴스로 풀지`를 결정한다.

## Workflow

1. 주제 입력을 고정한다.
   - topic
   - category
   - format
   - user value
   - depth
   - timing
2. 이 포스트의 목적을 한 줄로 정리한다.
   - 무엇을 알려줄지
   - 왜 저장할지
   - 읽고 나면 어떤 감각이 남아야 할지
3. audience와 reading mode를 정한다.
   - 가볍게 저장할 포스트인지
   - 천천히 읽는 인사이트형인지
4. slide count를 정한다.
   - 보통 `4~7장` 안에서 결정한다.
   - 정보량이 적으면 억지로 늘리지 않는다.
5. cover 방향을 잡는다.
   - 제목 문법
   - 첫 장에서 약속할 가치
6. body 흐름을 설계한다.
   - 각 슬라이드의 역할이 겹치지 않게 나눈다.
   - 주장 / 정리 / 비교 / 예시 / 해설 / 마무리의 리듬을 조절한다.
7. closing을 정한다.
   - 억지 CTA보다, 저장 이유나 시선이 남는 마무리를 우선한다.
8. source gap을 점검한다.
   - 추가 자료가 필요한지
   - 근거가 약한 슬라이드가 있는지
9. 기획안만 만든다.
   - 전체 원고를 먼저 쓰지 않는다.
10. 기본적으로 chat에만 남긴다.
   - 저장이 필요하면 design 직전에 `final_report.md` 섹션으로만 정리한다.

## Output Format

기본 출력은 아래 순서를 따른다.

기본 출력 위치는 chat이다.

중간 planning 파일은 기본적으로 만들지 않는다. 저장은 최종 pre-design handoff 시점의 `final_report.md`만 사용한다.

### Plan Snapshot

- `topic`
- `category`
- `format`
- `user value`
- `depth`
- `timing`

### Content Goal

- 이 포스트가 독자에게 남길 핵심 가치 1문장
- audience
- why now

### Cover Direction

- 제목 방향 2~3개
- 어떤 톤으로 첫 장을 열지
- 첫 장에서 약속할 저장 포인트

### Slide Plan

- slide 1: role
- slide 2: role
- slide 3: role
- slide 4: role
- 필요하면 slide 5~7까지

각 슬라이드에는 아래를 붙인다.
- `goal`
- `key point`
- `notes`

### Closing Note

- 어떻게 마무리할지
- 저장형이면 무엇을 남길지
- 브랜딩형이면 어떤 시선을 남길지

### Risks or Gaps

- 자료가 더 필요한 부분
- 흐름이 약한 부분
- copy 단계에서 더 보강할 부분

## Planning Rules

- 기획은 항상 `format`에 맞게 짠다.
- 큐레이션형은 읽기 쉬운 정리와 선택 기준이 먼저다.
- 정리형은 중복 없는 구조와 저장성이 먼저다.
- 인사이트형은 흐름의 밀도와 결론의 정확성이 먼저다.
- 소개형은 정보량보다 한 대상의 매력을 선명하게 잡는 것이 먼저다.
- 비교형은 비교 기준이 명확해야 한다.
- 입문형은 어렵게 아는 척하지 않는다.

## Hard Rules

- 주제 선정으로 다시 돌아가지 않는다. 그 단계는 curator의 역할이다.
- 기획 단계에서 전체 원고를 먼저 써버리지 않는다.
- 슬라이드 역할이 겹치면 안 된다.
- 한 포스트에 메시지가 여러 개로 갈라지면 다시 줄인다.
- depth가 Light면 과하게 무겁게 쓰지 않는다.
- timing이 Seasonal이면 시즌성을 살리는 장치를 넣는다.
- source가 약하면 그 사실을 숨기지 말고 `Risks or Gaps`에 적는다.
- 기본 산출물은 chat plan이다. 저장이 필요하면 `final_report.md`에만 붙인다.
