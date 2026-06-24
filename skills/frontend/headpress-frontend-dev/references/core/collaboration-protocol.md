---
description: 定義前端開發者、AI 代理與各個無頭 CMS 平台之間的協作邊界與責任歸屬。
---
# 前端建置協作規範 — HeadPress Frontend Dev

主要協定：

Use the active project's collaboration document when present, commonly:

```text
docs/headless-integration.md
docs/frontend-collaboration.md
docs/ai-builder-prompts.md
```

如果專案原始碼庫可用，請在修改程式碼前直接閱讀相關檔案。本參考文件為此技能的精簡操作摘要。

## Ownership

| Area | AI builder / platform | Cursor / Git / agent |
| --- | --- | --- |
| Preview URLs, publish/deploy controls, domain binding | Owns when platform-managed | Do not replace without request |
| Visual editing and platform assets | Can own primary edits | Preserve platform files and generated assets |
| Code architecture, `/headpress/api/v1` integration, service layer | Can generate local patches | Owns durable implementation |
| `openapi.json` (API surface definition) | Read-only reference | HeadPress CMS repo owns; do not edit from frontend |
| WordPress content | Not source of truth | Do not directly mutate production content unless requested |
| SEO review, live scan, GSC setup | Platform tooling may lead | Implement code-side metadata only when requested |

## Before Editing

- Read project `AGENTS.md` and collaboration protocol when present.
- Identify the active platform and stack before giving prompts or changing files.
- Check whether the task belongs to platform operations, code work, or WordPress/HeadPress CMS work.
- Avoid simultaneous large UI changes in an AI builder and Cursor/Git on the same route.
- Confirm the endpoint exists in `openapi.json` before building against it.

## Do Not Overwrite

- Platform publish/deploy or domain setup.
- Platform build config, generated files, preview bridge, or error reporting pipeline unless the task specifically fixes those files.
- Generated route manifests such as `routeTree.gen.ts` by hand.
- Existing agent-generated SEO/head/script output without a direct reason.
- CMS mock/data structure in a way that no longer matches `/headpress/api/v1` response shape per `openapi.json`.

## Platform Notes

- **Lovable**: preserve `@lovable.dev/*` platform wiring and Publish/domain assumptions unless the task explicitly changes hosting strategy.
- **v0**: preserve the active Next.js/App Router or exported project structure; do not force TanStack Start just because another builder uses it.
- **Replit**: preserve Replit-specific run, env, and deployment files unless the task is deployment/runtime related.
- **Custom repo**: treat Git, package scripts, CI, and hosting provider config as the source of operational truth.

## Handoff

Every code handoff should say whether:

- builder sync/export/import is needed.
- platform publish/deploy is needed.
- custom-domain or env settings must be checked.
- WordPress / HeadPress backend schema/content changes are needed.
- SEO scan, sitemap submission, or GSC verification should be rerun.
- CORS settings on the HeadPress CMS must be updated to allow the production frontend domain.
