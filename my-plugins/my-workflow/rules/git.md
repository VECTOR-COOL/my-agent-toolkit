# Git 規則

做 commit、push、branch、merge、rebase、release、tag 前讀。

- 禁止 force push 到 `main`／`master`、`develop`、`release/*`；保護分支不重寫歷史（rebase、amend 已推送的 commit、`reset --hard`）。
- 不提交 secrets（`.env`、密碼、API key、token、私鑰）。
- 合併衝突要顯示內容並詢問，不自行決定，不用 force 或自動覆蓋。
- 合併進 `main`／`master`、`develop` 用 `--no-ff`。
- 發版（release、tag、版本）前先讀專案發版流程並逐步核對。
- 本地要使用者要求才 commit；不確定是否雲端就當本地，不掃系統猜環境。
- Cursor Cloud Agent 相關（建立環境、開／續／查／停對話）載 `my-cursor-cloud-agent`，不要先開網頁。
- commit 用 Conventional Commits：`type(scope): subject`，type 為 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`；祈使句、不超過 50 字元、不加句號；內文說 what 與 why；破壞性變更加 `!` 或 `BREAKING CHANGE:`。
