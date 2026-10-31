# 記憶後端細節

主流程與身份在 [SKILL.md](../SKILL.md)，欄位格式在 [schemas.md](schemas.md)。實際讀寫後端時才讀。

## 選後端

完整值只放**一個主後端**；跨後端先說明。例外是長期：完整值在 Agent 記憶庫，Mem0 另留索引（`tier=long`）讓語意搜尋搜得到。記憶是索引與脈絡，不取代 Git `docs/`。

| 後端 | 何時用 | 入口 |
|------|--------|------|
| **Agent 記憶庫** | 永久記憶完整值 | [Agent 記憶庫](https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132)；`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7` |
| **Mem0 `私人記憶`** | 短、中期私人事務與私人長期索引 | Composio 別名，勿硬編碼 ID。不帶 user |
| **Mem0 `團隊記憶`** | 短、中期全域與一般及其長期索引 | 先 Composio；無則 Mem0 MCP。全域不帶 user；一般才帶身份 |
| **Notion Memory** | Notion 個人摘要，不是永久記憶或私人庫 | `notion-memory-search`；先讀 `notion://docs/memory`；沒工具就跳過 |

組織知識庫（SOP、研究全文）走 `my-notion` + 專案 `notion.knowledge_db`，不與 Agent 記憶庫混用。

## Agent 記憶庫（Notion）

永久記憶，短期不寫這裡。

- **查**：(a) Mem0 命中 `tier=long`：用隔離鍵找那頁讀 `目前值`；找不到或 `狀態` 不是 `有效`，回報不一致並問使用者，不自己補寫。(b) 沒命中或不夠：`狀態=有效` 且 `AI 可用`，依 `scope`／`user_id`／`agent_id` 過濾，可一併讀 `scope=global` 且 `user_id` 空的列。禁整庫拉。
- **寫**：欄位與值只用 schemas.md。寫入並讀回成功後在 Mem0 留索引；沒索引的舊頁面查到時補。從短期升進來（排程建議經使用者同意）先去重合併，再更新同一隔離鍵：先對新鍵 `scope|user_id|agent_id|記憶鍵`，沒有再對舊鍵 `user_id|agent_id|記憶鍵`，對到就更新那一筆，不改寫既有列。
- 敏感度高於「一般」時謹慎寫入。工具細節見 [`my-notion`](../../my-notion/SKILL.md)。

## Mem0

**通路（依序）**：

1. **Composio**：搜 `mem0` toolkit；ACTIVE 時用別名 `私人記憶`／`團隊記憶` 選帳。
2. **Mem0 MCP**：Composio 沒接上、要重新登入或失敗時，先說 Composio 失敗，再在 MCP 目錄找 `mem0` namespace（或含 search／add／update／delete memory 的工具），先讀 schema 再呼叫。
3. 皆無或失敗 → 說哪條失敗。短期就回報無法使用，不改寫進永久庫。

**空間與身份**：`私人記憶`＝短期私人（與 Grok Bot 同庫）；`團隊記憶`＝全域與一般，只靠帶不帶身份分開。跨庫先問。語意搜尋優先；只用不猜的正式工具與參數；不靜默切 scope。

**配額與速度**（免費方案，額度以 [Mem0 定價頁](https://mem0.ai/pricing) 為準，**需確認**）：

- 每題只搜一次：原話加 1～2 個同義詞合成一句，不拆多次、不逐筆補讀、不列整庫、不 `rerank`，`fields` 只留必要欄，`top_k` 通常 5～10。
- 回答自足就不搜；同一對話沿用前次結果。
- 寫入批次：同組 metadata 更新一次、重複 id 一次批次刪；不為「確認寫成」再搜。
- 儲存靠遺忘與去重壓低；長期只留索引不留複本。命中率靠索引正文的摘要與關鍵字（schemas.md），不靠多搜。

**寫改刪**：短期 `infer=true`，由 Mem0 擋完全相同的句子；同一對話已有同一事實的 id 就更新，否則直接新增。單一耐久事實寫完要驗證。使用者指定的改或刪先顯示並取得同意。推測不當事實。去重、加權、遺忘由排程 agent 的 `my-memory-consolidate` 做。

**整理計數**（排程維護，對話中只讀不改）：`metadata.weight` 整數（沒有或 `normal` 當 `1`，`high` 當 `3`）；`metadata.tier` `short`／`mid`／`long`（long 不加權、不遺忘、不合併）；存放時間用 `created_at`，沒有就不遺忘。新增工具若沒有 metadata 欄，寫入成功後再更新，不另開一筆。
