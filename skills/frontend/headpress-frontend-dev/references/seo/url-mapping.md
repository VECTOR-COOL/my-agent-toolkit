# 網址映射與過濾（CMS → 前端公開網域）

Headless 架構下，**公開前端網域**（`VITE_SITE_URL`，例：`https://example.com`）與 **CMS 後端網域**（`VITE_WP_API_URL` 的 host，例：`https://cms.example.com`）經常不同。WordPress 在 permalink、`link`、`guid`、選單項目 `url`、`content.rendered` 內嵌 `<a href>`／`<img src>`、頂層 `seo.canonical`、`breadcrumb`、`route.redirect_to`、sitemap 條目等欄位，常輸出 **指向 CMS 的絕對 URL**。

**必守規則**：
- **使用者可點擊的站內連結**（導覽、內文、麵包屑、卡片 CTA、語言切換後的 logo 等）**不得直接導向 CMS 後端網址**；須在 service／mapper 層過濾並改寫為前端公開網域或前端 router 可解析的相對路徑。
- **SEO 與對外 URL**（`canonical`、`og:url`、JSON-LD 內 `url`、`sitemap` host）必須使用 `VITE_SITE_URL` 或 `GET /site`、`GET /manifest` 提供的 `frontend_url`，不可使用 `cms_url`／`site_url` 作為正式對外連結。
- **集中實作 URL rewriter**：依 `frontend_url` 與 `cms_url`（或 env）建立 `rewriteCmsUrl(url)`（或等效 util），在 mapper 輸出 normalized model 前統一處理；component 只吃已改寫的 `href`／`canonical`，禁止把 raw API 的 `link` 直接丟進 `<Link>`／`<a>`。
- **`content.rendered` HTML**：內嵌絕對連結須在 sanitize／rewrite 階段將 CMS origin 置換為 frontend origin（或改為相對路徑）；不可原樣 `dangerouslySetInnerHTML` 後仍留 CMS 站內連結。
- **媒體 `source_url`**：若仍指向 CMS `uploads`，需依專案策略處理（前端 image domain allowlist、CDN、proxy）；這不取代站內 **頁面連結** 必須 rewrite 的規則。
- **API 呼叫 vs 使用者導覽**：`headpressClient` 打 CMS API 是允許的；**瀏覽器位址列與使用者點擊的 href** 必須留在前端公開網域。
