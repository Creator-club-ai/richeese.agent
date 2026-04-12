---
name: wiki
description: This support skill should be used when the user asks to query the richesse.club knowledge wiki, lint the wiki, or maintain wiki pages directly. Ingest normally runs inside source-intake and should not be invoked as a separate default stage.
---

# Wiki

## Purpose

richesse.club의 반복 지식을 축적하는 보조 기억 레이어다. 매번 원문을 처음부터 다시 읽는 대신, 인물·브랜드·개념·시그널을 누적해서 다음 판단에 재사용한다.

## Read First

- `{vault}/wiki/wiki-schema.md`
- `{vault}/wiki/index.md`
- `{vault}/wiki/log.md`

## Operations

### Ingest

기본적으로 `source-intake` 안에서만 실행한다.

1. source packet에서 인물, 브랜드, 개념, 시그널을 추출한다.
2. 기존 페이지 존재 여부를 확인한다.
3. 새 페이지를 만들거나 기존 페이지를 업데이트한다.
4. `index.md`와 `log.md`를 갱신한다.

### Query

사용자가 특정 인물, 브랜드, 개념, 맥락을 물을 때 실행한다.

1. `index.md`에서 관련 페이지를 찾는다.
2. 필요한 페이지를 읽는다.
3. 답을 채팅에 요약한다.
4. 새 지식으로 승격할 가치가 있으면 새 페이지 저장을 제안한다.

### Lint

정기 점검이나 요청 시 실행한다.

점검 항목:

- 깨진 링크
- orphan page
- 중복 개념
- 서로 충돌하는 진술
- 갱신이 필요한 index / log

## Save Path

Vault 경로 우선순위:

1. `$RICHESSE_VAULT_PATH`
2. `%OneDrive%/문서/Obsidian Vault/richesse-content-os`

## Rules

- `raw/` 파일은 수정하지 않는다.
- ingest를 별도 메인 단계로 만들지 않는다.
- 단순 사실 확인은 과잉 저장하지 않는다.
- 반복 가치가 있는 지식만 위키 페이지로 승격한다.
