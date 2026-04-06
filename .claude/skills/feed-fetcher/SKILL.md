---
name: feed-fetcher
description: Use this skill to collect the latest articles from RSS feeds and save them to Obsidian. Run this first before feed-curator. Fetches from business, startup, strategy, and lifestyle sources filtered for richesse.club relevance. Deduplicates by canonical URL with title fallback and saves markdown + JSON to the Obsidian vault's 00_feeds folder.
---

# Feed Fetcher

## Role

RSS 피드에서 최신 기사를 수집하고 Obsidian vault에 저장한다. 편집 판단은 하지 않는다. 수집과 정제만 한다.

## 실행 방법

```bash
cd "c:/Users/HP/OneDrive/바탕 화면/콘텐츠/.claude/skills/feed-fetcher/scripts"
python fetch_feeds.py
```

의존성 설치 (최초 1회):
```bash
pip install feedparser deep-translator
```

## 출력

- `Obsidian Vault/richesse-content-os/00_feeds/YYYY-MM-DD.md` — 사람이 읽는 용
- `Obsidian Vault/richesse-content-os/00_feeds/YYYY-MM-DD.json` — feed-curator가 읽는 용

## 피드 목록

`references/feeds.md` 참고. 피드 추가/제거는 `scripts/fetch_feeds.py` 상단 `FEEDS` 리스트에서 수정.

## 오류 대응

- 특정 피드 실패 시 해당 피드만 스킵하고 계속 진행
- 전체 실패 시 `pip install feedparser deep-translator` 확인
- 번역 라이브러리가 없으면 영문 제목/요약이 그대로 저장될 수 있음
- 페이월로 기사가 0개면 정상 (헤드라인만 수집됨)

## 다음 단계

수집 완료 후 → `/feed-curator` 실행
