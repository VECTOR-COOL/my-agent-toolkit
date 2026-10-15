---
name: frontend-development
version: "1.1.0"
description: 通用前端應用開發、AI builder 專案架構、資料層與 prompt 組裝 Skill。用於規劃、審查、建置或遷移 Lovable、v0、Replit 或類似 React/TypeScript 前端 app、網站、dashboard 與工具；涵蓋 route map、專案契約、component 拆分、mock/API 資料策略、service layer 邊界、錯誤處理、HTTP 錯誤頁面、SSR/CSR 決策、theme 規劃、docs/prompts/i18n/tests/scripts 結構與分階段實作 prompts。若涉及 WordPress Headless CMS 資料契約，搭配 frontend-wordpress-headless-project 或 wordpress-rest-api-development。
---

# Frontend Development Skill

[![version](https://img.shields.io/badge/version-1.1.0-blue)]()
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

本技能適用於前端產品開發，可用於 Lovable、v0、Replit 或是本機的 React/TypeScript 專案。我們持續支援 Lovable，但除非使用者明確指定，請勿預設它為唯一的目標平台。

## 核心原則 (Core Principle)

從實際的平台、程式碼儲存庫 (repository) 及執行環境的證據出發。在使用者或程式碼庫證明特定環境之前，請保持與平台無關的中立指導原則。

- 如果專案是 Lovable，請使用相容 Lovable 的 prompts、檔案邊界與發布限制。
- 如果專案是 v0，偏好使用以 React/Next.js 為導向的 component prompts，若有使用 shadcn，則遵循 shadcn 相容的 UI 模式。
- 如果專案是 Replit，須考量全端應用程式的鷹架 (scaffolding)、執行環境指令與部署限制。
- 如果專案是本機程式碼庫，請遵循偵測到的框架、路由器 (router)、樣式系統、套件管理員以及測試設定。

## 觸發情境 (Trigger Context)

當任務涉及以下內容時使用此技能：

- 前端應用程式、網站、儀表板 (dashboard)、後台 (admin)、登陸頁面 (landing page) 或工具的規劃
- 路由地圖 (route maps)、資訊架構 (IA)、頁面清單、版面配置系統或元件拆分
- React、TypeScript、TanStack Start、TanStack Router、Vite、Next.js、Tailwind、shadcn/ui 或類似技術棧
- 給 Lovable、v0、Replit、Bolt、Cursor 或類似工具的 AI builder prompt 腳本包
- Mock-first 資料策略、API 遷移規劃、Service layers 邊界、Fixtures、具型別的 View models 或 CMS 整合邊界
- 載入中 (loading)、空白 (empty)、錯誤 (error)、重試 (retry)、超時 (timeout)、離線 (offline)、權限不足 (permission denied) 與可恢復的失敗狀態
- HTTP 400/401/403/404/410/429/500/503 錯誤路由或框架層級的錯誤頁面
- SSR/CSR 相容性、Hydration 風險、SEO 路由結構、Metadata 準備度，或前端發布準備度
- 規劃主題變數 (theme tokens)、設計系統 (design variables)、色彩系統、字體排版、間距與元件樣式計劃
- 多語系 (i18n)、文件、腳本、QA 關卡、視覺一致性檢查與分階段實作

## 工作流程 (Workflow)

1. **辨識目標平台與技術棧**
   - 在假設框架之前，先檢查現有檔案。
   - 偵測路由器、渲染模式 (rendering mode)、樣式系統、元件庫、資料獲取方式以及部署目標。
   - 如果平台證據與使用者的標籤衝突，請說明證據並以程式碼庫為主進行。

2. **定義專案契約**
   - 確認目標受眾、主要工作流程、路由、資料來源、內容所有權、SEO 期望與部署限制。
   - 將產品需求與平台實作細節分開。
   - 將平台特定的指示獨立放在一個區塊，使 prompts 可以跨 Lovable、v0、Replit 或本機實作重複使用。

3. **規劃路由與元件**
   - 將路由對應到頁面、loaders/server functions (若適用)、layouts、共用元件以及關鍵狀態。
   - 偏好應用程式既有的慣例，而非引入新的抽象概念。
   - 保持元件拆分的實用性：頁面佈局、功能區塊、可重用原件、資料展示、表單以及回饋狀態。
   - 建立主導覽選單時，必須從資料契約到渲染的 UI 皆支援多層級導覽，而非將所有層級攤平為頂層連結。

4. **規劃資料與服務 (Data and Services)**
   - 當後端尚未準備好時，從真實的 mock 資料開始。
   - 在串接真實 API 前，定義具型別的領域/視圖模型 (domain/view models) 與服務層邊界。
   - 在連線真實 API 前對齊目標資料 Schema。實作防禦性解析與驗證（例如預設值或 Schema 驗證），防止前端因缺少或錯誤型別的資料欄位而崩潰。
   - 將 API 特定的正規化邏輯 (normalization) 保持在頁面元件之外。
   - 為預期的失敗模式定義具有型別的錯誤契約，包含驗證錯誤、授權/權限失敗、找不到資源 (not found)、速率限制 (rate limit)、超時、網路失敗以及未知的伺服器錯誤。
   - 將 fetch、重試、超時、取消、備用方案與錯誤正規化邏輯保留在服務或路由 loader 的邊界內；元件應負責渲染正規化後的狀態，而非解析原始錯誤。
   - 對於 WordPress REST，使用 WordPress 專屬技能處理 schemas、fixtures、分頁、媒體、ACF、Yoast SEO 與端點驗證。

5. **規劃主題與 UI 系統 (Theme and UI System)**
   - 當任務包含視覺系統規劃時，請務必參閱設計系統與主題規劃文件（如 `references/design-system/index.md`、`references/theme-pages.md` 與 `references/theme-planning/README.md`）。
   - 保留專案中現有的 design tokens。
   - 若存在或應該存在 token 系統，請避免寫死 (hardcode) 單次使用的調色盤。

6. **規劃 HTTP 錯誤頁面與路由層級的失敗**
   - 遵循偵測到的路由器或框架慣例處理 404/not-found、錯誤邊界 (catch boundaries)、路由錯誤元件、伺服器錯誤以及靜態主機備用方案。
   - 當框架或產品範圍支援時，針對 400、401、403、404、410、429、500 與 503 包含獨立的處理邏輯。
   - 使 HTTP 錯誤頁面可用、在應用程式支援 i18n 時在地化、具備無障礙性、響應式，並與 App Shell 保持一致，不要看起來像行銷頁面。
   - 對於需要 SEO 的路由，確保缺少動態內容時（在框架允許的情況下）回傳實際的 404/410 狀態碼，而非回傳成功的空白頁面。

7. **產出分階段的實作 Prompts 或編輯**
   - 對於 AI Builder，請將 Prompts 分成小而可驗證的階段。
   - 每個階段都應指名檔案、路由、元件、資料契約、限制條件與驗收檢查標準。
   - 除非目標是特定平台，否則避免使用專有術語。例如，除非目標明確是 Lovable（此時使用 "Lovable Knowledge" 較適當），否則請使用「AI builder 知識/情境檔」等通用詞彙。

8. **驗證結果**
   - 執行現有的 typecheck、lint、tests、build 與框架特定的檢查。
   - 若為前端變更，請盡可能檢查渲染後的 UI。
   - 驗證成功、載入中、空白、錯誤、重試、找不到、權限不足與伺服器失敗狀態 (若適用)。
   - 使用直接訪問網址或框架的路由測試來驗證 HTTP 錯誤頁面，包含手機版與電腦版版面。
   - 檢查最終結果是否符合請求的平台範圍，並且沒有意外變成僅限 Lovable 的內容。

## 錯誤處理 (Error Handling)

所有前端的規劃或實作都必須在正確的邊界包含明確的錯誤處理。

- 將載入中、空白、錯誤、找不到、未授權、被禁止、速率限制、超時、離線以及資料降級狀態視為一等 (first-class) UI 狀態。
- 在原始 API、CMS、驗證與框架錯誤到達可重複使用元件之前，先將其正規化。
- 在整合端點時嚴格對齊目標資料 Schema。防範缺少或格式錯誤的欄位，以免元件在渲染非預期資料時崩潰。
- 在發明自訂全域狀態前，先使用現有的框架機制，例如 route error boundaries、loader errors、server function errors、`notFound` 輔助函數或錯誤元件。
- 保留有用處的重試或恢復路徑，但避免會對 API 造成壓力或隱藏持續性失敗的自動重試迴圈。
- 確保失敗不會渲染出空白螢幕、破壞 SSR/靜態生成，或默默回退到具誤導性的內容。
- 當功能涉及資料獲取或路由 loaders 時，請為預期的錯誤狀態包含真實的 mock fixtures 或測試。

## HTTP 錯誤頁面 (HTTP Error Pages)

當專案具有路由、發佈、SSR、SSG 或靜態代管行為時，請包含 HTTP 錯誤頁面規劃。

- 為缺少的路由和缺少的動態內容提供清晰的 404/not-found 頁面。
- 相關時，為受保護的區域新增 401/403 處理，為移除的內容新增 410 處理，為速率限制新增 429 處理，並為伺服器或維護失敗新增 500/503 處理。
- 將錯誤頁面保留在現有 App Shell 或文件中說明的框架慣例內，並提供回到有效工作流程的穩定導覽。
- 對於需要 SEO 的內容頁面，在平台支援的情況下回傳正確的 HTTP 狀態碼；不要只依賴於回傳 200 後的客戶端文字。
- 為每個實作的錯誤頁面驗證直接導航、重新整理、深層連結、靜態主機備用行為以及手機版版面。

## 主導覽選單 (Primary Navigation)

建立或修改主網站選單時，請將層級結構視為一等需求。

- 以穩定的欄位模擬導覽項目，例如 `label`、`href`、`children`、`isActive`、`external`，以及可選的 `description` 或 `icon`。
- 當資訊架構包含子頁面時，支援至少兩層的選單項目；只有當內容結構需要且 UI 模式可維持可用性時，才使用第三層。
- 電腦版可以使用下拉式 (dropdown)、展開式 (flyout) 或大型選單 (mega menu) 模式。手機版應使用抽屜 (drawer)、側滑面板 (sheet) 或手風琴 (accordion) 模式，以展示巢狀項目而不依賴滑鼠懸停 (hover)。
- 保留鍵盤與螢幕閱讀器行為：`aria-expanded`、`aria-controls`、focus-visible 狀態、Esc 鍵關閉、點擊外部關閉以及可預測的 Tab 順序。
- 保持作用中 (active) 與祖系作用中 (ancestor-active) 狀態的可見性，以便使用者能理解目前頁面及其所屬父層區塊。
- 為長標籤、多個兄弟項目以及狹窄的電腦版/平板寬度定義溢位處理行為。
- 驗證電腦版懸停/點擊行為、手機版開關與巢狀展開、深層連結作用中狀態，以及最小支援手機寬度下的版面配置。

## 平台注意事項 (Platform Notes)

### Lovable

- 使用符合 Lovable 專案編輯工作流程的分階段 Prompts。
- 保持 Knowledge 檔案簡潔且具備可實作性。
- 區分舊版的 React/Vite CSR 專案與 TanStack Start SSR 專案。
- 搭配 `lovable-legacy-to-ssr-migration` 將舊版 Lovable SPA 遷移到 TanStack Start SSR。
- 搭配 `frontend-wordpress-headless-project` 用於 AI-builder 或 React/TypeScript 前端 + WordPress Headless CMS 的交付。

### v0

- 除非專案上下文另有說明，否則請將 v0 的輸出視為 React 元件生成。
- 當專案已使用 shadcn/ui 時，偏好使用與之相容的元件結構。
- 在 Prompts 中包含響應式狀態、空白/載入中/錯誤狀態，以及真實的範例資料。
- 除非目標專案包含後端技術棧，否則請避免要求 v0 處理後端行為。

### Replit

- 考量執行環境指令、套件安裝、環境變數以及預覽/部署行為。
- 建立全端應用程式時，將前端 UI 需求與伺服器/API 需求分開。
- 包含可在 Replit 預覽中驗證的明確驗收標準。

### 本機程式碼庫 (Local Codebases)

- 遵循儲存庫中現有的框架與慣例。
- 進行範圍限制的編輯，並使用本機腳本進行驗證。
- 除非使用者要求，否則請勿引入 AI-builder 專屬的檔案。

## 輸出模式 (Output Patterns)

規劃時，產出：

- 專案契約 (project contract)
- 路由地圖 (route map)
- 元件地圖 (component map)
- 資料模型與服務計畫 (data model and service plan)
- 主題計畫 (theme plan)
- 分階段實作 prompts (staged implementation prompts)
- 驗證檢查清單 (verification checklist)

實作時，產出：

- 聚焦的程式碼編輯
- 必要時更新的 fixtures/services/types
- 僅在有用的情況下提供最少的文件或 prompt 檔案
- 具體的驗證結果

## 參考文件 (Reference Files)

在執行任務時，請優先查閱以下入門與設計系統文件：
- `references/getting-started.md` (前端開發起手式指南)
- `references/design-system/index.md` (設計系統與通用主題頁面規範入口)
- `references/theme-plan-configuration.md`
- `references/theme-planning/README.md`
