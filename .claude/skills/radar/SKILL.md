---
name: radar
description: This skill should be used only when the Python environment is unavailable and the RSS scripts cannot run. Search the web directly, surface 5 richesse.club-relevant signals, and use it as a manual fallback instead of the standard feed-fetcher workflow.
---

# Radar

## Purpose

`feed-fetcher`를 돌릴 수 없을 때만 웹 검색으로 오늘의 신호를 수동 확보한다. 정상 경로를 대체하는 비상용 스킬이다.

## Read First

- `brands/richesse-club/BRAND_GUIDE.md`
- `brands/richesse-club/CONTENT_STRATEGY.md`

## Workflow

1. business, money, people 축으로 웹 검색을 한다.
2. richesse.club에 맞는 신호만 남긴다.
3. 5개 안팎으로 압축한다.
4. 채팅에만 보여주고 멈춘다.

## Search Rule

아래 유형을 우선 본다.

- 창업자 발언
- 투자 논리
- 인수합병
- AI 비즈니스 모델
- 한국 시장에서의 구조 변화

## Filter Rule

하나라도 만족하면 후보로 남긴다.

- 기사 자체보다 판단 구조가 남는다
- 저장 가치가 분명하다
- 후속 카드로 발전시킬 수 있다

바로 제외한다.

- PR
- 약한 일반 뉴스
- 자기계발형 문장
- 정치/연예 중심 이슈

## Stop Rule

- 파일 저장은 하지 않는다.
- 사용자가 고른 신호만 `source-intake`로 넘긴다.
