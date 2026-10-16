# Cursor 外部記憶存取規則

適用 Cursor IDE 與 Cursor Cloud。Cloud 裡用 Grok 模型的那個也走這份，它不是 Grok Bot App（Grok Bot 見 [grok-bot.md](grok-bot.md)）。主 skill 見 `../SKILL.md`；只限 Cursor 時，衝突以本檔為準。

## 後端

IDE 與 Cloud 用同一套，依主 skill 選一個主後端：

| 後端 | 何時用 | 範圍 |
|------|--------|------|
| Agent 記憶庫 | 長期、可索引的偏好與原則 | `user_id=xiaoan`；全域 `agent_id` 留空 |
| Cursor Notion Memory | 個人、跨客戶端 | `notion-memory-search`；先讀 `notion://docs/memory` |
| Mem0 | 上面不夠時的語意快查 | `user_id=xiaoan`；不要用 `agent_id=grok-bot` |

Mem0 別名 `私人記憶`／`團隊記憶`，勿硬編碼 ID。跨空間先問。

## IDE 與 Cloud

- 記憶放哪裡相同。差在 skill 怎麼到：IDE 用本機 plugin 連結；Cloud 讀該 repo 匯出的 `.cursor/skills`。
- Cloud 讀不到家目錄，也不讀 `~/.codex/memories`。不要把本機檔當 Cloud 的記憶。

## 何時讀

1. 有明確目的：回想、或任務依賴對話外的舊偏好。
2. 不要每則訊息都搜尋。

## 何時寫

- 使用者說「請記住」或指定後端才寫。先說寫去哪一個後端。
- 先搜尋去重；有就更新。改或刪之前先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要把 Cursor 的記憶寫進 Grok Bot 的 `agent_id`。
