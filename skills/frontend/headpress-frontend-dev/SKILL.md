---
name: headpress-frontend-dev
version: "1.5.0"
description: HeadPress WordPress Headless Theme 前端 UI 開發協作 Skill。用於規劃或修改 HeadPress 驅動的前端 routes、layouts、components、SSR/pre-render、SEO metadata；引導 Agent 理解後端是 WordPress Headless CMS。此為純入口檔案，詳細規範請見 references/index.md。
---

# HeadPress Frontend UI DEV Skill

[![version](https://img.shields.io/badge/version-1.5.0-blue)]()

本 skill 是 **HeadPress WordPress Headless Theme 前端 UI 開發** 的 canonical 協作規則檔。
所有的細節規範（如 Schema 對齊、防呆禁忌、URL 映射等）皆已拆分至 `references/` 目錄。

## 📍 載入順序（必讀）

1. **直接讀取 [references/index.md](references/index.md)**：這是本專案的「意圖命中索引」，請根據使用者的需求與關鍵字，挑選並讀取最相關的小檔案，**絕對不要一次讀取所有的 reference 檔案**。
2. 若任務涉及 WordPress raw schema、TypeScript 型別或 mock fixture 細節，同時載入 `.agents/skills/wordpress-rest-api-development`。
3. 若任務涉及 WordPress 主題邏輯、REST endpoint 實作或後台設定，同時載入 `.agents/skills/wordpress-plugin-theme-development`。

## 🛡️ 核心定位與鐵律

1. **強制優先 HeadPress API**：預設透過 `https://example.com/headpress/api/v1/` 取得已組裝、可渲染的 public read-only payload。API 規格一律以 `themes/headpress/docs/prd/openapi.json` 為唯一真理。
2. **WP 原生 API 備援嚴格控管**：僅當 HeadPress 無對應 endpoint 時才考慮在 service layer 呼叫 `/wp/v2/*`。**每次使用前，必須通知使用者說明理由並取得明確同意，不得靜默引入**。
3. **無狀態與唯讀限制**：HeadPress API 不處理表單送出或會員登入，需要寫入流程時改走 server-side proxy，且不得暴露 secret。

> **提示**：若想了解架構心智模型、Schema 如何對齊、或是如何避免常見爆點，請立即前往 [references/index.md](references/index.md) 尋找對應的指南。
