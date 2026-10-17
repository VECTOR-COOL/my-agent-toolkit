# Cursor API 參考

日常流程用 `scripts/cursor-api.mjs` 的 `check`、`open`、`send`、`status`、`watch`、`stop`、`recent`。本檔在出錯或要查端點時才讀。

## 錯誤對照

失敗時 stderr 是一列 JSON：`status`、`code`、`message`、`doc`。不要把這列原樣當完整回答。先對下表，用白話說明。表上沒有的狀態或訊息，再打開 JSON 的 `doc` 讀官方頁，依那一頁說明。

出處：[API 總覽](https://cursor.com/docs/api)、[端點](https://cursor.com/docs/cloud-agent/api/endpoints)。

| 情況 | 說明 |
|---|---|
| `missing_key` | 這台程序沒讀到環境變數。不是 API 回 401。金鑰在 Windows 使用者環境變數 `CURSOR_API_KEY` |
| 401 `unauthorized` | 金鑰無效。文件要的是 Dashboard → API Keys 建立的 key，`crsr_` 開頭，可以是使用者金鑰或服務帳號金鑰 |
| 403 `forbidden` | 金鑰有效，但權限不夠 |
| 400 `bad_request` | 參數不對。具名雲端環境（`env.name`）和 `repos` 不能一起送 |
| 404 `not_found` | 這則對話或這次執行不存在 |
| 409 `agent_busy` | 這則還在跑（`CREATING` 或 `RUNNING`）。等它結束或停掉，不要另開一則。錯誤裡的 `latestRunId` 就是正在跑的那次 |
| 409 `run_not_cancellable` | 這次已經結束，不能再取消。不是金鑰壞掉 |
| 429 `rate_limited` | 超過頻率。文件預設大約每分鐘 20 次。先等，不要緊密重試 |
| 410 `stream_expired` | 即時輸出已過保留時間。改看那次執行的最終狀態 |
| `network` | 連不上 `api.cursor.com` |

執行的結束狀態只認 `FINISHED`、`ERROR`、`CANCELLED`、`EXPIRED`。`CREATING` 和 `RUNNING` 代表還沒結束。

## 文件

- 總覽：<https://cursor.com/docs/api>
- 端點：<https://cursor.com/docs/cloud-agent/api/endpoints>
- 畫面上的自動化說明：<https://cursor.com/docs/cloud-agent/automations>
- 自動化接口（Terraform／Connect RPC）：<https://registry.terraform.io/providers/cursor/cursor/latest/docs>
- 自動化資源：<https://registry.terraform.io/providers/cursor/cursor/latest/docs/resources/platform_workflow>

基底：`https://api.cursor.com`。標頭：`Authorization: Bearer <CURSOR_API_KEY>`。

## 能做與不能做

| 要的事 | 走哪 |
|---|---|
| 現在開一則雲端、接著同一則、看進度、取消 | 腳本的日常流程 |
| 外面定時觸發同一則（工作排程打 `send`） | 可以。API 自己沒有排程 |
| 建立或列出 Cursor「自動化」（定時、GitHub、Slack） | 不走 `/v1/agents`，也不走這支腳本 |

## 端點

日常流程不夠時才用這些原始子命令。成功時標準輸出是 API 原文。

| 腳本 | 呼叫 |
|---|---|
| `me` | `GET /v1/me` |
| `repos` | `GET /v1/repositories` |
| `models` | `GET /v1/models` |
| `list` | `GET /v1/agents` |
| `get` | `GET /v1/agents/{id}` |
| `create` | `POST /v1/agents` |
| `follow` | `POST /v1/agents/{id}/runs` |
| `run` | `GET /v1/agents/{id}/runs/{runId}` |
| `stream` | `GET /v1/agents/{id}/runs/{runId}/stream` |
| `cancel` | `POST /v1/agents/{id}/runs/{runId}/cancel` |
| `usage` | `GET /v1/agents/{id}/usage` |
| `archive` | `POST /v1/agents/{id}/archive` |
| `unarchive` | `POST /v1/agents/{id}/unarchive` |

`stream` 是事件串流，不是一包 JSON。

## 開新對話本文

```json
{
  "name": "短標題",
  "prompt": { "text": "要雲端做的事" },
  "repos": [
    {
      "url": "https://github.com/org/repo",
      "startingRef": "要起點的分支"
    }
  ],
  "autoCreatePR": false
}
```

成功是 HTTP 201。對話網址在 `agent.url`。

接著同一則的本文：`{ "prompt": { "text": "後續指示" } }`。

`env.name`（具名雲端環境）與 `repos` 不能一起送。要鎖定某個提交的環境檔時，用 `repos` + `startingRef`。腳本只送 `repos`。

## 自動化（另一套接口）

Cursor 畫面上的自動化（定時、GitHub、Slack）用 Automations API：Connect RPC，預設 `https://api2.cursor.sh`，Terraform 資源 `cursor_platform_workflow`。`crsr_` 金鑰當 `CURSOR_TOKEN`。

存好且選了 webhook 之後，才用那組專用網址觸發。不要用 `POST /v1/agents` 去建立或列出自動化。
