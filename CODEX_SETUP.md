# Codex CLI 설치 및 설정 가이드

## 1단계 — Codex CLI 설치

터미널에서:

```powershell
npm install -g @openai/codex
```

설치 확인:
```powershell
codex --version
```

## 2단계 — OpenAI API 키 설정

### 방법 A: 시스템 환경변수 (권장)
Windows 설정 → 고급 시스템 설정 → 환경 변수:
- 변수명: `OPENAI_API_KEY`
- 값: `sk-...your_key_here`

또는 PowerShell (현재 세션만):
```powershell
$env:OPENAI_API_KEY = "sk-...your_key_here"
```

### 방법 B: .env 파일
프로젝트 루트에 `.env` 파일 생성:
```
OPENAI_API_KEY=sk-...your_key_here
```

⚠️ 이 파일은 절대 git에 올리지 마세요. (이미 .gitignore에 있어야 함)

## 3단계 — 연결 테스트

Electron 앱에서 설치 확인 버튼을 클릭하거나,
터미널에서 직접 테스트:

```powershell
cd "C:\Users\HP\OneDrive\바탕 화면\콘텐츠\projects"
codex --full-auto --quiet "현재 디렉토리의 파일 목록을 알려줘"
```

## 완료된 구조

```
Electron 버튼 ("리서치 시작") 클릭
  → IPC: agent:runSkill
  → main: agent.ts → SKILL.md 읽기
  → spawn: codex --full-auto [prompt]
  → Codex가 파일 자율 생성
  → stdout → agent:log → UI 실시간 로그
  → 완료 → Electron 새로고침
```

## 스킬별 연결

| Electron 버튼 | 스킬 | 출력 파일 |
|---|---|---|
| 리서치 시작 | content_researcher | research_brief.md |
| 기획 생성 | content_planner | slide_plan.md |
| 원고 작성 | content_editor | carousel_draft.md |
| 디자인 생성 | slide_designer | carousel.json |
