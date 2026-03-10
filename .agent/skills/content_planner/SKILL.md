---
name: content_planner
description: This skill should be used when the user asks to "카드뉴스 기획해줘", "slide_plan.md 만들어줘", "리서치 브리프로 카드뉴스 구조 짜줘", or "이 자료로 카드뉴스 플랜 만들어줘". It converts research or provided sources into an approval-ready `slide_plan.md`.
---

# Card-News Planner Skill

## 목적

`research_brief.md` 또는 제공 자료를 카드뉴스 한 편의 구조로 고정한다.
상세 원고가 아니라, 승인 가능한 기획 문서 `slide_plan.md` 를 만든다.

## 먼저 확인할 문서

- 워크스페이스 루트의 `CARD_NEWS_TEAM.md`
- 워크스페이스 루트의 `brands/README.md`
- `researched` 프로젝트라면 `research_brief.md`
- `provided` 프로젝트라면 제공 자료 묶음
- active brand 가 정해져 있다면 `brands/<active-brand>/BRAND_GUIDE.md`
- active brand 가 정해져 있다면 필요 시 `brands/<active-brand>/DESIGNER_HANDOFF_BRIEF.md`

## 역할 경계

- `slide_plan.md` 까지만 만든다.
- 상세 카피, 캡션, 디자인 JSON 을 만들지 않는다.
- 승인 전 단계라는 사실을 문서 안에 명시한다.

## 카드뉴스 포맷 선택

기획 시작 전에 아래 포맷 중 하나를 고른다.

| 포맷 | 잘 맞는 주제 |
| --- | --- |
| `news brief` | 발표, 정책, 업계 변화, 일정 정리 |
| `curation` | 링크, 사례, 툴, 추천 리스트 |
| `explainer` | 개념 해설, 오해 정리, 구조 설명 |
| `checklist` | 실행 항목, 실수 방지, 저장형 정보 |
| `insight` | 해석, 관점, 판단 기준 제시 |

## 작업 순서

1. 입력 자료가 충분한지 확인한다.
2. active brand 를 확인하고 브랜드 가이드가 있으면 먼저 읽는다.
3. 주제 클래스와 카드뉴스 포맷을 하나로 고정한다.
4. 대상 독자와 저장/공유 가치 한 줄을 정한다.
5. 핵심 메시지를 하나의 문장으로 압축한다.
6. 핵심 포인트 3개를 정한다.
7. 6~10장 기준으로 슬라이드 흐름을 설계한다.
8. active brand 기준으로 톤과 비주얼 방향을 정리한다.
9. 결과를 `slide_plan.md` 로 저장한다.

## 앱 호환 규칙

아래 제목은 현재 앱이 읽는 필드이므로 반드시 그대로 포함한다.

- `## 대상 독자`
- `## 핵심 메시지 한 줄`
- `## 왜 지금 이 주제인가`
- `## 핵심 포인트 1`
- `## 핵심 포인트 2`
- `## 핵심 포인트 3`
- `## 예상 슬라이드 수`
- `## 마지막 CTA`

## 출력 파일 형식

`slide_plan.md` 는 아래 구조를 기본으로 사용한다.

```markdown
# 카드뉴스 기획안 - [가제]

## 기본 정보
- 브랜드:
- 콘텐츠 포맷:
- 주제 클래스:
- sourceType:
- 승인 상태: Pending owner approval

## 대상 독자

## 핵심 메시지 한 줄

## 왜 지금 이 주제인가

## 핵심 포인트 1

## 핵심 포인트 2

## 핵심 포인트 3

## 예상 슬라이드 수

## 마지막 CTA

## 슬라이드 흐름
- Slide 1 (Cover):
- Slide 2 (Context):
- Slide 3:
- Slide 4:
- Slide 5:
- Slide 6:
- Final (CTA):

## 비주얼 디렉션
- 톤 키워드 3개:
- 추천 시각 패턴:
- 반드시 보여줄 요소:
- 피해야 할 요소:

## 다음 단계
- owner 승인 이후 `content_editor`, `slide_designer` 진행
```

## 품질 기준

- 한 편에서 말하고 싶은 메시지는 하나여야 한다.
- 핵심 포인트는 3개를 넘기지 않는다.
- 슬라이드 수가 10장을 넘기면 구조를 다시 줄인다.
- 디자이너가 바로 해석할 수 있는 시각 방향을 남긴다.

## 중단 조건

아래 경우에는 억지로 플랜을 만들지 말고 필요한 입력을 반환한다.

- `researched` 인데 `research_brief.md` 가 없음
- active brand 가 명시되었지만 해당 브랜드 가이드가 없음
- 자료가 약해서 핵심 메시지를 하나로 압축할 수 없음
- 포맷을 하나로 고르지 못함
- 핵심 포인트가 3개로 정리되지 않음
