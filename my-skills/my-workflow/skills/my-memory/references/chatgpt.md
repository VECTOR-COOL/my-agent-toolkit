# ChatGPT 外部記憶存取規則

適用 ChatGPT 網頁、手機 App，以及桌面 App 裡的 Chat／Work。這些共用帳號記憶。桌面 App 裡的 Codex 不走這份，見 [codex.md](codex.md)。主 skill 見 `../SKILL.md`；只限 ChatGPT 時，衝突以本檔為準。

## 內建記憶

- 網頁、手機 App、桌面的 Chat／Work：設定裡的 ChatGPT 記憶，跟帳號走。記憶要開著才會存；臨時對話不會存。我們沒有保證寫入的開關。
- 這不是 Mem0，也不是 Codex 本機記憶。不要用 Grok Bot 的 `agent_id`。
- 使用者說「請記住」：帳號記憶由平台決定留不留。要讓 Cursor、Grok Bot、Codex 以後看得到，另寫外部後端，先說寫去哪。同一事實只寫一個主後端。

## 外部後端

- 先判斷短、中、永久。永久寫 Agent 記憶庫，整理時 `scope=general`、`user_id=gpt`、`agent_id` 留空。沒有 Notion 工具就回報。
- 短期私人：別名 `私人記憶`，不帶 user。
- 短期全域：別名 `團隊記憶`，不帶 user、不帶 agent。搜尋若不能排除帶了身份的紀錄，先停下來問，不要把整庫當全域。
- 短期一般：別名 `團隊記憶`，一定帶 `user_id=gpt`，所有 session 共用。不設 `agent_id`，不要用 Grok Bot 的 agent，也不要省略身份去讀。
- 私人與團隊跨庫先問。沒有 Composio 就依主 skill，短期不要改寫進永久庫。
- Cursor Notion Memory 只是 Notion 個人摘要，不是永久記憶，也不是私人記憶庫。沒有工具就跳過。

## 何時讀

1. 使用者要求回想，或任務依賴對話外的舊偏好。
2. 不要每則訊息都搜尋。問題自足就不要讀。

## 何時寫

- 只寫耐久事實與偏好。先搜尋去重；有就更新。
- 一則一個事實，繁體中文。改或刪之前先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
