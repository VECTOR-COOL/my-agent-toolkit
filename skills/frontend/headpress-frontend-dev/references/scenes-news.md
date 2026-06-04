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

透過 `/headless/v1/` 取得（查 `openapi.json` 確認欄位與 response schema）：

```text
GET /headless/v1/collection?type=post&page={page}    → 文章列表
GET /headless/v1/page?path=/news/{slug}             → 文章 detail
GET /headless/v1/taxonomy/category?slug={slug}       → 分類頁
GET /headless/v1/taxonomy/tag?slug={slug}            → 標籤頁
```

Pagination headers（fetcher 必須讀取）：

```text
X-WP-Total
X-WP-TotalPages
```

## Field Mapping

欄位對應（完整形狀以 `openapi.json` 的 `/headless/v1/collection` 與 `/headless/v1/page` response 為準）：

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

- `entity.seo`（若 HeadPress 輸出 Yoast/RankMath SEO 欄位）
- Fallback：`entity.title.rendered` 作為 `<title>`，stripped `entity.excerpt.rendered` 作為 `<meta description>`
- Canonical：`${VITE_SITE_URL}/news/{slug}` 或 active route pattern（例如 `https://example.com/news/my-post`）
- `og:type=article`
- Published/modified dates（若 metadata helper 支援）
- Absolute featured image URL 作為 `og:image`

## Forbidden Shortcuts

- Do not use a plain string title model unless it is explicitly a view model created by the service layer.
- Do not fetch article data inside the component only; use route loader + headlessClient.
- Do not assume category/tag index positions in `_embedded["wp:term"]` unless the service layer has guarded the shape.
- Confirm any endpoint used exists in `openapi.json` before building against it.
