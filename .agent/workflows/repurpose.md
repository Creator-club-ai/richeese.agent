---
description: 유튜브 영상 하나로 쇼츠 + 인스타 캐러셀 + 쓰레드를 한 번에 생성하는 통합 워크플로우
---

# /repurpose 워크플로우

다양한 콘텐츠 소스를 분석하여 **쇼츠 (영상만) + 인스타 캐러셀 + 쓰레드 게시물**을 한 번에 생성하는 통합 워크플로우입니다.

## 사용법

```
# 유튜브 영상
/repurpose https://youtube.com/watch?v=영상ID

# 전사 파일 / 스크립트
/repurpose path/to/transcript.txt

# 웹 아티클
/repurpose https://blog.example.com/article

# PDF 문서
/repurpose path/to/document.pdf
```

> **참고**: 쇼츠는 영상 소스에서만 생성 가능합니다.

## 참조 문서

- `content_analyzer.md` - 다양한 입력 소스 처리 가이드
- `video_analyzer.md` - 영상 분석 기준
- `brand_guide.md` - Richesse 브랜드 가이드
- `.agent/workflows/shorts.md` - 쇼츠 상세 가이드
- `.agent/workflows/instagram-slides.md` - 인스타 상세 가이드
- `.agent/workflows/threads.md` - 쓰레드 상세 가이드

---

## 실행 순서

### Phase 1: 콘텐츠 수집 및 분석 (공통)

#### 1-0. 입력 타입 감지
`content_analyzer.md`를 참고하여 입력 타입을 감지합니다:
- 유튜브 URL (`youtube.com`, `youtu.be`)
- 웹 아티클 URL (`http://`, `https://`)
- 로컬 파일 (`.txt`, `.srt`, `.md`, `.pdf`)

#### 1-1. 콘텐츠 추출

**유튜브 영상인 경우:**
// turbo
```powershell
python -m yt_dlp --no-check-certificate -f "best[height<=720]" --no-playlist --write-auto-sub --sub-lang "en,ko" --convert-subs srt -o "output/source_video.%(ext)s" "<YOUTUBE_URL>"
```

**전사 파일 / 텍스트 파일인 경우:**
```powershell
# 파일 직접 읽기
Get-Content "<FILE_PATH>" -Encoding UTF8
```

**웹 아티클인 경우:**
```
read_url_content 도구 사용
```

**PDF 파일인 경우:**
```powershell
# PyPDF2 사용 (필요시 설치)
pip install pypdf2
python -c "import PyPDF2; ..."
```

#### 1-2. 텍스트 분석
`video_analyzer.md`를 참고하여 다음을 추출합니다:

**쇼츠용 (영상 클립):**
- 하이라이트 구간 3개 (각 30~55초)
- 각 구간의 시작/끝 시간
- 각 구간의 추천 제목

**텍스트 콘텐츠용:**
- 핵심 인사이트 5개
- 기억에 남는 명언/인용구
- 실행 가능한 액션 아이템 3개

---

### Phase 2: 쇼츠 생성

`shorts.md` 워크플로우를 참고하여 실행합니다.

#### 2-1. 세로 영상 클립 추출 (3개)
// turbo
```powershell
# 클립 1
"C:\Users\dasar\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe" -y -ss <START_TIME_1> -i "output/source_video.mp4" -t <DURATION_1> -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "shorts_final/short_1.mp4"

# 클립 2, 3도 동일하게 실행
```

#### 2-2. 자막 합성
각 클립에 한국어 자막 + Richesse 워터마크 합성

#### 결과물
- `shorts_final/short_1.mp4`
- `shorts_final/short_2.mp4`
- `shorts_final/short_3.mp4`

---

### Phase 3: 인스타그램 캐러셀 생성

`instagram-slides.md` 워크플로우를 참고하여 실행합니다.

#### 3-1. 슬라이드 기획 (10장)

| 슬라이드 | 역할 |
|----------|------|
| 1 | Hook (표지) |
| 2 | 문제 제기 |
| 3~5 | 핵심 인사이트 3개 |
| 6 | 실행 팁 |
| 7 | 명언/인용 |
| 8 | 요약 |
| 9 | CTA |
| 10 | 브랜딩 |

#### 3-2. 슬라이드 텍스트 작성

**글쓰기 규칙:**
- 설명하는 느낌 ❌
- 명사로 끊기 ❌
- 리듬감 있게 (긴 문장 → 짧은 문장)

**2가지 톤 버전 생성:**
- ~다/명령조 버전
- ~습니다체 버전

각 슬라이드 3~5줄 분량

#### 3-3. 이미지 생성
각 슬라이드를 generate_image 도구로 생성 (1080x1350px)

#### 3-3. 캡션 + 해시태그 작성

#### 결과물
- `instagram_slides/[날짜]_[주제]/slide_01~10.png`
- `instagram_slides/[날짜]_[주제]/caption.txt`

---

### Phase 4: 쓰레드 게시물 생성

`threads.md` 워크플로우를 참고하여 실행합니다.

#### 4-1. 쓰레드 형식 선택
- 단일 게시물 (300~500자)
- 또는 쓰레드 시리즈 (3~5개 연결)

#### 4-2. 게시물 작성
핵심 인사이트를 쓰레드 형식으로 변환

#### 결과물
- `threads/[날짜]_[주제]/post.txt`

---

## 최종 결과물 구조

```
richesseshorts/
├── output/
│   ├── source_video.mp4          ← 원본 영상
│   └── source_video.ko.srt       ← 자막
│
├── shorts_final/
│   ├── short_1.mp4               ← 쇼츠 1
│   ├── short_2.mp4               ← 쇼츠 2
│   └── short_3.mp4               ← 쇼츠 3
│
├── instagram_slides/
│   └── [날짜]_[주제]/
│       ├── [주제]_slides.txt          ← ~다/명령조
│       ├── [주제]_slides_formal.txt   ← ~습니다체
│       ├── slide_01_hook.png
│       ├── slide_02~10.png
│       ├── caption.txt
│       └── source.txt                 ← 원본
│
└── threads/
    └── [날짜]_[주제]/
        └── post.txt
```

---

## 진행 체크리스트

### Phase 1: 준비
- [ ] 영상 다운로드 완료
- [ ] 자막 추출 완료
- [ ] 핵심 인사이트 5개 추출
- [ ] 하이라이트 구간 3개 선정

### Phase 2: 쇼츠
- [ ] 클립 3개 추출
- [ ] 자막 합성
- [ ] 워터마크 추가

### Phase 3: 인스타그램
- [ ] 슬라이드 10장 텍스트 작성
- [ ] 이미지 10장 생성
- [ ] 캡션 + 해시태그 작성

### Phase 4: 쓰레드
- [ ] 게시물 형식 선택
- [ ] 게시물 작성 완료

---

## 빠른 실행 (개별 워크플로우)

한 가지 콘텐츠만 필요한 경우:

```
/shorts https://youtube.com/watch?v=xxx         ← 쇼츠만
/instagram-slides https://youtube.com/watch?v=xxx  ← 캐러셀만
/threads https://youtube.com/watch?v=xxx        ← 쓰레드만
```

---

## 주의사항

- 영상 길이가 너무 짧으면 (5분 미만) 쇼츠 3개 추출이 어려울 수 있음
- 저작권 확인 필수
- 인용 시 출처 표기
