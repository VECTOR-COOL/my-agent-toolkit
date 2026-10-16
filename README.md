# My Agent Toolkit

> VECTOR LTD 可攜式 Agent Skills 套件庫

[![version](https://img.shields.io/badge/version-1.3.1-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-VECTOR--COOL-blue)](https://github.com/VECTOR-COOL/my-agent-toolkit)
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

## 簡介

集中管理供 AI 助理使用的 **Agent Skills**。各技能以 `SKILL.md` 為入口，搭配 `references/`、`examples/`、`scripts/` 或 `agents/` 等輔助資料。第三方可攜技能與組織自建技能分開存放。

本 repo 是技能文件庫，不是可直接執行的應用程式；根目錄不維護 app runtime、package manager 設定或 build pipeline。

## 技能目錄

| 類型 | 路徑 | 說明 |
|------|------|------|
| 第三方 skills | [`skills/README.md`](./skills/README.md) | 依 design、React、mobile、browser、Cloudflare、workflow、GitHub、security、WordPress 分類的 27 個可攜 skills。 |
| 自建 skills | [`my-skills/`](./my-skills/) | 前端、WordPress、其餘組織技能。常用工作流以 [`my-skills/my-workflow`](./my-skills/my-workflow/README.md) 為準。 |

### 自建 Workflow Skills

以 [`my-skills/my-workflow`](./my-skills/my-workflow/) 為準。新的 workflow skill 放 `my-skills/my-workflow/skills/`。

`.cursor/skills/` 由脚本匯出，供 Cursor Cloud 使用，勿手改。安裝與更新見 [`my-skills/my-workflow/README.md`](./my-skills/my-workflow/README.md)。

| 技能 | 說明 | 納入版本 |
|------|------|----------|
| [`my-workflow`](./my-skills/my-workflow/skills/my-workflow/SKILL.md) | 工作習慣入口：按需載入、記憶、Git 界線。 | v1.2.0 |
| [`my-skill-update`](./my-skills/my-workflow/skills/my-skill-update/SKILL.md) | 用 `gh skill update` 更新已安裝的 my-workflow skills。 | v1.2.0 |
| [`my-create-PRD`](./my-skills/my-workflow/skills/my-create-prd/SKILL.md) | 透過主動多輪需求訪談，建立足以讓所有 Agent 理解、實作與驗收的繁體中文 PRD。 | v1.2.0 |
| [`my notion`](./my-skills/my-workflow/skills/my-notion/SKILL.md) | 在 Codex 與 ChatGPT Web 操作 Notion，設計、建立、查詢與維護適合人機協作及 RAG 擷取的資料結構。 | v1.2.0 |
| [`my-memory`](./my-skills/my-workflow/skills/my-memory/SKILL.md) | 分流使用 Agent 記憶庫、Notion Memory 與 Mem0 讀寫外部記憶。 | v1.2.0 |
| [`my-review`](./my-skills/my-workflow/skills/my-review/SKILL.md) | 以專案／架構視角嚴格審查計畫與實作，拉回目標並收尾更新文件。 | v1.2.0 |
| [`my-codebase-clear`](./my-skills/my-workflow/skills/my-codebase-clear/SKILL.md) | 掃描可清理檔案、review candidates，經同意後安全刪除並收尾。 | v1.2.0 |
| [`my-codebase-init`](./my-skills/my-workflow/skills/my-codebase-init/SKILL.md) | 從 project-templates 初始化專案並建立 VECTOR-COOL 私有 repo。 | v1.2.0 |
| [`my-commit-all-and-push`](./my-skills/my-workflow/skills/my-commit-all-and-push/SKILL.md) | 全部 commit 並 push，說明用繁體中文。 | v1.2.0 |
| [`my-cursor-cloud-env-init`](./my-skills/my-workflow/skills/my-cursor-cloud-env-init/SKILL.md) | 對齊 Cursor Cloud 冷啟動，驗證本地與遠端可運行。 | v1.2.0 |
| [`my-docs`](./my-skills/my-workflow/skills/my-docs/SKILL.md) | 建立精簡技術文件並確保 AGENTS.md／README 齊備。 | v1.2.0 |
| [`my-subagent`](./my-skills/my-workflow/skills/my-subagent/SKILL.md) | 主線調度平行 subagent 並負責驗收。 | v1.2.0 |
| [`my-upgrade-plan`](./my-skills/my-workflow/skills/my-upgrade-plan/SKILL.md) | 擬定並經同意後執行安全升級計畫。 | v1.2.0 |

不在 my-workflow 包裡：

| 技能 | 說明 | 納入版本 |
|------|------|----------|
| [`my-agent-plugin-creator`](./my-skills/workflow/my-agent-plugin-creator/SKILL.md) | 依開放標準建立、遷移或驗證可攜 Agent Plugin。 | v1.1.0 |
| [`my-clean-windows-storage`](./my-skills/workflow/my-clean-windows-storage/SKILL.md) | 安全掃描、分類並清理 Windows 磁碟可釋放空間（須先授權再刪）。 | v1.1.0 |

## 快速開始

1. 複製或 submodule 本 repo 至工作區。常用工作流見 [`my-skills/my-workflow/README.md`](./my-skills/my-workflow/README.md)。
2. 依任務載入對應技能的 `SKILL.md`。
3. 只讀取當前任務需要的 `references/`、`examples/` 或 `scripts/`，避免一次載入整個技能庫。
4. 在目標產品 repo 執行技能內的 scripts；本 repo 根目錄不提供統一執行環境。

## 分支策略

- **`main`**：穩定線
- **`develop`**：日常開發與整合

## 授權

內部使用；細節依組織政策為準。
