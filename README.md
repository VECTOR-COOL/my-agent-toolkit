# My Agent Toolkit

> VECTOR LTD 可攜式 Agent Skills 套件庫

[![version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![GitHub](https://img.shields.io/badge/GitHub-VECTOR--COOL-blue)](https://github.com/VECTOR-COOL/my-agent-toolkit)

## 簡介

集中管理供 AI 助理使用的前端、WordPress Headless、REST API 與 Lovable 遷移等 **Agent Skills**。各技能以 `SKILL.md` 為入口，搭配 `references/`、`examples/`、`scripts/` 或 `agents/` 等輔助資料。

本 repo 是技能文件庫，不是可直接執行的應用程式；根目錄不維護 app runtime、package manager 設定或 build pipeline。

## 技能一覽

| Skill | 入口 | 用途 |
|------|------|------|
| `frontend-development` | [SKILL.md](./skills/frontend/frontend-development/SKILL.md) | 通用前端 app、網站、dashboard、工具與 AI builder 專案規劃 |
| `frontend-wordpress-headless-project` | [SKILL.md](./skills/frontend/frontend-wordpress-headless-project/SKILL.md) | WordPress Headless 前端專案、SEO、資料契約與部署協作 |
| `wordpress-rest-api-development` | [SKILL.md](./skills/backend/wordpress-rest-api-development/SKILL.md) | WordPress REST API schema、mock fixtures、TypeScript 型別與 service layer |
| `lovable-legacy-to-ssr-migration` | [SKILL.md](./skills/lovable/lovable-legacy-to-ssr-migration/SKILL.md) | 舊 Lovable React/Vite SPA 遷移至 TanStack Start SSR |

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
