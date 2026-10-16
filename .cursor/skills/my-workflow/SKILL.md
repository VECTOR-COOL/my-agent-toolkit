---
name: my-workflow
description: 私人工作流的路由入口。任務開始先載 my-rules；涉及記住／回想／偏好／決策再載 my-memory；其餘依 references/index.yaml 的 when 或 keywords 只載一個子 skill。用於分流任務、不確定該用哪個 skill、或要改 workflow 套件本身時。維護準則見 AGENTS.md。
---

# 工作流入口

這份 skill **只負責分流**，不是規則全文。通用守則在 `skills/my-rules/SKILL.md`；維護、安裝、版本在 [`AGENTS.md`](AGENTS.md)。

```mermaid
graph TD
  Start[收到任務] --> Rules[載入 my-rules]
  Rules --> Mem{需要記憶?}
  Mem -->|是| Memory[載入 my-memory]
  Mem -->|否| Index[讀 references/index.yaml]
  Memory --> Index
  Index --> One[只載入一個對上的子 skill]
  One --> Work[執行任務]
```

## 何時載這份

- 新對話開始、不確定該用哪個 skill。
- 使用者提到工作習慣、入口、選 skill、改 my-workflow 套件。

## 載入順序

路徑皆相對於**本 skill 套件根目錄**（內含這份 `SKILL.md` 的那一層）。

1. **`skills/my-rules/SKILL.md`** — 每個任務都要，內容不重複在這裡。
2. **`skills/my-memory/SKILL.md`** — 僅在「記住、回想、偏好、決策、歷史脈絡」時，且優先於其他子 skill。
3. **[`references/index.yaml`](references/index.yaml)** — 用 `when` 或 `keywords` 對上**一筆**後，只載 `skills/<name>/SKILL.md`。
4. 短期記憶要不要升永久，改載 `skills/my-memory-consolidate/SKILL.md`，不要在 `my-memory` 裡重做那套判斷。

同一對話已讀過的檔不必重讀。超過約 200 行的檔先讀摘要或索引，不要一次載整包。

## 怎麼選子 skill

| 做法 | 說明 |
|------|------|
| 對 keyword | 使用者原話與 `keywords` 最接近的一筆 |
| 對 when | 任務情境符合 `when` 描述 |
| 多筆都像 | 選範圍最小、最貼當前一步的那一個 |
| 對不上 | 先釐清需求；不要猜一個 skill 硬做 |

完整清單與版本號以 `index.yaml` 為準（與 `pack.yaml`、toolkit `project.json` 同號）。

## 不要做的事

- 不要一次載入 index 裡全部 skill。
- 不要在入口重寫 `my-rules` 或 `my-memory` 的細節。
- 不要改 `.cursor/skills/`（本 toolkit 由 [`scripts/export-cursor-skills.mjs`](scripts/export-cursor-skills.mjs) 匯出）；改 SSOT 在 `my-skills/my-workflow/`。
- Cursor 斜線指令：`/my-workflow`（skill 名稱，不是子目錄名）。

## 改這個套件

先讀 [`AGENTS.md`](AGENTS.md)。新增子 skill 時：建立 `skills/<name>/SKILL.md`，並在 `index.yaml` 補 `when` 與 `keywords`。
