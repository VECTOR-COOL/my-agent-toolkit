---
name: my-workflow
description: 依使用者的工作習慣，從索引挑出任務所需的單一 skill 並載入。用於新對話開始、不確定該用哪個 skill、需要套用偏好，或跨裝置工作流時。
---

# 工作流入口

通用規則（語言、Git、MCP 失敗回報、腳本、憑證）在 `my-rules`，每個任務先載它。再依 [元件目錄](references/index.yaml) 的 `when` 或 `keywords`，只載需要的那一個 skill，不要一次全載。細節見 [工作習慣](references/work-habits.md)。

- 有明確目的才用 `my-memory`；寫入要確認。
- Cursor Cloud Agent 相關：載 `my-cursor-cloud-agent`。介面工作才載 `my-ui-ux`。

改這個套件先對 `my-skills/my-workflow/AGENTS.md`，安裝見 `README.md`。Cursor 斜線用 skill 名，例如 `/my-workflow`。
