# Cursor Lovable Collaboration Protocol

Primary agreement:

Use the active project's collaboration document when present, commonly:

```text
docs/cursor-lovable-collaboration.md
```

If the project repo is available, read that file directly before changing code. This reference is a compact operational summary for this skill.

## Ownership

| Area | Lovable | Cursor / Git |
| --- | --- | --- |
| Publish, preview URLs, domain binding | Owns | Do not replace |
| Visual editing and platform assets | Owns primary edits | Preserve platform files and generated assets |
| Code architecture, CMS integration, service layer | Can generate | Owns durable implementation |
| WordPress content | Not source of truth | Do not directly mutate production content |
| SEO review, live scan, GSC setup | Platform tooling leads | Implement code-side metadata only when requested |

## Before Editing

- Read project `AGENTS.md` and this collaboration protocol when present.
- Check whether the task belongs to Lovable platform operations, Cursor code work, or WordPress CMS work.
- Avoid simultaneous large UI changes in Lovable and Cursor on the same route.

## Do Not Overwrite

- Lovable Publish or domain setup.
- `@lovable.dev/vite-tanstack-config` platform wiring.
- `src/server.ts`, `src/start.ts`, Lovable SSR/error reporting pipeline, unless the task specifically fixes those files.
- `src/routeTree.gen.ts` by hand.
- Existing Lovable Agent SEO/head/script output without a direct reason.
- CMS mock/data structure in a way that no longer matches WordPress REST API.

## Handoff

Every code handoff should say whether:

- Lovable Sync is needed.
- Lovable Publish is needed.
- custom-domain or env settings must be checked.
- WordPress backend/schema/content changes are needed.
- SEO scan, sitemap submission, or GSC verification should be rerun.
