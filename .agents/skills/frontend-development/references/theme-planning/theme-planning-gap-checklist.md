# 主題規劃不足檢查表

這份檢查表用來判斷一個 前端專案的主題規劃是否足夠完整。若任一項缺失，後續 prompt 容易造成視覺漂移、元件重複、響應式破版或資料邊界混亂。

## 必要文件

至少應有：

- `theme-plan.md`
- `theme-plan.config.json`
- `style-system.config.json`
- `design-system.md`
- `component-contracts.md`
- `pattern-library.md`
- `responsive-config.md`
- `data-contract.md`
- `prompt-invariants.md`
- `qa-checklist.md`

新專案或既有專案對齊時，還應有：

- `frontend-project.config.json`
- `project-contract.md`
- `route-map.md`

WordPress Headless 專案還應有：

- `wordpress-field-map.md`
- `wordpress-rest-endpoints.md`
- `cms-editorial-policy.md`

## 主題與品牌

檢查：

- 是否定義品牌/產品/網站名稱與類型？
- 第一視窗是否有明確品牌信號？
- 是否定義受眾與主要工作流？
- 是否定義禁用視覺模式，例如 generic SaaS hero、單一色系、裝飾性光球、巢狀卡片？
- 是否定義媒體策略，尤其是真實產品/場域/人物圖的要求？

不足時補：

- `identity`
- `experience`
- `media_policy`
- `forbidden_patterns`

## 全域樣式系統

檢查：

- 是否有 semantic color roles，而不是散落裸色碼？
- 是否定義 typography roles，而不是只指定字體名稱？
- 是否有 spacing scale、radius、shadow、motion？
- 是否有 button、input、card、badge、tabs、dialog、navigation 等 component tokens？
- CSS variables 是否是全域來源？
- Tailwind utility 是否接到 semantic tokens？

不足時補：

- `style-system.config.json`
- `src/styles/tokens.css`
- `design-tokens.md`

## 設計系統成熟度

檢查：

- 是否定義 foundations、primitive tokens、semantic tokens、component tokens、UI primitives、patterns、page templates？
- 是否有 component inventory，能列出 Button、Input、Card、Dialog、Navigation、Table、Tabs、Badge 的 owner、status、variants、states？
- token 是否支援需要的 modes，例如 light/dark、brand、density 或 platform，而不是只用一套硬寫樣式？
- component variants 是否可由 tokens 驅動，而不是靠 page-level override？
- states 是否涵蓋 default、hover、active、focus-visible、disabled、loading、empty、error、invalid、not-found？
- Figma Variables、Storybook、component docs 或 code tokens 若存在，是否與文件命名一致？
- 是否有 deprecated component 的 replacement，避免 AI builder 繼續使用舊元件？

不足時補：

- `design-system.md`
- token hierarchy
- component inventory
- pattern library
- adoption checklist
- deprecation notes

## 元件與組件切分

檢查：

- page 是否只負責 route composition、loader、SEO 與 layout？
- section 是否有明確 props、variants、responsive behavior？
- feature component 是否接收 normalized view model？
- UI primitive 是否不含業務邏輯？
- data mapper 是否不在 UI component 裡？
- component states 是否包含 loading、empty、error、disabled、focus-visible？
- 是否有命名規則？

不足時補：

- `component-contracts.md`
- section registry
- view model schema
- adapter/mapper 規範

## 不同裝置配置

檢查：

- 是否定義 narrow mobile、mobile、tablet、laptop、desktop、wide？
- 是否定義各裝置的 navigation？
- 是否定義 section 在 mobile/tablet/desktop 的 layout 行為？
- 是否定義 card grid、table、form、media 的 responsive rule？
- 是否有 QA viewport 尺寸？
- 是否檢查文字溢出、重疊、按鈕壓縮、圖片裁切？

不足時補：

- `responsive-config.md`
- section responsive contract
- component responsive contract
- screenshot QA checklist

## 資料與 CMS

檢查：

- 是否採用 mock-first 或 inventory-first？
- 是否有 view model，而不是 UI 直接吃 API/CMS response？
- 是否定義 service layer 目錄？
- WordPress REST、ACF、CPT、media、Yoast SEO 欄位是否有 mapping？
- route loader 需要的資料是否可被 SSR 看見？
- fallback、404、empty state 是否定義？

不足時補：

- `data-contract.md`
- `wordpress-field-map.md`
- `wordpress-rest-endpoints.md`
- normalized TypeScript types
- fixture schema

## SEO 與 Accessibility

檢查：

- 每個 route 是否有 title、description、canonical、OG image？
- heading hierarchy 是否定義？
- 圖片 alt text 是否由 view model 提供？
- focus-visible、keyboard navigation、dialog trap 是否定義？
- contrast 是否符合至少 WCAG AA？
- 互動元件是否有 loading/disabled/invalid state？

不足時補：

- route SEO contract
- accessibility checklist
- component state contract

## Prompt 與維護

檢查：

- 是否有 `prompt-invariants.md`？
- 後續 AI builder prompt 是否知道不能重新設計？
- 新增 token、section、component 前是否要求說明理由？
- AI builder 是否被禁止新增裸值、重做 primitives、產生巢狀卡片或建立不可追蹤的一次性樣式？
- 新頁面是否先嘗試用既有 tokens、components、patterns、responsive rules 組合？
- 既有專案是否先 inventory 再對齊？
- migration、CMS integration、SEO sitemap、deployment 是否被明確列為 scope 或 non-goal？

不足時補：

- prompt invariants
- AI builder forbidden shortcuts
- non-goals
- staged prompts
- drift report

## 完成標準

只有在以下條件都成立時，才能說主題規劃完成：

- 主題方向、全域樣式、元件切分、裝置配置、資料邊界、QA gate 都有文件或設定檔。
- 新增頁面時，可以從既有 tokens、components、patterns、responsive rules、layout、section 與 data contract 組合。
- 後續 AI builder prompt 有明確 invariants，不會意外重設計。
- 裸色碼、重複 primitives、未定義 variants、未記錄的一次性樣式都有檢查方法。
- desktop 與 mobile 的視覺檢查標準已定義。
- WordPress/API/CMS 邊界已定義或明確標為 non-goal。
