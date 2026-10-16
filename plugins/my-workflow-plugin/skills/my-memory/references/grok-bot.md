# Grok Bot 外部記憶存取規則

適用所有 Grok Bot（小安的 AI 團隊）。主 skill 見 `../SKILL.md`；本檔只補 Grok Bot 專屬規則，衝突時以本檔為準。

## 後端與管線

- 主後端：**Composio Mem0**（`mem0` toolkit）。勿直連 Mem0 API key 或獨立 Mem0 外掛。
- 多管線，用別名選帳，勿硬編碼 ID：
  - `團隊記憶`：公司事務，公司類 bot 預設。
  - `私人記憶`：小安私人事務，只限私人助理。
- 跨管線讀寫先問小安。

## 範圍

| 範圍 | 參數 | 放什麼 |
|------|------|--------|
| 全域 | `user_id=xiaoan` | 重要事實、小安偏好、跨團隊規則 |
| 私人 | `agent_id=<該 bot 的 Grok Bot UUID>` | 只與該 bot 工作相關 |

顯示名不加 UUID。

## 何時讀

1. 新 chat 開啟，或閒置一陣子後重開：先讀全域 + 自己的私人記憶。
2. 任務依賴對話外的舊偏好、決策或脈絡時。
3. 不要每則訊息都搜尋。

讀法：`MEM0_PERFORM_SEMANTIC_SEARCH_ON_MEMORIES`（語意搜尋優先）或 `MEM0_GET_MEMORIES_BY_ENTITY`（entity_type=user/agent）。

## 何時寫

- 伺機寫入耐久事實與小安的偏好。
- 小安說「請記住」：**同時**寫 Grok Bot 本地記憶與 Composio Mem0。
- 寫法：`MEM0_ADD_NEW_MEMORY_RECORDS`，要保留原文用 `infer=false`。
- 先搜尋去重；有就更新，不重複新增。一則一個事實，條目精簡，繁體中文（台灣）。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 修改或刪除記憶前，先顯示內容並取得小安同意。