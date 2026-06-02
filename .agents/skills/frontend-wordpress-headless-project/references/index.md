# Reference Index

先載入此檔案，再只載入當前任務需要的 reference。

| 任務 | 讀取 |
| --- | --- |
| 確認專案身分、domain、環境名稱、平台與 source-of-truth 邊界 | `project-contract.md` |
| 避免 AI-builder/Cursor/Git 覆寫衝突，或決定變更 owner | `collaboration-protocol.md` |
| 對齊 UI 需求、WordPress REST API 欄位、mock shape 或 service-layer contract | `data-contract.md` |
| 確認 WordPress-backed data 必須遵守 WordPress REST API 結構與 mapper 邊界 | `wordpress-data-structure-policy.md` |
| 規劃或修補 API error、timeout、auth、CORS、not found、empty data、fallback media | `data-contract.md`、`frontend-seo-deployment.md` |
| 處理 SSR/SSG/pre-render SEO、custom domain、publish、sitemap、robots 或 GSC readiness | `frontend-seo-deployment.md` |
| prompt agent 前需要 negative prompts、anti-patterns 或 pitfall checks | `anti-prompts-pitfalls.md` |
| 需要官方前端平台、WordPress 或 TanStack 連結 | `official-docs.md` |
| 建立或調整首頁 / landing sections | `scenes-home.md` |
| 建立或調整 news lists、article detail pages、categories 或 tags | `scenes-news.md` |
| 建立或調整 CMS-backed static pages | `scenes-content-page.md` |

## 新增 Scene Rules

每個 UI scenario 建立一個新的 `scenes-*.md` 檔案。每個 scene 只聚焦：

- route/page purpose
- expected data service
- WordPress REST fields
- SEO requirements
- UI states
- error handling
- forbidden shortcuts

不要在這裡複製全域 WordPress schemas。請連回 `data-contract.md` 與 `.agents/skills/wordpress-rest-api-development`。
