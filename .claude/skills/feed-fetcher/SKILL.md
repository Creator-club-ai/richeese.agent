---
name: feed-fetcher
description: This skill should be used when the user asks for "오늘 뉴스", "latest signals", "뉴스 가져와줘", or wants richesse.club-relevant feed collection. Run the feed fetch script, curate the strongest signals, save them to Obsidian today's news storage, then stop for user selection.
---

# Feed Fetcher

## Purpose

RSS와 YouTube 피드에서 richesse.club에 맞는 오늘의 신호를 한 번에 수집하고 큐레이션한다. 이 단계의 목적은 카드 기획이 아니라 "오늘 볼 만한 것"을 짧게 고르는 것이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- 필요하면 `references/feeds.md`

## Run

```bash
python scripts/fetch_and_curate.py
```

환경이 비어 있으면 먼저 의존성을 설치한다.

```bash
pip install feedparser
```

## Workflow

1. 수집 스크립트를 실행한다.
2. 오늘 기준 신규 기사와 영상을 읽는다.
3. richesse.club 기준으로 바로 걸러낸다.
4. 강한 신호만 남긴다.
5. 결과를 Obsidian `오늘의 뉴스/YYYY-MM-DD.md`와 `오늘의 뉴스/YYYY-MM-DD.json`에 저장한다.
6. 채팅에는 핵심 신호만 보여주고 멈춘다.

## Editorial Filter

아래 질문 중 하나라도 `Yes`면 후보로 남긴다.

- 이 소스가 없어도 richesse.club 독자에게 유효한 통찰인가
- 저장하거나 공유할 이유가 분명한가
- 단순 보도보다 판단, 구조, 숫자, 선언이 남는가

아래는 즉시 제외한다.

- 기업 PR
- 보도자료 재가공
- 일반적인 자기계발 문장
- 정보는 있는데 해석이 없는 기사
- richesse.club 톤과 거리가 먼 대중 뉴스

## Output Format

채팅에는 아래 형식으로만 요약한다.

```markdown
## 신호 1
- 주제:
- 출처:
- richesse 강도:
- 추천 형식:
- 타이밍:
```

마지막 줄에는 `source-intake`로 넘길 수 있게 한 줄만 붙인다.

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

저장 경로:

- `{vault}/오늘의 뉴스/YYYY-MM-DD.md`
- `{vault}/오늘의 뉴스/YYYY-MM-DD.json`

## Stop Rule

- 이 단계에서 바로 `content-planner`로 가지 않는다.
- 사용자가 고른 신호만 `source-intake`로 넘긴다.
- 신규 기사가 없으면 없다고 말하고 종료한다.
