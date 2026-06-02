# My Agent Toolkit — AGENTS

> **版本**：v1.0.0 | 版本來源：`project.json`  
> **組織規則（唯讀）**：`D:/PROJECTS/AI-Assistants/GLOBAL_AGENTS.md`

## 概述

本 repo 集中管理 **Cursor Agent Skills**（非可執行應用）。技能依領域放在 `skills/`，供產品 codebase 複製、連結或透過 Cursor 技能路徑引用。

## 目錄結構

| 路徑 | 說明 |
|------|------|
| `skills/frontend/` | 前端開發、WordPress headless 專案技能 |
| `skills/backend/` | WordPress REST API 開發技能 |
| `skills/lovable/` | Lovable 遺留專案遷移至 SSR 技能 |
| `project.json` | 產品版本 SSOT（SemVer） |
| `ai_assistants.yaml` | 專案級 AI 設定（格式版本見檔內 `version` 欄） |

各技能根目錄含 `SKILL.md`（入口）、`references/`、`scripts/`（若有）。

## AI 行為指引

1. **按需載入**：只讀與任務相關的 `SKILL.md` 與 `references/`，勿一次載入整庫。
2. **路徑大小寫**：Git 路徑區分大小寫；修改或引用路徑時與 repo 內實際目錄名稱完全一致。
3. **不還原已移除的應用殼**：根目錄不再維護 Lovable / TanStack Start 應用程式碼；僅維護 `skills/`。
4. **治理**：跨專案規範以 `GLOBAL_AGENTS.md` 為準；本檔只描述本 repo 慣例。
5. **版本**：對外發布或 README badge 變更時，同步更新 `project.json` 的 `version`。

## 驗證（選用）

部分技能內含 `scripts/*.mjs`（例如 WordPress API 測試、schema 驗證）。在**目標產品 repo** 執行時需具備對應執行環境（Node/Bun）；本 repo 本身無根層 `package.json`。

## 分支

- `main`：穩定發布線
- `develop`：日常整合（預設工作分支）
