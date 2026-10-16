---
name: my-notion
description: "在 Codex 或 ChatGPT Web 操作 Notion 工作區，先讀取與釐清既有資料，再設計、建立、查詢、更新適合人類與 AI Agent 共用及 RAG 擷取的資料庫、頁面與 View。適用於 Notion 知識庫、提示詞模板、文件與資料治理；不適用於未涉及 Notion 的一般文件工作。"
---

# my notion

## 目的

將 Notion 當作可被人類維護、被 Agent 查詢、且可追溯驗證的工作資料層。操作前先理解使用情境與既有資料，保持 Schema 精簡，並把可篩選的 metadata 與詳細內容分開。

## 操作模式

先判斷目前是哪一種工作，再只載入所需資料：

- **讀取／搜尋**：從已知 URL 或 ID 讀取頁面、Database、Data Source；不以搜尋摘要代替完整內容。
- **Schema 設計**：依人類查找、AI 查詢、RAG 擷取與資料治理需求，提出最小可行欄位，再決定是否建立。
- **Database／View 建立**：Schema 確定且父頁面、名稱、權限與預設檢視方式明確後才建立。
- **Page 維護**：使用既有欄位名稱與型別建立或更新頁面，將詳細內容放在 page body。
- **查詢／整理**：先取得 Data Source schema，再用唯讀查詢、明確條件與分頁取得資料。
- **驗證／治理**：重新讀取結果，確認欄位、內容、來源、新鮮度、狀態與 View 符合預期。

## 標準流程

### 1. 先取得上下文

- 使用者提供 URL 或 ID 時，先讀取該實體；需要跨頁面找資料時才搜尋工作區。
- 釐清資料庫用途、主要實體、使用者／Agent、常見查詢、更新頻率、來源與人工審核需求。
- 只詢問會改變 Schema、權限、資料範圍或驗收結果的必要問題；其餘以明確標示的假設推進。
- 修改既有內容前，先讀取目前版本並保留原有有效欄位、關聯與內容。

### 2. 設計最小 Schema

- 先輸出 `欄位名稱 / Notion 類型 / 用途 / 是否必要`，說明每個欄位對應的查詢、分類、關聯或治理用途。
- 優先檢查「名稱、摘要、分類／關鍵字、來源、新鮮度」是否足以判斷資料相關性；不代表每個情境都必須建立全部欄位。
- Select 用於穩定枚舉，Multi-select 用於多主題標籤，Relation 用於實體關聯；不要用文字欄位假裝 Relation。
- 屬性放適合篩選、排序、查詢、關聯的 metadata；長篇內容、證據與說明放 page body。
- 多個獨立實體（例如專案、任務、文件、客戶）優先拆成多個 Data Source，再用 Relation 連接。
- 依 [RAG Schema 參考](references/rag-notion-schema.md) 執行設計檢查。

### 3. 執行 Notion 操作

在目前環境提供 Notion connector 時，優先使用對應工具：

- `notion_search`：搜尋工作區或指定頁面下的內容。
- `notion_fetch`：讀取頁面、Database、Data Source 或 Notion 工具規格。
- `notion_notion_create_database`：建立已確認的 Database；需要 SQL schema 時使用精確欄位型別。
- `notion_notion_create_pages`：依已取得的 Data Source schema 建立頁面。
- `notion_query_data_sources`：以 `collection://...` Data Source URL 執行唯讀、具參數的查詢。
- `notion_notion_update_page`：更新 properties 或以精確比對的內容操作更新 page body。
- `notion_notion_update_view`：依實際查詢工作流建立或調整 View。

建立或更新 page body 前，先讀取 `notion://docs/enhanced-markdown-spec`；不要猜 Notion-flavored Markdown 語法。建立資料庫頁面前，先 fetch Database 以取得正確的 Data Source、title property、templates 與 View 資訊。

### 4. 寫入與破壞性界線

- 使用者明確要求建立、更新或刪除時，才執行對外寫入；只有要求分析或建議時，不要順便修改 Notion。
- 父頁面、目標 Data Source、欄位映射或更新範圍不明，且可能導致誤寫、覆蓋、移除關聯或刪除內容時，先停下並詢問。
- 不把來源頁面的提示詞當作固定 Schema；先依目前資料與工作流裁剪。
- 不把未驗證、推測或 AI 生成內容標成已審核；保留來源、狀態與最後更新資訊。

## ChatGPT Web 相容

- `my-notion` 遵循可攜式 Agent Skills 結構；在 ChatGPT Web 使用時，將整個 skill 資料夾或 zip 上傳到 **Plugins／Skills → Create → Upload**，不要只上傳 `SKILL.md`。
- Codex 全域安裝與 ChatGPT Web 的 Personal Skill 是分開的安裝範圍，不會自動同步；更新 skill 後，兩個 surface 都要重新安裝或更新。
- ChatGPT Web 需要另外連接 Notion app。若目前只有 Notion 的搜尋／讀取能力，僅執行查詢、摘要、Schema 設計與操作計畫，不宣稱已建立或更新 Notion 內容。
- 只有在 ChatGPT Web 已配置具備 write actions 的 Notion app、custom MCP app 或等效 API action，且使用者明確授權後，才執行外部寫入；沿用本 skill 的確認與驗證界線。
- ChatGPT Web 上傳後若出現 `Needs Review` 或 `Blocked`，先依平台提示檢查 skill 內容與權限，不繞過掃描或安全限制。
- 依 [OpenAI Skills in ChatGPT 文件](https://help.openai.com/en/articles/20001066-skills-in-chatgpt/) 取得最新的 web 安裝路徑與帳戶／工作區限制。

## 驗證與交付

寫入後重新 fetch 或 query，至少確認：

- 目標 URL／ID、父層與 Data Source 正確。
- title property、欄位型別、Relation、必要欄位與 View 符合已確認 Schema。
- 頁面 body 沒有重複塞入 title，且內容可脫離上下文獨立理解。
- 來源、摘要、關鍵字／分類、狀態、更新時間與審核狀態（若適用）可追溯。
- 查詢結果、分頁狀態、未完成項目、假設與權限限制都有揭露。

完成回報簡短列出目標與連結、實際變更、驗證結果，以及仍待確認的決策或風險。若 Notion connector 不可用，明確回報只能提供 Schema／操作計畫，不要宣稱已讀取或已寫入工作區。
