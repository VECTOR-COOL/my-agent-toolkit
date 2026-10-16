---
name: my-plugin-update
description: 檢查 my-workflow-plugin 是否落後遠端，並在使用者要求時用 git pull 與資料夾連結更新本機 Cursor、Codex、Grok Build。用於檢查更新、更新 plugin，或確認安裝連結是否還指到 repo 時。
---

# 檢查與更新 plugin

用 plugin 內的腳本。不要複製 plugin，不要改 Git 設定，不要強制推送。

```text
node scripts/update-plugin.mjs check
node scripts/update-plugin.mjs update
node scripts/update-plugin.mjs update --apply
```

在 `plugins/my-workflow-plugin` 執行。

## 判斷

1. 使用者只問有沒有更新：只跑 `check`。
2. 使用者要求更新：先跑 `update` 看預覽，再跑 `update --apply`。
3. 工作區有未提交變更，或本機與遠端分叉：停下來說明，不要拉、不要合併。
4. 連結指到別處：停下來，不要覆蓋。
5. ChatGPT 網頁與 grok.com 不能用這個指令更新。Cursor Cloud 要另外匯出到該專案。
