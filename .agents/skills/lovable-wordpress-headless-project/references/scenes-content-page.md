# Scene: CMS Content Pages

Use this when building or changing static CMS-backed pages such as About, Services, Contact, FAQ, policy pages, or landing pages represented by WordPress pages.

## Data

Prefer WordPress pages for stable content pages:

```text
GET /pages?slug={slug}&_embed
GET /pages?_embed
```

If a page requires structured sections that WordPress core pages cannot represent, document the required ACF/custom field or custom endpoint contract before baking a frontend-only structure into the app.

## Field Mapping

| UI need | WordPress REST field |
| --- | --- |
| title | `page.title.rendered` |
| body | `page.content.rendered` |
| excerpt/summary | `page.excerpt.rendered` when available |
| slug | `page.slug` |
| parent | `page.parent` |
| order | `page.menu_order` |
| feature image | `page._embedded["wp:featuredmedia"][0].source_url` |

Pages do not have normal post `categories` or `tags` unless the backend intentionally registers taxonomies for pages.

## SEO

- Use page SEO plugin fields first.
- Fallback to page title/body excerpt.
- Canonical should match the actual frontend route, not necessarily the WordPress CMS URL.
- For contact/location pages, add structured data only if the business data is confirmed.

## Forbidden Shortcuts

- Do not infer page taxonomy support without checking CMS registration.
- Do not copy WordPress admin URLs into frontend canonical links.
- Do not store important CMS content only in frontend constants.
