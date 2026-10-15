# Frontend SEO Deployment

## Platform Rules

- Identify the active platform before changing deployment, domain, or environment settings.
- Custom-domain binding may happen in Lovable, Vercel, Replit Deployments, Netlify, Cloudflare, or another host; do not assume repo code alone completes domain setup.
- Publish/deploy flow belongs to the active platform. Do not replace it with another pipeline unless the user explicitly asks for a hosting strategy change.
- Preserve the active rendering model: SSR, SSG, pre-render, ISR-like caching, or CSR. Improve SEO-critical content within the active stack unless the task is a migration.
- For platform-specific SEO/SSR behavior, verify official docs because defaults can change.

## SEO Requirements

Every public route should have:

- SEO-visible primary content through SSR, SSG, pre-render, or a verified platform crawler path
- one clear H1
- semantic sectioning
- useful image alt text
- route-level title and description
- canonical URL using site config/env
- Open Graph and Twitter metadata
- absolute `og:image`

Dynamic CMS routes should load content before metadata is produced:

```text
route/server data fetches CMS data
  -> metadata/head generation uses CMS title/excerpt/SEO fields
  -> component renders SEO-visible content
```

## HTTP Status And Error Pages

- Missing CMS content should produce a real 404/not-found response where the framework supports it.
- Removed content should use 410 when the product has a known removed-content state; otherwise use 404.
- Protected preview or account routes should distinguish 401 from 403.
- API outage, WordPress maintenance, timeout, or build-time fetch failure should render a controlled 500/503 state without leaking secrets.
- Error pages must keep canonical/robots behavior intentional; do not index temporary outage pages or empty client-rendered placeholders.

## CMS SEO Field Priority

1. `yoast_head_json` if present
2. WordPress `title.rendered`
3. stripped `excerpt.rendered`
4. embedded featured media
5. site defaults from site config/env

## Sitemap And Robots

- Coordinate sitemap and `robots.txt` changes with the active platform's publish/deploy flow and SEO review.
- Use the production site URL from config/env as the host.
- Include CMS-backed dynamic routes only after the API/source is ready enough to avoid publishing broken URLs.
- Do not set production `robots.txt` to block all crawlers unless explicitly requested.

## Platform Pitfalls

- Lovable: custom-domain binding and Publish may be platform-side operations; do not claim the site is live until Publish/domain state is verified.
- v0/Next.js exports: metadata, sitemap, robots, and image settings usually live in code, but deployment behavior still depends on the target host.
- Replit: deployment env vars and public URLs may differ from local dev; verify run/deploy configuration before diagnosing API or canonical issues.
- Older SPA/CSR projects do not become full SSR projects automatically; do not promise SEO parity without an actual rendering migration or verified pre-render support.
- Third-party scanners may not see the same output as verified crawlers when a platform provides crawler-specific pre-rendering.

## Handoff Checklist

After SEO/deployment-related code work, report:

- whether builder sync/export/import is needed
- whether platform publish/deploy is needed
- whether the SEO scan should be rerun
- whether Google Search Console/sitemap submission needs follow-up
- whether site URL, WordPress API URL, image domains, or auth/env settings must be checked in the platform
