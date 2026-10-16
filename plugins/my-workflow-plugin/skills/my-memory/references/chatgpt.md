# ChatGPT 外部記憶存取規則

適用 ChatGPT 網頁與 ChatGPT App 的聊天。兩者共用同一套帳號記憶。桌面 App 裡的 Codex 模式不走這份，見 [codex.md](codex.md)。主 skill 見 `../SKILL.md`；只限 ChatGPT 時，衝突以本檔為準。

## 內建記憶

- 網頁與 App：設定裡的 ChatGPT 記憶，跟帳號走，跨裝置。
- 這不是 Mem0，也不是 Codex 本機記憶。不要寫進 `grok-bot`。
- 使用者說「請記住」：平台會自己存。若要讓 Grok Bot、Cursor、Codex 以後看得到，另寫 Mem0 或 Agent 記憶庫，先說寫去哪。

## 外部後端

- 跨客戶端：Composio Mem0。別名 `私人記憶`／`團隊記憶`，勿硬編碼 ID。跨空間先問。
- 可索引的長期原則：Agent 記憶庫（見主 skill）。沒有 Notion 工具就回報，不要假裝寫進去。
- 範圍：`user_id=xiaoan`。不要設 `agent_id=grok-bot`，也不要新造 chatgpt 的 agent。沒有既有實體就只用 `user_id`。

## 何時讀

1. 使用者要求回想，或任務依賴對話外的舊偏好。
2. 不要每則訊息都搜尋。問題自足就不要讀。

## 何時寫

- 只寫耐久事實與偏好。先搜尋去重；有就更新。
- 一則一個事實，繁體中文。改或刪之前先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
