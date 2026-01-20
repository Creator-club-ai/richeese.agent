# 콘텐츠 리퍼포징 시스템 요약

## 📁 파일 구조

```
richesseshorts/
├── .agent/workflows/          ← 워크플로우 (슬래시 커맨드)
│   ├── repurpose.md          ← 통합: 쇼츠+인스타+쓰레드
│   ├── shorts.md             ← 쇼츠만
│   ├── instagram-slides.md   ← 인스타 캐러셀만
│   └── threads.md            ← 쓰레드만
│
├── content_analyzer.md        ← 범용 콘텐츠 분석 가이드
├── video_analyzer.md          ← 영상 하이라이트 분석 가이드
└── brand_guide.md             ← Richesse 브랜드 가이드라인
```

---

## 🎯 지원하는 입력 형식

| 입력 타입 | 예시 | 쇼츠 | 인스타 | 쓰레드 |
|----------|------|------|--------|--------|
| 유튜브 영상 | `https://youtube.com/watch?v=xxx` | ✅ | ✅ | ✅ |
| 전사 파일 | `transcript.txt`, `subtitle.srt` | ❌ | ✅ | ✅ |
| 웹 아티클 | `https://blog.com/article` | ❌ | ✅ | ✅ |
| PDF 문서 | `document.pdf` | ❌ | ✅ | ✅ |

> **참고**: 쇼츠는 영상 소스에서만 생성 가능합니다.

---

## 🚀 사용법

### 통합 워크플로우 (한 번에 모두 생성)

```bash
# 유튜브 영상
/repurpose https://youtube.com/watch?v=xxx

# 전사 파일
/repurpose path/to/transcript.txt

# 웹 아티클
/repurpose https://blog.example.com/article

# PDF 문서
/repurpose path/to/document.pdf
```

### 개별 워크플로우 (필요한 것만)

```bash
# 쇼츠만 (영상 필수)
/shorts https://youtube.com/watch?v=xxx

# 인스타 캐러셀만
/instagram-slides https://blog.example.com/article

# 쓰레드만
/threads path/to/transcript.txt
```

---

## 📊 결과물

### /repurpose 실행 시

```
richesseshorts/
├── shorts_final/
│   ├── short_1.mp4           ← 쇼츠 1 (30~55초)
│   ├── short_2.mp4           ← 쇼츠 2
│   └── short_3.mp4           ← 쇼츠 3
│
├── instagram_slides/
│   └── [날짜]_[주제]/
│       ├── slide_01_hook.png
│       ├── slide_02~10.png   ← 총 10장
│       └── caption.txt       ← 캡션 + 해시태그
│
└── threads/
    └── [날짜]_[주제]/
        └── post.txt          ← 쓰레드 게시물
```

---

## 📚 참조 문서 역할

### content_analyzer.md
- **역할**: 입력 타입 감지 및 텍스트 추출 방법
- **참조**: 모든 워크플로우

### video_analyzer.md
- **역할**: 영상 하이라이트 분석 기준 (쇼츠용)
- **참조**: `shorts.md`, `repurpose.md` (영상인 경우)

### brand_guide.md
- **역할**: Richesse 브랜드 색상, 폰트, 톤앤매너
- **참조**: 모든 워크플로우

---

## 🎨 콘텐츠 스타일

### 쇼츠 (1080x1920)
- 세로 영상 9:16 비율
- 금색 제목 (상단) + 흰색 자막 (하단)
- Richesse 워터마크

### 인스타 캐러셀 (1080x1350)
- 10장 구성: Hook → 인사이트 → CTA → 브랜딩
- 다크/라이트 배경 + 골드 포인트
- 미니멀 디자인

### 쓰레드
- 300~500자 권장
- 짧은 문장 + 줄바꿈
- 이모지 적절히 활용

---

## ⚙️ 작동 방식

1. **입력 감지**: URL인지 파일인지 자동 판별
2. **텍스트 추출**: 
   - 유튜브 → yt-dlp로 자막 다운
   - 아티클 → read_url_content
   - 파일 → 직접 읽기
3. **분석**: 핵심 인사이트 5개 + 하이라이트 3개 추출
4. **생성**: 
   - 쇼츠 → FFmpeg로 영상 크롭 + 자막 합성
   - 인스타 → generate_image로 슬라이드 10장
   - 쓰레드 → 텍스트 게시물 작성

---

## 🎯 다음 단계

1. `/repurpose` 명령어로 테스트
2. 생성된 결과물 확인
3. 브랜드 가이드 필요 시 수정
4. 자동화 스크립트 작성 (선택)
