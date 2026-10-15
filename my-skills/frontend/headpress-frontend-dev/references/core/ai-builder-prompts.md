# AI Builder Prompts 與實作檢查表

## Prompt 撰寫格式（交給 AI Builder）

交給 AI builder 的 prompt 建議包含：
- **專案階段**：UI mock、API migration、SEO hardening、production readiness。
- **平台與 stack**：Lovable TanStack Start、v0 Next.js、Replit、或 active repo 實際架構。
- **資料來源**：`/headpress/api/v1/` Composition API（優先）；schema 見 `themes/headpress/docs/prd/openapi.json`。
- **可改範圍**：指定 files / routes / components。
- **不可改範圍**：headpressClient、mapper、env、routing contract、全域樣式、SEO utilities。
- **驗收條件**：desktop/mobile、loading/empty/error、SSR/SEO 或 static HTML、typecheck。

**範例 prompt**：
```text
請只修改 src/routes/news.tsx 與 src/features/news/* 的 UI 呈現。
資料來源為 /headpress/api/v1/collection?type=post（優先 HeadPress API），schema 見 openapi.json。
headpressClient、mapper、env 設定不可修改。
component 必須使用既有 normalized NewsCardModel。
請保留 loading、empty、error 狀態，並確保缺 featuredImage 時使用 fallback。
完成後需通過 typecheck，mobile 版不可文字重疊或卡片溢出。
```

## 實作檢查表

**修改前**：
- [ ] 確認任務屬於 UI、資料、SEO、部署或協作哪一類。
- [ ] 讀取 `openapi.json` 確認相關 endpoint 的 response schema。
- [ ] 找到資料來源開關、API endpoint、mock fixtures、route loader/server function、SEO utilities。
- [ ] 確認辨識目前平台：Lovable、v0、Replit、自架 Vite/Next/TanStack、或其他。

**修改中**：
- [ ] 優先沿用既有 patterns，不重建整個架構。
- [ ] 讓 component 接 normalized props，不接 raw WordPress response。
- [ ] 對 null、undefined、空陣列、缺圖、缺 slug、API error 寫清楚 fallback。
- [ ] 避免在 SSR/static path 使用 `window`、`document`、`localStorage`、`location`。
- [ ] 避免把 WordPress HTML 直接丟進 DOM；若必須使用，確認 sanitizer。

**修改後**：
- [ ] 執行 typecheck、lint、build 或專案既有測試。
- [ ] 若改 UI，使用本機瀏覽器檢查 desktop/mobile 主要畫面。
- [ ] 若改資料層，測試 mock source 與 WordPress source。
- [ ] 若改 SEO，檢查 SSR/static HTML 或 metadata 產出。

## Review 重點

做 review 時，先列阻擋 release 的問題：
- build 是否因 browser-only API、dynamic import、env 缺失而失敗。
- component 是否繞過 headpressClient／service layer 直接呼叫 CMS URL。
- **是否在 HeadPress 已有 endpoint 時仍新增不必要的 `/wp/v2/` 直連**（高風險，須立即標記）。
- **任何 `/wp/v2/` 呼叫是否已事先通知使用者並取得明確同意**；未經同意引入的須退回重審。
- dynamic route 是否正確 404。
- SEO metadata 是否只在 client 端才出現。
