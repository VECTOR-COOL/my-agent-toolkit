# 核心原則與高風險禁止事項

## 核心原則

- **Schema 先查 openapi.json**：任何前端欄位對齊，先讀 `themes/headpress/docs/prd/openapi.json`；不得猜測或假設 response 形狀。
- **HeadPress 強制優先**：主 client 指向 `/headpress/api/v1/`；任何資料需求必須先確認 HeadPress API 是否可滿足，方可考慮備援。
- **WP 原生 API 使用前必須通知使用者**：`/wp/v2/` 僅在 service layer 作備援，且**必須先通知使用者說明理由並取得明確同意**後才能引入；component 不得直連。
- **保留現有 stack**：先辨識 active repo 實際使用的 framework、router、rendering mode；除非明確要求，不替換 stack。
- **先穩 UI，再串 API**：開發階段使用 mock 或 fixture 讓畫面穩定；正式 API 只透過 service layer 切換。
- **資料層與畫面分離**：routes / components 只吃 normalized view model；WordPress 原始 response 放在 service / mapper。
- **SSR/SEO 依平台能力落地**：需要 SEO 的內容應在 server render 或平台支援的 pre-render 流程取得。
- **型別先行**：所有 Composition API response、normalized model 都要有 TypeScript 型別。
- **可缺資料設計**：WordPress 後台資料常缺圖、缺 excerpt、欄位為 null；UI 與 mapper 必須有 fallback。
- **錯誤處理前置**：API error、timeout、CORS、not found 都在 service/mapper 正規化，再交給 UI 呈現。
- **網址須過濾，不可直連 CMS**：WordPress 輸出的絕對 URL，必須在 mapper 改寫為前端公開網域。
- **AI builder 只改可控範圍**：指定不可改 data services、routing contract、env schema、SEO utilities 與 shared types。

## 高風險禁止事項

除非使用者明確要求，避免做下列變更：
- **不要在未通知使用者的情況下引入任何 `/wp/v2/` 呼叫**：每次使用 WP 原生 API 備援前，必須先停下來通知使用者說明理由，等待明確同意後再繼續。
- **不要讓 component 直接呼叫 `/wp/v2/` 或任何 CMS URL**。
- **不要在 HeadPress API 可滿足需求的情況下繞過它**。
- **不要在 component 直接引入 mock fixture**。
- **不要移除 mock data**；mock 是 UI regression 的安全網。
- **不要把 SSR/SSG/pre-render 能力改成 CSR-only**。
- **不要 hardcode CMS 網域、production 網域或圖片 URL**。
- **不要把 CMS 絕對 URL 直接當成前端 `<a href>` 或 `canonical`**。
- **不要讓 AI builder 修改 `.env`、secret 或 WordPress application password**。
- **不要使用已廢棄的 endpoint**。

## WP 原生 API 備援啟用 SOP

當 Agent 判斷 HeadPress API 無法滿足特定需求時，**必須按以下 SOP 執行，不得跳過任一步驟**：
1. **確認 HeadPress 真的無法滿足**：搜尋 `openapi.json` 確認 endpoint/欄位確實不存在，且無法透過組合達成。
2. **撰寫備援申請通知**：向使用者說明需求、HeadPress 缺少的 endpoint、備援方案（`/wp/v2/` endpoint 及 service 封裝方式），並建議長期方案。
3. **等待使用者明確同意**：收到同意後才加入呼叫，並在程式碼標註 `// WP fallback: [原因] - approved by user [日期]`。
4. **不得靜默降級**：HeadPress 報錯時不得自動靜默切換到 `/wp/v2/`，應正確處理錯誤並提示。
