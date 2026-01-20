# Richesse Index Style: Design System (v1.6)
> **Goal:** 픽셀 단위의 정밀함과 타이포그래피 중심의 미학(Swiss Style)을 구현.

---

## 1. Core Identity
"장식은 최소화하고, 그리드와 타입만으로 압도한다."

*   **Native Resolution:** `1080px` x `1350px` (Instagram Portrait)
*   **Background:** 
    *   **Base:** Black (`#000000`)
    *   **Overlay:** Color `#480111` with 50% Opacity (Fill).
    *   *Effect:* Deep, rich wine-black tone (`#240008` visual equivalent).
*   **Foreground (Text):** Pure White (`#FFFFFF`)

---

## 2. Typography System
영문/숫자는 **Neue Haas Grotesk**, 국문은 **Pretendard**.

### Font Family Stack
```css
font-family: 'neue-haas-grotesk-display', 'Pretendard Variable', 'Pretendard', sans-serif;
```

### Text Styles (1080x1350px 기준)

| Element | Font Family | Size (px) | Weight | Tracking | Line Height | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Index Tag** | Neue Haas Grotesk | `24px` | `300` (L) | `0.02em` | - | `[ index® ]` 태그 전용 |
| **Cover Title** | Mix (Neue First) | `96px` | `600` (B) | `-0.04em` | `1.1` | - |
| **Slide Title** | **Pretendard** | `76px` | `700` (Bold) | `-0.025em` | `1.33` | **Left Align (x:64, y:350)** |
| **Body Text** | **Pretendard** | **`34px`** | `300` (Light) | `-0.01em` | **`1.5`** | **8pt Scale / 12pt Leading** |
| **Emphasis** | **Pretendard** | **`34px`** | **`500` (Med)** | `-0.01em` | **`1.5`** | **Bold 대신 Medium 사용** |

*(Note: Body Size `34px`는 1080px 캔버스에서의 `8pt` 대응 스케일입니다)*

---

## 3. Pixel-Perfect Layout (Absolute System)
모든 핵심 요소는 절대 좌표(Absolute)로 고정됩니다.

### 3.1. Header Tags (Fixed Anchors)
*   **Left Tag (`[ index® ]`):** `x: 56.29px`, `y: 157.73px`
*   **Right Tag (`[ Name ]`):** `right: 56.29px`, `y: 157.73px`

### 3.2. Slide Title
*   **Position:** Absolute
*   **Top:** `350px`
*   **Left:** `64px`
*   **Align:** Left Aligned

### 3.3. Content Body
*   **Position:** Absolute
*   **Top:** `690px`
*   **Left:** `64px`
*   **Width:** Max `950px` (Safe Area)
*   **Align:** Left Aligned

---

## 4. Components & Tech Spec
(이전 버전과 동일: Arrow List, Footer Quote, HD Rendering Logic)
