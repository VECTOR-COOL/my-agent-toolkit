---
name: lovable-wordpress-headless-project
description: Lovable TanStack Start SSR frontend + WordPress Headless REST API 專案協作 Skill。Use when a task involves Lovable UI/routes/layout/components backed by WordPress CMS, SSR-visible content, SEO metadata/canonical/Open Graph/sitemap/robots/custom domain readiness, CMS field mapping, ACF/custom post types, WordPress REST mock-to-api migration, service-layer boundaries, normalized view models, route loader/server function data flow, deployment/env checks, Lovable Publish/SEO scan follow-up, Cursor/Lovable/WordPress ownership rules, or review/debug of hydration, API fallback, missing media, 404, CORS, auth, and production build issues.
---

# Lovable + WordPress Headless 專案 Skill

這個 skill 用於維護「Lovable 產生或協作的 TanStack Start SSR 前端」與「WordPress Headless REST API」整合專案。目標是讓 UI 開發、資料串接、SEO、部署與多人協作都有明確邊界，避免在 Lovable、Cursor、WordPress 後台或 API 切換時互相破壞。

## 載入順序

1. 先讀 `references/index.md`。
2. 只載入目前任務需要的 reference；不要一次載入所有 scene docs。
3. 若任務重點是 WordPress raw schema、mock fixture、TypeScript 型別、service layer 實作或驗證腳本，同時載入 `.agents/skills/wordpress-rest-api-development`。
4. 若任務是舊 React/Vite SPA 搬到 TanStack Start SSR，同時載入 `.agents/skills/lovable-legacy-to-ssr-migration`。
5. 若 Lovable 平台行為影響 SEO/SSR/deployment 判斷，重新確認官方文件；本 skill 記錄的研究狀態是 2026-06-02。

## 使用時機

在下列情境必須使用本 skill：

- 規劃或修改 Lovable / TanStack Start SSR 專案架構。
- 建立、調整或搬移 routes、pages、layouts、components、data services。
- 將 mock data 改成 WordPress REST API，或反向建立 mock 以穩定 UI。
- 定義 WordPress post type、ACF 欄位、REST response mapping、TypeScript 型別。
- 處理 SSR、SEO metadata、canonical、Open Graph、custom domain、production build 準備。
- 檢查 Lovable 產出的程式是否破壞既有架構、樣式、資料層或 SEO。
- 撰寫給 Lovable、Cursor、WordPress 管理者使用的分工規則或 prompts。
- Debug hydration mismatch、API fallback、空資料、圖片缺失、路由 404、部署環境變數等問題。

若任務是舊版 CSR/SPA 搬到新版 SSR，應同時使用 `lovable-legacy-to-ssr-migration`。若任務重點是 WordPress REST API schema、mock 範本或 service 實作細節，應同時使用 `wordpress-rest-api-development`。若任務是通用 Lovable 專案規劃或 prompt 組裝，可搭配 `my-lovable`。

## 核心原則

- **先穩 UI，再串 API**：開發階段使用 mock 或 fixture 讓畫面穩定；正式 API 只透過 service layer 切換，不讓 component 直接呼叫 WordPress。
- **資料層與畫面分離**：routes / components 只吃 normalized view model；WordPress 原始 response、ACF 巢狀資料、fallback 邏輯放在 service / mapper。
- **SSR 優先**：需要 SEO 的內容必須可在 server render 時取得；避免只靠 client effect 補資料。
- **型別先行**：所有 CMS response、normalized model、route loader 回傳值都要有 TypeScript 型別或 schema。
- **可缺資料設計**：WordPress 後台資料常缺圖、缺 excerpt、欄位為 null、slug 改名、狀態 unpublished；UI 與 mapper 必須有 fallback。
- **Lovable 只改可控範圍**：讓 Lovable 產出 UI 或局部改版時，要明確指定不可改動 data services、routing contract、env schema、SEO utilities 與 shared types。
- **避免一次改到底**：大改分階段做：結構盤點、UI 穩定、資料 mapping、API 切換、SEO/build 驗收。

## 高風險禁止事項

除非使用者明確要求，避免做下列變更：

- 不要重建整個專案、替換 router、替換 framework、改 package manager 或大幅改 lockfile。
- 不要把 TanStack Start SSR 改回 SPA / CSR-only。
- 不要把 WordPress REST response 型別直接傳進深層 UI component。
- 不要移除 mock data；mock 是 UI regression 與 API 故障時的安全網。
- 不要在 UI 任務中順手改 global CSS、theme tokens、SEO utilities、env parser 或 API service。
- 不要 hardcode production/staging 網域、WordPress 網域、canonical URL、圖片 fallback URL。
- 不要為了通過 build 關掉 TypeScript、ESLint、SSR、route loader 或錯誤處理。
- 不要讓 Lovable 直接修改 `.env`、secret、auth token、WordPress application password。
- 不要引入大型狀態管理、CMS SDK 或 UI 套件，除非現有架構真的需要。

## 建議目錄邊界

依現有專案為準；若尚未建立，可採用下列邊界：

- `src/routes/`：TanStack Start routes、loader、page shell。
- `src/components/`：純 UI components，不直接知道 WordPress REST response。
- `src/features/`：大型頁面或領域功能，例如 posts、cases、products、home。
- `src/services/` 或 `src/lib/api/`：資料來源切換、fetch、cache、錯誤處理。
- `src/mappers/` 或 feature 內 `*.mapper.ts`：WordPress response 到 view model。
- `src/types/`：WordPress raw types、normalized types、route data types。
- `src/data/mock/`：mock fixtures，資料形狀要貼近 normalized model 或明確標示 raw mock。
- `src/config/`：env parsing、site config、API endpoints。
- `docs/`：交接文件、Lovable prompts、WordPress 欄位規格、部署檢查表。

不要把 fetch、mapping、fallback、UI rendering 全塞在同一個 component；這會讓 Lovable 後續改 UI 時很容易破壞資料邏輯。

## 資料來源策略

資料來源至少分成三層：

- **Mock source**：本機開發與 UI 驗收使用，資料穩定且可覆蓋空狀態。
- **WordPress source**：正式或 staging REST API，負責 request、pagination、status、error。
- **Normalized model**：component 真正使用的資料形狀。

建議用環境變數控制資料來源，例如 canonical `VITE_DATA_SOURCE=mock|api`，或沿用專案既有命名後在 config/service layer 正規化。不要在 component 裡用 `if (mock)` 分支切資料。

WordPress REST API 常見爆點：

- ACF 欄位不存在或外掛未開啟 REST expose。
- `_embedded` 沒有被 include，導致 featured image 或 author 缺失。
- pagination header 沒有被處理，列表頁只顯示第一頁。
- slug 變更造成舊 URL 404，需決定 redirect 或 fallback。
- draft/private content 在未登入 REST 請求中不可見。
- CORS、Basic Auth、Application Password、cookie auth 在本機與部署環境行為不同。
- media URL 指向 WordPress 網域，部署後 mixed content 或 hotlink policy 出問題。
- HTML content 需要 sanitization，不能直接信任後台輸入。

## 環境與部署防呆

環境設定應集中管理，避免散落在 component 或 route 裡：

- API base URL、site base URL、canonical domain、data source、preview mode、image domains 都應由 config/env 讀取。
- env parser 要提供清楚錯誤訊息；production 缺必要 env 時應 fail fast。
- `.env.example` 或部署文件要同步更新，但不得提交真實 secret。
- local、preview、staging、production 的資料來源與 canonical 不可混用。
- WordPress REST API 若需要 auth，必須區分 server-only secret 與 browser-safe public config。
- build 階段與 runtime 階段都可能讀取 env；確認部署平台的注入時機。

部署前特別檢查：

- production build 是否能完成 SSR render。
- API endpoint 是否允許部署網域請求。
- 圖片與媒體是否可由前端網域載入，且沒有 mixed content。
- 404、500、API timeout、WordPress 維護中狀態是否有可接受畫面。
- custom domain 上的 canonical、Open Graph URL、robots policy 是否正確。

## 快取與資料更新

WordPress 內容會被編輯、取消發布、改 slug 或換圖；快取策略必須可解釋：

- 若使用 framework cache、fetch cache、CDN cache 或 ISR-like 策略，文件要標示更新延遲。
- preview/draft 不應共用公開頁快取。
- slug 改名時需決定 redirect、404 或查詢舊 slug mapping。
- 列表頁與 detail 頁可能不同步，mapper 與 fetcher 需能處理已刪除或 unpublished item。
- 搜尋、分類、標籤頁若有 pagination，cache key 必須包含 query params。

## SSR 與 SEO 規則

- 文章、頁面、分類、產品、案例等可索引內容，應在 route loader 或 server 可執行資料流程取得。
- 每個 SEO 頁面要能產生 title、description、canonical、Open Graph image，資料缺失時使用 site fallback。
- dynamic route 要處理不存在 slug：回傳 404，不要渲染空頁。
- 預覽或草稿模式要和正式公開模式分開，不要讓 production 頁面讀到 draft。
- canonical domain 要由 config/env 控制，避免 hardcode staging 網域。
- sitemap、robots、schema.org 若尚未正式實作，需在 docs 或 TODO 明確標註，不要用假檔案假裝完成。

## UI 與 Lovable 協作規則

交給 Lovable 的 prompt 應明確限制：

- 可以修改指定 route/page/component 的視覺與 layout。
- 不可修改資料來源切換、WordPress fetcher、mapper、env parsing、route params contract。
- 不可把 mock data inline 到 component。
- 不可移除 loading、empty、error、fallback image 等狀態。
- 不可改 Tailwind/theme/design token 的全域語意，除非任務明確要求。
- 新增 component 要遵守現有 import alias、UI library、icon library、class 命名與檔案位置。

檢查 Lovable 產出時，優先看：

- 是否新增了重複或衝突的 mock data。
- 是否 component 直接 fetch WordPress。
- 是否刪掉 SSR loader 或 metadata。
- 是否導入不必要套件。
- 是否用瀏覽器專用 API 造成 SSR build 失敗。
- 是否讓文字、圖片、卡片在 mobile 破版。

## 實作檢查表

修改前：

- 確認任務屬於 UI、資料、SEO、部署或協作哪一類。
- 讀取現有目錄與資料流，不假設專案一定有標準目錄。
- 找到資料來源開關、API endpoint、mock fixtures、route loader、SEO utilities。
- 確認是否有 WordPress schema / ACF 欄位文件。

修改中：

- 優先沿用既有 patterns，不重建整個架構。
- 讓 component 接 normalized props。
- 對 null、undefined、空陣列、缺圖、缺 slug、API error 寫清楚 fallback。
- 避免在 SSR path 使用 `window`、`document`、`localStorage`、`location`，除非有 client-only guard。
- 避免把 WordPress HTML 直接丟進 DOM；若必須使用，確認 sanitizer 或明確信任邊界。
- 新增 env 時同步更新 env example、config parser 與文件。

修改後：

- 執行 typecheck、lint、build 或專案既有測試；若無法執行要說明原因。
- 若改 UI，使用本機瀏覽器檢查 desktop/mobile 主要畫面。
- 若改資料層，測試 mock source 與 WordPress source 至少各一個成功路徑與錯誤/空資料路徑。
- 若改 SEO，檢查 SSR HTML 或 metadata 產出，不只看 client 畫面。
- 檢查是否誤改 unrelated files、Lovable 生成檔或使用者未要求的全域樣式。

最低測試矩陣：

- `mock` 資料來源：正常資料、空資料、缺圖、長標題。
- `wordpress` 資料來源：正常資料、API error、找不到 slug、欄位缺失。
- viewport：mobile、desktop。
- render：server-rendered HTML、hydrated client 畫面。
- environment：local 與 production-like build。

## 常見情境處理

### 新增 WordPress 驅動的列表頁

1. 先定義 normalized item type。
2. 建立 mock fixture，覆蓋正常、空列表、缺圖、長標題。
3. 建立 WordPress fetcher 與 mapper。
4. 在 route loader 取得資料，component 只負責 render。
5. 加上 pagination 或明確標註第一階段不支援。
6. 補 SEO fallback 與 404/empty 狀態。

### 新增 detail 頁或 dynamic slug route

1. 確認 route param 命名與 URL 結構。
2. fetch by slug 時處理零筆、多筆、非 publish 狀態。
3. mapper 補齊 title、content、excerpt、date、featured image fallback。
4. 找不到內容時回傳 404。
5. metadata 使用內容資料生成，缺欄位時使用 site fallback。

### 從 mock 切到正式 API

1. 不直接刪 mock；保留做 regression 與 UI 開發。
2. 確認 env、API base URL、auth、CORS、staging/production endpoint。
3. 用 mapper 對齊 WordPress raw response 與 normalized model。
4. 測試空資料、欄位缺失、圖片缺失、API timeout。
5. 檢查 production build 不依賴本機 mock-only path。

### WordPress 欄位變更

1. 更新 WordPress raw type 或 schema。
2. 更新 mapper，不讓 component 直接跟著改 raw 欄位。
3. 更新 mock fixture，包含舊資料缺新欄位的 fallback。
4. 檢查 SEO metadata、列表卡片、detail 頁是否受影響。

### Preview / Draft 模式

1. 明確區分公開資料與預覽資料來源。
2. preview token 或 auth secret 只能在 server 端使用。
3. preview 頁面不可被索引，metadata 與 robots policy 要能防止收錄。
4. preview 不可污染公開快取。
5. 無權限或 token 過期時要顯示明確錯誤，不要 fallback 到錯誤的公開內容。

### 多語系或地區內容

1. 確認 URL 策略：prefix、subdomain、query 或 WordPress plugin routing。
2. normalized model 要包含 locale 或 language fallback。
3. SEO metadata、canonical、hreflang 不可混用語系。
4. mock fixture 至少覆蓋一個長字串語系，避免 UI 在翻譯後破版。
5. WordPress taxonomy、slug、menu 若依語系不同，fetcher 不可只用單一 hardcoded slug。

### 圖片與媒體資產

1. 確認 featured image、gallery、inline content image 的來源與 fallback。
2. 使用 responsive image 時保留 alt、width/height 或穩定 aspect ratio。
3. 外部 WordPress 圖片網域需符合部署平台 image allowlist。
4. 缺圖時 UI 不可 layout shift 或顯示破圖 icon。
5. 圖片 URL 由 mapper 正規化，不在 component 拼接。

### Custom domain / production 準備

1. 確認 canonical base URL、API base URL、image domain、robots policy。
2. 檢查是否有 staging 網域 hardcode。
3. 檢查 SSR build、route 404、redirect、asset path。
4. 確認 WordPress REST API 可由 production domain 存取。
5. 若尚未實作 sitemap/robots/schema，明確列為後續工作，不要混在 UI 任務中硬做。

## Prompt 撰寫格式

交給 Lovable 或 Cursor 的 prompt 建議包含：

- 專案階段：UI mock、API migration、SEO hardening、production readiness。
- 可改範圍：指定 files / routes / components。
- 不可改範圍：資料服務、mapper、env、routing contract、全域樣式等。
- 資料規格：normalized model 欄位、空資料規則、圖片 fallback。
- 驗收條件：desktop/mobile、loading/empty/error、SSR/SEO、build/typecheck。

範例：

```text
請只修改 src/routes/posts.tsx 與 src/features/posts/* 的 UI 呈現。
資料來源、fetcher、mapper、env 設定不可修改。
component 必須使用既有 normalized PostCardModel。
請保留 loading、empty、error 狀態，並確保缺 featuredImage 時使用 fallback。
完成後需通過 typecheck，mobile 版不可文字重疊或卡片溢出。
```

## Review 重點

做 review 時，先列阻擋 release 的問題，再列中低風險問題。特別檢查：

- SSR build 是否會因 browser-only API、dynamic import、env 缺失而失敗。
- component 是否繞過 service layer 直接呼叫 WordPress。
- mock 與 API response 是否形狀分裂，導致切換資料源後破版。
- dynamic route 是否正確 404。
- SEO metadata 是否只在 client 端才出現。
- WordPress HTML 是否有 XSS 或樣式污染風險。
- API error 是否讓整頁 blank。
- Lovable 是否產生了無關重構、全域 CSS 污染或套件膨脹。

若 review 發現可直接修補的缺口，應直接修改；只有在缺少 WordPress 後台設定、API 權限或商業規則時才回問使用者。
## WordPress data structure requirement

When backend data is WordPress, this skill must follow WordPress REST API data structures. Use `.agents/skills/wordpress-rest-api-development` as the canonical reference for schemas, TypeScript types, mock data, and service-layer mapper patterns. Keep WordPress fields and nesting intact at the API/mock boundary, and only flatten or rename data inside an explicit service-layer mapper. See `references/wordpress-data-structure-policy.md` for the detailed policy.
