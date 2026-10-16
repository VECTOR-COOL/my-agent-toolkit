# 無障礙設計 (Accessibility / A11y)

HeadPress 前端專案重視包容性設計，確保所有人（包含使用輔助科技的使用者）都能無障礙地瀏覽網站與使用功能。

## 1. 鍵盤導覽 (Keyboard Navigation)

所有可互動的元素（連結、按鈕、表單輸入框）都必須能透過鍵盤的 `Tab` 鍵到達，並且需有明確的焦點狀態。
- **Focus Ring**: 不可全域隱藏焦點框（禁止 `outline: none` 且不提供替代樣式）。應使用 `:focus-visible` 偽類為鍵盤操作者提供清晰的視覺焦點。
- **Skip Link**: 在頁面頂部提供「跳至主要內容 (Skip to main content)」的隱藏連結，讓使用螢幕閱讀器的使用者能略過重複的導覽列。

## 2. 螢幕閱讀器與 ARIA 標籤

- **語意化 HTML**: 優先使用原生 HTML5 標籤 (`<nav>`, `<main>`, `<article>`, `<button>`, `<a>`)，減少使用沒有語意的 `<div>` 或 `<span>` 綁定 click 事件。
- **ARIA 屬性**: 只有在原生標籤無法表達複雜互動時（例如：下拉選單、分頁 Tabs、對話框 Modal）才使用 `aria-expanded`, `aria-hidden`, `aria-controls`, `role="tab"` 等屬性。
- **Screen Reader Only (sr-only)**: 針對視覺上隱藏但需讓螢幕閱讀器讀出的內容，應套用 `sr-only` CSS class（透過 `clip: rect(0,0,0,0)` 等方式隱藏）。例如圖示按鈕必須有 `sr-only` 的文字說明。

## 3. 對比度與視覺呈現

- **色彩對比**: 文字與背景的對比度必須符合 WCAG AA 級標準。一般文字至少為 4.5:1，大型文字至少為 3:1。
- **不依賴單一顏色**: 傳達錯誤或成功等重要訊息時，不能僅靠顏色變化（例如文字變紅），必須加上文字說明或圖示輔助。

## 4. 媒體與動態內容

- **圖片 Alt 文字**: 除非圖片為純裝飾性 (`alt=""`)，否則必須為所有 `<img />` 提供具描述性的 `alt` 屬性。CMS 回傳的媒體物件若缺漏 alt 描述，前端可適度給予安全 Fallback。
- **動畫降低 (Prefers Reduced Motion)**: 透過 `@media (prefers-reduced-motion: reduce)` 偵測使用者的系統偏好。若使用者開啟此設定，應關閉所有非必要的裝飾性動畫、平滑捲動與複雜轉場。
