# Reference Index — HeadPress Frontend Dev

先載入此檔案，再只載入當前任務需要的 reference。

> 所有網域範例使用 `example.com` / `cms.example.com`；實際使用時替換為部署的真實網域。

## HeadPress 關鍵文件路徑

| 資源 | 路徑 |
|------|------|
| **OpenAPI Schema（唯一 canonical）** | `themes/headpress/docs/prd/openapi.json` |
| API 混合架構 PRD | `themes/headpress/docs/prd/混合型HeadlessAPI架構PRD.md` |
| PHP OOP 骨架與型別規範 | `themes/headpress/docs/prd/PHP-OOP骨架與型別規範.md` |
| API 一致化計畫 | `themes/headpress/docs/prd/API一致化參考與逐檔計畫.md` |
| WP 欄位保留條件 | `themes/headpress/docs/prd/WP欄位保留與顯示條件PRD.md` |
| Deprecation 政策 | `themes/headpress/docs/standards/deprecation-policy.md` |
| 後端 REST 驗證腳本 | `scripts/wp-rest-check.mjs` |
| Swagger UI 啟動腳本 | `scripts/open-api-ui.ps1` |

## 任務對照表

| 任務 | 讀取 |
| --- | --- |
| 從零開始：入門與如何建立首頁 | `getting-started.md` |
| 確認 HeadPress API endpoints、response schema、欄位定義 | `themes/headpress/docs/prd/openapi.json` + `data-contract.md` |
| 確認專案身分、domain、環境名稱、平台與 source-of-truth 邊界 | `project-contract.md` |
| 避免 AI-builder/Git 覆寫衝突，或決定變更 owner | `collaboration-protocol.md` |
| 對齊 UI 需求、Composition API 欄位、mock shape 或 service-layer contract | `data-contract.md` |
| 取得 WordPress post、Page 或 Custom Post Type 單篇 / 列表 | `data-contract.md`；文章 UI 另讀 `scenes-news.md` |
| 確認 WordPress-backed data 必須遵守 WordPress REST API 結構與 mapper 邊界 | `wordpress-data-structure-policy.md` |
| 規劃或修補 API error、timeout、auth、CORS、not found、empty data | `data-contract.md`、`frontend-seo-deployment.md` |
| 處理 SSR/SSG/pre-render SEO、custom domain、publish、sitemap、robots | `frontend-seo-deployment.md` |
| prompt AI builder 前需要 negative prompts、anti-patterns 或 pitfall checks | `anti-prompts-pitfalls.md` |
| 需要官方前端平台、WordPress 或 TanStack 連結 | `official-docs.md` |
| 建立或調整首頁 / landing sections | `scenes-home.md` |
| 建立或調整 news lists、article detail pages、categories 或 tags | `scenes-news.md` |
| 建立或調整 CMS-backed static pages | `scenes-content-page.md` |

## 新增 Scene Rules

每個 UI scenario 建立一個新的 `scenes-*.md` 檔案。每個 scene 只聚焦：

- route/page purpose
- expected data service（對應哪個 `headpress/api/v1` endpoint，優先於 `/wp/v2/`）
- WordPress REST fields（查 openapi.json）
- SEO requirements
- UI states
- error handling
- forbidden shortcuts

不要在這裡複製全域 WordPress schemas。請連回 `data-contract.md`、`openapi.json` 與 `.agents/skills/wordpress-rest-api-development`。
