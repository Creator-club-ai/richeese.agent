---
name: richesse-content-writer
description: Use this skill when the user asks to write richesse.club Instagram carousel copy after the topic and slide plan are already approved. Trigger on requests such as 카드뉴스 원고, carousel copy, caption draft, slide copy, copywriting, or when Codex needs to turn a richesse.club content plan into polished Korean slide text without redoing topic curation or planning.
---

# Richesse Content Writer

## Overview

승인된 richesse.club 기획안을 실제 카드뉴스 원고로 바꾼다. 주제와 슬라이드 구조는 이미 정해져 있다는 전제로, cover title, slide copy, closing line까지 읽기 좋은 한국어 카피로 정리한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자 요청
- `richesse-content-planner` 결과물이나 승인된 기획안
- 기사, 인터뷰, 메모, 레퍼런스가 있다면 함께 읽는다.

## Start Condition

- topic, format, user value, depth, timing이 이미 정해져 있어야 한다.
- slide flow가 없으면 `richesse-content-planner`를 먼저 쓴다.
- 이 스킬은 `무슨 주제를 할지`나 `어떤 흐름으로 갈지`를 다시 결정하지 않는다.

## Workflow

1. 입력을 고정한다.
   - topic
   - format
   - user value
   - depth
   - timing
   - slide plan
2. 포스트의 문장 리듬을 정한다.
   - 저장형이면 바로 이해되는 문장
   - 브랜딩형이면 richesse다운 시선이 살아 있는 문장
   - 정보형이면 과장보다 선명한 전달
3. cover copy를 먼저 쓴다.
   - 제목은 포맷에 맞는 문법으로 쓴다.
   - 첫 장에서 독자가 얻을 가치를 분명하게 약속한다.
4. 각 슬라이드 원고를 쓴다.
   - 슬라이드 역할을 바꾸지 않는다.
   - 한 슬라이드에는 메시지 1개만 남긴다.
   - 앞 슬라이드와 같은 말을 반복하지 않는다.
5. closing을 쓴다.
   - 억지 CTA보다 저장 이유, 시선, 정리감을 남긴다.
6. 전체 흐름을 다듬는다.
   - 과한 문장 제거
   - 같은 어휘 반복 제거
   - 너무 어려운 문장 단순화
7. 최종 원고만 낸다.
   - 기획안을 다시 뒤집지 않는다.
8. 기본적으로 chat에만 낸다.
   - 저장이 필요하면 design 직전 `final_report.md` 안에 포함한다.

## Output Format

기본 출력은 아래 순서를 따른다.

기본 출력 위치는 chat이다.

별도 copy 파일은 기본적으로 만들지 않는다. pre-design handoff가 필요할 때만 `final_report.md`에 합친다.

### Copy Snapshot

- `topic`
- `format`
- `user value`
- `depth`
- `timing`

### Cover

- `title option 1`
- `title option 2`
- 필요하면 `sub line` 또는 `cover promise`

### Slide Copy

각 슬라이드는 아래 구조를 따른다.

- `slide number`
- `role`
- `headline`
- `body copy`
- 필요하면 `bullet` 또는 `quote line`

### Closing

- 마지막 슬라이드용 마무리 문장
- 캡션 마지막 한 줄로도 전환 가능한 문장

## Writing Rules

- 한국어로 쓴다. 사용자가 다른 언어를 원할 때만 바꾼다.
- richesse.club 문장은 짧고 정제되어야 한다.
- 원문 키워드를 라벨처럼 꽂지 말고 자연스러운 한국어로 다시 쓴다.
- `있어 보이는 말`보다 `바로 읽히는 말`을 우선한다.
- 저장형은 이해 속도와 정리감을 우선한다.
- 정보형은 군더더기 없는 전달을 우선한다.
- 브랜딩형은 richesse다운 시선과 결을 우선한다.
- depth가 Light면 과하게 무겁게 쓰지 않는다.
- depth가 Deep이어도 허세나 권위적인 자기계발 톤('~해야 한다', '~해라')으로 밀어붙이지 않는다.
- **톤 분리 규칙:** 기사의 표지, 헤드라인, 요약 리스트 등은 짧고 강렬하게 쓰며, 이때는 힘 있는 문어체('~한다', '~하는가' 등)를 써도 무방하다.
- **본문/캡션 규칙:** 단, 길이가 긴 본문 단락이나 캡션에서는 딱딱한 문어체를 피하고 세련된 대화체/반존대('~요', '~죠')를 써서 독자에게 여유 있게 말을 건넨다.

## Format-Specific Rules

### 큐레이션형 / 소개형

- 설명보다 선택 기준과 매력을 선명하게 쓴다.
- 장소나 대상의 결이 바로 보이게 쓴다.
- 억지 철학을 붙이지 않는다.

### 정리형 / 리스트형 / 입문형

- 저장이 잘 되도록 구조를 명확하게 쓴다.
- 겹치는 항목을 줄인다.
- 어려운 말을 쓰기보다 바로 구분되게 쓴다.

### 비교형

- 무엇이 어떻게 다른지 비교축이 분명해야 한다.
- 슬라이드마다 비교 기준이 흐려지면 안 된다.

### 케이스형 / 인사이트형 / 해설형

- 흐름과 논리의 연결이 중요하다.
- 한 문장씩 똑똑해 보이는 것보다, 읽고 나면 남는 결론이 더 중요하다.

## Hard Rules

- topic curation으로 다시 돌아가지 않는다.
- planner가 정한 slide role을 함부로 바꾸지 않는다.
- 슬라이드마다 같은 주장만 반복하지 않는다.
- 한 슬라이드에 정보가 너무 많으면 줄인다.
- 한 슬라이드가 너무 비면 억지로 멋부리지 말고 정보 밀도를 다시 맞춘다.
- 과장된 성공담, 허세, 자기계발 클리셰를 피한다.
- 이 스킬은 원고 작성까지 담당한다. 디자인 문제를 원고로 해결하려 들지 않는다.
- 기본 산출물은 chat copy다. 저장은 `final_report.md` 하나만 기본값으로 본다.
