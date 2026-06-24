---
description: 從零開始建立 HeadPress 前端應用的標準流程與核心指引。
---
# Getting Started: 從零建立 HeadPress 前端

本章節指引 AI Agent 使用 HeadPress Composition API 建立前端網站。請先理解：後端是 **WordPress Headless CMS**，HeadPress 是啟用在 WordPress 上的父主題，提供 public read-only Composition API。前端可以使用 WordPress 的內容邏輯，但資料入口預設是 `/headpress/api/v1`，不是 component 直接打 `/wp/v2`。

> 所有網域範例使用 `example.com`；實際使用時替換為部署的真實網域。

---

## 0. 先確認專案邊界

在開始寫前端前，先回答四個問題：

| 問題 | 判斷方式 | 影響 |
| --- | --- | --- |
| Public site URL 是什麼？ | `VITE_SITE_URL` 或部署平台設定 | canonical、OG URL、sitemap URL |
| CMS URL 是什麼？ | `VITE_WP_API_URL` 的 host | API base、CORS、image domain allowlist |
| 前端平台是什麼？ | Lovable / v0 / Replit / Next / Vite / TanStack | SSR/SSG/pre-render 能力與 route loader 寫法 |
| 內容模型有哪些？ | `GET /content-types`、WordPress 後台、OpenAPI | route、列表、CPT、taxonomy UI |

前端只負責 UI、route composition、metadata 輸出與部署平台行為；WordPress owns content、media、menus、taxonomy、SEO source data 與 permalink。

---

## 1. Discover API Contract

初始化時先讀 runtime contract：

```text
GET https://example.com/headpress/api/v1/manifest
GET https://example.com/headpress/api/v1/openapi.json
```

在 repo 內做契約審查或離線開發時，對照：

```text
themes/headpress/docs/prd/openapi.json
```

`/manifest` 用於理解 AI-builder recipes、route kinds、frontend mapping 與 recommended flow；`/openapi.json` 是 endpoint、parameters、response schema 的機器可讀規格。Agent 不得使用 openapi 未定義的 endpoint 或欄位。

---

## 2. 設定 Environment 與 Client

前端公開 env 只放可暴露的 URL：

```bash
VITE_SITE_URL=https://example.com
VITE_WP_API_URL=https://cms.example.com/headpress/api/v1
VITE_DATA_SOURCE=mock|api
```

若框架不是 Vite，可以在 config parser 中對應到相同語意；server-only secrets 不得使用 `VITE_` / `NEXT_PUBLIC_` 等 browser-exposed prefix。

建立 service layer：

```text
src/services/headpressClient.ts  # 主 client，base = /headpress/api/v1
src/services/wpClient.ts         # 備援 client，僅 service layer 可用
src/mappers/*                    # API payload -> normalized view model
src/types/*                      # OpenAPI response types + view models
```

UI component 不直接 `fetch()` CMS，也不直接 import mock fixture。

---

## 3. 建立 App Shell

App Shell 包含 Header、Footer、全站 SEO defaults、社群連結、全域導覽與共用 layout。

```text
GET /site
GET /menus
GET /menus/{slug}
GET /theme
GET /assets
GET /languages
```

最小流程：

1. 用 `GET /site` 取得 site identity、menus、social_links、SEO defaults、meta。
2. 用 mapper 建立 `SiteShellModel`，包含 logo、siteName、primaryNav、footerNav、socialLinks、defaultSeo。
3. 導覽列必須支援 WordPress menu hierarchy；至少兩層，必要時三層。
4. 若需要 theme design tokens，讀 `GET /theme`，不要猜測 CSS 變數或 theme.json shape。

---

## 4. 建立 Route Loader

公開頁面以 route resolver 為中心，因為它理解 WordPress permalink、front page、page_for_posts、single post、CPT、taxonomy archive、redirect 與 404。

```text
# 首頁
GET /route?include=all

# 一般 route，AI Builder / SDK 優先
GET /route?path=/about&include=all
GET /route?path=/blog/post-slug&include=all
GET /route?path=/project/demo-case&include=all

# 手寫前端或人工測試也可用
GET /route?path=/about
GET /route?path=/blog/post-slug
```

Route loader 必須處理：

| 回應狀態 | 前端動作 |
| --- | --- |
| `route.kind === "redirect"` 或 HTTP 301 | 執行 framework-level redirect |
| `route.kind === "not-found"` 或 HTTP 404 | 回 framework-level 404，不渲染空白成功頁 |
| `route.template` 存在 | 優先映射 template component |
| `route.template` 不存在 | fallback 到 `route.view` |
| API timeout / 500 | 顯示受控 error state 或回 503，不靜默替換 production mock |

---

## 5. 建立 Template Mapping

建議 template mapping：

| WordPress / HeadPress route | 前端 template |
| --- | --- |
| `front-page` | `HomePage` |
| `page` | `PageTemplate` |
| `single` / `single_post` | `SinglePostTemplate` |
| `single_{post_type}` | `SingleCptTemplate` 或專屬 CPT template |
| `archive` / `taxonomy-archive` | `ArchiveTemplate` |
| `search` | `SearchTemplate` |
| `not-found` | `NotFoundTemplate` |

內容解析優先順序：

```text
data.sections -> entity.blocks -> entity.content.rendered
```

若必須渲染 WordPress HTML，先確認 sanitizer、信任邊界與樣式隔離；card 摘要或 meta description 需要 strip HTML。

---

## 6. 建立列表、搜尋與 taxonomy 頁

列表與 archive 使用 collection 類 endpoint；不要在 component 直接使用 `/wp/v2/posts`。

```text
GET /collection?type=post&page=1&per_page=10
GET /content/post?page=1&per_page=10
GET /collection?type=project&taxonomy=project_category&term=featured
GET /search?q={query}&page=1&per_page=10
GET /taxonomies
GET /taxonomy/category
GET /taxonomy/category/news
```

選擇規則：

- 一般列表或 archive card：`GET /collection?type={post_type}`。
- 直覺 path-style 列表：`GET /content/{post_type}`。
- 複雜 safe WP_Query-shaped 條件：`POST /collection`，body 必須符合 openapi `QueryRequest`。
- taxonomy 探索或篩選器：`GET /taxonomies` 與 `GET /taxonomy/{taxonomy}`。

---

## 7. WordPress 單筆資料選擇

公開頁面 detail 預設用 route resolver，因為它提供 SEO、breadcrumb、redirect 與 404 context：

```text
GET /route?path=/blog/post-slug&include=all
GET /route?path=/project/demo-case&include=all
```

只有在不需要頁面 context 時，才使用單筆 content endpoint：

```text
GET /content/{post_type}/{identifier}
GET /content-object/{id}
```

注意：

- `identifier` 可是 ID 或 slug，但 slug 只在已知 post type 時才安全。
- WordPress slug 不保證跨 post type 唯一；未知 content route 一律用 `/route?path=`。
- 兩個單筆 endpoint 永遠回單一 object 或 404，不回 `items[]`。

---

## 8. SEO、Sitemap、Robots

公開頁面的 metadata 應在 SSR/SSG/pre-render 階段建立：

```text
data.seo.title
data.seo.description
data.seo.canonical
data.seo.robots
data.seo.resolved_og_image
data.schema
```

補充資料：

```text
GET /sitemap
GET /robots
GET /redirects
```

CMS 提供 source data；正式 `sitemap.xml`、`robots.txt` 與 `<head>` 輸出由前端平台負責。canonical 必須使用 public site URL，不可使用 CMS URL。

---

## 9. Mock-to-API 遷移

開發階段可以先使用 mock，但 mock shape 必須貼近 `/headpress/api/v1` response：

1. mock fixture 用 OpenAPI response shape，不使用方便 UI 的臨時欄位。
2. mapper 將 HeadPress / WordPress-shaped payload 轉成 normalized view model。
3. `VITE_DATA_SOURCE=mock|api` 僅切換 service 來源，不改 component props。
4. Production API 失敗不得靜默 fallback 到 mock content。

---

## 10. 最小驗收清單

- [ ] `/manifest` 與 `/openapi.json` 可讀，且 client base URL 正確。
- [ ] `/site` 可渲染 header/footer，選單階層與 active/ancestor state 正常。
- [ ] `/route?include=all` 可渲染首頁。
- [ ] `/route?path=/some-page&include=all` 可渲染一般 page。
- [ ] single post/CPT、archive/list、search、taxonomy 頁至少各測一條。
- [ ] 404 與 redirect 使用 framework-level behavior。
- [ ] SEO metadata、canonical、OG image、JSON-LD 在 server/static HTML 可見。
- [ ] 缺圖、空列表、API error、timeout、CORS 失敗都有受控 UI。
- [ ] 沒有 component 直接呼叫 CMS URL 或 `/wp/v2`。
