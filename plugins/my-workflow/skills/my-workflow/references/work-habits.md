# 工作習慣

這份給需要細節時才讀。入口仍是 `skills/my-workflow/SKILL.md`。

## 語言與篇幅

- 繁體中文。專有名詞可留英文。
- 短句、直接說結論。
- 文件精簡。流程圖用 `graph TD`／`graph LR`／`graph TB`，不用 `flowchart`。

## 按需載入

- 啟動時不要讀完整 plugin。
- 依任務選一個最小 skill 集合。
- 同一對話已讀過的檔案不要重複讀。
- 超過約 200 行的檔，先讀摘要或索引。

## 記憶

- 先判斷短、中、永久。細節見 `my-memory`。
- 永久記憶是 Notion 的 Agent 記憶庫。
- 短期私人走 `私人記憶`，不帶 user。短期全域走 `團隊記憶`，不帶 user。
- 短期一般只有 Grok Bot 分 agent 與 user。ChatGPT 用 `user_id=gpt`，Cursor 用 `user_id=cursor`，各自所有 session 共用。
- 讀之前要有目的。寫入要使用者確認。禁止密碼、Token、金鑰。

## Git

- 禁止 force push 到 `main`、`develop`、`release/*`。
- 不提交 `.env`、金鑰、憑證。
- 本地：使用者要求才 commit。
- Cursor Cloud：完成後 commit 到 `develop`，除非使用者要求否則不開 PR。
- 判斷 Cloud 只能依使用者明示或工作區就是 Cloud Agent。禁止掃系統來猜。不確定當本地。

## GLOBAL_AGENTS.md

只依這個順序找，找到就讀，找不到就停：

1. 環境變數 `AI_ASSISTANTS_HOME` 或 `GLOBAL_AGENTS_PATH`
2. 工作區 `ai_assistants.yaml` 若寫了路徑
3. 工作區內檔名剛好是 `GLOBAL_AGENTS.md`

禁止把 `D:\PROJECTS\AI-Assistants\...` 當必要路徑。禁止掃整個磁碟。

## 腳本

- 本專案新腳本用 Node ESM（`.mjs`）。
- 優先用 Node 內建 API。沒有具體需要時不加 npm 套件。
- 會改檔的腳本要有 `--help`、非零失敗碼；預設不覆寫既有檔。

## 設計與 UI

僅在前端／UI 任務才載入。有 `DESIGN.md` 就沿用，不要另發明一套顏色與間距。
