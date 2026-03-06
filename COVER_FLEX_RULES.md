# 커버 유연성 규칙

커버는 "고정된 한 가지 레이아웃"으로 강제하지 않습니다.

## 기본 원칙
- 기본: 텍스트 중심 커버
- 선택: 인물/주제 이미지가 적합할 때만 이미지 커버 사용
- 목표: 템플릿 일관성보다 메시지 적합도를 우선

## 사용 가능한 필드 (`cover` 슬라이드)
- `coverMode`: `auto` | `text` | `media`
  - `auto`: 이미지가 있으면 사용, 없으면 텍스트
  - `text`: 이미지가 있어도 텍스트 커버 강제
  - `media`: 이미지 커버 우선 (이미지 없으면 텍스트로 자동 폴백)
- `coverImageSide`: `right` | `left`
- `preset`: `editorial` | `minimal` | `impact`
  - `editorial`: 기본 권장
  - `minimal`: 장식 최소화
  - `impact`: 헤드라인 강조

## JSON 예시
```json
{
  "type": "cover",
  "category": "Weekly Insight",
  "kicker": "Startup Briefing",
  "title": "나발 라비칸트\nHow to Get Rich\n핵심 요약",
  "subtitle": "원문/인터뷰 기반 핵심 프레임",
  "coverMode": "media",
  "coverImageSide": "right",
  "preset": "editorial",
  "coverImage": {
    "src": "file:///C:/path/to/naval.jpg",
    "alt": "Naval Ravikant portrait",
    "caption": "원문 인터뷰 핵심 요약"
  }
}
```

## 추천 기준
- 인물/브랜드/서비스 중심 주제: `coverMode: media`
- 정책/리스트/체크리스트 중심 주제: `coverMode: text`
