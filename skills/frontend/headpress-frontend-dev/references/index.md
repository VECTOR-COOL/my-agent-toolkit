---
description: HeadPress 前端開發 AI Agents 核心索引指南。
---

# HeadPress Frontend Dev — Reference Routing

身為 AI Agent，當你在進行 HeadPress 前端開發任務時，**絕對不要一次讀取所有的 reference 檔案**。請根據使用者指令的關鍵字與情境意圖，挑選並讀取最相關的小檔案。

這份指南已經過「去重與分類」，並使用前沿設計系統與現代化 Web 架構進行組織。

## 意圖命中索引 (Intent Routing Index)

請比對你的任務，並**僅讀取**符合條件的檔案：

### 🎯 1. 專案核心與協作規則 (Core)
*如果任務涉及專案初始化、合約確認、與人類開發者的協作、或是想知道常見的雷區：*
- [x] **架構速覽與 Headless 心智模型**：讀取 `core/architecture-mindset.md`
- [x] **從零開始建立或了解環境/平台設定**：讀取 `core/getting-started.md`
- [x] **確認網域、API URL 與前端邊界**：讀取 `core/project-contract.md`
- [x] **避免覆寫、決定誰負責什麼**：讀取 `core/collaboration-protocol.md`
- [x] **核心原則與高風險禁止事項**：讀取 `core/core-principles-guardrails.md`
- [x] **撰寫 Prompt 給其他 Builder，或需要避開陷阱**：讀取 `core/anti-prompts-pitfalls.md`
- [x] **交給 AI Builder 的 Prompt 範例與檢查表**：讀取 `core/ai-builder-prompts.md`
- [x] **需要官方文件連結**：讀取 `core/official-docs.md`

### 🎨 2. 設計系統與 UI 規範 (Design System)
*如果任務是開發 UI 元件、寫 CSS、調整排版、確保無障礙或改善效能：*
- [x] **顏色、字體、間距 (Design Tokens)**：讀取 `design-system/foundations.md`
- [x] **RWD 裝置尺寸與排版 (大螢幕/小螢幕/平板/手機)**：讀取 `design-system/responsive-breakpoints.md`
- [x] **元件開發與層次劃分 (Atomic Design, 狀態機)**：讀取 `design-system/components-guidelines.md`
- [x] **導覽選單 (Primary Navigation) 多層級與行為**：讀取 `design-system/navigation-menu.md`
- [x] **無障礙存取 (a11y, 鍵盤導覽, ARIA, 對比度)**：讀取 `design-system/accessibility-a11y.md`
- [x] **渲染效能 (CLS, 圖片最佳化, Bundle Size)**：讀取 `design-system/performance.md`

### 🔌 3. API 串接與資料模型 (API Integration)
*如果任務是打 API、對齊 Schema、或將 WordPress payload 轉為 ViewModel：*
- [x] **確認 HeadPress API endpoints 與 Response Schema**：首先讀取 `../themes/headpress/docs/prd/openapi.json`
- [x] **如何對齊 Schema 與渲染契約**：讀取 `api-integration/schema-alignment.md`
- [x] **處理 Service Layer、Mappers、Error/Timeout fallback**：讀取 `api-integration/data-contract.md`
- [x] **處理 WordPress 特有的內容邏輯 (CPT, Taxonomy, HTML 處理)**：讀取 `api-integration/wordpress-data-structure-policy.md`
- [x] **WordPress REST API 常見爆點與錯誤處理**：讀取 `api-integration/common-pitfalls.md`

### 🌍 4. 搜尋引擎最佳化與部署 (SEO)
*如果任務涉及 Meta Tags, Canonical URL, JSON-LD Schema, Sitemap 或部署環境：*
- [x] **處理 SSR/SSG、Head 標籤注入、路由跳轉**：讀取 `seo/frontend-seo-deployment.md`
- [x] **網址映射與過濾（CMS 轉 Frontend）**：讀取 `seo/url-mapping.md`

### 🖼️ 5. 具體頁面場景 (Scenes)
*如果你正在實作特定的頁面，需要知道該頁面的資料入口與 UI 特性：*
- [x] **實作「首頁 (Home)」或 Landing Sections**：讀取 `scenes/scenes-home.md`
- [x] **實作「最新消息 / 文章列表 / 單篇文章」**：讀取 `scenes/scenes-news.md`
- [x] **實作「靜態內容頁 (如：關於我們)」**：讀取 `scenes/scenes-content-page.md`
- [x] **其他常見情境 (如：新增列表頁、從 Mock 切換 API、媒體缺圖處理)**：讀取 `scenes/common-scenarios.md`

---

## Agent 操作守則

1. **先定位，後讀取**：遇到模糊需求時，先利用此索引定位該讀哪個子目錄的檔案，善用 `view_file` 工具。
2. **單一職責**：如果發現檔案開始變得「超級大」，主動將其拆分並利用 Markdown 的 `[Link](file.md)` 功能進行內部引用。
3. **不要猜測資料結構**：若需要串接 API，永遠以 `openapi.json` 為唯一真理，並遵循 `api-integration/data-contract.md` 實作。
