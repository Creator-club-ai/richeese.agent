---
name: richesse-source-intake
description: Use this skill when the user provides a source such as a YouTube URL, article URL, interview, transcript, podcast, notes, or raw reference and wants to build richesse.club content from it. Trigger before topic curation when Codex needs to extract the source thesis, notable points, reusable angles, and content-worthy moments from raw material.
---

# Richesse Source Intake

## Overview

raw source를 richesse.club에서 쓸 수 있는 chat-first intake brief로 바꾼다. 단순 요약이 아니라, source에서 카드뉴스로 발전시킬 수 있는 주장, 장면, 문장, 포인트, 후보 각도를 추출한다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 사용자 요청
- source 자체
  - YouTube URL
  - article URL
  - transcript
  - interview notes
  - memo

## Start Condition

- 아직 주제가 정해지지 않았거나, source 기반으로 어떤 주제를 뽑을지 정해야 할 때 쓴다.
- source에서 바로 topic을 확정하지 않는다.
- intake 결과물은 기본적으로 chat에 남기고, 다음 단계에서 `richesse-topic-curator`가 읽는다.

## Workflow

1. source의 형태를 먼저 파악한다.
   - YouTube 영상인지
   - 기사인지
   - 인터뷰인지
   - 단순 메모인지
2. source를 읽고 핵심 주장과 핵심 장면을 뽑는다.
   - 이 source가 결국 무슨 이야기를 하는지
   - 어떤 대목이 가장 카드뉴스화하기 쉬운지
3. source 안의 usable points를 분리한다.
   - 카드 한 장으로 옮길 수 있는 포인트
   - 저장성이 있는 정리 포인트
   - 비교나 해설로 확장 가능한 포인트
4. richesse.club에 맞는지 판단한다.
   - wealth의 큰 세계 안에 들어오는가
   - 너무 generic한가
   - 지나치게 뉴스 요약형인가
5. source를 한 덩어리로 쓸지, 일부만 뽑아 쓸지 정한다.
   - 전체를 하나의 포스트로 갈지
   - 한 포인트만 떼어 단독 포스트로 갈지
6. candidate angles를 뽑는다.
   - 이 source에서 가능한 방향을 최소 3개 이상 만든다.
   - 단순 제목 나열이 아니라 왜 가능한지 짧게 적는다.
7. format hints를 붙인다.
   - 정리형으로 좋은지
   - 인사이트형으로 좋은지
   - 케이스형, 해설형, 입문형이 맞는지
8. source risk를 적는다.
   - 근거가 약한 부분
   - 표현을 그대로 가져오면 위험한 부분
   - 추가 확인이 필요한 부분

## Output Format

기본 출력은 아래 순서를 따른다.

기본 출력 위치는 chat이다.

중간 파일은 만들지 않는다. 저장이 필요하면 최종 pre-design handoff 시점에만 `final_report.md`로 합친다.

### Source Snapshot

- `source type`
- `source title`
- `source link` 또는 `source description`
- `one-line summary`

### Core Thesis

- 이 source가 말하는 핵심 주장 1~2개

### Notable Moments

- 기억할 만한 장면
- 카드 한 장으로 옮길 만한 포인트
- 인용하거나 변환할 만한 문장

### Usable Points

- `point`
- `why it matters`
- `likely format`

### Candidate Angles

- `working angle`
- `why it can become a post`
- `best format hint`

### Recommended Extraction

- source 전체를 다룰지
- 한 부분만 떼어낼지
- 어떤 방향이 가장 richesse.club에 맞는지

### Risks or Gaps

- 추가 확인이 필요한 부분
- source만으로는 약한 부분
- 표현을 순화하거나 재구성해야 하는 부분

## YouTube-Specific Rules

- 영상 전체 줄거리를 길게 요약하지 않는다.
- 시간 순서 요약보다 카드뉴스로 옮길 수 있는 포인트를 우선한다.
- 말이 많은 영상이라도 핵심 장면과 핵심 주장만 남긴다.
- 자막 문장을 그대로 옮기지 말고, richesse.club에 맞는 언어로 다시 쓸 준비를 한다.

## Hard Rules

- intake 단계에서 최종 topic을 확정하지 않는다.
- intake 단계에서 slide flow나 원고를 먼저 쓰지 않는다.
- source 요약으로 끝내지 않는다.
- 쓸 만한 포인트와 버릴 포인트를 구분한다.
- richesse.club과 맞지 않는 source면 그 사실을 분명하게 적는다.
- 기본 산출물은 chat brief다. 별도 intake 문서를 새로 만들지 않는다.
