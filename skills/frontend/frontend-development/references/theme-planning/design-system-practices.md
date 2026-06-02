# 設計系統實踐規範

這份文件用於把 theme planning 轉成可被 AI builder、coding agent 與人工工程師穩定重用的設計系統規範。目標不是建立大型企業流程，而是讓 Lovable、v0、Replit、Cursor 或本機 React/TypeScript 專案在多次生成後仍維持同一套 tokens、元件、版型與互動狀態。

## 使用時機

當任務涉及下列內容時，先讀此文件：

- 建立或更新 `theme-plan.md`、`style-system.config.json`、`component-contracts.md`。
- 將品牌方向轉成 CSS variables、Tailwind tokens、Figma Variables 或 design tokens。
- 讓 AI builder 新增頁面、section、元件或樣式，但必須避免視覺漂移。
- 盤點既有 UI library、shadcn/ui、Radix、Material UI、Bootstrap、Polaris、Fluent、Carbon 或自製元件。
- 定義 Button、Card、Dialog、Form、Navigation、Table、Tabs、Badge 等共用元件的 variants 與 states。

## 設計系統層次

設計系統應由下往上定義，不要從單一頁面的視覺開始硬推全站樣式。

```text
foundations
  -> primitive tokens
  -> semantic tokens
  -> component tokens
  -> UI primitives
  -> feature components
  -> patterns
  -> page templates
  -> content/data states
```

- **Foundations**：品牌、語氣、資訊密度、accessibility baseline、媒體策略、禁用視覺模式。
- **Primitive tokens**：原始值，例如 color scale、font family、font size、spacing、radius、shadow、motion duration。
- **Semantic tokens**：用途命名，例如 `surface-page`、`surface-card`、`text-primary`、`border-muted`、`action-primary-bg`。
- **Component tokens**：元件專用命名，例如 `button.primary.bg`、`card.radius`、`dialog.shadow`、`input.border.invalid`。
- **UI primitives**：Button、Input、Select、Checkbox、Tabs、Dialog、Tooltip、Badge、Card、Table。
- **Feature components**：ArticleCard、PricingTable、SearchFilters、ProductGallery、InquiryForm。
- **Patterns**：Hero、FeatureGrid、MediaText、DetailHeader、FilterableList、EmptyState、ErrorState。
- **Page templates**：Marketing page、CMS article detail、dashboard list、settings page、checkout flow。
- **Content/data states**：loading、empty、error、not found、permission denied、missing media、long text、localized text。

## Token-First 規則

每個專案應先決定 token 來源，再讓 AI builder 生成樣式。

- 優先使用既有 CSS variables、Tailwind theme、component library tokens 或 Figma Variables。
- 若尚無 tokens，先建立 primitive、semantic、component 三層，不要只建立一串品牌色。
- Semantic tokens 是 UI 的主要使用介面；page 與 component 不應直接使用 primitive color scale。
- Component tokens 只在元件需要穩定 variants 或 states 時建立，不要為每個 one-off section 新增 token。
- 支援 modes 時，至少明確列出 `light`、`dark`、`brand`、`density` 或 `platform` 哪些是本專案真的需要。
- 將 raw values 集中在 token 檔或 theme config；component 中不得散落裸色碼、任意 spacing、任意 shadow。

建議 token contract：

```json
{
  "tokenLayers": {
    "primitive": ["color.neutral.0", "color.brand.600", "space.4", "radius.2"],
    "semantic": ["surface.page", "surface.card", "text.primary", "border.default"],
    "component": ["button.primary.bg", "input.border.invalid", "card.shadow"]
  },
  "modes": ["light", "dark"],
  "rules": [
    "components use semantic or component tokens",
    "raw hex values only exist in primitive tokens",
    "new tokens require a named use case"
  ]
}
```

## AI Builder 不可破壞規則

交給 AI builder 的 prompt 必須明確限制：

- 不得新增裸色碼、任意 `box-shadow`、任意 `border-radius` 或未命名 spacing。
- 不得重做既有 Button、Input、Card、Dialog、Tabs、Badge、Navigation。
- 不得把 UI primitive 複製成 feature-local 版本。
- 不得用 page-level CSS 覆蓋 component tokens，除非本次任務明確更新設計系統。
- 不得新增巢狀卡片、單一色系頁面、裝飾性光球、不可追蹤的一次性 gradient。
- 不得移除 focus-visible、disabled、loading、invalid、empty、error、not-found states。
- 新增 component 前必須先說明為何不能用既有 primitive、feature component 或 pattern 組合。

可直接放入 prompt：

```text
請先重用現有 design system tokens、UI primitives、feature components 與 patterns。
除非本次任務明確要求更新設計系統，否則不得新增裸色碼、重做 Button/Card/Dialog/Input/Tabs，也不得改全域 tokens。
若需要新增 token、variant、component 或 pattern，請在變更中標示用途、states、responsive behavior 與 adoption 位置。
```

## Component Contract

每個可重用 component 或 pattern 應具備同一份 contract，讓 AI builder 後續擴充時不重新發明。

```md
## Component: Button

Layer:
UI primitive

Purpose:
Trigger primary, secondary, destructive, or quiet actions.

Props:
- variant: primary | secondary | ghost | destructive
- size: sm | md | lg | icon
- disabled?: boolean
- loading?: boolean

States:
- default
- hover
- active
- focus-visible
- disabled
- loading

Token Usage:
- background: button.{variant}.bg
- text: button.{variant}.text
- border: button.{variant}.border
- radius: control.radius

Responsive:
- minimum touch target 44px on touch devices
- icon-only button requires accessible label

Accessibility:
- keyboard reachable
- visible focus state
- loading state keeps button width stable

Forbidden:
- no local hex values
- no page-specific padding overrides
```

## Patterns 與 Page Templates

設計系統不只包含元件，還要定義常見組合，降低 AI builder 每次重排版面的機率。

- **Pattern**：可跨頁重用的 section 或 flow，例如 Hero、MediaText、FeatureGrid、ArticleList、EmptyState、ErrorState。
- **Page template**：完整 route 類型，例如 marketing landing、CMS detail、dashboard list、settings form。
- Pattern 應定義 allowed components、layout variants、content slots、responsive behavior、states 與 forbidden shortcuts。
- Page template 應定義 route purpose、section order、SEO needs、data source、error/not-found behavior 與 QA viewport。

範例：

```md
## Pattern: EmptyState

Use for:
No search results, no CMS items, unavailable optional data.

Allowed components:
Icon, heading, description, primary action, secondary action.

Tokens:
surface.empty, text.muted, action.secondary.bg

States:
empty, permission-empty, filtered-empty

Forbidden:
Do not render as a decorative marketing card inside another card.
```

## 輕量治理

小型專案也需要最低治理，否則 AI builder 很快會讓樣式分裂。

- 每個 token、component、pattern 應有 `status`：`draft`、`ready`、`deprecated`。
- 每個新增項目要有 owner 或來源，例如 `design-system`、`feature:posts`、`migration`。
- 新增或修改 token 時要記錄 change rationale，不接受「看起來比較好」這種無法驗證的理由。
- Deprecated component 要標示 replacement，不要只刪文件。
- 新增頁面前先做 adoption check：能否用既有 tokens、components、patterns、responsive rules 組出來。

建議治理欄位：

```json
{
  "name": "Card",
  "layer": "UI primitive",
  "status": "ready",
  "owner": "design-system",
  "version": "1.0",
  "variants": ["default", "interactive", "media"],
  "deprecatedBy": null,
  "changeRationale": "Shared container for repeated item summaries"
}
```

## 文件與驗收

Storybook、Figma Variables、token build pipeline 或 visual regression tools 都是建議工具，不是每個專案的硬性要求。若專案已有這些工具，設計系統規範要對齊；若沒有，至少保留 markdown/config 形式的 contract。

最低驗收：

- 新增頁面可由既有 tokens、components、patterns、responsive rules 組合。
- `rg` 找不到新增的裸色碼、重複 Button/Card/Dialog/Input 類元件，除非有明確變更理由。
- 主要元件包含 default、hover、active、focus-visible、disabled、loading、empty/error 或 invalid states。
- mobile、desktop 至少各一個 viewport 檢查，確認文字不溢出、互動可操作、media 不破版。
- AI builder prompt 有明確 invariants，後續任務不會重設計全站。

## 主流實踐參考

- DTCG design tokens：將 tokens 當成跨工具、跨平台交換格式，參考 `https://www.designtokens.org/`。
- Figma design tokens / Variables：用 modes 管理 light/dark、brand、density 等設計變體，參考 `https://www.figma.com/resource-library/design-tokens/`。
- Storybook：用元件目錄、docs、interaction tests 或 visual tests 驗證 component contract，參考 `https://storybook.js.org/`。
- Atlassian Design System：將 design system context 變成 AI 可讀的工作邊界，參考 `https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era`。
- Fluent 2：以 token 與 theme 分層維持跨平台一致性，參考 `https://fluent2.microsoft.design/design-tokens`。
