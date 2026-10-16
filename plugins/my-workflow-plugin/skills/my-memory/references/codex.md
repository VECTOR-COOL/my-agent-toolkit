# Codex 外部記憶存取規則

適用 Codex CLI、IDE 外掛，以及 ChatGPT 桌面 App 裡的 Codex。跟 ChatGPT 聊天記憶分開，不要併進 [chatgpt.md](chatgpt.md)。主 skill 見 `../SKILL.md`；只限 Codex 時，衝突以本檔為準。

## 內建記憶

- 存在這台電腦的 `~/.codex/memories/`（家目錄若改過，以 `CODEX_HOME` 為準）。預設關閉，不跨裝置。
- `/memories` 管的是這份本機記憶，不是 Mem0，也不是 ChatGPT 帳號記憶。
- 不要手改那些檔當正式寫入。

## 外部後端

- 要跨裝置、或給 Grok Bot／Cursor／ChatGPT 看：Composio Mem0，`user_id=xiaoan`。不用 `agent_id=grok-bot`，也不要新造 codex agent。沒有既有實體就只用 `user_id`。
- 別名 `私人記憶`／`團隊記憶`，勿硬編碼 ID。跨空間先問。
- 可索引的長期原則：Agent 記憶庫。沒有 Notion 工具就回報。
- 使用者說「請記住」：本機記憶不會進 ChatGPT。跨裝置要另寫 Mem0 或 Agent 記憶庫，先說寫去哪。

## 何時讀

1. 使用者要求回想，或任務依賴對話外的舊偏好。
2. 本機記憶與 Mem0 都有時，先講你用的是哪一份。不要混成同一來源。

## 何時寫

- 只寫耐久事實與偏好。先搜尋去重；有就更新。
- 改或刪之前先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要把 ChatGPT 帳號記憶當成已經在這台 Codex 裡。
