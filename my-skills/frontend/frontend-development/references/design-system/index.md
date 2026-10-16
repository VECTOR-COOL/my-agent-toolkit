# 設計系統 (Design System)

本目錄 (`design-system/`) 包含了專案中關於設計系統、主題配置與頁面結構的規範檔案。為了維持高可維護性，我們將設計系統拆分為多個獨立文件進行管理：

## 目錄結構與規範

- [**theme-pages.md**](theme-pages.md)：定義一個「通用主題」必須包含的基礎頁面清單 (例如首頁、關於我們、404、文章列表等) 以及頁面所需的核心區塊。
- [**tokens.md**](tokens.md)：定義設計系統的 Design Tokens，包含顏色 (Colors)、字體 (Typography)、間距 (Spacing) 與斷點 (Breakpoints)。
- [**components.md**](components.md)：定義共用的基礎 UI 元件規範 (Buttons, Cards, Inputs 等)，確保整個主題有一致的互動回饋。

在開始切版或給予 AI Builder Prompt 前，請確保專案已根據此設計系統正確配置全域變數 (例如 Tailwind 的 `tailwind.config.ts` 或 CSS Variables)。
