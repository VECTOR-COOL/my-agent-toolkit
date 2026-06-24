# 常見情境處理

## 新增 Composition API 驅動的列表頁

1. 先查 `openapi.json` 的 `/collection` response schema。
2. 定義 normalized item type（例如 `PostCardModel`）。
3. 建立 mock fixture，覆蓋正常、空列表、缺圖、長標題。
4. 建立 headpressClient fetcher 與 mapper（`collection → PostCardModel[]`）。
5. 在 route loader / server function 取得資料，component 只負責 render。
6. 加上 pagination 或明確標註第一階段不支援。
7. 補 SEO fallback 與 404/empty 狀態。

## 新增 detail 頁或 dynamic slug route

1. 查 `openapi.json` 的 `/route` response schema (搭配 `?path=` 參數)，確認 path 與 slug 對應。
2. 確認 route param 命名與 URL 結構。
3. fetch by path 時處理零筆、多筆、非 publish 狀態。
4. mapper 補齊 title、content、excerpt、date、featured image fallback。
5. 找不到內容時回傳框架 404。
6. metadata 使用內容資料生成，缺欄位時使用 site fallback。

## 取得 WordPress Post / CPT 單篇文章

預設使用 HeadPress route resolver，而不是直接用 `/wp/v2/`：
```text
# 首頁解析
GET /route?include=all

# 一般文章與頁面 (SDK 優先推薦做法)
GET /route?path=/{post-slug}&include=all
GET /route?path=/blog/{post-slug}&include=all

# Custom Post Type single
GET /route?path=/{post_type}/{post-slug}&include=all
```
後端必要條件：CPT 必須 `public: true`、`show_in_rest: true`，並加入 `headpress/route/post_type_allowlist`。若只需要一個公開 publish object 且已知 post type，可在 service layer 使用 `GET /content/{post_type}/{identifier}`。這永遠回單一 object 或 404，不回陣列；若需要 SEO、breadcrumb、redirect 或 404 page context，仍必須使用 `GET /route?path={current_path}&include=all`。

## 從 mock 切到正式 `/headpress/api/v1/` API

1. 不直接刪 mock；保留做 regression 與 UI 開發。
2. 確認 env、API base URL（`VITE_WP_API_URL`）、auth、CORS。
3. 用 mapper 對齊 Composition API response 與 normalized model。
4. 測試空資料、欄位缺失、圖片缺失、API timeout。
5. 確認 production build 不依賴本機 mock-only path。

## 欄位不存在或 openapi.json 未列

1. 確認欄位是否已在 `openapi.json` 定義。
2. 若未定義，先看 `themes/headpress/docs/prd/混合型HeadlessAPI架構PRD.md` 確認計畫。
3. 若確實需要新欄位，走 Schema Change Protocol 提交後端 PR 或 issue，不在前端永久 fake。

## 媒體與缺圖處理 (Media Fallback)

1. **缺圖替代 (Placeholder)**：當 API 未回傳圖片 URL 或欄位為空時，必須提供與網站視覺風格相近的預設代圖，維持 UI 佈局完整，不可讓版面破圖或留白。
2. **載入錯誤偵測**：必須在 `<img>` 或圖片元件綁定 `onError` 事件，主動偵測圖片載入失敗，自動替換為前述的預設代圖。
3. **樣式對齊**：代圖的尺寸比例（aspect-ratio）、object-fit 行為與原圖設定需保持一致。

## Custom domain / production 準備

1. 確認 canonical base URL（`VITE_SITE_URL`）與 API base URL（`VITE_WP_API_URL`）由 env 控制，不 hardcode。
2. 確認前端 platform（Lovable、Vercel 等）custom domain 已正確 bind 且 DNS 生效。
3. 確認 `/headpress/api/v1/` CORS 允許前端 production domain。
4. 確認 sitemap/robots/schema.org 若尚未實作，已明確列為後續工作。
