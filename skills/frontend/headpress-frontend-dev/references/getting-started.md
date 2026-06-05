# Getting Started: 如何從首頁開始

本章節介紹如何使用 HeadPress Composition API 從零開始建立前端應用程式的首頁。

## 1. 探索 API 規格與設定 (Discover API Contract)

在開始實作前，請先確認 API 規格與建議流程：
- 呼叫 `GET /manifest` 了解 AI builder 的建議整合流程。
- 呼叫 `GET /openapi.json` 取得完整的機器可讀 API 規格。

## 2. 建立 App Shell (全站共用結構)

首先，建立全站共用的外殼 (App Shell)，包含導覽列 (Header)、頁尾 (Footer)、全域 SEO 等設定。

**API Endpoint:**
`GET /site`

**功能:**
取得全站共用資料，如網站識別 (Site Identity)、CMS/Frontend URLs、Logo、全域選單 (Global Menus)、社群連結、聯絡資訊與預設 SEO 設定。這些資料適用於全域佈局，並非特定頁面專屬。

## 3. 渲染首頁 (Homepage)

建立好 App Shell 後，接著就是取得首頁的專屬內容。

**API Endpoints:**
`GET /route`

既有整合也可使用 `GET /front-page` 或 `GET /page`，新前端優先使用 `/route`。

**功能:**
明確取得首頁資料。這會解析 WordPress 設定的 front page，並回傳完整的 `PageResponse`，內容包含：
- `site`: 網站內容情境
- `route`: 路由資訊 (對於首頁會回傳 `route.kind=front-page`)
- `entity`: WordPress 頁面實體資料
- `sections`: 頁面區塊資料
- `seo`: 頁面專屬的 SEO 資訊
- `attachments`, `media`, `breadcrumb`, `schema`, `archive`, `collections`, `meta` 等渲染就緒 (render-ready) 資料。

## 4. 渲染其他前端頁面 (Other Routes)

完成首頁後，可以使用相同的模式渲染其他任何前端頁面：

**API Endpoint:**
`GET /route/{path}`

若 SDK 或 OpenAPI client 不擅長多層 path parameter，可使用 `GET /route?path=/about/team`。

**功能:**
傳入前端路徑 (例如 `/route/about`、`/route/blog/post-slug` 或 `/route/category/news`)。此端點會自動解析為頁面、文章、自訂文章類型、彙整頁面或 404 等，並回傳與首頁格式一致的 `PageResponse`。

## 5. 補充資料：Atomic Endpoints

開發時請優先使用 `/site` 與 `/route` 組合 API，當前端有獨立需求時才呼叫以下原子端點：
- `/collection`: 取得列表 (如最新文章)、分類列表
- `/search`: 全文搜尋
- `/sitemap`: 用於產生 Sitemap
- `/taxonomies` 與 `/taxonomy/{taxonomy}`: 探索可用分類法與取得 terms
- `/media/{id}`: 取得單一媒體的詳細資料

---

## 6. Runtime Metadata 探索 (專給 AI Builder 與開發工具)

為了讓 AI Builder 或前端產生器能夠自動了解站點的內容結構與建議的路由對應，HeadPress 提供了三個專屬的 Meta 端點。在初始化專案或建構路由表前，可以先呼叫這些端點來獲取系統資訊：

### `GET /manifest` (系統整合清單)
**使用時機：** 剛開始建構專案或設定 AI Builder 時的第一步。
**功能：** 回傳推薦的 API 使用流程 (Recommended Flow)、支援的路由種類 (Route Kinds)、API Base URL 以及系統啟用的功能特徵 (Features)。這能幫助開發工具自動決定要呼叫哪些端點。

### `GET /content-types` (內容模型探索)
**使用時機：** 實作動態路由、篩選器或需要呈現所有可用內容類型時。
**功能：** 列出系統中所有開放給前端的「文章類型 (Post Types)」與「分類法 (Taxonomies)」。你可藉此知道可以對 `/collection?type=...` 傳入哪些合法的 type 參數 (例如 `post`, `page`, `portfolio`)，或是取得各分類法的層級結構設定。

### `GET /templates` (前端樣板映射)
**使用時機：** 當 AI Builder 需要自動建立 React/Vue Component 結構時。
**功能：** 列出所有可能的路由種類 (如 `front-page`, `single`, `taxonomy-archive`, `not-found`) 並推薦其對應的前端元件名稱 (例如 `HomePage`, `PageTemplate`, `ArchivePage`, `NotFoundPage`)。這有助於自動生成路由表或動態組件載入機制。

---

## 快取與錯誤處理提示

- **快取：** 主要的 GET 請求都會包含 `ETag` 與 `Cache-Control`。帶有符合 `If-None-Match` 的請求會收到 304 Not Modified。
- **錯誤處理：** 錯誤會被封裝在 `{ error: { code, message, status, details }, meta }`。當找不到路徑時，`/route/{path}` 會回傳 HTTP 404 以及 `route.kind=not-found`，讓前端可以渲染專屬的 404 畫面。
