# 元件目錄

先讀這份，再只載當前那一列的 skill。沒有斜線命令的 client 忽略最後一欄。

| 何時 | 讀這個 skill | Cursor 斜線 |
|------|----------------|---------------|
| 新對話、不知用哪個 | `my-workflow`（本入口） | `/my-workflow-start` |
| 檢查或更新本 plugin | `my-plugin-update` | `/my-workflow-update` |
| 記住／回想偏好與決策 | `my-memory` | `/my-workflow-memory` |
| 操作 Notion 資料結構 | `my-notion` | `/my-workflow-notion` |
| 寫技術文件、AGENTS／README | `my-docs` | `/my-workflow-docs` |
| 審查計畫或實作 | `my-review` | `/my-workflow-review` |
| 寫 PRD | `my-create-prd` | `/my-workflow-create-prd` |
| 清理 codebase | `my-codebase-clear` | `/my-workflow-codebase-clear` |
| 從模板初始化專案 | `my-codebase-init` | `/my-workflow-codebase-init` |
| 全部 commit 並 push | `my-commit-all-and-push` | `/my-workflow-commit-all-and-push` |
| 對齊 Cursor Cloud 環境 | `my-cursor-cloud-env-init` | `/my-workflow-cursor-cloud-env-init` |
| 調度平行 subagent | `my-subagent` | `/my-workflow-subagent` |
| 安全升級計畫 | `my-upgrade-plan` | `/my-workflow-upgrade-plan` |

Cursor 規則（不是 skill）：`my-workflow.mdc` 一律載入；`my-git.mdc`、`my-docs-style.mdc`、`my-ui-design.mdc` 按任務載。細節見 `plugins/my-workflow/AGENTS.md`。

記憶依客戶端只讀 `skills/my-memory/references/` 裡對應的那一份。
