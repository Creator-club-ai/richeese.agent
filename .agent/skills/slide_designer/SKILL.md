---
name: slide_designer
description: This skill should be used when the user asks to "카드뉴스 디자인해줘", "carousel.json 만들어줘", "원고 기반으로 슬라이드 렌더용 JSON 짜줘", or "디자이너 단계 진행해줘". It turns approved card-news inputs into `carousel.json` while preserving 1080x1350 rendering rules.
---

# Card-News Slide Designer Skill

## 목적

승인된 카드뉴스 기획과 원고를 시각 설계로 변환한다.
기본 산출물은 `carousel.json` 이며, 렌더는 명시적으로 요청될 때만 이어서 수행한다.

## 먼저 확인할 문서

- 워크스페이스 루트의 `CARD_NEWS_TEAM.md`
- 워크스페이스 루트의 `brands/README.md`
- active brand 가 정해져 있다면 `brands/<active-brand>/BRAND_GUIDE.md`
- active brand 가 정해져 있다면 `brands/<active-brand>/DESIGNER_HANDOFF_BRIEF.md`
- 프로젝트 폴더의 `approvals.json`
- 프로젝트 폴더의 `carousel_draft.md`
- 프로젝트 폴더의 `handoff_brief.md`

## 역할 경계

- 여기서 책임지는 결과는 `carousel.json` 이다.
- 리서치 재작성이나 기획 재정의는 하지 않는다.
- 승인되지 않은 문서를 억지로 디자인으로 밀어 넣지 않는다.
- 특정 브랜드의 시각 패턴을 스킬 안에 고정하지 않는다.
- active brand 가이드가 있으면 그 문서를 먼저 해석하고 따른다.

## 시작 조건

- `approvals.json.slidePlan.status` 가 `approved` 여야 한다.
- `carousel_draft.md` 와 `handoff_brief.md` 가 모두 있어야 한다.
- active brand 가 명시되었으면 해당 브랜드 가이드를 읽을 수 있어야 한다.
- 6~10장 안에서 메시지가 성립해야 한다.

## 디자인 원칙

- active brand 가이드가 있으면 그 가이드 안에서 레이아웃과 톤을 판단한다.
- 스킬 안에 고정된 스타일을 강요하지 않고, 메시지 전달력과 브랜드 일관성을 우선한다.
- 한 슬라이드의 핵심 메시지는 하나만 보이게 만든다.
- 1080x1350, 즉 4:5 기준을 지킨다.
- 모바일에서 3초 안에 핵심이 읽혀야 한다.

## 공통 가드레일

- 구조 없는 텍스트 나열을 피한다.
- 승인되지 않은 내용을 디자인으로 확정하지 않는다.
- 브랜드 가이드와 충돌하는 스타일을 임의로 추가하지 않는다.

## 작업 순서

1. `approvals.json` 으로 실제 승인 상태를 확인한다.
2. `carousel_draft.md` 와 `handoff_brief.md` 로 슬라이드 역할과 메시지를 정리한다.
3. active brand 를 확인하고 해당 브랜드 가이드를 읽는다.
4. 슬라이드별 HTML/CSS 를 설계한다.
5. 결과를 `carousel.json` 으로 저장한다.
6. 렌더 요청이 있으면 현재 렌더러 규칙으로 실행한다.

## 출력 파일 형식

`carousel.json` 은 아래 구조를 유지한다.

```json
{
  "meta": {
    "eyebrow": "Card News"
  },
  "slides": [
    {
      "html": "<콘텐츠 영역 HTML>",
      "css": "슬라이드별 CSS",
      "theme": "light | dark",
      "chrome": "full | none",
      "footer": "minimal | none",
      "eyebrow": "선택적 오버라이드"
    }
  ]
}
```

## 렌더 규칙

- 출력 규격은 1080x1350 이다.
- 출력 폴더는 `renders/<콘텐츠ID>` 를 기본으로 사용한다.
- 한국어 텍스트는 `word-break: keep-all` 을 우선 적용한다.

## 품질 기준

- active brand 가이드와 충돌하지 않는다.
- 핵심 수치나 강조어는 시선이 먼저 가도록 배치한다.
- 본문 가독성이 떨어지는 경우 슬라이드를 분리한다.
- CTA 는 행동 문구가 명확해야 한다.

## 중단 조건

아래 경우에는 `carousel.json` 을 만들지 말고 문제를 명시하고 멈춘다.

- 승인 상태가 아님
- `carousel_draft.md` 또는 `handoff_brief.md` 가 없음
- active brand 가 불명확하거나 브랜드 가이드가 없음
- 필수 숫자/사실이 불명확함
- 한 슬라이드에 정보가 과밀해서 가독성을 지킬 수 없음
