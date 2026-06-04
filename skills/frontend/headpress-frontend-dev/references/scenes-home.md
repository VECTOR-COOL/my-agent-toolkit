# Scene: Homepage — HeadPress Frontend Dev

Use this when building or changing the site homepage or homepage sections.

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Data

Homepage data **優先** 透過 `headpress/api/v1` 組裝。查 `openapi.json` 確認 `/site` 與 `/page` 的 response schema。

常見 section 資料來源：

```text
GET /site                         → site 設定、navigation、全域 meta
GET /page                         → 首頁 front page（完整 page payload）
GET /collection?type=post&per_page=3   → 最新文章/消息（若首頁 section 需要）
GET /taxonomies                   → 分類導覽
```

Do not create permanent homepage-only fake data shapes. If the UI needs configurable homepage blocks, document the required ACF/custom field or HeadPress endpoint instead of defaulting to `/wp/v2/`.

## SEO

- H1 should identify the site/product clearly.
- `head()` should use site defaults from `/site` or homepage `seo` from `/page`.
- Homepage canonical must be `${VITE_SITE_URL}/`（例如 `https://example.com/`）.
- Important homepage copy must be visible in SSR HTML; do not rely on client-only effects.

## UI States

Handle:

- no latest posts / empty collection
- missing featured image（use site brand fallback）
- API timeout/error（show controlled error state, keep app shell）
- partial CMS data while retaining layout integrity

## Forbidden Shortcuts

- Do not client-fetch all homepage content after first paint; use route loader + headpressClient.
- Do not hardcode production content as if it came from CMS.
- Do not change CMS field expectations to match a card layout.
- Do not use `/wp/v2/` when `/page` or `/collection` already covers the use case.
- Confirm any field used exists in `openapi.json` before building against it.
