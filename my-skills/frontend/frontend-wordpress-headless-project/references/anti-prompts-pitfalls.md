# Anti-Prompts And Pitfalls

Load this before sending broad prompts to Lovable, v0, Replit, Cursor, or another coding agent.

## Short Negative Prompt

Append this to risky implementation prompts:

```text
Do not replace the active frontend stack, router, rendering mode, or package manager unless explicitly requested; do not bypass the WordPress service layer; do not change WordPress REST field shapes; do not hardcode mock data into UI components; do not expose CMS secrets through public env variables; and do not weaken SSR, SSG, pre-rendered, or otherwise SEO-visible primary content.
```

## Chinese Version

```text
請不要改掉目前專案的 frontend stack、router、rendering mode 或 package manager，除非任務明確要求；不要繞過 WordPress service layer；不要擅改 WordPress REST API 欄位結構；不要把 mock data 寫死在 UI component；不要用公開 env 變數暴露 CMS secret；不要讓主要內容變成只靠 client-side useEffect 才渲染而削弱 SEO 可見性。
```

## Common Pitfalls

- Replacing the active stack to solve one routing issue. Fix the route in the active framework instead.
- Copying assumptions from one builder into another, such as forcing TanStack Start into a v0/Next.js export or forcing Next.js into a TanStack project.
- Fetching CMS data directly inside visual components. Keep fetches in loaders, server functions, server components, or services according to the active stack.
- Designing mock data as convenient frontend objects, then discovering it does not match WordPress REST.
- Assuming `title`, `content`, or `excerpt` are plain strings. WordPress uses `*.rendered` HTML fields.
- Forgetting `_embed`, then building extra client requests for every author, media, category, or tag.
- Combining `_fields` with `_embed` but omitting `_embedded` and `_links`.
- Treating custom post type URLs as obvious. Check WordPress `rest_base`.
- Falling back to mock data in production and accidentally publishing fake content.
- Putting API tokens in public env vars such as `VITE_` or `NEXT_PUBLIC_`, which can expose them to the browser bundle.
- Using `useEffect` for primary content, causing weak server/static HTML and poor SEO.
- Publishing sitemap URLs before CMS dynamic routes are stable.
- Editing `robots.txt` or canonical host without checking deployment domain and publish state.
- Assuming custom domain setup means the site is live. The platform may still need publish, deploy, DNS, or SSL verification.
- Running SEO review before publishing/custom-domain changes and treating old findings as current.

## Safer Prompt Pattern

```text
Implement this page using the existing frontend stack and route structure.
Read data through the existing WordPress service layer or create one if missing.
Keep mock data aligned with WordPress REST API shape.
Use the active framework's server/static/loader data path for SEO-visible content and route metadata.
If a required CMS field does not exist, document the backend requirement instead of inventing a permanent frontend field.

Negative constraints:
[paste the short negative prompt]
```

## Review Checklist

- Did any component import mock data directly?
- Did any component directly fetch the CMS?
- Did any route lose SSR/SSG/pre-rendered or otherwise SEO-visible content?
- Did any change alter WordPress REST field assumptions?
- Did env handling expose secrets?
- Did SEO use absolute URLs from site config/env?
- Did sitemap/robots/domain changes require platform publish/deploy or SEO scan follow-up?
