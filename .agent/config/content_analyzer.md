# 콘텐츠 분석 에이전트

다양한 형식의 콘텐츠를 분석하여 핵심 인사이트를 추출하는 범용 분석 에이전트입니다.

---

## 지원하는 입력 형식

| 입력 타입 | 예시 | 처리 방법 |
|----------|------|-----------|
| **유튜브 영상** | `https://youtube.com/watch?v=xxx` | yt-dlp로 자막 추출 |
| **전사 파일** | `transcript.txt`, `subtitle.srt` | 파일 직접 읽기 |
| **아티클/블로그** | `https://blog.com/article` | read_url_content로 추출 |
| **PDF 문서** | `document.pdf` | PDF 텍스트 추출 |
| **텍스트 파일** | `notes.md`, `script.txt` | 파일 직접 읽기 |

---

## 입력 타입 감지 로직

### 1. 유튜브 URL
```
패턴: youtube.com, youtu.be 포함
처리: yt-dlp --skip-download --write-auto-sub
```

### 2. 웹 아티클 URL
```
패턴: http://, https:// (유튜브 제외)
처리: read_url_content 도구 사용
```

### 3. 로컬 파일
```
패턴: .txt, .srt, .md, .pdf 등
처리: 파일 확장자에 따라 적절한 읽기 방법 선택
```

---

## 텍스트 추출 방법

### 유튜브 영상 → 자막 추출
// turbo
```powershell
python -m yt_dlp --no-check-certificate --skip-download --write-auto-sub --sub-lang "en,ko" --convert-subs srt -o "output/source" "<YOUTUBE_URL>"
```

### 웹 아티클 → 본문 추출
read_url_content 도구 사용

### 전사 파일 (SRT) → 텍스트 변환
```python
# SRT 파일의 타임스탬프 제거하고 순수 텍스트만 추출
```

### PDF → 텍스트 추출
```powershell
# PyPDF2 또는 pdfplumber 사용
pip install pypdf2
python extract_pdf.py <PDF_PATH>
```

---

## 분석 기준 (공통)

추출된 텍스트를 다음 기준으로 분석합니다:

### 1. 비즈니스 인사이트
- CEO의 경영 철학, 전략
- 시장을 보는 눈, 트렌드 분석
- 비즈니스 성공 사례

### 2. 성공 마인드셋
- 역경 극복 스토리
- 습관, 루틴, 태도
- 동기부여 메시지

### 3. 부의 원리 (Richesse)
- 돈의 흐름, 투자 철학
- 자산 관리, 재테크 팁
- 경제적 자유 달성 방법

### 4. 감정적 임팩트
- 진정성이 느껴지는 부분
- 강력한 어조로 핵심을 찌르는 순간
- 공감되는 문제 제기

### 5. 실용적 액션
- 당장 실천 가능한 팁
- 구체적인 숫자와 사례
- 단계별 실행 방법

---

## 출력 형식

### 쇼츠용 하이라이트 (영상만 해당)
```
### 클립 1
- **시간**: 00:02:30 ~ 00:03:15 (45초)
- **선택 이유**: [설명]
- **추천 제목**: [제목]
- **핵심 내용**: [요약]
```

### 텍스트 콘텐츠용 인사이트
```
### 인사이트 1: [제목]
- **카테고리**: 마인드셋 / 재테크 / 자기계발 / 동기부여
- **핵심 메시지**: [한 문장 요약]
- **상세 내용**: [2~3문장]
- **액션 아이템**: [실행 가능한 팁]

### 인사이트 2~5
(동일 형식)
```

### 명언/인용구
```
"[기억에 남는 명언이나 인용구]"
- 출처: [화자 또는 원문]
```

---

## 사용 예시

### 유튜브 영상 분석
```
/repurpose https://youtube.com/watch?v=xxx
```

### 전사 파일 분석
```
/repurpose path/to/transcript.txt
```

### 아티클 분석
```
/repurpose https://blog.example.com/article
```

### PDF 분석
```
/repurpose path/to/document.pdf
```

---

## 주의사항

- 영상이 아닌 경우 쇼츠는 생성 불가 (인스타/쓰레드만)
- 저작권 확인 필수
- 출처 명확히 표기
- 너무 짧은 콘텐츠(500자 미만)는 분석 결과가 제한적일 수 있음
