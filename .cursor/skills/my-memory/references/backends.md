# 記憶後端細節

主流程與判斷規則在 [SKILL.md](../SKILL.md)。欄位格式在 [schemas.md](schemas.md)。這份只在實際讀寫後端時才讀。

## 選後端

選**一個主後端**；跨後端須先說明。同一事實勿無計畫寫入多處。記憶是索引與脈絡，不取代 Git `docs/`、`ai/`。

| 後端 | 何時用 | 入口 |
|------|--------|------|
| **Agent 記憶庫** | 永久記憶 | [Agent 記憶庫](https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132)；`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7` |
| **Mem0 `私人記憶`** | 短期的私人事務 | Composio 別名，勿硬編碼 ID。不帶 user |
| **Mem0 `團隊記憶`** | 短期的全域與一般 | 先 Composio；無則 Mem0 MCP。全域不帶 user；一般才帶身份 |
| **Cursor Notion Memory** | Notion 個人摘要，不是永久記憶，也不是私人記憶庫 | `notion-memory-search`；先讀 `notion://docs/memory` |

組織知識庫（SOP、研究全文）仍走 `$my-notion` + 專案 `notion.knowledge_db`，不與 Agent 記憶庫混用。

## Agent 記憶庫（Notion）

永久記憶。短期不要寫進這裡。

- DB：[Agent 記憶庫](https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132)
- Data source：`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7`

**查**：`狀態=有效` 且 `AI 可用`，再依目前客戶端的 `scope`／`user_id`／`agent_id` 過濾，並可一併讀 `scope=global` 且 `user_id` 為空的列。命中後讀 `目前值`。禁整庫拉。

**寫**：欄位與允許值只用 [schemas.md](schemas.md)。從短期整理進來時，先照 [`my-memory-consolidate`](../../my-memory-consolidate/SKILL.md) 去重並合併，再更新同一隔離鍵，不重複新增。去重先對新鍵 `scope|user_id|agent_id|記憶鍵`，沒有再對舊鍵 `user_id|agent_id|記憶鍵`。對到就更新那一筆。這次不改寫既有列。

敏感度高於「一般」時謹慎寫入。工具細節 → [`$my-notion`](../../my-notion/SKILL.md)。

## Cursor Notion Memory

1. 本對話首次使用前讀 `notion://docs/memory`。
2. 搜尋：`notion-memory-search`；必要時 fetch About（`id: "memory"`）。
3. 這裡只放 Notion 個人摘要。私人事務寫 Mem0 `私人記憶`。永久事實寫 Agent 記憶庫。同一事實只留一處。

## Mem0

**讀**：照上面的讀取時機與方法。問題自足或禁止時不搜。

**通路（依序）**：
1. **Composio**：搜尋 `mem0` toolkit；ACTIVE 時用別名 `私人記憶`／`團隊記憶` 選帳，勿硬編碼 ID。
2. **Mem0 MCP**：Composio 沒接上、要重新登入或呼叫失敗時，先說 Composio 失敗，再在 MCP 目錄找 `mem0`／`Mem0` namespace（或含 search／add／update／delete memory 的工具），先讀 schema 再呼叫。
3. 兩者皆無，或連線失敗 → 先說哪條失敗。短期就回報無法使用 Mem0，不要改寫進永久庫。

**空間**：`私人記憶`＝短期私人事務（與 Grok Bot 同一個庫）。`團隊記憶`＝短期的全域與一般。私人與團隊跨庫先問。

**身份**：照上面的身份表。全域與一般同在 `團隊記憶`，只靠帶不帶身份分開。讀全域不能排除帶了 user 或 agent 的紀錄時，先停下來問。讀一般一定帶身份。工具若硬要身份欄，先停下來問，不要猜，也不要改成依 session 換 id。

**流程**：語意搜尋優先 → 只用不猜的正式工具／參數 → 不靜默切 scope。

**寫改刪**：先搜去重 → 單一耐久事實 → 驗證；改刪前顯示並取得同意。推測不得當使用者事實。

**整理計數**（要不要升永久見 [`my-memory-consolidate`](../../my-memory-consolidate/SKILL.md)）：

- `metadata.weight`：`high` 或 `normal`
- `metadata.read_count`：整數，只在有目的採用時加 1
- 搜尋相似度不是這兩個欄位
- 用該筆記憶 id 更新 metadata。新增工具若沒有 metadata 欄，寫入成功後再更新，不要另開一筆

