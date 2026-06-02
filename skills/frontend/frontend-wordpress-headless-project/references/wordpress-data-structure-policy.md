# WordPress 資料結構規範

只要此 skill 涉及後端資料，且後端來源是 WordPress，就必須遵守 WordPress 的資料模型。

## 主要參考來源

- 以 `.agents/skills/wordpress-rest-api-development` 作為 WordPress REST API 結構、TypeScript 型別、模擬資料格式與服務層範例的主要參考。
- 當 `wordpress-rest-api-development` 已經有對應的 WordPress REST API 結構時，不要自行發明專案專屬的後端資料結構。
- 如果此 skill 需要文章、頁面、媒體、分類、標籤、作者、選單或自訂內容的範例，命名方式與巢狀結構應參考 `wordpress-rest-api-development`。

## 必須遵守的資料結構規則

- 將 WordPress 視為後端資料來源的唯一準則。
- 預設使用 WordPress REST API 的欄位名稱與巢狀結構作為資料合約。
- 保留 WordPress 原生識別與欄位，例如 `id`、`slug`、`date`、`modified`、`status`、`type`、`link`、`title`、`content`、`excerpt`、`author`、`featured_media`、`categories`、`tags`。
- 除非在服務層映射器中明確轉換成 UI 使用格式，否則應保留 WordPress 轉譯欄位的原始結構，例如 `title.rendered`、`content.rendered`、`excerpt.rendered`。
- 媒體資料必須相容 WordPress REST API 的媒體回應格式，例如 `id`、`source_url`、`alt_text`、`caption`、`media_details`，以及可用時的圖片尺寸版本。
- 分類法參照必須相容 WordPress REST API 回應格式：文章以分類法詞彙 ID 參照分類或標籤，詞彙物件使用 `id`、`count`、`description`、`link`、`name`、`slug`、`taxonomy` 等 WordPress 欄位。
- 自訂文章類型與類似 ACF 的欄位只能作為 WordPress REST API 結構的擴充，不得取代 WordPress 核心欄位。

## 模擬資料與 API 邊界

- 模擬資料必須優先使用相容 WordPress 的回應格式。
- 方便 UI 使用的檢視模型只能放在服務層映射器之後。
- 服務層映射器必須是唯一負責為元件扁平化、重新命名、正規化或合併 WordPress 欄位的位置。
- 元件不應直接依賴 WordPress 不存在、且專案映射器也未明確定義的臨時後端欄位。
- 從模擬資料遷移到 API 資料時，TypeScript 型別必須與 `wordpress-rest-api-development` 對齊，避免切換資料來源時需要重寫 UI。

## Frontend 專案規則

- 在 React/TypeScript 前端專案中，route loader、server function、server component、static generation 或專案既有資料流程應該透過 WordPress 服務層取得資料，不應直接讀取原始模擬資料陣列。
- SEO 相關頁面資料應從相容 WordPress 的欄位取得，例如 `title.rendered`、`excerpt.rendered`、可用時的 `yoast_head_json`，或文件中明確定義的映射後中繼資料。
- 除非使用者明確說明後端不是 WordPress，否則 WordPress 作為後端的內容不得使用 Supabase、Firebase 或任意 CMS 資料表風格的資料結構。
- 如果提示詞、實作計畫或生成檔案提到後端結構，必須明確說明後端資料合約遵循 `wordpress-rest-api-development` 中的 WordPress REST API 結構。
