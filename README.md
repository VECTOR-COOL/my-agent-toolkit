# My Agent Toolkit

> VECTOR LTD 可攜式 Agent Skills 套件庫

[![version](https://img.shields.io/badge/version-1.1.0-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-VECTOR--COOL-blue)](https://github.com/VECTOR-COOL/my-agent-toolkit)
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

## 簡介

集中管理供 AI 助理使用的 **Agent Skills**。各技能以 `SKILL.md` 為入口，搭配 `references/`、`examples/`、`scripts/` 或 `agents/` 等輔助資料。第三方可攜技能與組織自建技能分開存放。

本 repo 是技能文件庫，不是可直接執行的應用程式；根目錄不維護 app runtime、package manager 設定或 build pipeline。

## 技能目錄

| 類型 | 路徑 | 說明 |
|------|------|------|
| 第三方 skills | [`skills/README.md`](./skills/README.md) | 依 design、React、mobile、browser、Cloudflare、workflow、GitHub、security、WordPress 分類的 27 個可攜 skills。 |
| 自建 skills | [`my-skills/`](./my-skills/) | 組織維護的 PRD、Notion、Mem0 記憶、前端、WordPress Headless、REST API 與 Lovable 遷移技能。 |

### 自建 Workflow Skills

| 技能 | 說明 | 納入版本 |
|------|------|----------|
| [`my-create-PRD`](./my-skills/workflow/my-create-prd/SKILL.md) | 透過主動多輪需求訪談，建立足以讓所有 Agent 理解、實作與驗收的繁體中文 PRD。 | v1.1.0 |
| [`my notion`](./my-skills/workflow/my-notion/SKILL.md) | 在 Codex 與 ChatGPT Web 操作 Notion，設計、建立、查詢與維護適合人機協作及 RAG 擷取的資料結構。 | v1.1.0 |
| [`my-mem0-memory`](./my-skills/workflow/my-mem0-memory/SKILL.md) | 透過 Composio 安全搜尋、寫入與管理 Mem0 私人／團隊外部記憶。 | v1.1.0 |

## 快速開始

1. 複製或 submodule 本 repo 至工作區，或將 `skills/` 內單一技能連結至 Cursor skills 路徑。
2. 依任務載入對應技能的 `SKILL.md`。
3. 只讀取當前任務需要的 `references/`、`examples/` 或 `scripts/`，避免一次載入整個技能庫。
4. 在目標產品 repo 執行技能內的 scripts；本 repo 根目錄不提供統一執行環境。

## 分支策略

- **`main`**：穩定線
- **`develop`**：日常開發與整合

## 授權

內部使用；細節依組織政策為準。
