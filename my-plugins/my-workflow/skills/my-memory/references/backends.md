# 記憶後端細節

主流程與判斷規則在 [SKILL.md](../SKILL.md)。欄位格式在 [schemas.md](schemas.md)。這份只在實際讀寫後端時才讀。

## 選後端

完整值只放**一個主後端**；跨後端須先說明。例外是長期記憶：完整值在 Agent 記憶庫，Mem0 另留一筆索引（`tier=long`），讓語意搜尋搜得到。記憶是索引與脈絡，不取代 Git `docs/`、`ai/`。

| 後端 | 何時用 | 入口 |
|------|--------|------|
| **Agent 記憶庫** | 永久記憶的完整值 | [Agent 記憶庫](https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132)；`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7` |
| **Mem0 `私人記憶`** | 短期、中期的私人事務，與私人長期索引 | Composio 別名，勿硬編碼 ID。不帶 user |
| **Mem0 `團隊記憶`** | 短期、中期的全域與一般，與其長期索引 | 先 Composio；無則 Mem0 MCP。全域不帶 user；一般才帶身份 |
| **Notion Memory** | Notion 個人摘要，不是永久記憶，也不是私人記憶庫 | `notion-memory-search`；先讀 `notion://docs/memory` |

組織知識庫（SOP、研究全文）仍走 `$my-notion` + 專案 `notion.knowledge_db`，不與 Agent 記憶庫混用。

## Agent 記憶庫（Notion）

永久記憶。短期不要寫進這裡。

- DB：[Agent 記憶庫](https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132)
- Data source：`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7`

**查**：兩種進法。(a) Mem0 命中 `tier=long` 索引：用索引裡的隔離鍵找那一頁，讀 `目前值`；找不到或 `狀態` 不是 `有效`，回報索引與 Notion 不一致，問使用者要刪索引還是恢復頁面，不要自己補寫。(b) Mem0 沒命中或不夠：`狀態=有效` 且 `AI 可用`，再依目前客戶端的 `scope`／`user_id`／`agent_id` 過濾，並可一併讀 `scope=global` 且 `user_id` 為空的列。禁整庫拉。

**寫**：欄位與允許值只用 [schemas.md](schemas.md)。寫入並讀回成功後，在 Mem0 留索引（格式見 schemas.md）；沒有索引的舊頁面，查到時補一筆。從短期升進來時（排程整理的建議經使用者同意），先去重並合併，再更新同一隔離鍵，不重複新增。去重先對新鍵 `scope|user_id|agent_id|記憶鍵`，沒有再對舊鍵 `user_id|agent_id|記憶鍵`。對到就更新那一筆。這次不改寫既有列。

敏感度高於「一般」時謹慎寫入。工具細節 → [`$my-notion`](../../my-notion/SKILL.md)。

## Notion Memory

1. 本對話首次使用前讀 `notion://docs/memory`。
2. 搜尋：`notion-memory-search`；必要時 fetch About（`id: "memory"`）。
3. 這裡只放 Notion 個人摘要。私人事務寫 Mem0 `私人記憶`。永久事實寫 Agent 記憶庫。同一事實的完整值只留一處。

## Mem0

**讀**：查記憶的第一步。帶這次身份語意搜一次，短期、中期、長期索引一起回來；命中 `tier=long` 就照上面「Agent 記憶庫 → 查 (a)」去拿完整值。問題自足或禁止時不搜。

**通路（依序）**：
1. **Composio**：搜尋 `mem0` toolkit；ACTIVE 時用別名 `私人記憶`／`團隊記憶` 選帳，勿硬編碼 ID。
2. **Mem0 MCP**：Composio 沒接上、要重新登入或呼叫失敗時，先說 Composio 失敗，再在 MCP 目錄找 `mem0`／`Mem0` namespace（或含 search／add／update／delete memory 的工具），先讀 schema 再呼叫。
3. 兩者皆無，或連線失敗 → 先說哪條失敗。短期就回報無法使用 Mem0，不要改寫進永久庫。

**空間**：`私人記憶`＝短期私人事務（與 Grok Bot 同一個庫）。`團隊記憶`＝短期的全域與一般。私人與團隊跨庫先問。

**身份**：照上面的身份表。全域與一般同在 `團隊記憶`，只靠帶不帶身份分開。讀全域不能排除帶了 user 或 agent 的紀錄時，先停下來問。讀一般一定帶身份。工具若硬要身份欄，先停下來問，不要猜，也不要改成依 session 換 id。

**流程**：語意搜尋優先 → 只用不猜的正式工具／參數 → 不靜默切 scope。

**配額與速度**（免費方案；額度數字以 [Mem0 定價頁](https://mem0.ai/pricing) 為準，**需確認**）：Mem0 只負責短期、中期與長期索引的語意入口，完整內容在 Notion，所以要讓它又小又快：

- 每個問題只搜一次：查詢詞用使用者原話加 1～2 個同義詞合成一句，不拆成多次、不逐筆補讀、不列整庫、不 `rerank`、`fields` 只留必要欄、`top_k` 用這題需要的筆數（通常 5～10）。
- 回答自足就不搜；同一則對話沿用前一次結果。
- 寫入批次：同一組的 metadata 更新一次、重複 id 一次批次刪；不為了「確認寫成」再搜。
- 儲存靠遺忘與去重壓低：短期該刪就刪，長期只留一筆索引，不留完整值複本。
- 命中率靠索引正文的摘要與關鍵字（格式見 [schemas.md](schemas.md)），不靠多搜幾次。

**寫改刪**：短期新增用 `infer=true`，由 Mem0 擋完全相同的句子。這一則對話已有同一事實的 id 就更新，否則直接新增，不要為去重再搜一次。單一耐久事實，寫完要驗證。使用者指定的改或刪，先顯示並取得同意。推測不得當使用者事實。語意去重、加權與遺忘由排程 agent 的 `my-memory-consolidate` 做，對話中不做。

**整理計數**（由排程 agent 的 `my-memory-consolidate` 維護，對話中只讀不改）：

- `metadata.weight`：整數。沒有或舊值 `normal` 當 `1`，舊值 `high` 當 `3`
- `metadata.tier`：`short`、`mid` 或 `long`（長期索引，不加權、不遺忘、不合併）
- 存放時間用記憶的 `created_at`。沒有就不遺忘
- 用該筆記憶 id 更新 metadata。新增工具若沒有 metadata 欄，寫入成功後再更新，不要另開一筆
- 查詢只打一次，並帶回 id、正文、身份、`created_at`、metadata。重複筆在保留筆更新成功後批次刪除。只刪列出的 id

