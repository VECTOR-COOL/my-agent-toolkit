# 常見爆點與錯誤處理

## WordPress REST API 常見爆點

- ACF 欄位不存在或外掛未開啟 REST expose → mapper 要有 fallback，不要讓 UI 崩潰。
- `_embedded` 沒有被 include → featured image 或 author 缺失，mapper 要判斷並給 fallback。
- pagination header 沒有被處理 → 列表頁只顯示第一頁，fetcher 要讀 `X-WP-Total`。
- draft/private content 在未登入 REST 請求中不可見 → 不要讓 UI 空白，要有 notFound 狀態。
- CORS、Application Password 在本機與部署環境行為不同 → 確認部署平台的 CORS 設定文件。
- media URL 指向 CMS 網域（`example.com`）→ 部署後確認前端平台的 image domain allowlist。
- HTML content 需要 sanitization → 不能直接信任後台輸入，不可裸露 `dangerouslySetInnerHTML`。
- CMS 與前端分網域時，WP 輸出的 `link`、`menu.url`、`seo.canonical` 等常仍是 CMS 絕對路徑 → 必須改為前端公開網域。

## 錯誤處理規則

- fetcher 要處理 HTTP status、timeout、network failure、invalid JSON、CORS/auth 失敗、rate limit、WordPress maintenance/500，以及 REST error response body。
- service layer 要把錯誤正規化成 typed result，例如 `error`、`notFound`、`unauthorized`、`forbidden`、`rateLimited`、`timeout`、`unavailable`。
- mapper 要處理 `null`、缺欄位、空陣列、缺 `_embedded`、缺 featured media、unpublished/private item。
- dynamic route 找不到內容時要回傳框架支援的 404/not-found，不要渲染空白 detail page。
- API 失敗時 fallback 到 mock **僅限** 開發環境且明確標示 degraded state；production 不可靜默替換。
- error UI 要保留 app shell、導覽與可恢復操作；不可整頁 blank，也不可洩漏錯誤細節或 secret。
