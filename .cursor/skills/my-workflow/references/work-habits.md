# 工作習慣

這份給需要細節時才讀。入口仍是 `skills/my-workflow/SKILL.md`。

## 語言與篇幅

- 繁體中文。少用難懂縮寫。第一次出現時用白話補一句。
- 回覆短、直接說結論，少佔輸出。
- 文件言簡意賅，包含 skill、規格、說明。能用一句話說完就不要開長段。
- 可以用 mermaid。流程圖用 `graph TD`／`graph LR`／`graph TB`，不用 `flowchart`。

## 按需載入

- 啟動時不要讀完整套件。
- 入口載入後，用索引的 when 與 keywords 對任務。對上才讀那個 SKILL.md。
- 同一對話已讀過的檔案不要重複讀。
- 超過約 200 行的檔，先讀摘要或索引。
- 不要為了「懂我」去讀完整 `my-workflow` skill；細節等任務需要再載。

## 記憶

判斷、身份與後端規則以 `my-memory` 為準，這裡不重複。讀之前要有目的；寫入要使用者確認；禁止密碼、Token、金鑰。

## MCP 連線

Skill 依賴的 MCP 連不上時，先告訴使用者：

- 哪個 skill
- 哪條連線（例如 Notion、Composio Mem0）
- 是沒接上、要重新登入，還是呼叫報錯

不要貼 token、金鑰，或含憑證的錯誤全文。能做的部分繼續，並說明哪一步沒做。改走備用通路之前，也要先說原本那條失敗。

## Git

- 禁止 force push 到 `main`、`develop`、`release/*`。
- 不提交 `.env`、金鑰、憑證。
- 本地：使用者要求才 commit。
- Cursor Cloud Agent、建立雲端工作環境、開／續／查／停雲端對話：載 `my-cursor-cloud-agent`。交付方式以那份為準。
- 判斷 Cloud 只能依使用者明示或工作區就是 Cloud Agent。禁止掃系統來猜。不確定當本地。

## GLOBAL_AGENTS.md

只依這個順序找，找到就讀，找不到就停：

1. 環境變數 `AI_ASSISTANTS_HOME` 或 `GLOBAL_AGENTS_PATH`
2. 工作區 `ai_assistants.yaml` 若寫了路徑
3. 工作區內檔名剛好是 `GLOBAL_AGENTS.md`

禁止把 `D:\PROJECTS\AI-Assistants\...` 當必要路徑。禁止掃整個磁碟。找不到就只用本套件。

## 腳本

- 本專案新腳本用 `.mjs`。PowerShell 容易卡住，不要新寫 PowerShell 或 Python。
- 這只限專案自己的程式。既有第三方不改，也不改第三方套件。
- 優先用 Node 內建 API。沒有具體需要時不加 npm 套件。
- 會改檔的腳本要有 `--help`、非零失敗碼；預設不覆寫既有檔。

## 設計與 UI

介面任務才載 `my-ui-ux`。有 `DESIGN.md` 就沿用，不要另發明一套顏色與間距。沒有設計來源時，先補設計決策再寫畫面。

## 雲端

Cursor Cloud Agent、建立雲端工作環境、開／續／查／停雲端對話：載 `my-cursor-cloud-agent`。不要先開網頁。
