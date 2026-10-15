# Scene: Homepage

Use this when building or changing the project homepage or homepage sections.

## Data

The homepage may compose multiple CMS-backed sections. Keep each section behind a service call or typed loader result.

Common section sources:

- hero / intro: CMS page fields or agreed site settings endpoint
- latest news: `GET /posts?_embed&per_page=...`
- featured categories: `GET /categories`
- media: embedded featured media or `GET /media/{id}`

Do not create permanent homepage-only fake data shapes. If the UI needs configurable homepage blocks, document a CMS custom field or custom endpoint requirement.

## SEO

- H1 should identify the site/product clearly.
- `head()` should use site defaults or CMS page SEO fields.
- Homepage canonical should be `${VITE_SITE_URL}/`.
- Important homepage copy must be visible in SSR HTML.

## UI States

Handle:

- no latest posts
- missing featured image
- API timeout/error
- partial CMS data while retaining layout integrity

## Forbidden Shortcuts

- Do not client-fetch all homepage content after first paint.
- Do not hardcode production content as if it came from CMS.
- Do not change CMS field expectations to match a card layout.
