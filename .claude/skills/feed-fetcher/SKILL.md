---
name: feed-fetcher
description: Use this skill to collect and curate today's news in one step. Runs fetch_and_curate.py to gather articles from 16 RSS/YouTube feeds, applies keyword pre-filtering to remove noise, then Claude applies richesse.club editorial judgment and saves curated signals to Obsidian 오늘의 뉴스/ folder.
---

# News

## Role

오늘의 뉴스를 수집하고 richesse.club 기준으로 큐레이션한다.
수집(fetch) + 편집 판단(curate)을 한 번에 수행한다.

## 실행

```bash
python scripts/fetch_and_curate.py
```

의존성 설치 (최초 1회):
```bash
pip install feedparser
```

언제 실행해도 동일한 명령이다. 스크립트가 오늘 기존 파일을 확인하고 신규 기사만 추가한다.

## Workflow

1. 스크립트를 실행한다.
   - 16개 피드에서 기사 수집
   - 키워드 사전 필터로 스포츠/범죄/오락/자기계발 등 즉시 제외
   - 오늘 이미 수집된 기사와 중복 제거
   - 신규 기사만 `--- NEW_ARTICLES_START ---` 블록으로 stdout 출력
   - `RICHESSE_VAULT_PATH/오늘의 뉴스/YYYY-MM-DD.json` 누적 저장

2. stdout에서 신규 기사를 읽는다.
   - 신규 기사가 0개면: "새로운 기사가 없습니다." 출력 후 종료.
   - 신규 기사가 있으면: richesse.club 편집 기준으로 평가.

3. richesse.club 기준으로 기사를 평가한다.

   **통과 기준 — 세 질문 중 하나 이상 Yes:**
   1. 이 기사가 없었어도 richesse.club 독자는 몰랐을 것인가?
   2. 카드뉴스로 만들었을 때 실제로 저장하거나 공유하는 사람이 있는가?
   3. 업계 사람이 "이거 봤어?" 하고 링크를 던질 만한가?

   **즉시 제외:**
   - 기업 PR / 보도자료 형식
   - 수치만 있고 "그래서 왜?"가 없는 것
   - 뉴스 요약만 있고 richesse.club 각도가 없는 것

4. 신호를 선별하고 편집 각도를 붙인다.
   - 기본 5개, 풍부한 날 최대 10개, 빈약한 날 1~4개도 그대로

5. 채팅에 출력하고 `오늘의 뉴스/YYYY-MM-DD.md`에 저장(또는 append)한다.

## Output Format

```
## 신호 1
- 소재: [무엇에 관한 이야기인가]
- 출처: [소스명 + URL]
- richesse 각도: [이 신호를 richesse.club은 어떤 방향으로 읽을 수 있는가]
- 추천 포맷: [정리형 / 인사이트형 / 해설형 / 큐레이션형 등]
- 타이밍: [Now / Evergreen / Seasonal]
```

마지막 한 줄:
> 어떤 신호가 끌리나요? URL이나 소스를 주시면 source-intake로 넘기겠습니다.

## 소재 없을 때

> 오늘은 기준을 통과한 소재가 없습니다.
> 직접 URL이나 소스를 붙여주시면 source-intake부터 시작하겠습니다.

## Rules

- 모든 출력은 한국어로 작성한다.
- 각도 없이 기사 제목만 나열하지 않는다.
- 신호 선택 후 source-intake로 넘기는 것은 사용자가 결정한다.
- 이 스킬은 pitch로 직접 넘기지 않는다.

## Vault 경로 규칙

- 1순위: 환경변수 `RICHESSE_VAULT_PATH`
- 2순위: `%OneDrive%/문서/Obsidian Vault/richesse-content-os`
