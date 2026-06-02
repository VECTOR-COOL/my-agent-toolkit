# Lovable SSR SEO Deployment

## Lovable Platform Rules

- Custom-domain binding happens in Lovable, not in repository code.
- Publish happens through Lovable. Do not replace it with an external deployment pipeline unless the user explicitly asks for a separate hosting strategy.
- New Lovable apps created from May 13, 2026 use TanStack Start SSR according to Lovable SEO documentation, except on Enterprise plans. Older React + Vite projects use Lovable's deployed public URL on-request pre-rendering for verified crawlers.
- For this project, preserve TanStack Start SSR compatibility and avoid reverting to SPA routing.

## SEO Requirements

Every public route should have:

- SSR-visible primary content
- one clear H1
- semantic sectioning
- useful image alt text
- route-level title and description
- canonical URL using `VITE_SITE_URL`
- Open Graph and Twitter metadata
- absolute `og:image`

Dynamic CMS routes should load content before metadata is produced:

```text
route loader fetches CMS data
  -> head({ loaderData }) uses CMS title/excerpt/SEO fields
  -> component renders SSR-visible content
```

## CMS SEO Field Priority

1. `yoast_head_json` if present
2. WordPress `title.rendered`
3. stripped `excerpt.rendered`
4. embedded featured media
5. site defaults from `VITE_SITE_URL`

## Sitemap And Robots

- Coordinate sitemap and `robots.txt` changes with Lovable Publish and SEO review.
- Use `VITE_SITE_URL` as the production host.
- Include CMS-backed dynamic routes only after the API/source is ready enough to avoid publishing broken URLs.
- Do not set production `robots.txt` to block all crawlers unless explicitly requested.

## Platform Pitfalls

- A custom domain can be configured before publishing, but it will not serve content until the Lovable project is published.
- After publishing publicly, rerun the SEO review for live checks. After connecting a custom domain, rerun it again for the new host.
- Older React + Vite Lovable apps do not become full TanStack Start SSR projects automatically; do not promise an in-place stack migration unless the codebase actually uses TanStack Start.
- Third-party scanners may not see the same output as verified crawlers for older SPA projects that rely on Lovable pre-rendering.

## Handoff Checklist

After SEO/deployment-related code work, report:

- whether Lovable Sync and Publish are needed
- whether the SEO & AI search scan should be rerun
- whether Google Search Console/sitemap submission needs follow-up
- whether `VITE_SITE_URL` or `VITE_WP_API_URL` must be checked in Lovable env settings
