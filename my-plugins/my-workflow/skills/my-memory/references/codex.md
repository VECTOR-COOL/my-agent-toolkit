# Codex 外部記憶存取規則

適用 Codex CLI、IDE 外掛，以及 ChatGPT 桌面 App 裡的 Codex。跟 ChatGPT 聊天記憶分開，不要併進 [chatgpt.md](chatgpt.md)。主 skill 見 `../SKILL.md`；只限 Codex 時，衝突以本檔為準。

## 內建記憶

- 存在這台電腦的 `~/.codex/memories/`（家目錄若改過，以 `CODEX_HOME` 為準）。預設關閉，不跨裝置。
- `/memories` 管的是這份本機記憶，不是 Mem0，也不是 ChatGPT 帳號記憶。
- 不要手改那些檔當正式寫入。

## 外部後端

- 先判斷短、中、永久。永久寫 Agent 記憶庫，並抄入當時的 `scope`、`user_id`、`agent_id`。沒有 Notion 工具就回報。
- 短期私人走別名 `私人記憶`，不帶 user。短期全域走 `團隊記憶`，不帶 user、不帶 agent。排除不了帶身份的紀錄就先問，不要把整庫當全域。
- 短期一般尚未定義 Codex 的 `user_id`。先問，不要仿 `gpt`／`claude`，不要按 session 換，也不要設 `agent_id`。
- 勿硬編碼 ID。私人與團隊跨庫先問。短期沒有 Mem0 就回報，不要改寫進永久庫。
- 使用者說「請記住」：本機記憶不會進 ChatGPT。跨裝置要另寫 Mem0 或 Agent 記憶庫，先說寫去哪。

## 何時讀

1. 使用者要求回想，或任務依賴對話外的舊偏好。
2. 外部記憶先查 Agent 記憶庫，不夠再查 Mem0。本機記憶另算，不要和外部記憶混成同一來源。

## 何時寫

- 只寫耐久事實與偏好。寫入 Mem0 用 `infer=true`。這一則對話已有同一事實的 id 就更新，否則直接新增，不要先搜一輪去重。語意去重、加權與遺忘由排程 agent 的 `my-memory-consolidate` 做，對話中不做。
- 使用者指定的改或刪，先顯示並取得同意。遺忘條件成立就刪除該筆 Mem0。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要把 ChatGPT 帳號記憶當成已經在這台 Codex 裡。
