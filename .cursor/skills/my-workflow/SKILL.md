---
name: my-workflow
description: 依使用者工作習慣選規則與 skill：繁體中文、按需載入、記憶走 my-memory、腳本用 mjs。用於新對話、不知道該用哪個 skill、要記得偏好，或跨裝置工作流時。
---

# 工作流入口

先讀這份，再只載當前任務需要的 skill。細節見 [工作習慣](references/work-habits.md)。

- 回覆繁體中文，精簡、說人話。
- 不要一次載入全部 skills 或規則。
- 有明確目的才用 `my-memory`；寫入要確認；禁止憑證。
- 專案腳本用 `.mjs`；不要為本專案新寫 Python 或 PowerShell。
- Git：禁止 force push 到保護分支；不提交 secrets。本地要使用者要求才 commit。只有確定是 Cursor Cloud 才自動 commit 到 `develop`、不開 PR。不確定就當本地。
- `GLOBAL_AGENTS.md` 只依 [工作習慣](references/work-habits.md) 的順序找。找不到就只用本 plugin。
- 與第三方 plugin 規則衝突時，以本 plugin 與專案 `AGENTS.md` 為準。
- UI 工作才載入設計規則；有 `DESIGN.md` 就當設計來源。

常用 skill：`my-memory`、`my-docs`、`my-review`、`my-commit-all-and-push`、`my-codebase-init`、`my-plugin-update`。
