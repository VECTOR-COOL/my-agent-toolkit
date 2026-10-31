# My Agent Toolkit

**版本：`v1.15.7`**

> VECTOR LTD 可攜式 Agent Skills 套件庫

[![GitHub](https://img.shields.io/badge/GitHub-VECTOR--COOL-blue)](https://github.com/VECTOR-COOL/my-agent-toolkit)
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

## 簡介

集中管理供 AI 助理使用的 **Agent Skills**。各技能以 `SKILL.md` 為入口，搭配 `references/`、`examples/`、`scripts/` 或 `agents/` 等輔助資料。第三方可攜技能與組織自建技能分開存放。

本 repo 是技能文件庫，不是可直接執行的應用程式；根目錄不維護 app runtime、package manager 設定或 build pipeline。

## 技能目錄

| 類型 | 路徑 | 說明 |
|------|------|------|
| 第三方 skills | [`skills/README.md`](./skills/README.md) | 依 design、React、mobile、browser、Cloudflare、workflow、GitHub、security、WordPress 分類的 27 個可攜 skills。 |
| 自建 skills | [`my-skills/`](./my-skills/) | 每個都是獨立 skill，分類目錄區隔類型、功能、平台：前端、WordPress、Claude（[`claude/`](./my-skills/claude/)）等。開發準則見 [`my-skills/AGENTS.md`](./my-skills/AGENTS.md)。常用工作流以 [`my-plugins/my-workflow`](./my-plugins/my-workflow/README.md) 為準。 |

### 自建 Workflow Skills

以 [`my-plugins/my-workflow`](./my-plugins/my-workflow/) 為準。新的 workflow skill 放 `my-plugins/my-workflow/skills/`。

`my-plugins/my-workflow` 是 Claude Code + Codex plugin（含常駐 rules 與 Composio MCP），marketplace 在 `.claude-plugin/` 與 `.agents/plugins/`。安裝與更新見 [`my-plugins/my-workflow/README.md`](./my-plugins/my-workflow/README.md)。

| 技能 | 說明 | 納入版本 |
|------|------|----------|
| [`my-workflow`](./my-plugins/my-workflow/skills/my-workflow/SKILL.md) | 工作習慣入口：按需載入、記憶、Git 界線。 | v1.2.0 |
| [`my-plugin-install`](./my-plugins/my-workflow/skills/my-plugin-install/SKILL.md) | 依平台安裝與更新 my-workflow plugin（Claude Code、網頁與 Cowork、雲端 session、Codex）。 | v1.12.1 |
| [`my-create-PRD`](./my-plugins/my-workflow/skills/my-create-prd/SKILL.md) | 透過主動多輪需求訪談，建立足以讓所有 Agent 理解、實作與驗收的繁體中文 PRD。 | v1.2.0 |
| [`my notion`](./my-plugins/my-workflow/skills/my-notion/SKILL.md) | 在 Codex 與 ChatGPT Web 操作 Notion，設計、建立、查詢與維護適合人機協作及 RAG 擷取的資料結構。 | v1.2.0 |
| [`my-memory`](./my-plugins/my-workflow/skills/my-memory/SKILL.md) | 分流使用 Agent 記憶庫、Notion Memory 與 Mem0 讀寫外部記憶。 | v1.2.0 |
| [`my-memory-consolidate`](./my-plugins/my-workflow/skills/my-memory-consolidate/SKILL.md) | 寫入不另搜；查 Mem0 的那一次命中去重、升中期並加權；權重達到 3 升長期；低權重且存放滿 30 天必須刪除。 | v1.4.0 |
| [`my-review`](./my-plugins/my-workflow/skills/my-review/SKILL.md) | 以專案／架構視角嚴格審查計畫與實作，拉回目標並收尾更新文件。 | v1.2.0 |
| [`my-codebase-clear`](./my-plugins/my-workflow/skills/my-codebase-clear/SKILL.md) | 掃描可清理檔案、review candidates，經同意後安全刪除並收尾。 | v1.2.0 |
| [`my-codebase-init`](./my-plugins/my-workflow/skills/my-codebase-init/SKILL.md) | 從 project-templates 初始化專案並建立 VECTOR-COOL 私有 repo。 | v1.2.0 |
| [`my-commit-all-and-push`](./my-plugins/my-workflow/skills/my-commit-all-and-push/SKILL.md) | 全部 commit 並 push，說明用繁體中文。 | v1.2.0 |
| [`my-cloud-agent`](./my-plugins/my-workflow/skills/my-cloud-agent/SKILL.md) | 開、續、查、停雲端 agent session，派任務並驗收（Claude 支援工具與 CLI）。 | v1.2.0 |
| [`my-release-packaging`](./my-plugins/my-workflow/skills/my-release-packaging/SKILL.md) | 建立正式發佈包與增量更新檔（--since）的 export-ignore 規則、打包腳本與規格書，審核機敏檔洩漏（檔名＋內容）。 | v1.15.7 |
| [`my-docs`](./my-plugins/my-workflow/skills/my-docs/SKILL.md) | 建立精簡技術文件並確保 AGENTS.md／README 齊備。 | v1.2.0 |
| [`my-subagent`](./my-plugins/my-workflow/skills/my-subagent/SKILL.md) | 主線調度平行 subagent 並負責驗收。 | v1.2.0 |

不在 my-workflow 包裡：

| 技能 | 說明 | 納入版本 |
|------|------|----------|
| [`my-agent-plugin-creator`](./my-skills/workflow/my-agent-plugin-creator/SKILL.md) | 依開放標準建立、遷移或驗證可攜 Agent Plugin。 | v1.1.0 |
| [`my-clean-windows-storage`](./my-skills/workflow/my-clean-windows-storage/SKILL.md) | 安全掃描、分類並清理 Windows 磁碟可釋放空間（須先授權再刪）。 | v1.1.0 |

## 快速開始

1. 複製或 submodule 本 repo 至工作區。常用工作流見 [`my-plugins/my-workflow/README.md`](./my-plugins/my-workflow/README.md)。
2. 依任務載入對應技能的 `SKILL.md`。
3. 只讀取當前任務需要的 `references/`、`examples/` 或 `scripts/`，避免一次載入整個技能庫。
4. 在目標產品 repo 執行技能內的 scripts；本 repo 根目錄不提供統一執行環境。

## 分支策略

- **`main`**：穩定線
- **`develop`**：日常開發與整合

## 授權

內部使用；細節依組織政策為準。
