# 導覽選單 (Primary Navigation)

為相容 WordPress 內建選單行為，建立或修改主導覽列時，必須將階層結構（Hierarchy）視為一級需求：

- **多層架構支援**：模型需包含如 `label`、`href`、`children`、`isActive`、`external` 等穩定欄位。無論是哪種版本的實作，皆須支援至少兩層的子選單（如 WordPress 後台設定的下拉選單）；在內容結構需要且 UI 允許的情況下，應支援第三層。
- **元件模式**：Desktop 版應實作 dropdown、flyout 或 mega menu 模式；Mobile 版應實作 drawer、sheet 或 accordion 模式，並確保不依賴 hover 即可展開巢狀項目。
- **無障礙存取 (a11y)**：保留鍵盤與螢幕閱讀器行為：如 `aria-expanded`、`aria-controls`、focus-visible 狀態、Esc 關閉、點擊外部關閉以及可預期的 Tab 順序。
- **當前狀態標示**：讓當前頁面 (active) 及其父層級 (ancestor-active) 狀態保持可見，幫助使用者理解當前所處區塊。
- **極端情況處理**：定義長標籤、過多子項目或窄螢幕時的溢位與折行行為。
- **多語版本（Logo 回首頁）**：若前端有多國語版本，且導覽列含站點 logo／品牌連結，**logo 的 `href` 必須回到當前語言的首頁**，不可固定指向預設語言首頁（例如只連到 `/` 或預設 locale 的 `/en/`）。
  - 以 `GET /languages` 的 `current_locale` 與 `languages[]` 解析當前語言首頁路徑；切換語言後 logo 連結須同步更新。
  - 若多語採 URL prefix（如 `/zh-TW/`、`/en/`），logo 應使用**當前 prefix 下的根路徑**。
  - 單語站可沿用站點 canonical 首頁；有語言切換 UI 時，一律視為多語並遵守本規則。
