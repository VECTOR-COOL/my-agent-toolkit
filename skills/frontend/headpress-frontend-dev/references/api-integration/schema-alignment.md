# 如何對齊 Schema 與渲染契約

## 如何對齊 Schema（必讀）

### Step 1 — 查 OpenAPI Spec（Single Source of Truth）
HeadPress API schema 的 **唯一 canonical 來源** 是：
`themes/headpress/docs/prd/openapi.json`

**Runtime 可取得的 schema**（WordPress 啟動後）：
`GET https://example.com/headpress/api/v1/openapi.json`

> **AI Builder 注意**：使用任何欄位或 endpoint 前，**必須先在 openapi.json 中確認其存在**。未列入的 endpoint 代表尚未實作或已廢棄，不得假設可用。

### Step 2 — 確認 Composition API Endpoints (v1 嚴格對齊)
前端 **必須優先** 消費以下 endpoints（完整 schema 在 `openapi.json`；路徑相對於 `/headpress/api/v1`）。

**【主流程：AI Builder 首選】**
- `GET /manifest`：取得 AI Builder 開發配方、前端路由映射與建議。
- `GET /site`：取得全站基礎結構資料 (App init / Root Layout)。
- `GET /route?include=all`：首頁資料專用首屏渲染。
- `GET /route?path={current_path}&include=all`：**全站一般路由主要解析器**。

### Step 3 — 對齊回應欄位
Composition API 的 `entity`、`items`、media、taxonomy 欄位**保留 WordPress REST conventions**；頁面級 SEO 在頂層 `seo`（見 openapi.json）。

欄位對齊規則（mapper 必須遵守）：
| WordPress 欄位 | 正確寫法 | 錯誤寫法 |
| --- | --- | --- |
| 文章標題 | `title.rendered` | `title`（字串） |
| 文章內容 | `content.rendered` | `content` |
| 文章摘要 | `excerpt.rendered` | `excerpt` |
| 特色圖 ID | `featured_media` | `featured_image_id` |
| 特色圖 URL | `_embedded["wp:featuredmedia"][0].source_url` | 自行拼接 URL |
| 分類/標籤 | `_embedded["wp:term"]` | `categories`（ID 陣列） |

## 渲染契約 (Rendering Contract)

AI Agent 在實作或修改前端邏輯時，**必須**遵守以下 v1 渲染契約：
1. **優先使用 SSR / SSG**：只要平台支援，必須優先使用 Server-Side Rendering (SSR) 或 Static Site Generation (SSG)。 CSR 僅作 fallback，**嚴禁**作為公開 SEO 頁面的唯一渲染方式。
2. **SEO 與 Meta 標籤注入**：`data.seo` 提供 `title`, `description`, `canonical`, `robots`, `resolved_og_image`。必須在 Server 端注入 `<head>`。
3. **路由狀態處理 (Redirect & 404)**：當 `data.route.kind === 'redirect'` 或 HTTP 301 時，執行 Redirect。當 `data.route.kind === 'not-found'`，觸發 404 機制。
4. **元件映射層級**：版型優先順序 `data.route.template` → `data.route.view`。內容解析優先順序 `data.sections` → `entity.blocks` → `entity.content.rendered`。
5. **無狀態與唯讀限制**：HeadPress API **不處理** 表單送出或會員登入。請改用 WordPress 原生 REST 或 Serverless Functions，**絕對不要**假定 HeadPress 處理寫入操作。

## 環境變數對齊

前端整合使用以下命名慣例：
```bash
# 前端 .env（Lovable / Vite / Next.js 等）
VITE_SITE_URL=https://example.com
VITE_WP_API_URL=https://example.com/headpress/api/v1
VITE_DATA_SOURCE=mock|api
```

後端（CMS repo / HeadPress 主題）使用固定變數名：
```bash
WP_API_BASE
WP_API_USER
WP_API_APP_PASSWORD
```
> Server-only secrets 不得使用 `VITE_` prefix（或任何框架的 browser-exposed prefix）。
