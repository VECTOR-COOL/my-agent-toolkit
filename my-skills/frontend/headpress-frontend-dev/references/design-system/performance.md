# 渲染與效能優化 (Performance)

優異的效能是 HeadPress 專案的核心要求。前端不僅要畫面美觀，更要顧及 Web Vitals（特別是 LCP 與 CLS）。

## 1. 預防版面偏移 (Cumulative Layout Shift, CLS)

- **圖片與媒體佔位**: 所有的 `<img>`, `<video>` 都必須有明確的 `width` 與 `height` 屬性，或使用 `aspect-ratio` CSS 屬性，保留空間以防止載入後撐開版面。
- **字體載入 (FOUT/FOIT)**: 自訂字型應使用 `font-display: swap`，避免畫面出現長達數秒的隱藏文字。必要時可利用 `size-adjust` 等 CSS 調整 fallback 字體的比例，降低切換時的位移。
- **動態內容容器**: 對於透過 API 延遲載入的內容（例如：最新消息列表、廣告區塊），應預先給予 Skeleton Loading UI 或設定最小高度 (`min-height`)。

## 2. 圖片最佳化 (Image Optimization)

網頁前端的多尺寸圖片處理統稱為 **Responsive Images (響應式圖片)**，這也是 HeadPress 前端對圖片的標準要求。

- **響應式圖片 (Responsive Images)**: 必須搭配 `srcset` 與 `sizes` 屬性，讓不同尺寸的裝置自動選擇最適合的圖檔大小，避免行動裝置下載不必要的巨幅圖片。同時盡量配合 WordPress 後端提供 WebP / AVIF 現代格式。
- **Lazy Loading (延遲載入)**: 位於首屏（Above the fold）之外的圖片一律加上 `loading="lazy"`。
- **首屏圖片優先載入**: Hero 區塊的主視覺圖片（LCP 元素）必須加上 `fetchpriority="high"`，並且**嚴禁**使用 lazy load。
- **預設圖片回退 (Image Fallback)**: 元件必須處理圖片載入失敗的情況（例如透過 `onError` 事件捕捉）。當圖片失效時，務必用準備好的預設圖片 (Default/Placeholder Image) 進行回退 (Fallback)，確保版面完整不破圖。

## 3. JavaScript 與 Bundle Size

- **依賴管理**: 嚴格管控第三方套件。例如：處理時間格式請優先考慮原生的 `Intl.DateTimeFormat` 或是輕量的 `date-fns`/`dayjs`，而非引入龐大的 `moment.js`。
- **動態載入 (Code Splitting)**: 對於極少使用的巨大組件（如複雜的 3D 渲染圖表、影片播放器、大型第三方對話框），應使用 Dynamic Import 延遲載入。

## 4. 渲染策略 (SSR / SSG)

- 依據 `getting-started.md` 的規劃，所有具 SEO 價值的公開頁面必須在 Server Side 完成第一次渲染。
- 避免在 Component 的根節點執行過多只能在 Client 端執行的邏輯（例如直接依賴 `window.innerWidth` 來決定 Layout），這會導致 Hydration Mismatch 與初次渲染的延遲。
