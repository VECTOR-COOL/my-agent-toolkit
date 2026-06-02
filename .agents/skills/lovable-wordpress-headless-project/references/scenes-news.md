# Scene: News And Articles

Use this when building or changing news listing, article detail, category, tag, archive, or related-post UI.

## Routes

Common route patterns:

```text
/news
/news/$slug
/news/category/$slug
/news/tag/$slug
```

Match the active project's route naming before adding new routes.

## Data

Use WordPress posts unless the CMS has an agreed custom post type.

```text
GET /posts?_embed&per_page={n}&page={page}
GET /posts?slug={slug}&_embed
GET /posts?categories={id}&_embed
GET /posts?tags={id}&_embed
GET /categories?slug={slug}
GET /tags?slug={slug}
```

Use pagination headers:

```text
X-WP-Total
X-WP-TotalPages
```

## Field Mapping

| UI need | WordPress REST field |
| --- | --- |
| title | `post.title.rendered` |
| slug | `post.slug` |
| date | `post.date` or `post.modified` |
| excerpt | stripped `post.excerpt.rendered` |
| body HTML | `post.content.rendered` |
| feature image | `post._embedded["wp:featuredmedia"][0].source_url` |
| image alt | `post._embedded["wp:featuredmedia"][0].alt_text` |
| categories | `post._embedded["wp:term"][0]` |
| tags | `post._embedded["wp:term"][1]` |

## SEO

Article detail pages should use:

- CMS/Yoast title and description when present
- canonical `${VITE_SITE_URL}/news/{slug}` or the active route pattern
- `og:type=article`
- published/modified dates when metadata helpers support them
- absolute featured image URL for `og:image`

## Forbidden Shortcuts

- Do not use a plain string title model unless it is explicitly a view model created by the service layer.
- Do not fetch article data inside the component only.
- Do not assume category/tag index positions unless using `_embed` and the service layer has guarded the shape.
