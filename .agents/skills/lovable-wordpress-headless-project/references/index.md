# Reference Index

Load this file first, then load only the needed reference.

| Task | Load |
| --- | --- |
| Confirm project identity, domains, environment names, and source-of-truth boundaries | `project-contract.md` |
| Avoid Cursor/Lovable overwrite conflicts or decide who owns a change | `collaboration-protocol.md` |
| Map UI needs to WordPress REST API fields, mock shapes, or service-layer contracts | `data-contract.md` |
| Confirm WordPress-backed data must follow WordPress REST API structures and mapper boundaries | `wordpress-data-structure-policy.md` |
| Work on SSR SEO, custom domain, publish, sitemap, robots, or GSC readiness | `lovable-seo-deployment.md` |
| Need negative prompts, anti-patterns, or pitfall checks before prompting an agent | `anti-prompts-pitfalls.md` |
| Need official Lovable, WordPress, or TanStack links | `official-docs.md` |
| Build or adjust the homepage / landing sections | `scenes-home.md` |
| Build or adjust news lists, article detail pages, categories, or tags | `scenes-news.md` |
| Build or adjust CMS-backed static pages | `scenes-content-page.md` |

## Add New Scene Rules

Create one new `scenes-*.md` file per UI scenario. Keep each scene focused on:

- route/page purpose
- expected data service
- WordPress REST fields
- SEO requirements
- UI states
- forbidden shortcuts

Do not duplicate global WordPress schemas here. Link back to `data-contract.md` and `.agents/skills/wordpress-rest-api-development`.
