# Project Contract

## Identity

| Item | Contract |
| --- | --- |
| Product | Active project's frontend |
| Public site | `PROJECT_SITE_URL`, for example `https://example.com` |
| CMS | `PROJECT_CMS_URL`, for example `https://cms.example.com` |
| REST API base | `PROJECT_WP_API_URL`, for example `https://cms.example.com/wp-json/wp/v2` |
| Frontend platform | Active repo/builder platform, such as Lovable, v0, Replit, Cursor-managed repo, or custom hosting |
| Rendering target | Preserve the project's active SSR, SSG, pre-render, or CSR mode; improve SEO-critical content only within that stack unless asked to migrate |
| Backend model | WordPress Headless CMS, RESTful JSON exchange |

## Source Of Truth

- WordPress owns content: titles, slugs, body, excerpts, media, categories, tags, custom post type records, and SEO plugin fields.
- Frontend owns presentation: layout, components, route composition, loading states, error states, and accessible markup.
- Platform tooling owns platform operations: visual editing, preview URLs, publish/deploy controls, custom-domain binding, platform env settings, and platform SEO review tooling when available.
- Git owns durable code and project documentation.

## Environment Names

Use these names unless the active project repo already defines compatible equivalents:

```bash
VITE_SITE_URL=PROJECT_SITE_URL
VITE_WP_API_URL=PROJECT_WP_API_URL
VITE_DATA_SOURCE=mock|api
```

Server-only secrets must not use the `VITE_` prefix. For Next.js or other frameworks, map these concepts to the framework's existing public/private env naming instead of renaming everything blindly.

## Example Values

For a project whose public site is `https://example.com` and CMS is `https://cms.example.com`:

```bash
VITE_SITE_URL=https://example.com
VITE_WP_API_URL=https://cms.example.com/wp-json/wp/v2
```

## Guardrails

- Do not hardcode development URLs into production SEO fields.
- Do not treat any builder's internal storage as the CMS when WordPress is the backend contract.
- Do not alter CMS field names to satisfy a UI component. Adapt via a mapper/service, or request a backend schema change.
- Do not claim the domain is bound, deployed, or published unless the relevant platform/deployment state has been verified by the operator or tooling.
