---
description: 提供在向 AI 開發代理（如 Lovable、v0、Cursor）發送提示前，應避免的反模式與常見陷阱。
---
# 反模式與常見陷阱 — HeadPress Frontend Dev

在向 Lovable、v0、Replit、Cursor 或其他開發代理發送廣泛提示前，請先載入此文件。

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Short Negative Prompt（English）

Append this to risky implementation prompts:

```text
Do not replace the active frontend stack, router, rendering mode, or package manager unless explicitly requested; prefer the /headpress/api/v1 Composition API public base and do not bypass the headpressClient service layer; only use /wp/v2/ in the service layer when HeadPress cannot provide the data; never call /wp/v2/ from UI components; do not change /headpress/api/v1 field shapes without checking openapi.json; do not hardcode mock data into UI components; do not expose CMS secrets through public env variables; and do not weaken SSR, SSG, pre-rendered, or otherwise SEO-visible primary content.
```

## 中文版 Negative Prompt

```text
請不要改掉目前專案的 frontend stack、router、rendering mode 或 package manager，除非任務明確要求；
優先使用 /headpress/api/v1 public base，不要繞過 headpressClient service layer；
僅在 HeadPress 無法提供資料時，才在 service layer 使用 /wp/v2/，且 UI component 不得直連 WP API；
不要在未查閱 openapi.json 的情況下改變欄位形狀假設；
不要把 mock data 寫死在 UI component；
不要用公開 env 變數（VITE_* 或 NEXT_PUBLIC_*）暴露 CMS secret；
不要讓主要內容變成只靠 client-side useEffect 才渲染而削弱 SEO 可見性。
```

## Common Pitfalls（HeadPress 特有）

- 未查 `openapi.json` 就假設 `/headpress/api/v1` endpoint 存在或回傳特定欄位。
- HeadPress 已有 `/route?path={current_path}`、`/page/{path}` 或 `/collection` 時，仍從 component 直連 `/wp/v2/posts`。
- 以為 `data-contract.md` 列的欄位就是全部；實際 schema 以 `openapi.json` 為準。
- 設計 mock data 為方便 UI 的物件，未對齊 `/headpress/api/v1` response 形狀，導致 API 切換後破版。
- 假設 `title`、`content`、`excerpt` 是純字串；WordPress 使用 `*.rendered` HTML 欄位。
- 忘記 `_embed`，然後對每篇文章再發多次 request 取 author、media、category。
- 組合 `_fields` + `_embed` 但漏掉 `_embedded` 和 `_links`。
- 在 production 降級為 mock data 而靜默 publish 假內容。
- 把 API tokens 放進 `VITE_` 或 `NEXT_PUBLIC_` prefix env var，暴露給瀏覽器 bundle。
- 用 `useEffect` 取得主要內容，造成 server/static HTML 為空而 SEO 失效。
- 在 CMS dynamic routes 穩定前就 publish sitemap URLs。
- Replacing the active stack to solve one routing issue. Fix the route in the active framework instead.
- Assuming custom domain setup means the site is live. The platform may still need publish, deploy, DNS, or SSL verification.

## Safer Prompt Pattern

```text
請使用現有的 frontend stack 與 route structure 實作此頁面。
優先透過 headpressClient 指向 /headpress/api/v1 取得資料；schema 以 openapi.json 為準。
若 HeadPress 無法提供所需欄位，說明後端擴充需求；短期備援才在 service layer 使用 wpClient。
使用 active framework 的 server/static/loader data path 取得 SEO-visible content 與 route metadata。

負面限制：
[paste the negative prompt above]
```

## Review Checklist

- 是否有 component 直接 import mock data？
- 是否有 component 直接 fetch CMS URL（不透過 service layer）？
- 是否在 HeadPress 已有 endpoint 時仍不必要地使用 `/wp/v2/`？
- 是否有 route 丟失 SSR/SSG/pre-rendered content？
- 是否有 change 改變了 `/headpress/api/v1` 欄位假設而未確認 openapi.json？
- env 處理是否暴露 server-only secrets？
- SEO 是否使用來自 site config/env 的絕對 URL？
- sitemap/robots/domain changes 是否需要 platform publish/deploy 或 SEO scan follow-up？
