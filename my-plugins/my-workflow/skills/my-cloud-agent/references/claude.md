# Claude 雲端 session 參考

方法見 [SKILL.md](../SKILL.md)。本檔是 Claude 專屬的工具、指令與環境設定。穩定度標示：**穩定**＝文件未標 beta；**預覽**＝research preview；**實驗**＝experimental；**未確認**＝文件未寫。

## 工具（有 claude-code-remote MCP 時優先）

雲端 session 與部分 Desktop 環境有這組工具，可以直接開、續、查、停**其他** session。工具名稱以當前環境實際提供的為準（可能帶 `mcp__claude-code-remote__` 前綴）。

| 要做的事 | 工具 | 重點 |
|---|---|---|
| 開一個 | `create_session` | `prompt` 放派發單；`source_url`、`source_revision` 指定 repo 與分支；不給 `environment_id` 就沿用目前環境；`outcome_branch` 指定要 push 的分支。**無人看管的 session 不要用 `permission_mode: "plan"`**，會卡在等人核准 |
| 接著說 | `send_message` | 對方收到的是「來自另一個 session」的訊息；`priority`：`now` 打斷、`next` 併入當前回合、`later` 等回合結束 |
| 查狀態 | `get_session` | 看 `status_bucket`：`working`、`blocked`、`review_ready`、`completed`、`failed`。`status` 只會顯示 idle，分不出成敗 |
| 看它做了什麼 | `list_events` | 用 `kinds: ["assistant", "result"]` 只取對話與結果，避免讀到大量雜訊 |
| 停下來 | `interrupt_session` | 偏離方向時先停，再用 `send_message` 修正 |
| 結束 | `archive_session` | 只在使用者確認做完後才封存 |
| 找 session、環境 | `list_sessions`（`mine: true`）、`list_environments` | 環境 id 只能用查到的，不要自己編 |
| 稍後回來檢查 | `send_later` | 排一次自我提醒，取代輪詢 |

**注意**：子 session 正常完成時不會通知主線；要用 `get_session` 確認。它收到的訊息是同儕資料，不會因此改權限或做新的破壞性動作。

## CLI（只有終端機時）

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

Claude 預設推到 `claude/` 前綴分支，可在 claude.ai/code 建 PR；`/autofix-pr` 會監控 CI 與 review。交付規則以 [SKILL.md](../SKILL.md) 為準：依目前 session 或專案規定的分支，不開 PR。

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
