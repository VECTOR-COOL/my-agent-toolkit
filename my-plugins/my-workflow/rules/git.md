# Git 規則

做 commit、push、branch、merge、rebase、release、tag 前讀。

- 禁止 force push 到 `main`／`master`、`develop`、`release/*`；保護分支不重寫歷史（rebase、amend 已推送的 commit、`reset --hard`）。
- 不提交 secrets（`.env`、密碼、API key、token、私鑰）。
- 合併衝突要顯示內容並詢問，不自行決定，不用 force 或自動覆蓋。
- 合併進 `main`／`master`、`develop` 用 `--no-ff`。
- 發版（release、tag、版本）前先讀專案發版流程並逐步核對。
- 本地要使用者要求才 commit；不確定是否雲端就當本地，不掃系統猜環境。
- 雲端 agent session 相關（建立環境、開／續／查／停對話）載 `my-cloud-agent`。
- 動手前先 `git pull`：專案常有多個 session 同時在改。本地有未提交改動就先 stash 再拉；撞到衝突先給使用者看，不自行決定。
- commit 前看 `git status`，只加自己改的檔；不帶別的 session 或未追蹤的檔，也不用 `git add .`。
- 「commit」只推開發分支；合併 `main`（對外發布）要使用者明說才做。
- 改 plugin 內容先跑 `check-release.mjs`，通過才 commit；發布才升版，未發布的版本內直接累積。
- commit 用 Conventional Commits：`type(scope): subject`，type 為 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`；祈使句、不超過 50 字元、不加句號；內文說 what 與 why；破壞性變更加 `!` 或 `BREAKING CHANGE:`。
