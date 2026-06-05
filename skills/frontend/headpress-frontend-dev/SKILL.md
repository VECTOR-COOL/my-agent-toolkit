---
name: headpress-frontend-dev
version: "1.2.1"
description: HeadPress WordPress Headless Theme 前端 UI 開發協作 Skill。用於規劃或修改 HeadPress 驅動的前端 routes、layouts、components、SSR/pre-render、SEO metadata；優先消費 Composition API（namespace headpress/api/v1）；僅在 HeadPress 無法提供所需資料時才於 service layer 使用 /wp/v2/；對齊 openapi.json schema、normalized view model、mock-to-api 遷移、service-layer 邊界、環境變數與錯誤處理；撰寫 Lovable、v0、Replit、Cursor 等 AI builder prompt；debug hydration、CORS、auth、404、空資料與媒體 fallback。搭配 wordpress-rest-api-development 或 wordpress-plugin-theme-development 處理 schema 與主題後端。
---

# HeadPress Frontend UI DEV Skill

[![version](https://img.shields.io/badge/version-1.2.1-blue)]()

本 skill 是 **HeadPress WordPress Headless Theme 前端 UI 開發** 的 canonical 協作規則檔。所有 AI builder、coding agent 與人工開發者在操作使用 HeadPress 主題的前端（Lovable、v0、Replit、Cursor 或任何 React/TypeScript repo）時，**必須優先載入此 skill**。

---

## 架構速覽


| 層級              | 範例網域                       | 技術                               | 職責                                                        |
| ------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| 前端              | `example.com`                  | Lovable / v0 / Replit / 自架 React | UI、路由、SSR/SSG/pre-render、SEO HTML/meta、sitemap/robots |
| 後端（HeadPress） | `example.com`（CMS 所在 host） | WordPress + HeadPress Theme        | 內容模型、媒體、REST 欄位、Composition API                  |

**前端主要資料來源**：`https://example.com/wp-json/headpress/api/v1/`（HeadPress Composition API，REST namespace：`headpress/api/v1`）。

**API 優先順序**（必守）：

1. **優先** HeadPress Composition API（`/headpress/api/v1/*`）；欄位與 endpoint 以 `openapi.json` 為準。
2. **僅當** HeadPress 無對應 endpoint、或 openapi 未涵蓋且短期無法補後端時，才在 **service layer** 透過獨立 `wpClient` 呼叫 `/wp/v2/*`。
3. **Component / route** 不得直接 `fetch` CMS URL；一律經 `headpressClient`（主）或 service 內封裝的 `wpClient`（備援）。
4. 新需求應優先擴充 HeadPress API／openapi，不以永久 WP 直連取代 Composition API。

---

## 載入順序

1. **先讀本檔案（SKILL.md）完整內容**。
2. 讀 `references/index.md`，確認當前任務對應哪個 reference。
3. **只載入** 當前任務需要的 reference；不要一次載入所有 scene docs。
4. 若任務涉及 WordPress raw schema、TypeScript 型別、service layer 或 mock fixture 細節，同時載入 `.agents/skills/wordpress-rest-api-development`。
5. 若任務涉及 WordPress 主題邏輯、REST endpoint 實作或後台設定，同時載入 `.agents/skills/wordpress-plugin-theme-development`。

---

## 如何對齊 Schema（必讀）

### Step 1 — 查 OpenAPI Spec（Single Source of Truth）

HeadPress API schema 的 **唯一 canonical 來源** 是：

```
themes/headpress/docs/prd/openapi.json
```

**Runtime 可取得的 schema**（WordPress 啟動後）：

```
GET https://example.com/wp-json/headpress/api/v1/openapi.json
```

**Swagger UI 本機瀏覽**（請由人類操作）：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/open-api-ui.ps1 open
# 開啟後瀏覽：http://127.0.0.1:8765/tools/swagger-ui/index.html
# 可加 -CmsUrl http://你的本機WP網址 讓 Try it out 指向本機
```

> **AI Builder 注意**：使用任何欄位或 endpoint 前，**必須先在 openapi.json 中確認其存在**。未列入的 endpoint 代表尚未實作或已廢棄，不得假設可用。

---

### Step 2 — 確認 Composition API Endpoints

前端 **優先** 消費以下 endpoints（完整 schema 在 `openapi.json`；路徑相對於 `wp-json/headpress/api/v1`）：

```
# 主流程（優先）
GET /site
GET /route
GET /route/{path}         # 例：/route/about、/route/blog/my-post、/route/category/news
GET /route?path=/about/team  # SDK / OpenAPI fallback

# 進階補充
GET /collection
GET /search
GET /sitemap
GET /taxonomies
GET /taxonomy/{taxonomy}
GET /media/{id}
GET /openapi.json
GET /manifest
GET /health

# supported alternatives（既有整合可用，新整合優先 /route）
GET /front-page
GET /page
GET /page/{path}
```

**Service Boundary 流程**：

```
route loader / server function
  → headpressClient（主：/headpress/api/v1/）
  → [必要時] wpClient（備：/wp/v2/*，僅 service layer）
  → mapper → normalized view model
  → UI components
```

前端以 **headpressClient** 為主（base URL 指向 `/headpress/api/v1/`）；WP 原生 API 僅作 service-layer 備援，且須與 UI 隔離。

---

### Step 3 — 對齊回應欄位

Composition API 的 `entity`、`items`、media、taxonomy 欄位**保留 WordPress REST conventions**；頁面級 SEO 在頂層 `seo`（見 openapi.json）。

欄位對齊規則（mapper 必須遵守）：


| WordPress 欄位 | 正確寫法                                      | 錯誤寫法                |
| ---------------- | ----------------------------------------------- | ------------------------- |
| 文章標題       | `title.rendered`                              | `title`（字串）         |
| 文章內容       | `content.rendered`                            | `content`               |
| 文章摘要       | `excerpt.rendered`                            | `excerpt`               |
| 特色圖 ID      | `featured_media`                              | `featured_image_id`     |
| 特色圖 URL     | `_embedded["wp:featuredmedia"][0].source_url` | 自行拼接 URL            |
| 分類/標籤      | `_embedded["wp:term"]`                        | `categories`（ID 陣列） |
| SEO meta       | `yoast_head_json`（若 Yoast 可用）            | 自行推測 meta           |

---

### Step 4 — 查閱補充文件


| 任務                       | 查閱路徑                                                    |
| ---------------------------- | ------------------------------------------------------------- |
| API 整體設計與 PRD         | `themes/headpress/docs/prd/混合型HeadlessAPI架構PRD.md`     |
| PHP OOP 骨架與型別規範     | `themes/headpress/docs/prd/PHP-OOP骨架與型別規範.md`        |
| API 一致化計畫             | `themes/headpress/docs/prd/API一致化參考與逐檔計畫.md`      |
| WP 欄位保留條件            | `themes/headpress/docs/prd/WP欄位保留與顯示條件PRD.md`      |
| Deprecation 政策           | `themes/headpress/docs/standards/deprecation-policy.md`     |
| 前端整合 CORS/Auth 文件    | 參見部署 repo 的`docs/` 或 CMS repo 的整合說明              |
| WordPress REST 詳細 schema | `.agents/skills/wordpress-rest-api-development`             |
| 主題邏輯與後台設定         | `.agents/skills/wordpress-plugin-theme-development`         |
| 前端 reference 快速索引    | `.agents/skills/headpress-frontend-dev/references/index.md` |

---

## 環境變數對齊

HeadPress 前端整合使用以下環境變數命名慣例（以 `example.com` 為示範，實際替換為部署網域）：

```bash
# 前端 .env（Lovable / Vite / Next.js 等）
VITE_SITE_URL=https://example.com
VITE_WP_API_URL=https://example.com/wp-json/headpress/api/v1
VITE_DATA_SOURCE=mock|api
```

後端（CMS repo / HeadPress 主題）使用固定變數名：

```bash
WP_API_BASE
WP_API_USER
WP_API_APP_PASSWORD
```

後端 REST 驗證腳本（需人類執行）：

```bash
node scripts/wp-rest-check.mjs
```

> Server-only secrets 不得使用 `VITE_` prefix（或任何其他框架的 browser-exposed prefix）。

---

## 使用時機

在下列情境使用本 skill：

- 規劃或修改使用 HeadPress 的前端頁面架構、routes、layouts、components。
- 將 mock data 改成 `/headpress/api/v1/` API，或建立 HeadPress-shaped mock 穩定 UI。
- 定義 Composition API response 的 TypeScript 型別或 normalized view model。
- 處理 SSR、SSG、pre-render、SEO metadata、canonical、Open Graph。
- 設計或修補 API error、timeout、CORS、auth、not found、empty data、fallback media。
- 檢查 AI builder 或 coding agent 產出是否破壞既有架構。
- 撰寫給 Lovable、v0、Replit、Cursor 等 AI builder 使用的 prompt 或分工規則。
- Debug hydration mismatch、API fallback、空資料、圖片缺失、路由 404。
- 需要確認 `/headpress/api/v1/` endpoint 的 response schema。

---

## 核心原則

- **Schema 先查 openapi.json**：任何前端欄位對齊，先讀 `themes/headpress/docs/prd/openapi.json`；不得猜測或假設 response 形狀。
- **HeadPress 優先**：主 client 指向 `/headpress/api/v1/`；`/wp/v2/` 僅在 service layer 作備援，component 不得直連。
- **保留現有 stack**：先辨識 active repo 實際使用的 framework、router、rendering mode；除非明確要求，不替換 stack。
- **先穩 UI，再串 API**：開發階段使用 mock 或 fixture 讓畫面穩定；正式 API 只透過 service layer 切換。
- **資料層與畫面分離**：routes / components 只吃 normalized view model；WordPress 原始 response、ACF 巢狀資料、fallback 邏輯放在 service / mapper。
- **SSR/SEO 依平台能力落地**：需要 SEO 的內容應在 server render 或平台支援的 pre-render 流程取得；不要只靠 client effect 補主要內容。
- **型別先行**：所有 Composition API response、normalized model、route loader 回傳值都要有 TypeScript 型別或對應 openapi.json schema。
- **可缺資料設計**：WordPress 後台資料常缺圖、缺 excerpt、欄位為 null；UI 與 mapper 必須有 fallback。
- **錯誤處理前置**：API error、timeout、CORS、not found、rate limit 都在 service/mapper 正規化，再交給 UI 呈現。
- **AI builder 只改可控範圍**：交給 AI builder 產出 UI 時，必須明確指定不可改 data services、routing contract、env schema、SEO utilities 與 shared types。

---

## 高風險禁止事項

除非使用者明確要求，避免做下列變更：

- 不要讓 component 直接呼叫 `/wp/v2/` 或任何 CMS URL（只能透過 headpressClient 或 service 內封裝的 wpClient）。
- 不要在 component 直接引入 mock fixture 或假設欄位形狀。
- 不要把 WordPress REST response 型別直接傳進深層 UI component（必須過 mapper）。
- 不要移除 mock data；mock 是 UI regression 與 API 故障時的安全網。
- 不要重建整個專案、替換 router、替換 framework 或大幅改 lockfile。
- 不要把 SSR/SSG/pre-render 能力改成 CSR-only（除非專案明確無 SEO 要求）。
- 不要 hardcode CMS 網域、production/staging 網域或圖片 URL。
- 不要為了通過 build 關掉 TypeScript、ESLint、SSR/SSG 或錯誤處理。
- 不要讓 AI builder 或 agent 修改 `.env`、secret、auth token 或 WordPress application password。
- 不要使用已廢棄的 endpoint；以 `openapi.json` 為準，未列入的路徑一律先確認。

---

## WordPress REST API 常見爆點

- ACF 欄位不存在或外掛未開啟 REST expose → mapper 要有 fallback，不要讓 UI 崩潰。
- `_embedded` 沒有被 include → featured image 或 author 缺失，mapper 要判斷並給 fallback。
- pagination header 沒有被處理 → 列表頁只顯示第一頁，fetcher 要讀 `X-WP-Total`。
- draft/private content 在未登入 REST 請求中不可見 → 不要讓 UI 空白，要有 notFound 狀態。
- CORS、Application Password 在本機與部署環境行為不同 → 確認部署平台的 CORS 設定文件。
- media URL 指向 CMS 網域（`example.com`）→ 部署後確認前端平台的 image domain allowlist（若前端與 CMS 不同網域時尤需注意）。
- HTML content 需要 sanitization → 不能直接信任後台輸入，不可裸露 `dangerouslySetInnerHTML`。

---

## 錯誤處理規則

- fetcher 要處理 HTTP status、timeout、network failure、invalid JSON、CORS/auth 失敗、rate limit、WordPress maintenance/500，以及 REST error response body。
- service layer 要把錯誤正規化成 typed result，例如 `error`、`notFound`、`unauthorized`、`forbidden`、`rateLimited`、`timeout`、`unavailable`。
- mapper 要處理 `null`、缺欄位、空陣列、缺 `_embedded`、缺 featured media、unpublished/private item。
- dynamic route 找不到內容時要回傳框架支援的 404/not-found，不要渲染空白 detail page。
- API 失敗時 fallback 到 mock **僅限** 開發環境且明確標示 degraded state；production 不可靜默替換。
- error UI 要保留 app shell、導覽與可恢復操作；不可整頁 blank，也不可洩漏錯誤細節或 secret。

---

## 導覽選單 (Primary Navigation)

為相容 WordPress 內建選單行為，建立或修改主導覽列時，必須將階層結構（Hierarchy）視為一級需求：

- **多層架構支援**：模型需包含如 `label`、`href`、`children`、`isActive`、`external` 等穩定欄位。無論是哪種版本的實作，皆須支援至少兩層的子選單（如 WordPress 後台設定的下拉選單）；在內容結構需要且 UI 允許的情況下，應支援第三層。
- **元件模式**：Desktop 版應實作 dropdown、flyout 或 mega menu 模式；Mobile 版應實作 drawer、sheet 或 accordion 模式，並確保不依賴 hover 即可展開巢狀項目。
- **無障礙存取 (a11y)**：保留鍵盤與螢幕閱讀器行為：如 `aria-expanded`、`aria-controls`、focus-visible 狀態、Esc 關閉、點擊外部關閉以及可預期的 Tab 順序。
- **當前狀態標示**：讓當前頁面 (active) 及其父層級 (ancestor-active) 狀態保持可見，幫助使用者理解當前所處區塊。
- **極端情況處理**：定義長標籤、過多子項目或窄螢幕時的溢位與折行行為。

---

## 建議目錄邊界（前端 repo）

依現有 repo 為準；若尚未建立，可採用：

```
src/routes/           # framework routes、loader、page shell
src/components/       # 純 UI components，不直接知道 WordPress REST response
src/features/         # 大型頁面或領域功能（posts、cases、products、home）
src/services/         # headpressClient、wpClient（備援）、fetch、cache、錯誤處理
  └── headpressClient.ts  # 主 API client，指向 /headpress/api/v1/
src/mappers/          # Composition API response → normalized view model
src/types/            # WordPress raw types、normalized types、route data types
src/data/mock/        # mock fixtures（資料形狀貼近 /headpress/api/v1/ response）
src/config/           # env parsing、site config、API endpoints
docs/                 # 交接文件、AI-builder prompts、WordPress 欄位規格
```

---

## Prompt 撰寫格式（交給 AI Builder）

交給 AI builder 的 prompt 建議包含：

- **專案階段**：UI mock、API migration、SEO hardening、production readiness。
- **平台與 stack**：Lovable TanStack Start、v0 Next.js、Replit、或 active repo 實際架構。
- **資料來源**：`/headpress/api/v1/` Composition API（優先）；schema 見 `themes/headpress/docs/prd/openapi.json`。
- **可改範圍**：指定 files / routes / components。
- **不可改範圍**：headpressClient、mapper、env、routing contract、全域樣式、SEO utilities。
- **驗收條件**：desktop/mobile、loading/empty/error、SSR/SEO 或 static HTML、typecheck。

**範例 prompt**：

```text
請只修改 src/routes/news.tsx 與 src/features/news/* 的 UI 呈現。
資料來源為 /headpress/api/v1/collection?type=post（優先 HeadPress API），schema 見 openapi.json。
headpressClient、mapper、env 設定不可修改。
component 必須使用既有 normalized NewsCardModel。
請保留 loading、empty、error 狀態，並確保缺 featuredImage 時使用 fallback。
完成後需通過 typecheck，mobile 版不可文字重疊或卡片溢出。
```

---

## 實作檢查表

**修改前**：

- [ ] 確認任務屬於 UI、資料、SEO、部署或協作哪一類。
- [ ] 讀取 `openapi.json` 確認相關 endpoint 的 response schema。
- [ ] 讀取現有目錄與資料流，不假設專案一定有標準目錄。
- [ ] 找到資料來源開關、API endpoint、mock fixtures、route loader/server function、SEO utilities。
- [ ] 確認辨識目前平台：Lovable、v0、Replit、自架 Vite/Next/TanStack、或其他。

**修改中**：

- [ ] 優先沿用既有 patterns，不重建整個架構。
- [ ] 讓 component 接 normalized props，不接 raw WordPress response。
- [ ] 對 null、undefined、空陣列、缺圖、缺 slug、API error 寫清楚 fallback。
- [ ] 避免在 SSR/static path 使用 `window`、`document`、`localStorage`、`location`（無 client guard）。
- [ ] 避免把 WordPress HTML 直接丟進 DOM；若必須使用，確認 sanitizer 或明確信任邊界。
- [ ] 新增 env 時同步更新 env example、config parser 與文件。

**修改後**：

- [ ] 執行 typecheck、lint、build 或專案既有測試；若無法執行要說明原因。
- [ ] 若改 UI，使用本機瀏覽器檢查 desktop/mobile 主要畫面。
- [ ] 若改資料層，測試 mock source 與 WordPress source 至少各一個成功路徑與錯誤/空資料路徑。
- [ ] 若改 SEO，檢查 SSR/static HTML 或 metadata 產出，不只看 client 畫面。
- [ ] 確認未誤改 unrelated files、平台生成檔或使用者未要求的全域樣式。

---

## 常見情境處理

### 新增 Composition API 驅動的列表頁

1. 先查 `openapi.json` 的 `/collection` response schema。
2. 定義 normalized item type（例如 `PostCardModel`）。
3. 建立 mock fixture，覆蓋正常、空列表、缺圖、長標題。
4. 建立 headpressClient fetcher 與 mapper（`collection → PostCardModel[]`）。
5. 在 route loader / server function 取得資料，component 只負責 render。
6. 加上 pagination 或明確標註第一階段不支援。
7. 補 SEO fallback 與 404/empty 狀態。

### 新增 detail 頁或 dynamic slug route

1. 查 `openapi.json` 的 `/route/{path}` response schema，確認 path 與 slug 對應。
2. 確認 route param 命名與 URL 結構。
3. fetch by path 時處理零筆、多筆、非 publish 狀態。
4. mapper 補齊 title、content、excerpt、date、featured image fallback。
5. 找不到內容時回傳框架 404。
6. metadata 使用內容資料生成，缺欄位時使用 site fallback。

### 取得 WordPress Post / CPT 單篇文章

AI builder 或前端 agent 需要取得某篇 WordPress 文章、Page 或 CPT detail 時，預設使用 HeadPress route resolver，而不是直接用 `/wp/v2/`：

```text
# 一般文章 single post
GET /route/{post-slug}
GET /route/blog/{post-slug}      # 若前端 route 設計有 blog prefix，依實際 frontend path 傳入

# Custom Post Type single
GET /route/{post_type}/{post-slug}

# SDK 不方便處理多層 path parameter 時
GET /route?path=/{post_type}/{post-slug}
```

範例：

```text
GET /route/news-release-2026?include=route,entity,seo,media
GET /route/project/demo-case?include=route,entity,seo,media
GET /route?path=/project/demo-case&include=route,entity,seo,media
```

mapper 應讀取：

```text
route.kind       -> single / page / not-found
route.template   -> single_post / single_{post_type} / page_default
route.view       -> single / page / system
entity.type      -> post / page / CPT slug
entity.slug      -> content slug
entity.title.rendered
entity.content.rendered
entity.excerpt.rendered
entity.featured_media
seo              -> detail page metadata
```

取得 CPT 列表或 archive cards 時使用：

```text
GET /collection?type={post_type}&page=1&per_page=10
GET /collection?type={post_type}&taxonomy={taxonomy}&term={term-slug}
```

後端必要條件：CPT 必須 `public: true`、`show_in_rest: true`，並加入 `headpress/route/post_type_allowlist`。若需要直接以 ID 取得內容，HeadPress 目前沒有 `GET /content/{type}/{id}`；只能在 service layer 使用 `/wp/v2/{rest_base}/{id}` 作短期備援，component 不得直接呼叫。

### 從 mock 切到正式 `/headpress/api/v1/` API

1. 不直接刪 mock；保留做 regression 與 UI 開發。
2. 確認 env、API base URL（`VITE_WP_API_URL`）、auth、CORS。
3. 用 mapper 對齊 Composition API response 與 normalized model。
4. 測試空資料、欄位缺失、圖片缺失、API timeout。
5. 確認 production build 不依賴本機 mock-only path。

### 欄位不存在或 openapi.json 未列

1. 確認欄位是否已在 `openapi.json` 定義。
2. 若未定義，先看 `themes/headpress/docs/prd/混合型HeadlessAPI架構PRD.md` 確認計畫。
3. 若確實需要新欄位，走 Schema Change Protocol：
   - 識別缺少的欄位與 UI 場景。
   - 決定它屬於 WordPress core、ACF、taxonomy、media metadata 或 SEO plugin。
   - 記錄預期的 REST path 與 type。
   - 提交後端 PR 或 issue，不在前端永久 fake。

### 媒體與缺圖處理 (Media Fallback)

1. **缺圖替代 (Placeholder)**：當 API 未回傳圖片 URL 或欄位為空時，必須提供與網站視覺風格相近的預設代圖，維持 UI 佈局完整，不可讓版面破圖或留白。
2. **載入錯誤偵測**：必須在 `<img>` 或圖片元件綁定 `onError` 事件（或對應框架的 error handler），主動偵測圖片載入失敗。當圖片載入錯誤（例如外部圖床失效）時，自動替換為前述的預設代圖。
3. **樣式對齊**：代圖的尺寸比例（aspect-ratio）、object-fit 行為與原圖設定需保持一致，避免替換代圖時引發版面跳動 (Layout Shift)。

### Custom domain / production 準備

1. 確認 canonical base URL（`VITE_SITE_URL`）與 API base URL（`VITE_WP_API_URL`）由 env 控制，不 hardcode。
2. 確認前端 platform（Lovable、Vercel 等）custom domain 已正確 bind 且 DNS 生效。
3. 確認 `/headpress/api/v1/` CORS 允許前端 production domain。
4. 確認 WordPress REST API Application Password 等 auth 設定（不提交 secret）。
5. 確認 sitemap/robots/schema.org 若尚未實作，已明確列為後續工作。

---

## Review 重點

做 review 時，先列阻擋 release 的問題，再列中低風險問題。特別檢查：

- build 是否因 browser-only API、dynamic import、env 缺失而失敗。
- component 是否繞過 headpressClient／service layer 直接呼叫 CMS URL。
- mock 與 `/headpress/api/v1/` response 是否形狀一致，切換後不破版。
- 是否在 HeadPress 已有 endpoint 時仍新增不必要的 `/wp/v2/` 直連。
- dynamic route 是否正確 404。
- SEO metadata 是否只在 client 端才出現（而非 SSR/static HTML）。
- WordPress HTML 是否有 XSS 或樣式污染風險。
- API error 是否讓整頁 blank。
- AI builder 是否產生無關重構、全域 CSS 污染或套件膨脹。
- 所使用的 endpoint 是否都已在 `openapi.json` 正式定義。

若 review 發現可直接修補的缺口，應直接修改；只有在缺少 WordPress 後台設定、API 權限或商業規則時才回問使用者。
