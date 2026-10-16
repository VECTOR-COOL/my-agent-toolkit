# Cursor 外部記憶存取規則

適用 Cursor IDE 與 Cursor Cloud。Cloud 裡用 Grok 模型的那個也走這份，它不是 Grok Bot App（Grok Bot 見 [grok-bot.md](grok-bot.md)）。主 skill 見 `../SKILL.md`；只限 Cursor 時，衝突以本檔為準。

## 後端

先判斷短、中、永久。IDE 與 Cloud 的記憶放同一處：

| 後端 | 何時用 | 範圍 |
|------|--------|------|
| Mem0 `私人記憶` | 短期私人事務 | 不帶 user；不設 `agent_id` |
| Mem0 `團隊記憶` | 短期全域 | 不帶 user、不帶 agent。排除不了帶身份的紀錄就先問 |
| Mem0 `團隊記憶` | 短期一般 | 一定帶 `user_id=cursor`；IDE 與 Cloud 所有 session 共用；不設 `agent_id` |
| Agent 記憶庫 | 永久記憶 | 整理時 `scope=general`、`user_id=cursor`、`agent_id` 留空 |
| Cursor Notion Memory | Notion 個人摘要，不是永久記憶 | `notion-memory-search`；先讀 `notion://docs/memory` |

## IDE 與 Cloud

- skill 怎麼到不一樣：IDE 可用 `gh skill` 裝進本機；Cloud 讀該 repo 匯出的 `.cursor/skills`。
- Cloud 要自己接上 Notion／Composio。家目錄的連結帶不過去，也讀不到 `~/.codex/memories`。不要把本機檔當 Cloud 的記憶。

## 何時讀

1. 有明確目的：回想、或任務依賴對話外的舊偏好。
2. 先查 Agent 記憶庫的永久記憶。不夠再查 Mem0。
3. 不要每則訊息都搜尋。

## 何時寫

- 使用者說「請記住」或指定後端才寫。先說寫去哪一個後端。
- 寫入 Mem0 用 `infer=true`。這一則對話已有同一事實的 id 就更新，否則直接新增，不要先搜一輪去重。查到 Mem0 才依 `my-memory-consolidate` 做語意去重與加權。改或刪之前先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要把 Cursor 的記憶寫進 Grok Bot 的 `agent_id`。
