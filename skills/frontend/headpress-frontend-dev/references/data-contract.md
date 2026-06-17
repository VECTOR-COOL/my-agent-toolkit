# HeadPress Composition API Data Contract

本文件說明前端如何消費 HeadPress Composition API（public base：`/headpress/api/v1`；REST namespace：`headpress/api/v1`）。

> 所有網域範例使用 `example.com`；實際使用時替換為部署的真實網域。

## 後端定位：WordPress Headless CMS

HeadPress 的前端資料契約建立在 WordPress 上。Agent 不應把後端想成無狀態 JSON datastore、Supabase table 或自訂 SaaS CMS，而要使用 WordPress 的資料邏輯：

- content objects：`post`、`page`、Custom Post Type。
- routing：WordPress permalink、front page、posts page、archive、taxonomy archive、single object、redirect、404。
- classification：taxonomy、term、category、tag、custom taxonomy。
- media：attachment、featured media、image sizes、alt text、caption。
- navigation：WordPress nav menu location、menu item hierarchy、external link、current/ancestor state。
- SEO：SEO plugin fields、canonical source data、robots、schema、breadcrumb、Open Graph image。

HeadPress Composition API 會把這些 WordPress 資料組裝為前端可渲染的 payload；它不取消 WordPress 欄位慣例。因此 mapper 必須理解 `title.rendered`、`content.rendered`、`excerpt.rendered`、`featured_media`、taxonomy ids、media objects 與 publish/private 狀態。

## API 優先順序

1. **優先** `/headpress/api/v1/*`（HeadPress Composition API）。
2. **僅當** HeadPress 無對應能力或 openapi 未涵蓋時，在 **service layer** 使用 `/wp/v2/*`（完整 URL 通常位於 `{CMS}/wp-json/wp/v2/*`）。
3. Component 不得直接呼叫任一 CMS URL；經 `headpressClient` 或 service 內 `wpClient`。

## API Base URL

```bash
# 前端環境變數（範例）
VITE_WP_API_URL=https://example.com/headpress/api/v1
```

## Schema 查詢位置

**OpenAPI 3.1 契約 SSOT（repo，後端開發／CI）**：

```
themes/headpress/docs/prd/openapi.json
```

**Runtime（AI builder、前端整合、codegen 應優先使用）**：

```
GET https://example.com/headpress/api/v1/manifest
GET https://example.com/headpress/api/v1/openapi.json
```

`/manifest` 提供站點 URL 與整合 recipes；`/openapi.json` 回傳與 SSOT 同形的 spec，並注入實際 CMS `servers` URL。勿把 repo 靜態檔當 live API base。

**離線 placeholder（僅 Swagger UI 無 WP 時）**：

```
themes/headpress/docs/prd/openapi.example.json
```

`openapi.example.json` 的 `servers` 為範例網域，不可作為 production fetch 或 Try it out 目標。

> AI Builder 或 agent：使用任何欄位前，**必須先在 openapi.json（優先 runtime GET）中確認欄位存在**。未列入的欄位代表未實作或已廢棄。

## Composition API Endpoints（優先）

路徑相對於 `/headpress/api/v1`（完整 schema 見 `openapi.json`）：

```
# 主流程
GET /site
GET /route
GET /route/{path}
GET /route?path=/about/team

# supported alternatives（既有整合可用，新整合優先 /route）
GET /front-page
GET /page
GET /page/{path}

# 進階
GET /collection
GET /content/{post_type}
GET /content/{post_type}/{identifier}
GET /content-object/{id}
POST /collection
GET /search
GET /sitemap
GET /taxonomies
GET /taxonomy/{taxonomy}
GET /media/{id}
GET /languages
GET /openapi.json
GET /manifest
GET /health

```

## Endpoint 選擇矩陣

| 場景 | 優先 endpoint | 說明 |
| --- | --- | --- |
| 初始化 AI builder / codegen | `GET /manifest` → `GET /openapi.json` | 先取得 recommended flow、runtime servers URL 與 schema |
| 全站 layout / App Shell | `GET /site` | site identity、menus、SEO defaults、social links、meta |
| 首頁 | `GET /route?include=all` | 解析 WordPress front page；比 `/front-page` 更適合新整合 |
| 一般公開路由 | `GET /route?path={current_path}&include=all` | 解析 page、post、CPT、archive、redirect、404；AI builder / SDK 優先 |
| 手寫測試公開路由 | `GET /route/{path}` | 完全受支援；人工測試可讀性較好 |
| header/footer 選單 | `GET /menus`、`GET /menus/{slug}`、`GET /menus/locations` | 保留 WordPress menu hierarchy |
| 最新文章 / CPT 列表 | `GET /collection?type={post_type}` 或 `GET /content/{post_type}` | 含 pagination；卡片資料仍需 mapper |
| taxonomy filter / archive | `GET /taxonomies`、`GET /taxonomy/{taxonomy}`、`GET /collection?taxonomy={taxonomy}&term={slug}` | 先探索 taxonomy，再查 collection |
| 搜尋 | `GET /search?q={query}` | 公開 allowlisted content search |
| 單筆物件，不需要 SEO context | `GET /content/{post_type}/{identifier}` | 已知 post type，依 ID 或 slug 取 publish object |
| 只知道 WordPress ID | `GET /content-object/{id}` | 不知道 post type 的 publish object resolver |
| 設計 token / assets | `GET /theme`、`GET /assets` | 不要猜測 theme.json 或 uploads URL |
| sitemap / robots / redirects source | `GET /sitemap`、`GET /robots`、`GET /redirects` | 前端平台負責正式輸出 |
| HeadPress 無能力且短期不能補 | `/wp/v2/*` via `wpClient` | 僅限 service layer fallback；component 不可直連 |

## WordPress Native Endpoints（備援，service layer only）

以下僅在 HeadPress 無法提供同等資料時，由 service layer 透過 `wpClient` 呼叫；component 不直接消費：

```
GET /wp/v2/posts
GET /wp/v2/pages
GET /wp/v2/categories
GET /wp/v2/tags
GET /wp/v2/media/{id}
```

若需要以 ID 直接取得某篇內容，優先使用 HeadPress 的單筆 resolver：

```text
GET /content-object/{id}
```

只有 HeadPress 沒有對應 public endpoint、且需求明確超出 composition API 時，才可在 service layer 使用：

```text
GET /wp/v2/{rest_base}/{id}
```

例如 CPT `project` 的 `rest_base` 是 `projects`：

```text
GET /wp/v2/projects/123
```

## Service Boundary

```
route loader / server function
  → headpressClient（主：/headpress/api/v1/）
  → [必要時] wpClient（備：/wp/v2/*）
  → mapper → normalized view model
  → UI components
```

主 client 指向 `/headpress/api/v1/`。OpenAPI spec 可自動產生 TypeScript client。

## 取得 WordPress Post / CPT 內容

### 單篇文章、Page、CPT detail（優先）

前端要取得某篇 WordPress content detail 時，優先用 HeadPress route resolver。它會一次回傳 route identity、主要 entity、SEO、media、breadcrumb 與 not-found 狀態，適合 SSR/SSG/pre-render 與 dynamic route loader。

```text
# 一般 post single，依實際 frontend path 傳入
GET /route/{post-slug}
GET /route/blog/{post-slug}

# Custom Post Type single
GET /route/{post_type}/{post-slug}

# SDK / OpenAPI client 不方便傳多層 path 時
GET /route?path=/{post_type}/{post-slug}
```

範例：

```text
GET /route/news-release-2026?include=route,entity,seo,media
GET /route/project/demo-case?include=route,entity,seo,media
GET /route?path=/project/demo-case&include=route,entity,seo,media
```

AI builder / mapper 必須依下列欄位判斷內容類型與畫面：

| 需求 | 欄位 |
| --- | --- |
| route 狀態 | `route.kind`、`route.status` |
| template key | `route.template`，例如 `single_post`、`single_project`、`page_default` |
| render mode | `route.view`，例如 `single`、`page`、`system` |
| content type | `entity.type`，例如 `post`、`page`、`project` |
| 標題 | `entity.title.rendered` |
| 內容 HTML | `entity.content.rendered` |
| 摘要 | `entity.excerpt.rendered` |
| slug | `entity.slug` |
| 特色圖 ID | `entity.featured_media` |
| SEO | 頂層 `seo` |

若 `route.status = 404` 或 `route.kind = "not-found"`，route loader 必須回傳框架級 404，不要渲染空白 detail page。

### CPT 列表或 archive cards

列表、archive、卡片集合使用 `/content/{post_type}` 或 `/collection`：

```text
GET /content/{post_type}?page=1&per_page=10
GET /collection?type={post_type}&page=1&per_page=10
GET /collection?type={post_type}&taxonomy={taxonomy}&term={term-slug}
```

範例：

```text
GET /content/project?page=1&per_page=12
GET /collection?type=project&page=1&per_page=12
GET /collection?type=project&taxonomy=project_category&term=featured
```

### 單一 WordPress object（service layer）

只需要一個 publish object、且不需要 route SEO / breadcrumb / redirect / not-found 時，可用：

```text
GET /content/{post_type}/{identifier}
```

`identifier` 可為 ID 或 slug。回應保留 WordPress-shaped `title.rendered`、`content.rendered`、`excerpt.rendered`。公開頁面渲染仍優先 `/route/{path}`。

若只知道 WordPress ID、不知道 post type，可用：

```text
GET /content-object/{id}
```

`/content-object/{id}` 類似 WordPress object resolver，但只解析公開 publish 且在 HeadPress allowlist 內的 post/page/CPT。它不是通用 WP object dump，不可用來查 user、term、option、private object。單筆 endpoint 永遠回單一 object 或 404，不回 `items[]`。

### Safe WP_Query-shaped 查詢

需要 array-style 查詢條件時才使用：

```text
POST /collection
```

Body 必須符合 openapi.json `QueryRequest`；後端永遠限制 `post_status=publish`、allowlisted `post_type`、`per_page<=100`，且 taxonomy 必須 public + `show_in_rest`。不得在前端假設可以傳 raw `meta_query`、private/draft status、`posts_per_page=-1` 或任意 `WP_Query` args。

### 語言資訊

```text
GET /languages
```

WordPress core 只提供目前 site locale 與已安裝語言包，不代表內容已翻譯。若 API 回傳只有 `source=wordpress-core` 的單一語言，前端應隱藏語言切換或顯示單語 UI；多語 route / content 行為必須等後端多語 plugin 或子主題透過 openapi 契約定義。

### CPT 可用條件

後端 CPT 需要符合：

```php
'public'       => true,
'show_in_rest' => true,
```

並加入 HeadPress allowlist，否則 `/collection`、search、sitemap、CPT archive 與 `/{post_type}/{slug}` route 解析可能無法取得：

```php
add_filter( 'headpress/route/post_type_allowlist', function ( array $types ): array {
    $types[] = 'project';
    return $types;
} );
```

前端或 AI builder 可先查：

```text
GET /content-types
```

用 `post_types[].name`、`post_types[].rest_base`、`post_types[].archive` 確認 CPT 是否公開且有 REST metadata。

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
| SEO meta | 頂層 `seo`（HeadPress `/route` / `/page`）或 `yoast_head_json` | 自行推測 meta |

站台擴充欄位可能出現在 `entity` 或自訂 key；以 `openapi.json` 為準（勿假設舊版 `headless` key 仍存在）。

## Components 禁止事項

Components 不得：

- 直接呼叫 `fetch("https://example.com/...")` 或任何 CMS URL
- 直接 import mock fixtures
- 假設 openapi.json 未定義的後端欄位
- 在 HeadPress 已有 `/route/{path}`、`/page/{path}` 或 `/collection` 時，繞過 service layer 直連 `/wp/v2/`
- 在 SSR/SSG/pre-render 可用時，從 client-only effects 取得主要內容

## Schema Change Protocol

若 UI 需要 REST response 中不存在的資料：

1. 確認欄位是否已在 `openapi.json` 的 HeadPress paths 定義。
2. 識別缺少的欄位與 UI 場景。
3. 決定它屬於 WordPress core、ACF/custom fields、taxonomy、media metadata 或 SEO plugin。
4. **優先** 提交 HeadPress 後端／openapi 擴充；短期才在 service layer 用 `/wp/v2/` 備援。
5. 不要在前端永久 fake 該欄位。

## Production Fallback

- 開發環境可 fallback 到 mock data 維持 UI 開發進度。
- Production **不得** 在 API 失敗後顯示假 mock 內容。
- Production 應 render 受控的 empty/error state，不破壞 layout 或 SEO basics。

## Error Contract

- Fetcher 必須捕捉 HTTP status、WordPress REST error body、timeout、network failure、invalid JSON、CORS/auth 失敗、rate limit 與 server/maintenance errors。
- Service layer 必須把錯誤正規化成 typed states：`error`、`notFound`、`unauthorized`、`forbidden`、`rateLimited`、`timeout`、`unavailable`。
- Dynamic slug routes 在 API 返回零筆 published items 時，必須回傳框架級 404/not-found。
- `/route/{path}` 的 `route.status = 404` 必須對應框架級 404；`/sitemap` 失敗不得 publish 失效 URL。
- 缺 `_embedded`、缺 media、空 ACF 欄位、`null` rendered 欄位、unpublished/private content 必須在 mapper 或 service code 處理，不可讓 UI components 直接面對。
- Production fallback 絕不能靜默用 mock 替換失敗的 API 內容；改顯示受控 degraded/error state。

## Common API Pitfalls

- 使用 `_embed` + `_fields` 時，保留 `_embedded` 和 `_links` 否則 featured media/taxonomy 消失。
- 不要在沒有 pagination 的情況下 fetch 大型 archive；WordPress 預設 `per_page` 有上限。
- 讀 pagination headers：`X-WP-Total`、`X-WP-TotalPages`；不要從當前 response 長度推算總頁數。
- 確認 custom post type 的 `show_in_rest` 和 `rest_base` 設定，再建立對應 route。
- `rendered` 欄位是 HTML；card excerpt/meta description 要 strip HTML，不可直接用原始值。
- 列表／archive 優先 `GET /route/{path}` 或 `/collection`；勿預設改打 `/wp/v2/posts`。
- 簡單 post type 列表可用 `/content/{post_type}`；複雜條件才用 `POST /collection`，且只傳 OpenAPI 允許的 safe subset。
