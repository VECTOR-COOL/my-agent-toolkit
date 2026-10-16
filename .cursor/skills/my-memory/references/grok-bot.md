# Grok Bot 外部記憶存取規則

適用所有 Grok Bot（小安的 AI 團隊）。主 skill 見 `../SKILL.md`。庫與身份以本檔為準。寫入要確認，跟主 skill 一樣。套件怎麼維護以 `my-skills/my-workflow/AGENTS.md` 為準。安裝見 `README.md`。

## 後端與管線

- 主後端：**Composio Mem0**（`mem0` toolkit）。勿直連 Mem0 API key 或獨立 Mem0 外掛。
- 多管線，用別名選帳，勿硬編碼 ID：
  - `私人記憶`：短期私人事務，不帶 user。
  - `團隊記憶`：短期的全域與一般。全域不帶 user。
- 永久記憶寫 Notion 的 Agent 記憶庫，不寫進 Mem0。見主 skill。
- 跨管線讀寫先問小安。

## 範圍

先判斷短、中、永久（見主 skill）。短期 Mem0 用下表。整理進永久時抄同一組身份：一般是 `scope=general`、`user_id=xiaoan`、`agent_id` 為該 bot UUID；私人與全域兩欄留空，`scope` 分別是 `private`、`global`。

| 範圍 | 庫與身份 | 放什麼 |
|------|----------|--------|
| 私人 | `私人記憶`，不帶 user | 小安私人事務 |
| 全域 | `團隊記憶`，不帶 user | 重要事實、小安偏好、跨團隊規則 |
| 一般 | `團隊記憶`。`user_id=xiaoan` 與 `agent_id=<該 bot 的 Grok Bot UUID>` | 只與該 bot 工作相關 |

UUID 還沒對上就留這個佔位，不要猜、不要抄別的 bot。ChatGPT、Cursor 不要占用這個 agent。顯示名不加 UUID。私人或全域若工具硬要身份欄，先停下來問。

## 何時讀

1. 新 chat 開啟，或閒置一陣子後重開：先讀全域（不帶 user、不帶 agent）、私人（不帶 user）、自己的一般 Mem0（`user_id=xiaoan` 加自己的 UUID）。讀全域若不能排除帶了 user 或 agent 的紀錄，先停下來問。永久原則改讀 Agent 記憶庫。
2. 任務依賴對話外的舊偏好、決策或脈絡時。
3. 不要每則訊息都搜尋。

讀法：`MEM0_PERFORM_SEMANTIC_SEARCH_ON_MEMORIES`（語意搜尋優先）或 `MEM0_GET_MEMORIES_BY_ENTITY`（entity_type=user/agent）。

## 何時寫

- 短期 Mem0 要小安確認才寫。不要伺機寫。
- 小安說「請記住」：先判斷時效。短期同時寫 Grok Bot 本地記憶與 Composio Mem0。要一直留、且達整理條件的，走 `my-memory-consolidate`：寫進 Agent 記憶庫後刪除該筆短期。
- 寫法：`MEM0_ADD_NEW_MEMORY_RECORDS`，要保留原文用 `infer=false`。
- 先搜尋去重；有就更新，不重複新增。一則一個事實，條目精簡，繁體中文（台灣）。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 修改或刪除記憶前，先顯示內容並取得小安同意。