---
name: my-cursor-cloud-agent
description: 操作 Cursor Cloud Agent：用 API 開、續、查、停雲端對話，對齊雲端環境與冷啟動，完成後自動 commit。不要先開網頁，不要用 PR 交付。用於 Cloud Agent、開雲端、冷啟動、CURSOR_API_KEY、api.cursor.com 時。
---

# Cursor Cloud Agent

開、續、查、停雲端對話，或建立、對齊雲端工作環境時載這份。不要先開網頁。端點與錯誤對照見 [reference.md](references/reference.md)，出錯或要查端點才讀。

官方文件：

- API 總覽：<https://cursor.com/docs/api>
- 雲端對話端點：<https://cursor.com/docs/cloud-agent/api/endpoints>
- 畫面上的自動化：<https://cursor.com/docs/cloud-agent/automations>
- 自動化接口：<https://registry.terraform.io/providers/cursor/cursor/latest/docs>
- 自動化資源：<https://registry.terraform.io/providers/cursor/cursor/latest/docs/resources/platform_workflow>

呼叫基底是 `https://api.cursor.com`。標頭是 `Authorization: Bearer`，值用 `CURSOR_API_KEY`，不要寫進文件或回報。

不確定是不是雲端就當本地，等使用者要求才 commit。禁止掃系統來猜。

## 交付

確定是 Cursor Cloud，或正在建立雲端工作環境：

- 完成後自動 commit 並 push。不要停在未提交。
- 預設交到 `develop`。熱修復可交到使用者指定或既有的 `hot`／`hotfix`。
- 不要改開 PR。除非使用者明確要求，否則不建立 PR。
- 禁止 force push 到 `main`、`develop`、`release/*`。不提交 secrets。

## 雲端環境

1. 建立、檢查或對齊雲端環境腳本，確保冷啟動正常。盡量腳本化，減少臨時判斷。
2. 用下面的 API 開一則新的雲端對話。模型用 Grok 4.7 extra high fast。預設分支 `develop`。
3. 這個專案要啟動的服務先啟動。有測試就跑；失敗就回到第 1 步。
4. 本地與遠端都要能跑。
5. 缺環境變數而過不了：說明 key 與值、存在專案哪個位置。設定好後從第 1 步重來。
6. 冷啟動成功後，依上面的交付方式 commit 並 push。

## 用 API 操作對話

先跑這個 skill 資料夾裡的腳本。不要在對話裡重寫呼叫。

```text
node scripts/cursor-api.mjs check
```

Windows 使用者環境變數 `CURSOR_API_KEY`。腳本自己讀目前程序，沒有再讀使用者環境。不要印出金鑰。

| 要做的事 | 呼叫 |
|---|---|
| 金鑰通不通 | `check` |
| 開一則 | `open --prompt "要做的事" --repo "https://github.com/org/repo" --ref "分支"` |
| 同一則接著說 | `send <agentId> --prompt "後續指示"` |
| 現在做到哪 | `status <agentId>` |
| 短暫看會不會結束 | `watch <agentId>` |
| 停掉正在跑的那次 | `stop <agentId>` |
| 最近幾則 | `recent` |

成功時把回傳的 `url` 給使用者。

開新對話預設不開合併請求。要開才加 `--auto-pr`。`--ref` 用遠端已有的分支；使用者指定的優先。沒給 `--ref` 就不送起始分支。

`send` 若這則還在跑，腳本不會另開一則。`watch` 預設最多看 60 秒；要等久一點加 `--wait` 秒數，上限 300。時間到仍在跑，就告訴使用者還沒結束。

結束碼不是 0 時，讀 stderr 那一列 JSON。先讀 reference.md 的錯誤對照，用白話說明。對照沒有的狀態或訊息，再打開 JSON 裡的 `doc`，或上面的官方文件。

## 不要做

- 不要為了這些動作先打開環境頁。
- 畫面上的自動化不走這支腳本。
- 沒有端點的動作（例如網頁「儲存環境」）先說沒有，不要改去點網頁。
- 不要把沒做完說成完成。
