# HeadPress Composition API

HeadPress API 是面向 AI Builder 與現代前端的 WordPress Headless Composition API。它不是 WordPress REST API 的替代品；它把 WordPress CMS、ACF、SEO、media、route resolving、archive context 與全站設定整理成前端可直接渲染的 page data。

## 定位

使用下列產品定位：

```text
WordPress Headless Composition API for AI Builders
```

目標使用者包含 Lovable、v0、Cursor、Replit、Next.js、Remix、Nuxt、React、Vue、Svelte 與其他現代前端。命名應 frontend-first，response 保持 WordPress-compatible entity structure，並提供 SEO-ready page data。

## 主力端點

新的主力端點：

```text
GET /site
GET /page
GET /page/{path}
```

舊端點只保留相容 alias，不再主推：

```text
GET /site-layout
GET /route?path=/about
```

文件標示：

```text
/site-layout is deprecated. Use /site instead.
/route is deprecated. Use /page/{path} instead.
```

## 端點列表

主流程端點：

```text
GET /page
GET /page/{path}
GET /site
GET /search
GET /sitemap
GET /manifest
GET /openapi.json
GET /health
```

進階補充端點：

```text
GET /collection
GET /taxonomies
GET /taxonomy/{taxonomy}
GET /media/{id}
```

`/page` 是 Frontend Page Data Endpoint，不是 WordPress `page` post type endpoint。它代表「請依照 frontend path 回傳渲染此頁所需的完整資料」。

## `/site`

`GET /site` 回傳全站共用資料，供 root layout、SSR server 與 AI Builder 初始化網站結構使用。應包含 site name、description、frontend URL、CMS URL、logo、menus、footer、social links、SEO defaults 與 global settings。

最小 shape：

```json
{
  "site": {
    "name": "UAVS",
    "description": "網站描述",
    "frontend_url": "https://uavs.tw",
    "cms_url": "https://cms.uavs.tw",
    "logo": {
      "id": 1,
      "url": "https://cms.uavs.tw/wp-content/uploads/logo.png",
      "alt": "UAVS"
    },
    "menus": {
      "primary": [],
      "footer": []
    },
    "seo_defaults": {
      "title": "UAVS",
      "description": "網站描述",
      "default_og_image": null
    }
  },
  "meta": {
    "api_version": "1.1.0",
    "generated_at": "2026-06-04T10:00:00"
  }
}
```

Cache header 建議：

```text
Cache-Control: public, max-age=1800, stale-while-revalidate=3600
```

## `/page`

`GET /page` 回首頁 front page。`GET /page/{path}` 支援多層 path，例如：

```text
GET /page/about
GET /page/about/team
GET /page/blog/my-post
GET /page/project/my-project
GET /page/category/news
GET /page/search?q=keyword
```

支援的 `route.kind`：

```text
front-page
page
single
post-type-archive
taxonomy-archive
search
not-found
redirect
```

預設標準結構：

```json
{
  "site": {},
  "route": {},
  "entity": {},
  "sections": [],
  "seo": {},
  "breadcrumb": [],
  "schema": {},
  "media": {},
  "archive": null,
  "collections": null,
  "meta": {}
}
```

MVP 可先回傳：

```json
{
  "site": {},
  "route": {},
  "entity": {},
  "seo": {},
  "media": {},
  "meta": {}
}
```

第二階段再補 `sections`、`breadcrumb`、`schema`、`archive` 與 `collections`。

## Include 參數

`/page` 預設可包含必要 `site` 資料，讓 AI Builder 只呼叫一次即可渲染整頁。進階前端可改用 `/site` 長快取，再用 `include` 精簡 `/page`。

可支援 include：

```text
site
route
entity
acf
sections
seo
breadcrumb
schema
media
archive
collections
meta
```

範例：

```text
GET /page/about?include=route,entity,seo,breadcrumb,schema,media
GET /page/category/news?include=route,archive,collections,seo,breadcrumb
GET /page/about?include=site,route,entity,seo,media
```

若指定 `acf`，資料仍放在 `entity.acf`，不要放在最外層 `acf`。

## ACF 與 Sections

ACF 原始欄位放在 `entity.acf`。HeadPress 整理過、前端友善的渲染區塊放在 `sections`。

```text
entity.acf = 原始 ACF 欄位，給開發者使用
sections = 整理後的前端渲染區塊，給 AI Builder 或前端直接使用
```

## SEO

SEO 不要藏在 `headless.seo`。`/page` response 直接使用頂層 `seo`。

```json
{
  "seo": {
    "title": "關於我們 - UAVS",
    "description": "頁面描述",
    "canonical": "https://uavs.tw/about",
    "robots": "index,follow",
    "og_title": "關於我們 - UAVS",
    "og_description": "頁面描述",
    "og_image": null,
    "resolved_og_image": "https://cms.uavs.tw/wp-content/uploads/default-og.jpg"
  }
}
```

`og_image` 可為 `null`；`resolved_og_image` 是前端最後應使用的 fallback 後 OG image。

## Archive 與 Collections

`archive` 說明「這是什麼列表頁」。`collections` 說明「這個列表頁有哪些 items 與 pagination」。

Post type archive:

```json
{
  "route": {
    "path": "/blog",
    "kind": "post-type-archive",
    "status": 200
  },
  "archive": {
    "post_type": "post"
  },
  "collections": {
    "items": [],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

Taxonomy archive:

```json
{
  "route": {
    "path": "/category/news",
    "kind": "taxonomy-archive",
    "status": 200
  },
  "archive": {
    "taxonomy": "category",
    "term": {
      "id": 3,
      "slug": "news",
      "name": "News"
    }
  },
  "collections": {
    "items": [],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

## Redirect 與 Not Found

Redirect response 使用 `route.kind = "redirect"`，`route.status = 301 | 302`，並提供 `route.location`。`entity` 為 `null`，`seo` 可為 `null`。

Not found response 使用 `route.kind = "not-found"`，`route.status = 404`。SEO 建議 `robots: "noindex,follow"`。

## WordPress REST 實作注意

`/page/{path}` 必須支援多層 path，不能只吃單一 slug。

```php
register_rest_route('headpress/api/v1', '/page(?:/(?P<path>.*))?', [
    'methods' => 'GET',
    'callback' => 'headpress_get_page',
    'permission_callback' => '__return_true',
]);
```

公開 read-only endpoint 可使用 `__return_true`，但不得暴露 private options、user emails、edit links、draft/private content 或 secrets。若 endpoint 會回傳非公開資料或執行寫入，必須改用 capability-based `permission_callback`。

Path normalization:

```php
function headpress_get_page($request) {
    $path = $request->get_param('path');
    $path = empty($path) ? '/' : '/' . trim($path, '/');

    return rest_ensure_response([
        'site' => [],
        'route' => [
            'path' => $path,
        ],
        'entity' => null,
        'sections' => [],
        'seo' => null,
        'breadcrumb' => [],
        'schema' => [],
        'media' => [],
        'archive' => null,
        'collections' => null,
        'meta' => [
            'api_version' => '1.1.0',
            'generated_at' => current_time('c'),
        ],
    ]);
}
```

PHP function names 使用 snake_case，例如 `headpress_get_page`、`headpress_get_site`、`headpress_resolve_page`、`headpress_get_page_data`。

## OpenAPI 同步

新增或修改 paths：

```text
/site
/page
/page/{path}
```

標記 deprecated：

```text
/route
/site-layout
```

更新 schemas：

```text
PageResponse
SiteResponse
RouteInfo
Entity
Seo
Media
Archive
Collections
Meta
Section
BreadcrumbItem
```

`/page` 描述建議：

```text
/page is the primary frontend page data endpoint.
It resolves a frontend path into render-ready WordPress content, SEO metadata, media, ACF fields, sections, archive context, collections, and site data.
```

## MVP 驗收

- `GET /site` 回傳全站共用資料。
- `GET /page` 回傳首頁資料。
- `GET /page/about` 解析一般頁面。
- `GET /page/blog/my-post` 解析 post single。
- `GET /page/project/my-project` 解析 custom post type single。
- `GET /page/blog` 解析 post type archive。
- `GET /page/category/news` 解析 taxonomy archive。
- `GET /page/search?q=keyword` 解析 search page。
- `GET /page/missing-page` 回傳 not-found。
- `GET /page/old-url` 回傳 redirect。
- `/page` 預設包含 `site`、`route`、`entity`、`seo`、`media`、`meta`。
- ACF 回傳於 `entity.acf`。
- `sections` 回傳前端友善區塊資料。
- `seo` 位於頂層。
- `og_image` 可為 `null`，`resolved_og_image` 可回傳 fallback 圖。
- `archive` 與 `collections` 分工清楚。
- OpenAPI 已更新 `/site`、`/page`、`/page/{path}`。
- 舊 `/route`、`/site-layout` 已標示 deprecated 或相容 alias。
