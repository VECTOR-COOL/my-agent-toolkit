# HeadPress Composition API Data Contract

本文件說明前端如何消費 HeadPress Composition API（`/headless/v1/`）。

> 所有網域範例使用 `example.com`；實際使用時替換為部署的真實網域。

## API Base URL

```bash
# 前端環境變數（範例）
VITE_WP_API_URL=https://example.com/wp-json/headless/v1
```

## Schema 查詢位置

**OpenAPI 3.1 Spec（唯一 canonical）**：

```
themes/headpress/docs/prd/openapi.json
```

Runtime 取得（WordPress 啟動後）：
```
GET https://example.com/wp-json/headless/v1/openapi.json
```

> AI Builder 或 agent：使用任何欄位前，**必須先在 openapi.json 中確認欄位存在**。未列入的欄位代表未實作或已廢棄。

## Composition API Endpoints

前端只消費以下 endpoints（完整 schema 見 `openapi.json`）：

```
GET /headless/v1/site
GET /headless/v1/page?path={frontendPath}
GET /headless/v1/collection?type={postType}&page={page}
GET /headless/v1/search?q={keyword}&page={page}
GET /headless/v1/sitemap?type={type}&page={page}
GET /headless/v1/taxonomies
GET /headless/v1/taxonomy/{taxonomy}?slug={slug}
GET /headless/v1/media/{id}
GET /headless/v1/openapi.json
```

## WordPress Native Endpoints（內部使用，前端不直接呼叫）

以下為 Composition API 內部使用的 WordPress 原生 endpoint，前端不應直接呼叫：

```
GET /wp/v2/posts
GET /wp/v2/pages
GET /wp/v2/categories
GET /wp/v2/tags
GET /wp/v2/media/{id}
```

## Service Boundary

```
route loader / server function
  → headlessClient（指向 /headless/v1/）
  → /headless/v1/* composition API
  → mapper → normalized view model
  → UI components
```

前端只需要 **一個 API client** 指向 `/headless/v1/`。OpenAPI spec 可以自動產生 TypeScript client。

## Required Shape Discipline

Composition API 的 `entity`、`items`、media、taxonomy 欄位保留 WordPress REST conventions。

**欄位對齊規則**（mapper 必須遵守）：

| WordPress 欄位 | 正確寫法 | 錯誤寫法 |
|---------------|---------|---------|
| 文章標題 | `title.rendered` | `title`（字串） |
| 文章內容 | `content.rendered` | `content` |
| 文章摘要 | `excerpt.rendered` | `excerpt` |
| 特色圖 ID | `featured_media` | `featured_image_id` |
| 特色圖 URL | `_embedded["wp:featuredmedia"][0].source_url` | 自行拼接 URL |
| 分類/標籤 | `_embedded["wp:term"]` | `categories`（ID 陣列） |
| SEO meta | `yoast_head_json`（若 Yoast 可用） | 自行推測 meta |

站台擴充欄位預設放在 `headless` key（見 openapi.json）。

## Components 禁止事項

Components 不得：

- 直接呼叫 `fetch("https://example.com/...")` 或任何 CMS URL
- 直接 import mock fixtures
- 假設 openapi.json 未定義的後端欄位
- 在 SSR/SSG/pre-render 可用時，從 client-only effects 取得主要內容

## Schema Change Protocol

若 UI 需要 REST response 中不存在的資料：

1. 確認欄位是否已在 `openapi.json` 定義。
2. 識別缺少的欄位與 UI 場景。
3. 決定它屬於 WordPress core、ACF/custom fields、taxonomy、media metadata 或 SEO plugin。
4. 記錄預期的 REST path 與 type（在 openapi.json 或文件中）。
5. 不要在前端永久 fake 該欄位；提交後端 PR 或 issue。

## Production Fallback

- 開發環境可 fallback 到 mock data 維持 UI 開發進度。
- Production **不得** 在 API 失敗後顯示假 mock 內容。
- Production 應 render 受控的 empty/error state，不破壞 layout 或 SEO basics。

## Error Contract

- Fetcher 必須捕捉 HTTP status、WordPress REST error body、timeout、network failure、invalid JSON、CORS/auth 失敗、rate limit 與 server/maintenance errors。
- Service layer 必須把錯誤正規化成 typed states：`error`、`notFound`、`unauthorized`、`forbidden`、`rateLimited`、`timeout`、`unavailable`。
- Dynamic slug routes 在 API 返回零筆 published items 時，必須回傳框架級 404/not-found。
- `/headless/v1/page` 404 必須對應框架級 404；`/headless/v1/sitemap` 失敗不得 publish 失效 URL。
- 缺 `_embedded`、缺 media、空 ACF 欄位、`null` rendered 欄位、unpublished/private content 必須在 mapper 或 service code 處理，不可讓 UI components 直接面對。
- Production fallback 絕不能靜默用 mock 替換失敗的 API 內容；改顯示受控 degraded/error state。

## Common API Pitfalls

- 使用 `_embed` + `_fields` 時，保留 `_embedded` 和 `_links` 否則 featured media/taxonomy 消失。
- 不要在沒有 pagination 的情況下 fetch 大型 archive；WordPress 預設 `per_page` 有上限。
- 讀 pagination headers：`X-WP-Total`、`X-WP-TotalPages`；不要從當前 response 長度推算總頁數。
- 確認 custom post type 的 `show_in_rest` 和 `rest_base` 設定，再建立對應 route。
- `rendered` 欄位是 HTML；card excerpt/meta description 要 strip HTML，不可直接用原始值。
