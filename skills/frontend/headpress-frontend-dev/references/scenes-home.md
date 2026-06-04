# Scene: Homepage — HeadPress Frontend Dev

Use this when building or changing the site homepage or homepage sections.

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Data

Homepage data 透過 `/headless/v1/` 組裝。查 `openapi.json` 確認 `/headless/v1/site` 與 `/headless/v1/collection` 的 response schema。

常見 section 資料來源：

```text
GET /headless/v1/site                                      → site 設定、navigation、全域 meta
GET /headless/v1/collection?type=post&per_page=3           → 最新文章/消息
GET /headless/v1/collection?type={cpt}&per_page=6          → 特色案例、產品或其他 CPT
GET /headless/v1/taxonomies                                → 分類導覽
```

Do not create permanent homepage-only fake data shapes. If the UI needs configurable homepage blocks, document the required ACF/custom field or Composition API endpoint instead.

## SEO

- H1 should identify the site/product clearly.
- `head()` should use site defaults from `/headless/v1/site` or CMS homepage page SEO fields.
- Homepage canonical must be `${VITE_SITE_URL}/`（例如 `https://example.com/`）.
- Important homepage copy must be visible in SSR HTML; do not rely on client-only effects.

## UI States

Handle:

- no latest posts / empty collection
- missing featured image（use site brand fallback）
- API timeout/error（show controlled error state, keep app shell）
- partial CMS data while retaining layout integrity

## Forbidden Shortcuts

- Do not client-fetch all homepage content after first paint; use route loader + headlessClient.
- Do not hardcode production content as if it came from CMS.
- Do not change CMS field expectations to match a card layout.
- Confirm any field used exists in `openapi.json` before building against it.
