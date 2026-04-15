# Topic Sprint + Second Brain Design

Date: 2026-04-15

## Problem

현재 파이프라인은 "오늘 뜨는 시그널 하나 → 콘텐츠" 구조에 최적화되어 있다.
사용자가 원하는 흐름은 "주제 하나 → 여러 소스 수집 → 조합 → 카드뉴스"이지만, 이를 지원하는 경로가 없다.

세 가지 구체적인 문제:
1. 주제를 지정해서 소스를 수집하는 기능이 없음
2. 수집된 소스가 Obsidian에 구조적으로 저장되지 않아 나중에 재활용 불가
3. 여러 소스를 조합해서 카드뉴스로 만드는 단계가 약함

부수 문제: Obsidian 볼트 안의 노트들이 wikilink 없이 고립되어 있어 second brain으로 작동하지 않는다.

## Scope

이 spec은 두 가지를 다룬다:

1. **Topic Sprint** — 새 `--topic` 진입점과 멀티소스 수집/합성 파이프라인
2. **Vault 연결 구조** — Daily Note 허브와 Topic MOC를 통한 wikilink 자동 생성

기존 morning-brew (signal-first) 플로우는 건드리지 않는다. 새 구조는 추가만 한다.

## Repo Cleanup (선행 작업)

다음 두 어댑터를 제거한다:

- `scripts/signal_adapters/x_adapter.py` — X/Twitter syndication 스크레이핑. fragile하고 자주 깨짐
- `scripts/signal_adapters/threads.py` — Jina Reader Threads 스크레이핑. 마찬가지로 불안정

`scripts/signal_adapters/catalog.py`에서 `X_HANDLES`, `THREADS_HANDLES` 항목과 해당 `SourceGroup` 두 개도 함께 제거한다.

수집 파이프라인은 RSS / Google News / YouTube / Naver 4개로 정리된다.

## New Vault Structure

기존 디렉토리는 그대로 유지한다. 아래 두 디렉토리만 추가된다.

```
richesse-content-os/
├── daily/                          ← NEW
│   └── YYYY-MM-DD.md               ← 하루의 허브 노트. 자동 생성
├── 오늘의 뉴스/                    ← 기존 유지
├── raw/                            ← 기존 유지
├── wiki/
│   ├── <topic>/                    ← NEW (주제별 폴더)
│   │   ├── index.md                ← Topic MOC. 소스 wikilink 집계
│   │   └── sources/                ← 소스별 개별 노트
│   └── editorial-memory/           ← 기존 유지
└── content/
    └── instagram/                  ← 기존 유지
```

## Daily Note Format

`daily/YYYY-MM-DD.md` 는 스크립트가 실행될 때마다 자동 생성/갱신된다.

```markdown
---
date: YYYY-MM-DD
---

# YYYY-MM-DD

## 오늘의 시그널
- [[오늘의 뉴스/YYYY-MM-DD-shortlist]]  ← morning-brew 실행 시 추가

## 주제 작업
- [[wiki/AI 스타트업/index]]  ← topic sprint 실행 시 추가
- [[wiki/여행 트렌드/index]]
```

## Topic MOC Format

`wiki/<topic>/index.md` 는 topic sprint 실행 시 자동 생성/갱신된다.

```markdown
---
topic: AI 스타트업
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# AI 스타트업

## 소스
- [[wiki/AI 스타트업/sources/2026-04-15-techcrunch-article]]
- [[wiki/AI 스타트업/sources/2026-04-15-hbr-article]]

## 콘텐츠
- [[content/instagram/2026-04-15-AI-스타트업-카드뉴스]]
```

## Source Note Format

`wiki/<topic>/sources/YYYY-MM-DD-<slug>.md` 는 소스별로 하나씩 생성된다.

```markdown
---
title: "원문 제목"
url: "https://..."
source: TechCrunch
date: YYYY-MM-DD
topic: AI 스타트업
tags: [AI, 스타트업, 비즈니스]
---

[[YYYY-MM-DD]] | [[wiki/AI 스타트업/index]]

## 요약
(원문 summary 필드 내용)
```

## Topic Sprint Pipeline

진입점: `head --topic "주제"` 또는 `python scripts/run_head_cycle.py --topic "주제"`

```
--topic "주제"
  → fetch_and_curate.py --topic "주제"
      RSS + GNews + YouTube + Naver 동시 검색 (주제 키워드 필터링)
      결과: signal shortlist (JSON)
  → vault writer
      소스별 노트 생성: wiki/<topic>/sources/
      Topic MOC 갱신: wiki/<topic>/index.md
      Daily Note 갱신: daily/YYYY-MM-DD.md
  → research (multi-source 합성)
      여러 소스 → ResearchOutput 하나
  → analyze → write → review → refine
      기존 파이프라인 그대로
      write 단계는 카드뉴스 슬라이드 구조로 출력
```

## Script Changes

### `scripts/fetch_and_curate.py`
- `--topic` 인자 추가
- topic이 지정되면 각 어댑터의 검색 쿼리에 topic 키워드를 주입
- RSS/GNews는 URL 파라미터로, YouTube는 search query로, Naver는 키워드로 필터

### `scripts/signal_adapters/catalog.py`
- `X_HANDLES`, `THREADS_HANDLES` 제거
- `build_source_groups()`에서 X, Threads `SourceGroup` 제거

### `scripts/run_head_cycle.py`
- `--topic` 인자 추가
- topic 모드 실행 시 vault writer 호출 후 research로 라우팅

### 새 파일: `scripts/vault_writer.py`
- 소스 리스트를 받아 vault에 노트 생성
- Daily Note 생성/갱신 (같은 날 재실행 시 기존 링크 유지, 새 링크만 추가)
- Topic MOC 생성/갱신 (기존 소스 링크 유지, 중복 추가 방지)
- wikilink 자동 삽입 책임을 단일 모듈에서 담당

### `scripts/editorial_memory.py`
- 변경 없음

### `scripts/phase_artifacts.py`
- 변경 없음

## What Is Not In Scope

- X / Threads 어댑터 대체 소스 추가 (별도 논의)
- `.claude/` 내부 정리 (별도 논의)
- Obsidian 플러그인 설정 (Templater, Dataview 등)
- Weekly Review 자동 생성
- 기존 `오늘의 뉴스/` 내 노트에 소급 wikilink 추가
