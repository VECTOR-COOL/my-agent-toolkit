---
description: 說明 WordPress 原生資料結構與 REST API 慣例，以及如何將其正規化為前端 UI 狀態的原則。
---
# WordPress 資料結構規範 — HeadPress Frontend Dev

只要此 skill 涉及後端資料，且後端來源是 WordPress + HeadPress，就必須遵守 WordPress 的資料模型。

## 主要參考來源（優先順序）

1. **`themes/headpress/docs/prd/openapi.json`**（HeadPress Composition API 的 canonical schema；public base `/headpress/api/v1`，REST namespace `headpress/api/v1`）
2. **`.agents/skills/wordpress-rest-api-development`**（WordPress REST API 結構、TypeScript 型別、模擬資料格式與服務層範例；`/wp/v2/` 僅作 service-layer 備援參考）

當 `openapi.json` 已定義欄位形狀時，以 `openapi.json` 為準。
當 HeadPress 無對應 endpoint 且需在 service layer 使用 WP 原生 API 時，參考 `wordpress-rest-api-development`。

不要自行發明後端資料結構。

## 必須遵守的資料結構規則

- 將 WordPress + HeadPress 視為後端資料來源的唯一準則。
- **優先** 以 `openapi.json` 中 `/headpress/api/v1` response 的欄位名稱與巢狀結構作為資料合約。
- 保留 WordPress 原生識別與欄位：`id`、`slug`、`date`、`modified`、`status`、`type`、`link`、`title`、`content`、`excerpt`、`author`、`featured_media`、`categories`、`tags`。
- 除非在服務層映射器中明確轉換，否則保留 WordPress 轉譯欄位的原始結構：`title.rendered`、`content.rendered`、`excerpt.rendered`。
- 媒體資料必須相容 WordPress REST API 媒體回應格式：`id`、`source_url`、`alt_text`、`caption`、`media_details` 及可用的圖片尺寸版本。
- 分類法參照必須相容 WordPress REST API：詞彙物件使用 `id`、`count`、`description`、`link`、`name`、`slug`、`taxonomy`。
- 自訂文章類型與 ACF 欄位只能作為 WordPress REST API 結構的擴充，不得取代 WordPress 核心欄位。
- 頁面級 SEO 以 `/route?path={current_path}` 回應的頂層 `seo` 為準（見 openapi.json）；勿假設舊版巢狀 `headless.seo`。
- `/content/{post_type}`、`/content/{post_type}/{identifier}`、`/content-object/{id}` 與 `POST /collection` 仍保留 WordPress-shaped 欄位；mapper 不得把 `title.rendered`、`content.rendered`、`excerpt.rendered` 假設成字串。
- `POST /collection` 是 HeadPress 定義的 safe WP_Query-shaped subset，不是任意 `WP_Query` pass-through；前端只能傳 openapi.json `QueryRequest` 支援欄位。
- `/languages` 的 WordPress core 資料只代表 locale 與 installed language packs；前端不得自行推論內容翻譯是否存在。

## 模擬資料與 API 邊界

- 模擬資料必須對齊 `/headpress/api/v1` response 形狀（以 `openapi.json` 為準）。
- 方便 UI 使用的 view model 只能放在服務層 mapper 之後。
- 服務層 mapper 是唯一負責扁平化、重新命名、正規化或合併欄位的地方。
- Component 不應依賴 `openapi.json` 未定義且 mapper 未明確轉換的欄位。
- 從 mock 遷移到 API 時，TypeScript 型別必須對齊 `openapi.json`，避免資料來源切換後需要重寫 UI。

## Frontend 專案規則

- Route loader、server function、server component、static generation 或專案既有資料流程應透過 `headpressClient`（指向 public base `/headpress/api/v1`）取得資料；必要時 service layer 才用 `wpClient`。
- SEO 相關頁面資料應從 `/route?path={current_path}` 的頂層 `seo`、`entity.title.rendered`、`entity.excerpt.rendered` 或 `/site` 的 site 設定取得。
- 列表 service 優先使用 `/content/{post_type}` 或 `/collection`；只有需要多條件 array-style 查詢時才使用 `POST /collection`。
- 單筆 service 已知 post type 時使用 `/content/{post_type}/{identifier}`；只知道 WordPress ID 時使用 `/content-object/{id}`。兩者永遠回單一 object 或 404，不回陣列。
- 不得使用 Supabase、Firebase 或任意 CMS 資料表風格的資料結構，除非使用者明確說明後端不是 WordPress。
- 若 prompt、實作計畫或生成檔案提到後端結構，必須說明後端資料合約遵循 `openapi.json` 的 HeadPress Composition API 與 WordPress REST 欄位慣例。
