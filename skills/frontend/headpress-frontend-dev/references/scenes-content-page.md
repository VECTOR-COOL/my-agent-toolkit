# Scene: CMS Content Pages — HeadPress Frontend Dev

Use this when building or changing static CMS-backed pages such as About, Services, Contact, FAQ, policy pages, or landing pages.

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Data

**優先** 透過 `/route/{path}` 取得（查 `openapi.json` 確認 response schema）：

```text
GET /route/about
GET /route/services
GET /route/contact
```

若此頁其實是 WordPress post 或 Custom Post Type detail，也一樣用 `/route/{path}`，讓 HeadPress 回傳 `route.template`、`route.view`、`entity` 與 `seo`：

```text
GET /route/{post-slug}                 # 一般 post detail，依實際 frontend path
GET /route/{post_type}/{post-slug}     # CPT detail，例如 /route/project/demo-case
GET /route?path=/{post_type}/{post-slug}
```

讀取回應時以 `route.template` 判斷 template，例如 `single_post`、`single_project`、`page_default`；以 `entity.type` 判斷資料型別，例如 `post`、`page`、`project`。

If a page requires structured sections that WordPress core pages cannot represent, document the required ACF/custom field or HeadPress endpoint contract before baking a frontend-only structure into the app. Short-term 才在 service layer 使用 `/wp/v2/pages`.

## Field Mapping

欄位對應（以 `openapi.json` 的 `/route/{path}` response 為準）：

| UI need | Composition API / WordPress REST field |
| --- | --- |
| 頁面標題 | `entity.title.rendered` |
| 頁面內容 | `entity.content.rendered` |
| 摘要/簡介 | `entity.excerpt.rendered`（若可用） |
| slug | `entity.slug` |
| 特色圖 URL | `entity._embedded["wp:featuredmedia"][0].source_url` |
| SEO meta | 頂層 `seo` 或 site fallback from `/site` |

Pages do not have normal post `categories` or `tags` unless the backend intentionally registers taxonomies for pages.

## SEO

- Use 頂層 `seo` first.
- Fallback to `entity.title.rendered` / stripped `entity.excerpt.rendered`.
- Canonical should match the actual frontend route（例如 `https://example.com/about`）, not the WordPress CMS URL.
- For contact/location pages, add structured data only if the business data is confirmed.

## Forbidden Shortcuts

- Do not infer page taxonomy support without checking CMS registration.
- Do not copy WordPress admin URLs into frontend canonical links.
- Do not store important CMS content only in frontend constants.
- Do not use `/wp/v2/pages` when `/route/{path}` is available.
- Confirm any field used exists in `openapi.json` before building against it.
