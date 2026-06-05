# Frontend SEO Deployment — HeadPress Frontend Dev

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Platform Rules

- 辨識 active platform（Lovable、v0、Replit、Vercel、Netlify、Cloudflare 等）後再改 deployment、domain 或 environment settings。
- Custom-domain binding 在前端部署平台進行；不要只改 repo code 就宣稱完成上線。
- Publish/deploy flow 由 active platform 負責；不要用另一個 pipeline 取代它，除非使用者明確要求換 hosting 策略。
- 保留 active rendering mode（SSR/SSG/pre-render/CSR）；只在 active stack 內改善 SEO-critical content，除非任務是 migration。
- 確認前端 platform 的最新 SSR/SEO 行為（官方文件可能變動）。

## SEO Requirements

每個 public route 應具備：

- SEO-visible primary content 透過 SSR、SSG、pre-render 或平台支援的 crawler path 取得
- 一個清楚的 H1
- 語意化 sectioning
- 有意義的 image alt text
- Route-level title 和 description
- Canonical URL（來自 `VITE_SITE_URL` env，例如 `https://example.com/about`）
- Open Graph 與 Twitter metadata
- 絕對路徑的 `og:image`

Dynamic CMS routes 的資料取得順序：

```text
route/server data → /headpress/api/v1/route/{path}
  → mapper 取出 entity.seo 或 title.rendered/excerpt.rendered
  → metadata/head 使用 CMS SEO 欄位生成
  → component renders SEO-visible content
```

## CMS SEO Field Priority（對應 `/route/{path}` response）

1. 頂層 `seo`（HeadPress `/route` response）
2. `entity.title.rendered`
3. stripped `entity.excerpt.rendered`
4. embedded featured media（`entity._embedded["wp:featuredmedia"][0]`）
5. site defaults（來自 `VITE_SITE_URL` 與 `/site` 的 site 設定）

## HTTP Status And Error Pages

- 缺少 CMS content（`/route/{path}` 的 `route.status = 404`）應產生框架級 404/not-found。
- 已移除 content 使用 410（若產品有明確 removed-content state），否則使用 404。
- Protected preview 或 account routes 應區分 401 與 403。
- API outage、WordPress maintenance、timeout 或 build-time fetch failure 應 render 受控 500/503 state，不洩漏 secrets。
- Error pages 的 canonical/robots 行為必須明確；不要索引暫時 outage 頁面或空的 client-rendered placeholders。

## Sitemap And Robots

- 使用 `/sitemap`（`headpress/api/v1`）作為 sitemap data source；前端平台仍然負責最終 `sitemap.xml` 和 `robots.txt` 輸出。
- 以 `VITE_SITE_URL`（例如 `https://example.com`）作為 sitemap host URL。
- CMS-backed dynamic routes 只有在 API/source 穩定後才加入 sitemap，避免 publish broken URLs。
- 不要在 production 把 `robots.txt` 設成 block all crawlers，除非明確要求。
- Exclude preview、draft、private、member、cart、checkout、search-result 與 noindex URLs。

## Platform Pitfalls

- **Lovable**: custom-domain binding 與 Publish 是平台側操作；勿宣稱 site 已上線，直到 Publish/domain state 已由操作人員確認。
- **v0/Next.js exports**: metadata、sitemap、robots 與 image settings 通常在 code 中，但 deployment 行為仍依 target host 而定。
- **Replit**: deployment env vars 與 public URLs 可能和 local dev 不同；verify run/deploy configuration before diagnosing API or canonical issues。
- **Older SPA/CSR projects**: 不會自動變成 full SSR；不要承諾 SEO parity without an actual rendering migration or verified pre-render support。

## Handoff Checklist

SEO/deployment 相關 code work 完成後回報：

- 是否需要 platform builder sync/export/import
- 是否需要 platform publish/deploy
- 是否需要 SEO scan rerun
- 是否需要 Google Search Console/sitemap submission follow-up
- 是否需要確認 `VITE_SITE_URL`、`VITE_WP_API_URL`、image domains 或 auth/env 設定
- `/route/{path}` metadata 與 `/sitemap` data 是否已對照 production canonical URLs 驗證
- HeadPress CMS 的 CORS 是否允許 production frontend domain
