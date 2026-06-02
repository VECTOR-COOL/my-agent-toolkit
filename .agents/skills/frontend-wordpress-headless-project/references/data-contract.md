# WordPress REST Data Contract

使用 `.agents/skills/wordpress-rest-api-development` 取得詳細 WordPress REST schemas、TypeScript examples、mock templates、service-layer examples 與 validation scripts。

## API Base

```text
PROJECT_WP_API_URL
```

## Standard Endpoints

```text
GET /posts?_embed
GET /posts?slug={slug}&_embed
GET /pages?_embed
GET /pages?slug={slug}&_embed
GET /categories
GET /categories?slug={slug}
GET /tags
GET /tags?slug={slug}
GET /media/{id}
```

Custom post types must use the `rest_base` registered in WordPress. Do not guess the frontend route from the post type name without checking the API.

## Required Shape Discipline

Keep mock and API data aligned with WordPress REST conventions:

- `title.rendered`, not plain `title`
- `content.rendered`, not plain `content`
- `excerpt.rendered`, not plain `excerpt`
- `featured_media` as media ID
- `_embedded["wp:featuredmedia"][0].source_url` for embedded feature image
- `_embedded["wp:term"]` for taxonomy data when using `_embed`
- `yoast_head_json` when Yoast SEO REST fields are available

## Service Boundary

Use this shape:

```text
routes loader/createServerFn
  -> services or wp-client.server
  -> WordPress REST API or mock fallback
  -> normalized view model only when the UI truly needs one
  -> components
```

Components must not:

- call `fetch("https://cms.example.com/...")` directly from UI components
- import mock fixtures directly
- assume backend fields that are not in WordPress REST response or an agreed custom endpoint

## Schema Change Protocol

When UI needs data that does not exist in the REST response:

1. Identify the missing field and the UI scenario.
2. Decide whether it belongs in WordPress core fields, ACF/custom fields, taxonomy, media metadata, or SEO plugin fields.
3. Document the expected REST path and type.
4. Do not permanently fake it in frontend data.

## Production Fallback

- Development may fallback to mock data for UI continuity.
- Production must not show fake mock content after API failure.
- Production should render a controlled empty/error state that does not break layout or SEO basics.

## Error Contract

- Fetcher must capture HTTP status, WordPress REST error body, timeout, network failure, invalid JSON, CORS/auth failures, rate limit, and server/maintenance errors.
- Service layer must normalize failures into typed states such as `error`, `notFound`, `unauthorized`, `forbidden`, `rateLimited`, `timeout`, or `unavailable`.
- Dynamic slug routes must return framework-level 404/not-found when the API returns zero matching published items.
- Missing `_embedded`, missing media, empty ACF fields, `null` rendered fields, and unpublished/private content must be handled in mapper or service code before data reaches UI components.
- Production fallback must never silently replace failed API content with mock content; show a controlled degraded/error state instead.

## Common API Pitfalls

- If using `_embed` with `_fields`, keep `_embedded` and `_links` in the field list or embedded media/taxonomies may disappear.
- Do not fetch large archives without pagination. WordPress collection endpoints default to limited pages and `per_page` is capped by WordPress.
- Read pagination headers such as `X-WP-Total` and `X-WP-TotalPages`; do not infer total pages from the current response length.
- Confirm custom post type `show_in_rest` and `rest_base` before building routes.
- Treat `rendered` fields as HTML. Sanitize or render intentionally, and strip HTML for card excerpts/meta descriptions.
