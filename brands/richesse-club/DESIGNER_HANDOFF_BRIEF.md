# richesse.club Designer Handoff Brief

이 문서는 richesse.club 전용 디자이너 브리프입니다.
디자인 기준은 같은 폴더의 `BRAND_GUIDE.md` 를 우선하며, 핵심 방향은 `Swiss design`, `고정된 body 템플릿 1종 반복`, `텍스트 중심`, `Pretendard 고정`, `모노크롬`입니다.

## 1) 프로젝트 정보
```markdown
- 콘텐츠 ID:
- 브랜드: richesse.club
- 포맷: Instagram Carousel (1080x1440)
- 마감:
```

## 2) 콘텐츠 목표
```markdown
- 핵심 목표(1문장):
- 타겟 독자:
- 마지막 인사이트:
```

## 3) 메시지 우선순위
```markdown
1. 1순위 메시지:
2. 2순위 메시지:
3. 3순위 메시지:
```

## 4) 비주얼 디렉션
```markdown
- 톤 키워드: swiss / refined / restrained / editorial
- 현재 운영 기본 템플릿: `brands/richesse-club/body.template.json`
- 금지 요소: 아이콘 중심 구성, 일러스트, 카드형 정보 박스, 과한 그라데이션, 글로우, 블러, 주황색 중심 강조
- 컬러 기준: 흑백/회색 중심, accent 없이 진행
- 강조 전략: 크기, 정렬, 폰트 두께 차이만으로 해결
- 서체 원칙: index/body = `Pretendard Medium`, headline = `Pretendard ExtraBold`, source tag = `Neue Haas Grotesk Display Pro 45 Light`
- 커버 원칙: Slide 1은 후킹을 위해 상대적으로 자유롭게 구성 가능하되, `2줄 제목` 구조는 고정
- 커버 번호 원칙: Slide 1은 번호를 생략해도 됨
- 커버 안전영역 원칙: tag와 제목은 항상 `1080x1080` safe area 안에 둘 것
- 커버 태그 원칙: 좌측 `[richesse.club]`, 우측 `[이름/주체명]`을 기본값으로 사용
- 커버 태그 서체: `Neue Haas Grotesk Display Pro`, `35px`, `Extra Light`
- 본문 원칙: Slide 2~N은 같은 텍스트 중심 템플릿을 반복
- 본문 기본 구조: 자동 번호 마커([02]부터) + 가는 구분선 -> 2줄 헤드라인 -> lead 본문 -> secondary 본문/quote -> bullet -> 하단 좌우 source tag
- 번호 원칙: index는 슬라이드 순서대로 자동 생성하고, 시각 스타일은 `Pretendard Medium 37.5px` 기준으로 고정
- 타이포 원칙: 헤드라인 자간은 약간 조이고, body 카피는 자간과 행간을 함께 다듬어 답답하지 않게 읽히게 할 것
- 본문 카피 원칙: body 슬라이드는 텍스트 밀도가 살아 있어야 하며, 문단/quote/bullet 슬롯을 충분히 채운다
- 정렬 원칙: 번호, 선, 헤드라인, 본문 시작선, source tag 축은 같은 기준선 안에서 정리
- 이미지 운용 원칙: 현재 운영 기본값은 `no image`. 별도 요청이 있을 때만 override 로 검토
``` 

## 5) 슬라이드별 메모
```markdown
- Slide 1:
  - 역할: Cover
  - 기획 의도: 피드에서 시선을 멈추게 하고 주제를 한 번에 인지시킴
  - 필수 요소: `2줄 제목`, 좌우 tag, 1080x1080 safe area 안의 정렬, 브랜드 톤 유지

- Slide 2:
  - 역할: First Body
  - 기획 의도: 커버 이후 본문 리듬을 확정하는 첫 기준 슬라이드
  - 필수 요소: 번호 마커, 구분선, 2줄 헤드라인, lead 본문, secondary 본문/quote, bullet, 하단 source tag

- Slide 3~N-1:
  - 역할: Body
  - 기획 의도: 같은 구조 안에서 메시지 1개씩 차분하게 전개
  - 필수 요소: Slide 2와 동일한 골격 유지, 메시지 1개, 충분한 본문 밀도, source tag 유지

- Final:
  - 역할: Final Body
  - 기획 의도: 전체 메시지를 정리하되 별도 행동 유도 카드로 밀지 않고 마지막 인사이트로 마무리
  - 필수 요소: Slide 2와 같은 골격 유지, 번호 마커, 헤드라인, 충분한 본문, bullet, source tag
```

## 6) 본문 슬라이드 제작 규칙
- 운영 기본값은 기존 cover 를 유지한 채 `slides.data.json` 의 텍스트만 교체하고 `npm run build:richesse -- --project projects/<id>` 로 `carousel.json` 을 다시 만드는 방식이다. `cover.slide.json` 이 있으면 그 파일을 우선 사용하고, 없으면 기존 `carousel.json` 의 첫 슬라이드를 유지한다.
- body 슬라이드는 `brands/richesse-club/body.template.json` 의 구조를 기준으로 반복한다.
- 번호 마커는 구조가 읽힐 만큼 충분히 크게 두며, 구분선은 시각 장식이 아니라 레이아웃 기준선 역할을 해야 한다.
- 헤드라인은 두 줄 안에서 끝내는 것을 우선하고, `Pretendard ExtraBold` 를 기본으로 잡는다. 자간은 다소 타이트하게 조정한다.
- 본문은 `lead -> secondary -> quote -> bullet` 슬롯을 충분히 채운다.
- 슬라이드가 여러 장 이어질수록 번호 위치, 선 길이, 텍스트 폭, 상하 간격, 하단 source tag 높이가 흔들리지 않아야 한다.
- 사진, 카드형 박스, 데이터형 레이아웃, 아이콘 세트는 richesse 기본 body 흐름과 맞지 않는다.
- 텍스트가 부족하면 디자인 요소를 늘리는 대신 원고를 보강하는 쪽으로 판단한다.

## 7) 확인 메모
- 브랜드 가이드의 Swiss design 원칙을 지켰는가?
- 텍스트 외 요소를 과하게 쓰지 않았는가?
- Pretendard 외 서체를 남용하지 않았는가?
- 지나치게 두꺼운 타이포와 주황 accent가 들어가지 않았는가?
- 공통 가독성 기준과 1080x1440 규격은 지켰는가?
- Cover 제목이 정확히 2줄인가?
- Cover tag와 제목이 1080x1080 safe area 안에 들어왔는가?
- Cover tag가 `Neue Haas Grotesk Display Pro 35 Extra Light` 로 처리됐는가?
- Cover를 제외한 본문 슬라이드가 같은 구조 안에서 안정적으로 반복되는가?
- 번호 마커, 구분선, 헤드라인, 본문 축, source tag 축이 슬라이드마다 어긋나지 않는가?
