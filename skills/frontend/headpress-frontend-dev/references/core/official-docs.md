---
description: 強調優先參考官方文件，以確認平台或 API 行為的準則。
---
# 官方文件指引 — HeadPress Frontend Dev

請優先使用官方文件以確認平台或 API 的行為。在對部署、SSR、SEO、環境變數或預設框架做出特定平台的主張之前，請先驗證當前的文件。

## HeadPress API Schema（最優先）

- **OpenAPI 3.1 Spec（CMS repo 本機）**：`themes/headpress/docs/prd/openapi.json`
- **OpenAPI（Runtime，WordPress 啟動後）**：`GET https://example.com/headpress/api/v1/openapi.json`
- API 混合架構 PRD：`themes/headpress/docs/prd/混合型HeadlessAPI架構PRD.md`
- Deprecation 政策：`themes/headpress/docs/standards/deprecation-policy.md`

## Frontend Platforms

### Lovable

- Documentation index: https://docs.lovable.dev/llms.txt
- SEO and AI search / SSR: https://docs.lovable.dev/features/seo-aeo
- Custom domains: https://docs.lovable.dev/features/custom-domain
- Publish: https://docs.lovable.dev/features/publish
- GitHub integration: https://docs.lovable.dev/integrations/github
- Google Search Console: https://docs.lovable.dev/integrations/google-search-console
- Deployment and hosting ownership: https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership
- External hosting: https://docs.lovable.dev/tips-tricks/external-deployment-hosting
- Skills: https://docs.lovable.dev/features/skills
- TanStack Start announcement/blog: https://lovable.dev/blog/building-apps-using-tanstack-start

### v0

- Documentation: https://v0.dev/docs
- API documentation: https://v0.dev/docs/api
- Sandbox documentation: https://v0.app/docs/sandbox

### Replit

- Documentation: https://docs.replit.com/
- Documentation index: https://docs.replit.com/llms.txt
- Configuration / `.replit`: https://docs.replit.com/references/configuration/configuration
- Deployments: https://replit.com/site/hosting

## WordPress REST API

- REST API Handbook: https://developer.wordpress.org/rest-api/
- Using the REST API: https://developer.wordpress.org/rest-api/using-the-rest-api/
- Global parameters: https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/
- Pagination: https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
- REST API Reference: https://developer.wordpress.org/rest-api/reference/
- Posts: https://developer.wordpress.org/rest-api/reference/posts/
- Pages: https://developer.wordpress.org/rest-api/reference/pages/
- Categories: https://developer.wordpress.org/rest-api/reference/categories/
- Tags: https://developer.wordpress.org/rest-api/reference/tags/
- Media: https://developer.wordpress.org/rest-api/reference/media/
- Search: https://developer.wordpress.org/rest-api/reference/search-results/
- register_rest_field: https://developer.wordpress.org/reference/functions/register_rest_field/

## SEO Plugin Fields

- Yoast SEO REST API: https://developer.yoast.com/features/rest-api/

## TanStack

- TanStack Start: https://tanstack.com/start/latest
- TanStack Router file-based routing: https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing
- TanStack Router SSR guide: https://tanstack.com/router/latest/docs/framework/react/guide/ssr
