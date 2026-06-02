# 主題規劃 Reference 目錄

這個目錄是 `frontend-development` skill 的主題規劃與設計系統入口。當前端專案需要規劃品牌、設計系統、樣式 tokens、元件切分、裝置配置、初始化配置或既有專案對齊時，優先引用這份目錄文件，再依需求讀取下列子規範。

## 使用方式

在 prompt 或專案文件中引用：

```text
請依照 .agents/skills/frontend-development/references/theme-planning/README.md 的主題規劃規範執行。
如涉及樣式、元件、裝置、初始化或既有專案對齊，請同步遵守 README 中列出的相關 reference。
```

推薦讀取順序：

1. `README.md`
2. `design-system-practices.md`
3. 需要元件分層時讀 `component-composition-guidelines.md`
4. 需要裝置與斷點時讀 `responsive-device-configuration.md`
5. 完成前讀 `theme-planning-gap-checklist.md`

## 主題規劃範圍

主題規劃包含以下層次：

- 品牌與體驗：網站/產品定位、受眾、第一視窗品牌信號、視覺方向與禁用模式。
- 設計系統：foundations、primitive/semantic/component tokens、UI primitives、patterns、page templates 與輕量治理。
- 全域樣式系統：顏色、字體、間距、圓角、陰影、動效、component tokens 與 CSS variables。
- 元件與組件切分：page、layout、section、feature component、UI primitive、data adapter 的分層規則。
- 裝置與響應式配置：desktop、laptop、tablet、mobile、narrow mobile 的斷點、版型行為與 QA 尺寸。
- 資料與 CMS 對應：mock-first view model、API/service boundary、WordPress REST/ACF/CPT 欄位對應。
- 初始化與對齊：新專案配置、既有專案 inventory、drift 標記、prompt invariants。
- QA 與驗收：typecheck、build、schema validation、desktop/mobile screenshot、SEO/accessibility checks。

## Reference 索引

核心文件：

- `../theme-plan-configuration.md`：主題計劃總規範，定義 theme plan、theme config、style system、QA gates 的分工。
- `../global-style-system-configuration.md`：全域樣式系統設定，包含 Bootstrap 類型的 color system、style system、component tokens 與 CSS variables。
- `../project-initialization-and-alignment.md`：新專案初始化與既有專案對齊配置。
- `design-system-practices.md`：AI builder 優先的設計系統實踐，涵蓋 token-first、component contract、patterns、governance 與防漂移規則。
- `component-composition-guidelines.md`：元件、組件、section、layout 的切分規範。
- `responsive-device-configuration.md`：不同裝置、斷點、容器、互動與 QA 配置。
- `theme-planning-gap-checklist.md`：主題規劃常見不足與完成前檢查表。

## 建議專案產物

新專案或完整對齊後，專案內應具備：

```text
docs/
  frontend-project.config.json
  project-contract.md
  route-map.md
  theme-plan.md
  theme-plan.config.json
  style-system.config.json
  design-system.md
  component-contracts.md
  pattern-library.md
  responsive-config.md
  data-contract.md
  prompt-invariants.md
  qa-checklist.md
```

若專案較小，可先保留：

```text
docs/
  theme-plan.md
  style-system.config.json
  design-system.md
  component-contracts.md
  responsive-config.md
  prompt-invariants.md
```

## 分工原則

- `theme-plan.md` 負責「為什麼」與「看起來/感覺起來應該如何」。
- `theme-plan.config.json` 負責穩定、可驗證的主題決策。
- `style-system.config.json` 負責全域可重用樣式配置。
- `design-system.md` 負責 tokens、UI primitives、components、patterns、page templates 與治理狀態。
- `component-contracts.md` 負責元件如何拆、如何重用、有哪些 states。
- `pattern-library.md` 負責 Hero、FeatureGrid、EmptyState、ErrorState、DetailHeader 等跨頁組合。
- `responsive-config.md` 負責不同裝置下的 layout、density、navigation 與 QA 尺寸。
- `data-contract.md` 負責資料來源、view model、mock/API/CMS 邊界。
- `prompt-invariants.md` 負責後續 AI builder prompt 不能破壞的規則。

## Prompt Invariant

任何以此目錄為依據的 AI builder prompt 都應包含：

```text
主題規劃是本專案的設計與實作合約。
除非本次任務明確更新 theme plan 或 style system，否則不得改變既有品牌方向、全域 tokens、元件切分、裝置配置與資料邊界。
新增頁面、section、元件、pattern 或樣式前，先檢查是否能重用現有 tokens、UI primitives、feature components、patterns 與 responsive rules。
不得新增裸色碼、重做 Button/Card/Dialog/Input/Tabs，或產生不可追蹤的一次性樣式，除非本次任務明確更新設計系統並記錄理由。
```
