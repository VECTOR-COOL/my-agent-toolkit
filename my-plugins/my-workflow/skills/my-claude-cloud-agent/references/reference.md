# Claude 雲端 session 參考

日常流程見 [SKILL.md](../SKILL.md)。本檔在出錯或要查環境設定時才讀。穩定度標示：**穩定**＝文件未標 beta；**預覽**＝research preview；**實驗**＝experimental；**未確認**＝文件未寫。

## 指令

| 指令 | 說明 | 穩定度 |
|---|---|---|
| `claude --cloud "任務"` | 開新雲端 session。`--remote` 是已棄用的別名 | 穩定 |
| `claude -p "訊息" --cloud <id>` | 續送，送出即結束 | 穩定 |
| `claude --teleport [<id>]` | 拉回本機；不給 id 則選單 | 穩定 |
| `/remote-env` | 設定 CLI 開雲端 session 的預設環境 | 穩定 |
| `/schedule`、`/routines` | 排程任務；`list`、`update`、`run` | 預覽 |
| 查狀態、停止雲端 session | 無 CLI 指令，到 claude.ai/code | 未確認有公開 API |

沒有 GitHub remote 時，`--cloud` 會打包上傳本機 repo（`CCR_FORCE_BUNDLE=1` 可強制）。組織需啟用 `allow_remote_sessions`。

## 環境

- 在 claude.ai/code 的環境設定對話框建立；組織 Owner 可在 admin settings 建共享環境。預設環境為 Default，網路 Trusted。
- **網路政策**：None、Trusted（預設白名單：套件 registry、GitHub、雲端 SDK）、Custom（自訂 allowed domains）、Full。
- **環境變數**：`.env` 格式，能用該環境的人都看得到，不放機密。
- **Secrets**：Network secrets，設定 host 後由 agent proxy 在離開 VM 時附加，session 內看不到。Enterprise 一般成員新增需 admin 權限。
- **Setup script**：Bash，session 啟動前執行，約 5 分鐘內完成的結果會被快取。每次啟動都要跑的專案安裝改用 SessionStart hook。
- **GitHub**：安裝 Claude GitHub App，或在終端機執行 `/web-setup`。託管環境的 credential 不進 VM，走 GitHub proxy。

## 交付

Claude 預設推到 `claude/` 前綴分支，可在 claude.ai/code 建 PR；`/autofix-pr` 會監控 CI 與 review。本 plugin 的交付規則（SKILL.md）優先：交到使用者指定分支，預設 `develop`，不開 PR。

## HTTP 入口

沒有公開的建立、查詢、中止 session 的 API。唯一文件化的是排程任務觸發（**實驗**）：

`POST https://api.anthropic.com/v1/claude_code/routines/{trig_id}/fire`，標頭 `Authorization: Bearer <routine token>`、`anthropic-version: 2023-06-01`，body `{"text": "..."}`（上限 65,536 字元），回傳 `claude_code_session_id` 與 `claude_code_session_url`。token 只能在 claude.ai/code/routines 產生，只能觸發該 routine，不是 API key。Managed Agents 是另一個產品，不是這裡的雲端 session。

## 常見問題

| 情況 | 說明 |
|---|---|
| `--cloud` 開了但缺最新程式 | 它 clone 的是已 push 的分支，先 push |
| 拉回本機失敗 | 檢查工作區乾淨、同一 repo、分支已 push、同一帳號 |
| 套件或網站連不上 | 網路政策不是 Full；把網域加進 Custom 的 allowed domains |
| 認證失敗 | 需 `claude auth login`；API key 不支援雲端 session |
