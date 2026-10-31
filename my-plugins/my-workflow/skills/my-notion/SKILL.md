---
name: my-notion
description: "操作 Notion 工作區，先讀取與釐清既有資料，再設計、建立、查詢、更新適合人類與 AI Agent 共用及 RAG 擷取的資料庫、頁面與 View。適用於 Notion 知識庫、提示詞模板、文件與資料治理；不適用於未涉及 Notion 的一般文件工作。"
---

# my notion

把 Notion 當作人類可維護、Agent 可查詢、可追溯驗證的資料層。先理解情境與既有資料，Schema 精簡，可篩選的 metadata 與詳細內容分開。

## 操作模式

先判斷是哪一種，只載所需資料：

- **讀取／搜尋**：從已知 URL 或 ID 讀頁面、Database、Data Source；不以搜尋摘要代替完整內容。
- **Schema 設計**：依人類查找、AI 查詢、RAG 擷取與治理需求提最小可行欄位，再決定是否建立。
- **Database／View 建立**：Schema、父頁面、名稱、權限、預設檢視都明確後才建。
- **Page 維護**：用既有欄位名與型別，詳細內容放 page body。
- **查詢／整理**：先取 Data Source schema，再唯讀查詢、明確條件、分頁。
- **驗證／治理**：重新讀取，確認欄位、內容、來源、新鮮度、狀態、View。

## 流程

### 1. 取得上下文

- 有 URL 或 ID 先讀該實體；需跨頁面找才搜工作區。
- 釐清用途、主要實體、使用者／Agent、常見查詢、更新頻率、來源、人工審核需求。
- 只問會改變 Schema、權限、範圍或驗收的問題；其餘以明確標示的假設推進。
- 修改前先讀目前版本，保留有效欄位、關聯與內容。

### 2. 最小 Schema

- 先輸出 `欄位名稱 / Notion 類型 / 用途 / 是否必要`。
- 檢查「名稱、摘要、分類／關鍵字、來源、新鮮度」是否足以判斷相關性；不是每個情境都要全建。
- Select 用於穩定枚舉，Multi-select 用於多主題標籤，Relation 用於實體關聯；不用文字欄位假裝 Relation。
- 屬性放可篩選、排序、查詢、關聯的 metadata；長內容、證據放 page body。
- 多個獨立實體（專案、任務、文件、客戶）拆成多個 Data Source，用 Relation 連。
- 依 [RAG Schema 參考](references/rag-notion-schema.md) 做設計檢查。

### 3. 執行

MCP 沒接上、要重新登入或呼叫失敗：先說原因，不貼 token，不空轉重試，不宣稱已讀或已寫。

有 Notion connector 時用對應工具：`notion_search`（搜尋）、`notion_fetch`（讀頁面、Database、Data Source、工具規格）、`notion_notion_create_database`、`notion_notion_create_pages`（依已取得的 schema）、`notion_query_data_sources`（`collection://...` 唯讀查詢）、`notion_notion_update_page`（properties 或精確比對更新 body）、`notion_notion_update_view`。

寫 page body 前先讀 `notion://docs/enhanced-markdown-spec`，不猜語法。建資料庫頁面前先 fetch Database 取 Data Source、title property、templates、View。

### 4. 寫入界線

- 使用者明確要求建立、更新、刪除才寫；只要分析或建議時不順便改。
- 父頁面、目標 Data Source、欄位映射或範圍不明且可能誤寫、覆蓋、移除關聯或刪內容時，先停下問。
- 不把來源頁面的提示詞當固定 Schema；依目前資料與工作流裁剪。
- 不把未驗證、推測或 AI 生成內容標成已審核；保留來源、狀態、最後更新。

## ChatGPT Web

- 上傳整個 skill 資料夾或 zip 到 **Plugins／Skills → Create → Upload**，不只上傳 `SKILL.md`。Codex 全域安裝與 ChatGPT Web Personal Skill 是分開範圍，更新要兩邊重裝。
- 需另外連接 Notion app。只有搜尋／讀取時，只做查詢、摘要、Schema 設計與操作計畫，不宣稱已寫入；有 write actions 的 Notion app／custom MCP／等效 API action 且使用者明確授權才寫。
- 出現 `Needs Review` 或 `Blocked` 依平台提示檢查，不繞過。安裝路徑與限制見 [OpenAI Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt/)。

## 驗證與交付

寫入後重新 fetch 或 query，確認：目標 URL／ID、父層、Data Source 正確；title property、欄位型別、Relation、必要欄位、View 符合 Schema；body 沒重複塞 title，內容可獨立理解；來源、摘要、分類、狀態、更新時間、審核狀態可追溯；查詢結果、分頁、未完成項、假設、權限限制都揭露。

回報：目標與連結、實際變更、驗證結果、待確認的決策或風險。MCP 不可用時說哪條連線、什麼失敗，這次只能提供 Schema／操作計畫。
