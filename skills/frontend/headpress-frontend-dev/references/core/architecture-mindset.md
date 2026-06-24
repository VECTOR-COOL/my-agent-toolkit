# 架構速覽與心智模型

## 架構速覽

| 層級              | 範例網域                       | 技術                               | 職責                                                        |
| ------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| 前端              | `example.com`                  | Lovable / v0 / Replit / 自架 React | UI、路由、SSR/SSG/pre-render、SEO HTML/meta、sitemap/robots |
| 後端（HeadPress） | `example.com`（CMS 所在 host） | WordPress + HeadPress Theme        | 內容模型、媒體、REST 欄位、Composition API                  |

**前端主要資料來源**：`https://example.com/headpress/api/v1/`（HeadPress Composition API public base；WordPress REST namespace 仍是 `headpress/api/v1`）。

## WordPress Headless 心智模型

Agent 必須先用 WordPress 的資料模型理解需求，再選擇 HeadPress endpoint：

| 前端需求 | WordPress 邏輯 | 預設 HeadPress endpoint |
| --- | --- | --- |
| 首頁、關於頁、任意公開 URL | WP permalink / front page / page / single / archive resolver | `GET /route?include=all` 或 `GET /route?path={current_path}&include=all` |
| 全站 header、footer、站名、Logo、社群連結 | Site settings、nav menus、theme support、SEO defaults | `GET /site`，必要時 `GET /menus`、`GET /menus/{slug}` |
| 文章列表、最新消息、案例列表 | `post` 或 CPT archive + pagination | `GET /collection?type={post_type}` 或 `GET /content/{post_type}` |
| 文章、Page、CPT 單篇 detail | WordPress object + permalink + SEO + media + breadcrumb | 優先 `GET /route?path={current_path}&include=all` |
| 已知 post type 的單一公開物件 | publish object by ID/slug，不需要 SEO/redirect context | `GET /content/{post_type}/{identifier}` |
| 只知道 WordPress ID | publish object resolver，不知道 post type | `GET /content-object/{id}` |
| 分類、標籤、CPT taxonomy | taxonomy / term / archive | `GET /taxonomies`、`GET /taxonomy/{taxonomy}`、`GET /collection?taxonomy={taxonomy}&term={slug}` |
| 搜尋 | WordPress search over public allowlisted content | `GET /search?q={query}` |
| sitemap、robots、redirect 來源資料 | WordPress public URLs 與站點規則來源 | `GET /sitemap`、`GET /robots`、`GET /redirects`，前端負責正式輸出 |

重要規則：
- WordPress slug **不是全站唯一**；不知道 post type 或實際 permalink 時，公開頁面一律先用 `/route?path=` 解析。
- `title.rendered`、`content.rendered`、`excerpt.rendered` 是 WordPress-shaped HTML 欄位；UI 需要純文字時只能在 mapper 轉換。
- `featured_media` 是媒體 ID，不是圖片 URL；圖片 URL 需讀 media payload 或 `_embedded` / HeadPress media 欄位。
- draft/private/preview/auth/session/cart/order/form write 不是 HeadPress public API 職責；需要私有或寫入流程時，改走 server-side proxy、WordPress 原生 REST 或外部服務，且不得暴露 secret。
