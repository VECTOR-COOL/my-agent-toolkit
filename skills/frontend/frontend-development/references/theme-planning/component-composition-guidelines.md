# 元件與組件切分規範

這份文件定義 前端專案中 page、layout、section、feature component、UI primitive、data adapter 的切分方式。目標是讓專案在多頁面、多 prompt、多資料來源擴充時仍能保持可維護。

## 基本原則

- 先切資料責任，再切視覺區塊。
- page 不應塞滿所有 UI 細節；page 負責 route-level composition、loader data、SEO 與主要 layout。
- section 是頁面內容的主要積木，應能接收明確 props 或 view model。
- feature component 負責一個可理解的功能或內容單元。
- UI primitive 應低耦合、無業務資料依賴。
- UI primitive 必須由 semantic tokens 或 component tokens 驅動，不接受 page-local 裸色碼與任意 spacing。
- patterns 應作為跨頁組合層，承接多個 primitives / feature components，避免 AI builder 每次重排 Hero、CardGrid、EmptyState。
- data adapter / mapper 應放在 service 或 data layer，不放在 visual component 裡。
- 新增抽象前，先確認它降低重複、穩定資料契約，或符合既有模式。

## 分層模型

建議採用以下層次：

```text
route/page
  layout
    section
      feature component
        UI primitive
  pattern / page template
  data loader / server function
  service / adapter
  view model / schema
```

## Route / Page

page 負責：

- route identity，例如 `/`, `/about`, `/services/$slug`, `/blog/$slug`。
- loader 或 server function 取得資料。
- 組合 layout 與 sections。
- 設定 SEO metadata、canonical、Open Graph。
- 處理 route-level loading、not found、error boundary。

page 不應負責：

- 大量裸 CSS class 決策。
- WordPress REST response 直接轉換成 UI。
- 重複出現的 card、list、CTA、media block 細節。
- 跨頁共用 navigation/footer 的內部實作。

## Layout

layout 負責：

- header、footer、sidebar、breadcrumb、main region。
- page shell、max width、section rhythm。
- desktop/mobile navigation 切換。
- route group 的共同結構。

layout 不應綁定單一 page 的內容資料。若 layout 需要站台設定，應接收 `siteSettings`、`navigation` 等穩定 view model。

## Section

section 是主題規劃最重要的可重用內容單位。常見 section：

- HeroSection
- FeatureGridSection
- ServiceListSection
- ArticleListSection
- TestimonialSection
- FaqSection
- CtaSection
- MediaTextSection
- ContactSection

section 應定義：

- purpose：這個 section 解決什麼頁面需求。
- data props：需要哪些 view model 欄位。
- layout variants：例如 `media-left`、`media-right`、`compact`、`featured`。
- token usage：使用哪些 semantic 或 component tokens。
- empty/loading/error 行為。
- responsive behavior：mobile 是否改成單欄、媒體是否置頂、CTA 是否固定位置。
- SEO/accessibility 注意事項，例如 heading level、alt text、list semantics。

section 不應：

- 直接 fetch API。
- 直接依賴 WordPress 原始 response。
- 在內部新增任意色碼與 spacing。
- 為單一頁面硬寫不可重用的 layout，除非明確標為 one-off。

## Feature Component

feature component 負責一個功能或內容單元，例如：

- ServiceCard
- ArticleCard
- PricingTable
- SearchFilters
- InquiryForm
- ProductGallery
- LocationMap

feature component 可以知道業務語意，但仍應接收 normalized props，而不是 CMS 原始資料。

應定義：

- props interface。
- variants，使用穩定名稱例如 `default`、`compact`、`featured`、`interactive`，不要用視覺形容詞當唯一命名。
- states，至少定義 default、hover、focus-visible、disabled/loading 或 empty/error 中適用者。
- token usage。
- action behavior。
- tracking/analytics hook 是否需要。
- accessibility behavior。

## UI Primitive

UI primitive 是最底層重用元件，例如：

- Button
- Input
- Select
- Checkbox
- Tabs
- Dialog
- Badge
- Card
- Table
- Tooltip

UI primitive 應：

- 使用 semantic tokens。
- 使用 component tokens 表達 variants 與 states，例如 `button.primary.bg`、`card.interactive.shadow`。
- 支援 focus-visible、disabled、loading、invalid 等狀態。
- 不依賴業務資料。
- 不決定 page-level spacing。
- 不包含 API 呼叫。

## Pattern

pattern 是跨頁可重用的組合，例如：

- Hero
- FeatureGrid
- MediaText
- DetailHeader
- FilterableList
- EmptyState
- ErrorState

pattern 應定義：

- allowed components。
- content slots。
- layout variants。
- token usage。
- responsive behavior。
- loading、empty、error、not-found 等狀態。
- forbidden shortcuts，例如不得巢狀卡片、不得新增 one-off gradient。

pattern 不應直接 fetch API，也不應取代 page template 的 route-level SEO 或資料責任。

## Data Adapter / Mapper

資料轉換應放在 service/data layer：

```text
WordPress REST response
  -> adapter / mapper
  -> normalized view model
  -> section / component props
```

不要讓 UI component 直接理解：

- `_embedded`
- ACF 原始欄位
- Yoast SEO 原始欄位
- WordPress media response 細節
- API pagination headers

## 命名規則

建議命名：

- Route page：`HomePage`、`ServicesPage`、`PostDetailPage`
- Layout：`SiteLayout`、`MarketingLayout`、`DashboardLayout`
- Section：`HeroSection`、`FeaturedPostsSection`
- Feature：`ArticleCard`、`ServiceCard`、`InquiryForm`
- Primitive：`Button`、`Input`、`Dialog`
- Adapter：`mapWpPostToPostViewModel`
- View model：`PostViewModel`、`SiteSettingsViewModel`

## Component Contract 範本

```md
## Component: ServiceCard

Purpose:
Show one service summary and route users to detail or inquiry flow.

Layer:
Feature component

Props:
- title: string
- excerpt: string
- image?: MediaViewModel
- href: string
- tags?: string[]

Variants:
- default
- compact
- featured

States:
- default
- hover
- loading
- empty image fallback

Responsive:
- desktop: image top, fixed aspect ratio
- tablet: keep card grid 2 columns when width allows
- mobile: single column, image remains visible, CTA does not wrap awkwardly

Style:
- use card token
- no local color hex
- no nested card
- no arbitrary radius, shadow, or spacing outside tokens

Accessibility:
- card title is heading only when section hierarchy allows
- image alt from view model
```

## 切分判斷

新增 component 前先判斷：

- 是否跨兩個以上頁面會重用？
- 是否代表一個穩定業務概念？
- 是否有獨立 variants 或 states？
- 是否能使用既有 token、primitive、feature component 或 pattern 組合？
- 是否能接收 normalized view model？
- 是否需要被 CMS section registry 或 route map 引用？

如果答案多數為否，先保留在 section 內，不要過早抽象。

## 常見錯誤

- page 檔案過大，包含所有卡片、表單、清單與資料轉換。
- card component 同時負責 fetch、map、render。
- section 直接吃 WordPress response。
- UI primitive 裡寫業務邏輯。
- 每個頁面都有自己的 Button、Card、Badge 樣式。
- component variant 沒有文件，導致下一次 AI builder prompt 重做一套。
- component 使用裸色碼、任意 shadow、任意 spacing，繞過設計系統 tokens。
- pattern 未定義，導致每次新增頁面都重新生成 Hero、列表、empty state。
- desktop 視覺正常，但 mobile 沒有定義切換行為。
