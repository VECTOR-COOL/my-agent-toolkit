---
name: my-workflow
description: 工作流入口。每次先載 my-rules（通用規則）與 my-memory（記住、回想、偏好、決策），再讀 references/index.yaml，依 when 或 keywords 只載對上的那一個 skill。用於規則、記憶、Notion、文件規格、介面設計、審查、產品需求、提交推送、Cursor Cloud Agent、清理或初始化專案、升級、平行分工、更新 skills，或不確定該用哪個 skill 時。
---

# 工作流入口

先做這三步，不要一次讀完整套件：

1. 讀 `skills/my-rules/SKILL.md`。每個任務都要。
2. 讀 `skills/my-memory/SKILL.md`。記住、回想、偏好、決策、歷史脈絡時，優先於其他 skill。沒有這類目的就不要查記憶。
3. 讀 [索引](references/index.yaml)。用 `when` 或 `keywords` 對上後，只載那一個 skill。

改這個套件先對 `AGENTS.md`。Cursor 斜線用 `/my-workflow`。
