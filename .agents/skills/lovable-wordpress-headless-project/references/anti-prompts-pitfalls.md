# Anti-Prompts And Pitfalls

Load this before sending broad prompts to Lovable, Cursor, or another coding agent.

## Short Negative Prompt

Append this to risky implementation prompts:

```text
Do not replace the Lovable/TanStack Start stack, do not introduce Next.js/Remix/react-router-dom routing, do not bypass the WordPress service layer, do not change WordPress REST field shapes, do not hardcode mock data into UI components, do not expose CMS secrets with VITE_ variables, and do not weaken SSR-visible SEO content.
```

## Chinese Version

```text
請不要改掉 Lovable/TanStack Start 架構，不要加入 Next.js/Remix/react-router-dom 路由，不要繞過 WordPress service layer，不要擅改 WordPress REST API 欄位結構，不要把 mock data 寫死在 UI component，不要用 VITE_ 暴露 CMS secret，不要讓主要內容變成只靠 client-side useEffect 才渲染。
```

## Common Pitfalls

- Replacing Lovable's stack to solve one routing issue. Fix the route in the active framework instead.
- Fetching CMS data directly inside visual components. Keep fetches in loaders, server functions, or services.
- Designing mock data as convenient frontend objects, then discovering it does not match WordPress REST.
- Assuming `title`, `content`, or `excerpt` are plain strings. WordPress uses `*.rendered` HTML fields.
- Forgetting `_embed`, then building extra client requests for every author, media, category, or tag.
- Combining `_fields` with `_embed` but omitting `_embedded` and `_links`.
- Treating custom post type URLs as obvious. Check WordPress `rest_base`.
- Falling back to mock data in production and accidentally publishing fake content.
- Putting API tokens in `VITE_` env vars, which can expose them to the browser bundle.
- Using `useEffect` for primary content, causing weak SSR HTML and poor SEO.
- Publishing sitemap URLs before CMS dynamic routes are stable.
- Editing `robots.txt` or canonical host without checking Lovable domain and Publish state.
- Assuming custom domain setup means the site is live. Lovable still needs Publish and DNS/SSL verification.
- Running SEO review before publishing/custom-domain changes and treating old findings as current.

## Safer Prompt Pattern

```text
Implement this page using the existing Lovable/TanStack Start structure.
Read data through the existing WordPress service layer or create one if missing.
Keep mock data aligned with WordPress REST API shape.
Use loader/server-side data for SSR-visible content and route head metadata.
If a required CMS field does not exist, document the backend requirement instead of inventing a permanent frontend field.

Negative constraints:
[paste the short negative prompt]
```

## Review Checklist

- Did any component import mock data directly?
- Did any component directly fetch the CMS?
- Did any route lose SSR-visible content?
- Did any change alter WordPress REST field assumptions?
- Did env handling expose secrets?
- Did SEO use absolute URLs from `VITE_SITE_URL`?
- Did sitemap/robots/domain changes require Lovable Publish or SEO scan follow-up?
