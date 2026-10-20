---
name: my-claude-cloud-agent
description: 操作 Claude Code 雲端 session（cloud agent）：用 claude --cloud 開、-p --cloud 續送、--teleport 拉回，設定雲端環境與冷啟動，完成後 commit 並 push。不要用 PR 交付。用於雲端 agent、開雲端、冷啟動、claude --cloud、teleport、雲端環境時。
---

# Claude Cloud Agent

開、續、拉回 Claude Code 雲端 session，或建立、對齊雲端工作環境時載這份。指令細節、環境設定與限制見 [reference.md](references/reference.md)，出錯或要查設定才讀。

官方文件：

- 雲端 session：<https://code.claude.com/docs/en/claude-code-on-the-web>
- 雲端環境：<https://code.claude.com/docs/en/cloud-environments>
- CLI 參考：<https://code.claude.com/docs/en/cli-reference>
- 排程（routines）：<https://code.claude.com/docs/en/routines>

不確定是不是雲端就當本地，等使用者要求才 commit。禁止掃系統來猜。

## 交付

確定是雲端 session，或正在建立雲端工作環境：

- 完成後自動 commit 並 push，不要停在未提交。
- 預設交到 `develop`。熱修復交到使用者指定或既有的 `hot`／`hotfix`。使用者指定的分支優先。
- 不開 PR，除非使用者明確要求。
- 禁止 force push 到 `main`、`develop`、`release/*`。不提交 secrets。

## 雲端環境

1. 檢查或對齊環境設定（網路政策、環境變數、setup script），確保冷啟動正常。盡量腳本化。
2. 開一則新的雲端 session，指定要做的事與起始分支。
3. 專案要啟動的服務先啟動。有測試就跑；失敗就回到第 1 步。
4. 缺環境變數而過不了：說明 key 與值、存在專案哪個位置。環境變數所有能用該環境的人都看得到，機密改用 Network secrets。設定好後從第 1 步重來。
5. 冷啟動成功後，依上面的交付方式 commit 並 push。

## 操作 session

| 要做的事 | 指令 |
|---|---|
| 開一則 | `claude --cloud "要做的事"` |
| 同一則接著說 | `claude -p "後續指示" --cloud <session-id>`（送出即結束，不等回覆；要機器可讀加 `--output-format json`） |
| 拉回本機繼續 | `claude --teleport <session-id>`，或 session 內 `/teleport`、`/tasks` 按 `t` |
| 設預設環境 | `/remote-env`（只設定預設，不新增或編輯環境） |

- `--cloud` 會 clone 目前目錄 GitHub remote 的**目前分支**，不含本機未 push 的 commit。先 push 再開。
- 拉回本機要求：工作區乾淨、同一 repo、分支已 push、同一 claude.ai 帳號。拉回後是獨立副本。
- 需要 `claude auth login` 的 claude.ai 帳號；API key、Bedrock、Vertex 不支援。
- 成功時把 session 連結給使用者。

**查狀態與停止**：文件沒有 CLI 指令。先說沒有，請使用者到 claude.ai/code 檢視、封存或刪除。若目前 session 有 `claude-code-remote` MCP 工具（`create_session`、`send_message`、`get_session`、`list_events`、`interrupt_session`、`archive_session`），改用它們開、續、查、停。

**排程**：`/schedule`（`/routines`）建立與管理；API trigger 只能在網頁新增。

## 不要做

- 不要編造「查狀態」「停止」的 CLI 指令；沒有就是沒有。
- 沒有端點的動作（例如新增或編輯環境）先說沒有，請使用者到網頁設定，不要硬做。
- 不要把沒做完說成完成。不要把 token、金鑰寫進文件或回報。
