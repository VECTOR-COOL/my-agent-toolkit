# Frontend Development 入門指南 (Getting Started)

本文件是開始進行前端開發 (Frontend Development) 的入門指引，無論你使用的是 React、Vue、Next.js 或 AI Builder (如 Lovable, v0)，請依循以下步驟確保專案架構穩健。

## 1. 專案初始化與對齊 (Project Initialization & Alignment)
開始撰寫程式碼前，必須先明確定義專案邊界與架構：
- **確認技術棧 (Stack)**：確定 Framework (Next.js/Vite)、Router、Styling (Tailwind/CSS Modules) 與狀態管理。
- **資料來源 (Data Source)**：確認 API 端點、是否需要 Mock 資料、與 CMS 整合的方式。
- **參考文件**：閱讀 `project-initialization-and-alignment.md` 與 `project-structure.md`。

## 2. 佈局與路由規劃 (Layout & Routing)
建立清晰的頁面與路由對應關係：
- 定義全域 App Shell (Header, Footer, Navigation)。
- 將設計稿或需求拆解為具體的頁面與路由 (Routes)。
- 處理特殊路由：404 NotFound、登入保護頁面 (Protected Routes)、Loading 狀態。

## 3. 設計系統與主題 (Design System & Theme)
不要在專案中寫死 (hardcode) 顏色與間距：
- 定義 Design Tokens (顏色、字體、間距)。
- 將通用主題的頁面結構與設計系統結合。
- **參考文件**：請查看 `design-system/` 目錄下的 `index.md` 與 `theme-pages.md` 了解通用主題頁面結構。

## 4. 元件拆分與開發 (Component Decomposition)
- 遵循單一職責原則 (Single Responsibility Principle) 拆分元件。
- 區分「展示型元件 (Presentational)」與「容器型元件 (Container/Smart)」。
- **參考文件**：`component-decomposition.md`。

## 5. 資料層與 API 串接 (Data Architecture)
- 建立 Service Layer，將 API 呼叫邏輯與 UI 元件分離。
- 定義 TypeScript 的 View Models。
- 做好錯誤處理 (Error Handling)，不要讓 API 失敗導致整個畫面崩潰。
- **參考文件**：`data-architecture.md`。

## 6. AI Builder 協作 (AI Builder Collaboration)
如果是透過 Prompt 讓 AI 幫忙寫扣：
- 分階段給予 Prompt，不要一次給太複雜的需求。
- 明確指定不可修改的資料夾 (如 `services/` 或 `types/`)。
- **參考文件**：`prompt-playbook.md` 與 `ai-builder-agent-collaboration.md`。
