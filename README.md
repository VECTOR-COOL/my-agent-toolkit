# My Agent Toolkit

> VECTOR LTD 可攜式 Agent Skills 套件庫

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FVECTOR-COOL%2Fmy-agent-toolkit%2Fdevelop%2Fproject.json&query=%24.version&label=version&color=blue)](./project.json)
[![GitHub](https://img.shields.io/badge/GitHub-VECTOR--COOL-blue)](https://github.com/VECTOR-COOL/my-agent-toolkit)

**版本**：1.0.0（SSOT：`project.json`）

## 簡介

集中管理供 AI 助理使用的前端、WordPress headless、REST API 與 Lovable 遷移等 **Agent Skills**。各技能以 `SKILL.md` 為入口，搭配 `references/` 與可選 `scripts/`。

## 技能一覽

| 路徑 | 用途 |
|------|------|
| [skills/frontend/frontend-development](./skills/frontend/frontend-development/) | 通用前端開發流程與慣例 |
| [skills/frontend/frontend-wordpress-headless-project](./skills/frontend/frontend-wordpress-headless-project/) | WordPress headless 前端專案 |
| [skills/backend/wordpress-rest-api-development](./skills/backend/wordpress-rest-api-development/) | WordPress REST API 與資料層 |
| [skills/lovable/lovable-legacy-to-ssr-migration](./skills/lovable/lovable-legacy-to-ssr-migration/) | Lovable 遺留專案遷移至 SSR |

## 快速開始

1. 複製或 submodule 本 repo 至你的工作區，或將 `skills/` 內單一技能連結至 Cursor skills 路徑。
2. 在 Cursor 中依任務載入對應 `SKILL.md`。
3. 產品專案請另載入組織規則：`D:/PROJECTS/AI-Assistants/GLOBAL_AGENTS.md`（唯讀）。

## 重要文件

| 文件 | 說明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | AI／Cursor 專案慣例與目錄說明 |
| [ai_assistants.yaml](./ai_assistants.yaml) | 專案級 AI 設定 |
| [project.json](./project.json) | 產品版本 metadata |

## 分支策略

- **`main`**：穩定線
- **`develop`**：日常開發與整合

## 授權

內部使用；細節依組織政策為準。
