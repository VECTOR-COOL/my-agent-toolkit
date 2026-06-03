---
name: wordpress-rest-api-development
version: "1.0.0"
description: Frontend + WordPress Headless CMS REST API 整合開發 Skill。Use when a Lovable, v0, Replit, Cursor, or React/TypeScript frontend needs WordPress REST API schemas, posts/pages/categories/tags/media/search/custom post type/error response shapes, Yoast SEO fields, ACF/custom fields exposed through REST, TypeScript WP types, realistic WordPress-shaped mock fixtures, service-layer mappers, mock-to-api switching, route loader/server function data fetching, pagination headers, auth/CORS/server proxy guidance, or validation scripts for WordPress API and fixture shape.
---

# WordPress REST API Development

[![version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

本 skill 是 WordPress REST API 資料契約的 canonical reference。使用它來讓 React/TypeScript 前端在開發期用 mock 穩定 UI，正式串接時只切換資料來源與 service layer，不重寫 routes/components。

若任務同時涉及前端專案治理、SSR/SEO/custom domain、AI builder/Cursor/WordPress 分工，搭配 `.agents/skills/frontend-wordpress-headless-project`。若任務是通用前端專案規劃、AI builder prompt 或非 WordPress 專案規劃，搭配 `.agents/skills/frontend-development`。

## 載入順序

採用 progressive disclosure，不要一次載入所有 examples/reference。

1. 先判斷任務是 schema、mock、service layer、auth、architecture、live API test 或 project audit。
2. 只讀下表對應檔案。
3. 若要檢查 bundled schemas，執行 `node scripts/validate-skill-schemas.mjs`。
4. 若要檢查既有 Lovable + WordPress 專案，執行 `node scripts/audit-lovable-wp-project.mjs --root <project-root>`。
5. 若 API 細節或前端平台/framework 行為會影響決策，重新查官方文件。

## Reference Index

| 需求 | 載入 |
| --- | --- |
| WordPress REST 核心概念、端點、全域參數、pagination、embedding | `references/wordpress-rest-api-handbook.md` |
| Lovable TanStack Start SSR 架構、route loader、server functions、env | `references/lovable-tanstack-start-architecture.md` |
| Schema 速查與各 schema 檔位置 | `references/wp-api-schemas.md` |
| 認證、Application Password、server-only secrets、CORS/proxy | `references/wp-rest-authentication.md` |
| Theme/common WordPress 資料需求 | `references/wp-theme-development.md` |
| TypeScript 型別 | `examples/types-wordpress.ts` |
| WordPress-shaped mock fixtures | `examples/mock-data-templates.ts` |
| Service layer、mock/API switch、route loader usage | `examples/service-layer.ts` |
| 常用 fetch functions | `examples/fetch-various-data.example.ts` |
| 導覽列/menu fetch 與 tree mapper | `examples/fetch-navigation.example.ts`、`examples/navigation-service.example.ts` |
| Headless sitemap.xml 產生 | `examples/generate-sitemap.example.ts` |
| 依 schemas 抓取主要資料 | `examples/fetch-main-data-by-schemas.ts` |

## 核心規則

- Mock 與 API boundary 必須對齊 WordPress REST API shape，例如 `title.rendered`、`content.rendered`、`excerpt.rendered`、`_embedded`、`_links`。
- UI component 不直接 `fetch` WordPress，不直接 import mock fixtures，不直接讀 env 決定資料來源。
- Route loader/server function 透過 service layer 取得資料；service layer 負責 mock/API 切換、pagination、errors、fallback、mapper。
- Component 使用 normalized view model 或清楚定義的 loader data；若需要扁平化、重新命名、合併 ACF/custom fields，只能在 mapper/service 中做。
- 主要 SEO 內容必須 SSR-visible；不要把可索引內容放到 client-only `useEffect` 才載入。
- Production API 失敗時顯示受控 empty/error state，不可 fallback 到 mock 假資料；development 可在 `import.meta.env.DEV` fallback mock。
- Server-only secrets、Application Password、preview tokens 不可使用 `VITE_` prefix，也不可傳進 client bundle 或 serialized loader data。
- Yoast SEO 欄位是 optional plugin fields；存在時優先用 `yoast_head_json`，不存在時 fallback 到 WordPress title/excerpt/media/site defaults。

## 資料來源設定

Canonical data source values:

```bash
VITE_DATA_SOURCE=mock
VITE_WP_API_URL=https://cms.example.com/wp-json/wp/v2
VITE_SITE_URL=https://example.com
```

- 新程式使用 `VITE_DATA_SOURCE=mock|api`。
- 既有程式若已使用 `wordpress`、`wp` 或其他值，先沿用並在 config/service layer 集中正規化；不要在 component 內分支。
- `VITE_WP_API_URL` 是公開 base URL 才能使用 `VITE_`。任何 secret 改用 server-only env，例如 `WP_APPLICATION_PASSWORD`。
- `VITE_API_BASE_URL` 只作既有程式相容別名；新程式優先 `VITE_WP_API_URL`。

## WordPress Shape 速查

常用 core entities:

- Post: `id`、`slug`、`date`、`modified`、`status`、`type`、`link`、`title.rendered`、`content.rendered`、`excerpt.rendered`、`author`、`featured_media`、`categories`、`tags`、`_embedded`。
- Page: 類似 Post，但有 `parent`、`menu_order`，通常沒有 `categories`、`tags`、`format`、`sticky`。
- Category/Tag: `id`、`count`、`description`、`link`、`name`、`slug`、`taxonomy`；Category 有 `parent`，Tag 通常沒有。
- Media: `id`、`source_url`、`alt_text`、`caption.rendered`、`media_details.sizes`。
- Search: `title` 是 string，不是 `{ rendered }`；詳細差異見 `references/schemas/search.json5`。
- Navigation menu: classic theme 通常用 `/wp/v2/menu-locations` 找 location，再用 `/wp/v2/menu-items?menus=<id>` 取得 items 並用 `parent` + `menu_order` 組 tree；block theme 可參考 `/wp/v2/navigation`。
- Error response: 非 2xx 通常是 `{ code, message, data: { status } }`，詳細差異見 `references/schemas/error-response.json5`；service layer 必須回傳/丟出此錯誤，不可靜默轉成空資料。

常用 access paths:

```ts
post.title.rendered
post.content.rendered
post.excerpt.rendered
post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
post._embedded?.["wp:term"]?.[0] // categories
post._embedded?.["wp:term"]?.[1] // tags
post.yoast_head_json?.title
error.code
error.message
error.data?.status
```

## Service Layer Contract

```text
route loader / server function
  -> feature service or shared WordPress service
  -> mock provider or WordPress API client
  -> mapper/validator
  -> component props / route loader data
```

保留 mock fixtures 作 UI regression 與 backend 未就緒時的開發資料，但 mock 不能被 production error path 顯示成正式內容。

切換資料來源時，通常只改：

- env：`VITE_DATA_SOURCE`、`VITE_WP_API_URL`、`VITE_SITE_URL`
- `src/config/*`
- `src/services/*` 或 `src/lib/api/*`
- mapper/validator

不應為了 API 切換重寫 `src/routes/*`、`src/components/*` 或全域樣式。

## 常見任務

### 建立 WordPress-backed 列表頁

1. 用 `references/wp-api-schemas.md` 確認 raw shape。
2. 用 `examples/mock-data-templates.ts` 建立 realistic mock。
3. 用 service layer 實作 `get_posts` / `get_pages` / custom endpoint。
4. 在 route loader 取得資料與 pagination。
5. Component 只 render loader data，並處理 loading/empty/error/缺圖/長標題。
6. SEO metadata 使用 CMS 欄位與 site fallback。

### 建立 detail 或 dynamic slug route

1. Fetch by slug，處理零筆、多筆、非 publish、API error。
2. 找不到內容時回傳 route-level 404，不要渲染空頁。
3. Mapper 正規化 title/content/excerpt/featured image/SEO fields。
4. `head({ loaderData })` 使用 loader data 產生 metadata。

### 串接正式 API

1. 保留 mock，切 `VITE_DATA_SOURCE=api`。
2. 確認 API base URL、CORS、auth、pagination headers、`?_embed`。
3. 測試正常資料、空資料、缺圖、欄位缺失、API timeout。
4. 確認 production build 不依賴本機 mock-only path。

### 處理 auth、preview 或 private content

1. 讀 `references/wp-rest-authentication.md`。
2. 使用 server function/server proxy 持有 secret。
3. Preview/draft 與 public data/cache 分開。
4. Preview 頁不要被 indexing，且錯誤不可 fallback 到錯誤公開內容。

## Scripts

在 skill 目錄內執行：

```bash
node scripts/validate-skill-schemas.mjs
node scripts/run-wordpress-rest-api-tests.mjs
WP_PROJECT_ROOT=D:/path/to/project node scripts/run-wordpress-rest-api-tests.mjs
WP_RESPONSE_TYPE=post WP_RESPONSE_FILE=fixtures/posts.json node scripts/run-wordpress-rest-api-tests.mjs
WP_LIVE_API_TEST=1 VITE_WP_API_URL=https://cms.example.com/wp-json/wp/v2 node scripts/run-wordpress-rest-api-tests.mjs
node examples/fetch-main-data-by-schemas.ts --per-page 1
node --experimental-strip-types examples/fetch-navigation.example.ts
```

如果 target project 已有自己的 package scripts，優先用專案既有 scripts。

## Review Checklist

- Frontmatter/project prompt 是否讓 WordPress backend 使用 WordPress REST shape，而不是任意 frontend-friendly object。
- Components/routes 是否直接 import mock、直接 fetch WordPress、直接讀 env。
- Mock/API shape 是否分裂。
- Production API error 是否顯示 mock 假內容。
- Production API error 是否被轉成 `[]`、`null` 或空頁；必須丟出/回傳包含 WordPress error body 的錯誤。
- Pagination headers `X-WP-Total`、`X-WP-TotalPages` 是否處理。
- Dynamic slug route 是否正確 404。
- Yoast/SEO fallback 是否可在 SSR metadata 中產生。
- WordPress HTML 是否有 sanitize/trust boundary。
- Secrets 是否誤放在 `VITE_` env。

完成後回報使用的 data source phase、讀取/修改的 schema 或 service 檔、驗證結果，以及仍需 WordPress 後台或 Lovable env 設定的項目。
