# Scene: CMS Content Pages — HeadPress Frontend Dev

Use this when building or changing static CMS-backed pages such as About, Services, Contact, FAQ, policy pages, or landing pages.

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Data

透過 `/headless/v1/page` 取得（查 `openapi.json` 確認 response schema）：

```text
GET /headless/v1/page?path={frontendPath}

例如：
GET /headless/v1/page?path=/about
GET /headless/v1/page?path=/services
GET /headless/v1/page?path=/contact
```

If a page requires structured sections that WordPress core pages cannot represent, document the required ACF/custom field or Composition API endpoint contract before baking a frontend-only structure into the app.

## Field Mapping

欄位對應（以 `openapi.json` 的 `/headless/v1/page` response 為準）：

| UI need | Composition API / WordPress REST field |
| --- | --- |
| 頁面標題 | `entity.title.rendered` |
| 頁面內容 | `entity.content.rendered` |
| 摘要/簡介 | `entity.excerpt.rendered`（若可用） |
| slug | `entity.slug` |
| 特色圖 URL | `entity._embedded["wp:featuredmedia"][0].source_url` |
| SEO meta | `entity.seo`（若 HeadPress 輸出）or site fallback from `/headless/v1/site` |

Pages do not have normal post `categories` or `tags` unless the backend intentionally registers taxonomies for pages.

## SEO

- Use `entity.seo` SEO plugin fields first.
- Fallback to `entity.title.rendered` / stripped `entity.excerpt.rendered`.
- Canonical should match the actual frontend route（例如 `https://example.com/about`）, not the WordPress CMS URL（`example.com/wp-admin` 等後台路徑）.
- For contact/location pages, add structured data only if the business data is confirmed.

## Forbidden Shortcuts

- Do not infer page taxonomy support without checking CMS registration.
- Do not copy WordPress admin URLs into frontend canonical links.
- Do not store important CMS content only in frontend constants.
- Confirm any field used exists in `openapi.json` before building against it.
