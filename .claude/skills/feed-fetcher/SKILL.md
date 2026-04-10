---
name: feed-fetcher
description: This skill should be used when the user asks for "오늘 뉴스", "latest signals", "뉴스 가져와줘", or wants richesse.club-relevant feed collection. Run the feed fetch script, curate the strongest signals in Korean, save the curated Korean output to Obsidian, then stop for user selection.
---

# Feed Fetcher

## Purpose

RSS와 YouTube 피드에서 richesse.club에 맞는 오늘의 신호를 수집하고 큐레이션한다. 목적은 카드 기획이 아니라 "오늘 볼 만한 것"을 빠르게 고르는 것이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`

## Run

```bash
python scripts/fetch_and_curate.py
```

의존성이 없으면 먼저 설치한다.

```bash
pip install feedparser
```

## Workflow

1. 스크립트를 실행한다.
2. 출력된 기사 목록을 읽는다.
3. richesse.club 기준으로 필터링한다.
4. 통과한 기사를 **한국어로 번역**하고 각도를 붙인다.
5. 고정 템플릿으로 채팅에 출력한다.
6. 큐레이션 결과를 Obsidian MD 파일로 저장한다.
7. 멈춘다.

## Editorial Filter

아래 중 하나라도 Yes면 후보로 남긴다.

- 단순 보도가 아닌 판단, 구조, 숫자, 선언이 있다
- richesse.club 독자가 저장하거나 공유할 이유가 있다
- 업계 사람이 "이거 봤어?" 하고 보낼 만하다

즉시 제외한다.

- 기업 PR / 보도자료
- 자기계발 문장
- 해석 없는 수치 나열
- 정치·사회 논쟁성 이슈
- richesse.club 톤과 거리가 먼 대중 뉴스

## Output Format (고정)

**모든 출력은 한국어로 작성한다. 영어 기사는 제목과 요약을 번역한다.**

채팅과 Obsidian MD 파일 모두 아래 형식을 사용한다.

```
# 오늘의 뉴스 — YYYY-MM-DD
수집 N개 | 선별 N개

---

## 1. [한국어 제목]
**출처**: 소스명 — [원문 링크](URL)
**한 줄 요약**: 무슨 일이 일어났는가 (1문장, 한국어)
**richesse 각도**: richesse.club 독자에게 왜 의미 있는가
**추천 형식**: 정리형 / 인사이트형 / 해설형 / 케이스형
**타이밍**: Now / Evergreen / Seasonal

---

## 2. [한국어 제목]
...
```

신호가 없을 때:

```
# 오늘의 뉴스 — YYYY-MM-DD
오늘은 기준을 통과한 소재가 없습니다.
직접 소스를 붙여넣거나 URL을 주시면 source-intake부터 시작하겠습니다.
```

## Save

큐레이션 완료 후 위 형식 그대로 Obsidian에 저장한다.

Vault 경로 우선순위:
1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

저장 경로: `{vault}/오늘의 뉴스/YYYY-MM-DD.md`

## Stop Rule

- 저장 완료 후 멈춘다.
- 사용자가 신호를 고르면 그때 `source-intake`로 넘긴다.
- 신규 기사가 없어도 기존 기사를 다시 큐레이션해서 보여준다.
