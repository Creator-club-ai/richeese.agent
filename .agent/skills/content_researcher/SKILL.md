---
name: content_researcher
description: This skill should be used when the user asks to "카드뉴스 리서치해줘", "Research Brief 만들어줘", "뉴스 카드뉴스 자료 조사해줘", or "큐레이션 카드뉴스 근거 정리해줘". It prepares a card-news-first `research_brief.md` and blocks unsupported claims.
---

# Card-News Researcher Skill

## 목적

카드뉴스 기획에 바로 투입할 수 있는 `research_brief.md` 를 만든다.
링크를 모으는 역할에서 멈추지 말고, 주제 클래스, 앵글, 주장-근거 매핑까지 정리한다.

## 먼저 확인할 문서

- 워크스페이스 루트의 `CARD_NEWS_TEAM.md`
- 필요 시 `SOURCE_INTAKE_PLAYBOOK.md`
- active brand 가 명시되어 있고 타겟/채널 맥락이 중요하면 `brands/<active-brand>/BRAND_GUIDE.md`

## 역할 경계

- 여기서 끝낼 산출물은 `research_brief.md` 하나다.
- `slide_plan.md`, `carousel_draft.md`, `carousel.json` 을 만들지 않는다.
- 근거가 약한 상태에서 다음 단계로 넘기지 않는다.

## 주제 클래스 분류

리서치 시작 전에 주제를 아래 중 하나로 분류한다.

| 클래스 | 판단 기준 |
| --- | --- |
| `news` | 최근 발표, 정책, 업계 변화처럼 시의성이 핵심인 주제 |
| `curation` | 여러 사례, 링크, 툴, 인물, 관점을 골라 묶는 주제 |
| `explainer` | 개념을 쉽게 풀어야 하는 주제 |
| `checklist` | 저장 가치가 높은 실행 항목형 주제 |
| `insight` | 해석, 맥락, 관점이 핵심인 주제 |

## 출처 규칙

- `Tier 1`: 정부/공공기관, 공식 통계, 원문 보고서, 공식 문서
- `Tier 2`: 업계 전문 미디어, 신뢰 가능한 기관 블로그, 전문가 아티클
- `Tier 3`: 커뮤니티, 개인 블로그, 큐레이션 글

사실, 수치, 정책 주장은 Tier 1 또는 Tier 2 근거를 우선 사용한다.
Tier 3 는 아이디어 확장용으로만 사용한다.

## 작업 순서

1. 입력이 `provided` 인지 `researched` 인지 확인한다.
2. 주제를 하나의 카드뉴스 클래스에 고정한다.
3. 탐색 질문을 3~5개로 좁힌다.
4. 중복이 아닌 근거를 수집하고 Tier 를 붙인다.
5. 후보 앵글을 2~3개 작성하고 추천 앵글 1개를 고른다.
6. 핵심 주장 3~5개를 정리하고 주장별 근거를 연결한다.
7. active brand 정보가 있으면 타겟 맥락에 맞게 앵글 우선순위를 조정한다.
8. 숫자, 인용, 사례, 반대 관점, Unknowns 를 정리한다.
9. 결과를 `research_brief.md` 로 저장한다.

## 출력 파일 형식

`research_brief.md` 는 아래 구조를 기본으로 사용한다.

```markdown
# Research Brief - [가제]

## 프로젝트 메타
- 콘텐츠 ID:
- 주제 클래스: news | curation | explainer | checklist | insight
- sourceType: provided | researched
- 한 줄 주제 정의:

## 왜 지금 다루는가
-

## 후보 앵글
1.
2.
3.

## 추천 앵글
-

## 핵심 주장
1.
2.
3.

## 주장별 근거
- 주장 1 -> [출처명] [링크] (Tier 1|2|3)
- 주장 2 -> [출처명] [링크] (Tier 1|2|3)
- 주장 3 -> [출처명] [링크] (Tier 1|2|3)

## 출처 목록
- [출처명] - 왜 쓰는가 - Tier

## 바로 쓸 수 있는 사실/수치/인용
-

## 시각 소재 힌트
- 차트, 비교표, 체크리스트, 인용 카드 중 무엇이 잘 맞는지 메모

## 반대 관점 / 주의 포인트
-

## Unknowns
- 추가 확인이 필요한 항목
```

## 품질 기준

- 핵심 주장마다 근거를 1:1 이상 연결한다.
- 같은 출처를 반복 인용해 개수를 부풀리지 않는다.
- 추천 앵글이 왜 더 저장/공유 가치가 큰지 설명 가능해야 한다.
- 디자이너가 쓸 수 있는 시각 소재 힌트를 최소 2개 남긴다.

## 중단 조건

아래 경우에는 억지로 브리프를 완성하지 말고 부족한 점을 명시하고 멈춘다.

- 근거가 약해서 핵심 주장을 확정할 수 없음
- 주제가 지나치게 넓어서 카드뉴스 한 편으로 묶이지 않음
- 출처 신뢰도 기준을 충족하지 못함
- 사실과 해석이 뒤섞여 추천 앵글을 정할 수 없음
