---
name: wiki
description: Use this skill to build and maintain the richesse.club knowledge wiki. Three operations — Ingest (add source knowledge to wiki), Query (search wiki for answers), Lint (check for broken links, orphan pages, contradictions). Ingest runs as part of source-intake unless there is nothing worth storing.
---

# Wiki

## Role

소스에서 추출된 지식을 위키에 축적하고 유지한다. RAG처럼 매번 소스를 다시 읽지 않는다. 한 번 컴파일된 지식이 위키에 남고, 다음 소스가 들어올 때 업데이트된다.

## Read First

- `{vault}/06_wiki/wiki-schema.md` — 구조, 템플릿, 네이밍 규칙
- `{vault}/06_wiki/index.md` — 현재 존재하는 페이지 목록
- `{vault}/06_wiki/log.md` — 수집 이력

## Vault 경로

1순위: `$RICHESSE_VAULT_PATH/06_wiki/`
2순위: `%OneDrive%/문서/Obsidian Vault/richesse-content-os/06_wiki/`

---

## 작업 1 — Ingest (수집)

새 소스가 source-intake를 통과한 후 실행한다. source-intake stage의 일부로 간주한다.

### 절차

1. source-intake 출력에서 다음을 추출한다:
   - 등장 인물 (people/)
   - 브랜드 / 기업 (brands/)
   - 핵심 개념 (concepts/)
   - 반복 패턴 또는 시그널 (signals/)

2. index.md에서 이미 존재하는 항목인지 확인한다.
   - **기존 항목**: 해당 페이지의 `소스 기록` 섹션에 새 줄 추가
   - **신규 항목**: wiki-schema.md 템플릿으로 새 페이지 생성 → index.md에 등록

3. log.md 최상단에 수집 기록 추가:
   ```
   ## YYYY-MM-DD
   **소스**: [소스 제목]
   **생성된 페이지**: [목록]
   **업데이트된 페이지**: [목록]
   ```

4. 채팅에 Ingest 결과 요약 출력 후 source-intake 단계로 되돌린다.

### Ingest 출력 형식

```
**Wiki Ingest 완료**

신규 페이지:
- people/[이름].md
- concepts/[개념].md

업데이트된 페이지:
- signals/[시그널].md (소스 기록 추가)

index.md + log.md 업데이트 완료.
```

---

## 작업 2 — Query (질의)

사용자가 "위키에서 [주제] 찾아줘" 또는 콘텐츠 기획 중 관련 지식이 필요할 때 실행한다.

### 절차

1. index.md에서 관련 항목을 찾는다.
2. 해당 페이지를 읽는다.
3. 답변을 종합해서 채팅에 출력한다.
4. **답변이 새로운 인사이트를 담고 있으면 위키에 새 페이지로 저장할지 제안한다.**
   - 단순 조회 → 저장 불필요
   - 여러 페이지를 종합한 새 관점 → `06_wiki/` 적절한 폴더에 저장 제안
   - 저장 시 index.md 등록 + log.md 기록 (`## [날짜] query | 제목` 형식)

### 저장 판단 기준

저장할 가치가 있는 Query 결과:
- 두 개 이상의 개념/인물/브랜드를 연결한 새로운 분석
- 반복해서 물어볼 것 같은 종합 정리
- 콘텐츠 각도로 발전시킬 수 있는 인사이트

저장하지 않아도 되는 결과:
- 단순 사실 확인 ("이 사람 언제 등장했어?")
- 이미 위키 페이지로 있는 내용의 단순 요약

---

## 작업 3 — Lint (점검)

정기적으로 또는 사용자가 요청할 때 실행한다.

### 체크 항목

- 내부 링크 `[[...]]`가 실제 파일을 가리키는지 확인
- 소스 기록이 없는 페이지 플래그
- index.md에 없는 페이지 감지
- 같은 개념이 다른 이름으로 중복된 경우 병합 제안

### 출력 형식

```
**Wiki Lint 결과**

깨진 링크: [목록 또는 "없음"]
소스 없는 페이지: [목록 또는 "없음"]
index.md 누락: [목록 또는 "없음"]
중복 의심: [목록 또는 "없음"]
```

---

## Rules

- 소스에 없는 내용을 추가하지 않는다.
- 기존 페이지의 내용을 덮어쓰지 않는다. 소스 기록에 추가만 한다.
- 파일명은 영어 소문자, 하이픈 구분.
- index.md와 log.md는 항상 최신 상태로 유지한다.
- 사용자 확인 없이 기존 페이지를 삭제하거나 병합하지 않는다.
