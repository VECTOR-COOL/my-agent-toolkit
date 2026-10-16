# 記憶後端細節

主流程與判斷規則在 [SKILL.md](../SKILL.md)。這份只在實際讀寫後端時才讀。

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

**查**：`狀態=有效` 且 `AI 可用` → 再依 `scope`／`類別`／`關鍵字` 過濾；命中後讀 `目前值`；禁整庫拉。不要用 user 或 Mem0 的 agent 來拆開。

**寫**（同隔離範圍以 `記憶鍵`／`隔離鍵` 去重，更新勿重複新增）：

| 必填／常用 | 說明 |
|------------|------|
| 記憶 | 標題 |
| 記憶鍵 | 穩定語意鍵 |
| 目前值 | 簡短有效事實 |
| 層級 | 永久用 `profile` |
| scope | 沿用庫內既有值；不確定用 `global` |
| 狀態 | 預設 `有效`；過時→`已過時`／`封存` |
| AI 可用 | 允許 Agent 使用時勾選 |
| 來源 | 優先 `使用者明示`／`使用者確認`；`AI 推定` 須標待確認 |
| 隔離鍵 | `scope\|記憶鍵`。不要用 user 或 Mem0 的 agent 拆開 |

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
