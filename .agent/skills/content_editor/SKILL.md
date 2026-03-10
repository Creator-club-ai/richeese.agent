---
name: content_editor
description: This skill should be used when the user asks to "카드뉴스 카피 써줘", "carousel_draft.md 만들어줘", "카드뉴스 원고와 디자이너 브리프 정리해줘", or "기획안 기반으로 슬라이드 문안 작성해줘". It writes both `carousel_draft.md` and `handoff_brief.md` for the card-news pipeline.
---

# Card-News Editor Skill

## 목적

승인된 `slide_plan.md` 를 실제 제작에 바로 쓸 수 있는 원고 묶음으로 바꾼다.
출력은 반드시 `carousel_draft.md` 와 `handoff_brief.md` 두 파일이다.

## 먼저 확인할 문서

- 워크스페이스 루트의 `CARD_NEWS_TEAM.md`
- 워크스페이스 루트의 `brands/README.md`
- 프로젝트 폴더의 `approvals.json`
- 프로젝트 폴더의 `slide_plan.md`
- 필요 시 `research_brief.md`
- active brand 가 정해져 있다면 `brands/<active-brand>/BRAND_GUIDE.md`
- active brand 가 정해져 있다면 `brands/<active-brand>/DESIGNER_HANDOFF_BRIEF.md`

## 역할 경계

- 레이아웃과 JSON 구조는 여기서 확정하지 않는다.
- 카피와 디자이너 핸드오프만 만든다.
- 승인 상태가 아니면 새 원고를 만들지 않는다.

## 시작 조건

- `approvals.json.slidePlan.status` 가 `approved` 여야 한다.
- `slide_plan.md` 가 존재해야 한다.
- 계획 안의 핵심 포인트 3개가 읽혀야 한다.

## 작업 순서

1. `approvals.json` 으로 실제 승인 상태를 확인한다.
2. active brand 를 확인하고 브랜드 가이드가 있으면 먼저 읽는다.
3. `slide_plan.md` 에서 대상 독자, 핵심 메시지, 핵심 포인트, CTA 를 읽는다.
4. 필요하면 `research_brief.md` 에서 사실과 수치를 다시 확인한다.
5. 슬라이드당 메시지 하나 원칙으로 원고를 압축한다.
6. `carousel_draft.md` 를 작성한다.
7. 같은 내용을 디자이너 관점으로 재구성한 `handoff_brief.md` 를 작성한다.

## 출력 파일 1. `carousel_draft.md`

```markdown
# Carousel Draft - [가제]

## Slide 1
- 역할: Cover
- 목적:
- 헤드라인:
- 서브카피:
- 강조어:
- 출처 메모:

## Slide 2
- 역할: Context
- 목적:
- 헤드라인:
- 본문:
- 강조어:
- 출처 메모:

## Slide 3
- 역할: Body
- 목적:
- 헤드라인:
- 본문:
- 강조어:
- 출처 메모:

## Final
- 역할: CTA
- 목적:
- CTA 문구:
- 보조 문구:

## Caption Draft
- 첫 줄:
- 본문:
- 핵심 포인트:
  1.
  2.
  3.
- 해시태그:
```

## 출력 파일 2. `handoff_brief.md`

```markdown
# Handoff Brief - [가제]

## 프로젝트 정보
- 콘텐츠 ID:
- 규격: 1080x1350
- 브랜드:
- 브랜드 가이드 경로:
- 주제 클래스:

## 핵심 목표
-

## 메시지 우선순위
1.
2.
3.

## 톤 / 시각 방향
- 톤 키워드:
- 추천 패턴:
- 강조해야 할 숫자/사실:
- 피해야 할 표현:

## 슬라이드별 역할 메모
- Slide 1:
- Slide 2:
- Slide 3:
- Final:

## 디자이너 주의 메모
- 모바일 가독성 리스크:
- 텍스트 밀도 리스크:
- 시각 소재 힌트:
```

## 품질 기준

- 슬라이드당 메시지는 하나만 남긴다.
- 강조어는 디자이너가 바로 볼 수 있게 짧게 남긴다.
- 캡션은 카드에서 못 담은 맥락만 보강한다.

## 중단 조건

아래 경우에는 억지로 원고를 쓰지 말고 부족한 점을 명시하고 멈춘다.

- `approvals.json` 에서 승인 상태가 아님
- active brand 가 명시되었지만 해당 브랜드 가이드가 없음
- `slide_plan.md` 의 핵심 메시지가 모호함
- 근거 없는 수치가 원고에 끼어들 수밖에 없음
- 한 슬라이드에 메시지 2개 이상이 들어가야만 성립함
