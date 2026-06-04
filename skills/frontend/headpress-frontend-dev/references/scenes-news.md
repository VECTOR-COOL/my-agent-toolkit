# Scene: News And Articles — HeadPress Frontend Dev

Use this when building or changing news listing, article detail, category, tag, archive, or related-post UI.

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Routes

Common route patterns（以 active project 的 route naming 為準）：

```text
/news
/news/$slug
/news/category/$slug
/news/tag/$slug
```

## Data

**優先** `headpress/api/v1`（查 `openapi.json` 確認欄位與 response schema）：

```text
GET /page/blog                    → post type archive（若 route 如此設計）
GET /page/blog/{slug}             → 文章 detail
GET /page/category/{slug}         → 分類 archive
GET /collection?type=post&page={page}  → 列表（進階端點，若 openapi 有定義）
GET /taxonomy/category?slug={slug}     → 分類 meta（若 openapi 有定義）
```

Pagination（來自 `collections.pagination` 或 response headers，以 openapi 為準）：

```text
X-WP-Total
X-WP-TotalPages
```

僅當 HeadPress 無對應 archive/list 行為時，才在 service layer 使用 `/wp/v2/posts` 等 WP 原生 endpoint。

## Field Mapping

欄位對應（完整形狀以 `openapi.json` 的 `/page/{path}` 與 `/collection` response 為準）：

| UI need | Composition API / WordPress REST field |
| --- | --- |
| 標題 | `entity.title.rendered` |
| slug | `entity.slug` |
| 日期 | `entity.date` or `entity.modified` |
| 摘要 | stripped `entity.excerpt.rendered` |
| 內容 HTML | `entity.content.rendered` |
| 特色圖 URL | `entity._embedded["wp:featuredmedia"][0].source_url` |
| 特色圖 alt | `entity._embedded["wp:featuredmedia"][0].alt_text` |
| 分類 | `entity._embedded["wp:term"][0]` |
| 標籤 | `entity._embedded["wp:term"][1]` |

## SEO

Article detail pages should use:

- 頂層 `seo`（HeadPress `/page/{path}`）
- Fallback：`entity.title.rendered` 作為 `<title>`，stripped `entity.excerpt.rendered` 作為 `<meta description>`
- Canonical：`${VITE_SITE_URL}/news/{slug}` 或 active route pattern
- `og:type=article`
- Published/modified dates（若 metadata helper 支援）
- Absolute featured image URL 作為 `og:image`

## Forbidden Shortcuts

- Do not use a plain string title model unless it is explicitly a view model created by the service layer.
- Do not fetch article data inside the component only; use route loader + headpressClient.
- Do not assume category/tag index positions in `_embedded["wp:term"]` unless the service layer has guarded the shape.
- Do not default to `/wp/v2/posts` when `/page/{path}` or `/collection` covers the scenario.
- Confirm any endpoint used exists in `openapi.json` before building against it.
