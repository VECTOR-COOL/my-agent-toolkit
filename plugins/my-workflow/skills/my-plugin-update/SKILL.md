---
name: my-plugin-update
description: 依 GitHub develop 更新 my-workflow。Cursor 團隊市集開了 Auto Refresh 就不要手動拉。Codex 用 marketplace upgrade。用於檢查更新或使用者要求更新時。斜線命令：/my-workflow-update。
---

# 檢查與更新 plugin

只更新 plugin 目錄，不是整個 repo：https://github.com/VECTOR-COOL/my-agent-toolkit/tree/develop/plugins/my-workflow

不要複製 plugin，不要改 Git 設定，不要強制推送。斜線命令：`/my-workflow-update`。

## 判斷

1. Cursor 已用團隊市集並打開 Auto Refresh：告訴使用者會自動更新。推上 `develop` 後重開視窗。不要再跑 pull。
2. Codex 或 ChatGPT 桌面：使用者要求更新時才跑 `codex plugin marketplace upgrade`。沒要求就只說明要跑這行。
3. Cursor Cloud：另跑 `node scripts/export-cursor-skills.mjs <目標專案> --force`，再在該專案 commit。
4. ChatGPT 網頁、grok.com、Grok Build 不能用這條 GitHub 更新。照實說。
