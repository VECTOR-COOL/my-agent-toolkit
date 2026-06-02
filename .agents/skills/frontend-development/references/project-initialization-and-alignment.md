# 專案初始化與既有專案對齊配置

> 主題規劃總入口請見 `theme-planning/README.md`。本文件是其中的新專案初始化與既有專案對齊規範。

這份文件定義 `frontend-development` skill 在建立新前端專案，或把既有專案對齊到此 skill 時，應使用的配置方式與檢查流程。

## 目標

初始化配置的目的，是在專案早期就把後續 AI builder prompt 或人工實作會反覆使用的決策固定下來。既有專案對齊配置的目的，是把已經存在的 routes、components、styles、mock data、API service 與文件整理成此 skill 可理解、可延伸、可驗證的形狀。

這兩種情境都應產出一組清楚的專案契約：

- 專案類型與技術棧。
- route map 與主要工作流。
- theme plan 與全域樣式系統。
- mock/API/CMS 資料策略。
- component contracts。
- SEO/accessibility/QA gates。
- 後續 AI builder prompt 的不變規則。

## 新專案初始化建議檔案

建議新專案建立以下文件：

```text
docs/
  frontend-project.config.json
  project-contract.md
  route-map.md
  theme-plan.md
  theme-plan.config.json
  style-system.config.json
  design-tokens.md
  component-contracts.md
  data-contract.md
  prompt-invariants.md
  qa-checklist.md
```

如果是 WordPress Headless 專案，再增加：

```text
docs/
  wordpress-field-map.md
  wordpress-rest-endpoints.md
  cms-editorial-policy.md
```

如果是舊版 Lovable React/Vite SPA 遷移到 TanStack Start SSR，再增加：

```text
docs/
  legacy-route-inventory.md
  visual-parity-checklist.md
  migration-non-goals.md
```

## `frontend-project.config.json` 範例

這份設定檔描述專案如何被 `frontend-development` skill 解讀。它不是 runtime config，不應包含 secret。

```json
{
  "$schema": "./frontend-project.schema.json",
  "version": 1,
  "project": {
    "name": "Example Frontend Project",
    "kind": "site",
    "framework": "tanstack-start",
    "rendering": "ssr",
    "language": "typescript",
    "packageManager": "npm",
    "locales": ["zh-TW"],
    "primaryAudience": ["site visitors", "content editors"]
  },
  "skills": {
    "primary": "frontend-development",
    "optional": ["frontend-wordpress-headless-project", "wordpress-rest-api-development"]
  },
  "routes": {
    "source": "docs/route-map.md",
    "routingLibrary": "tanstack-router",
    "seoRequired": true
  },
  "theme": {
    "plan": "docs/theme-plan.md",
    "config": "docs/theme-plan.config.json",
    "styleSystem": "docs/style-system.config.json",
    "tokens": "src/styles/tokens.css"
  },
  "components": {
    "contracts": "docs/component-contracts.md",
    "library": "project-local",
    "rules": ["reuse variants before creating new styles", "define loading empty error states"]
  },
  "data": {
    "mode": "mock-first",
    "contract": "docs/data-contract.md",
    "mockDirectory": "src/data",
    "serviceDirectory": "src/services",
    "viewModelDirectory": "src/types"
  },
  "wordpress": {
    "enabled": false,
    "fieldMap": null,
    "restBaseUrlEnv": "WORDPRESS_API_BASE_URL"
  },
  "qualityGates": {
    "commands": ["npm run typecheck", "npm run build"],
    "visualChecks": ["desktop screenshot", "mobile screenshot"],
    "requiredBeforeHandoff": true
  },
  "promptInvariants": {
    "file": "docs/prompt-invariants.md",
    "rules": [
      "do not redesign unless theme plan changes first",
      "preserve route map unless explicitly updated",
      "keep mock/API boundary in service layer",
      "use semantic style tokens"
    ]
  }
}
```

## 初始化流程

新專案應按以下順序建立：

1. 建立 `project-contract.md`，定義專案類型、受眾、目標、non-goals、技術棧與所有權邊界。
2. 建立 `route-map.md`，定義 route、page purpose、loader data、SEO 欄位與主要 CTA。
3. 建立 `theme-plan.md` 與 `theme-plan.config.json`，固定品牌、體驗、版型、媒體與 QA 原則。
4. 建立 `style-system.config.json` 與 tokens CSS，固定顏色系統、樣式系統與 component tokens。
5. 建立 `component-contracts.md`，定義主要元件 variants、states、資料依賴與 accessibility。
6. 建立 `data-contract.md`，先用 mock-first view model 定義資料形狀，再規劃 API/CMS 對接。
7. 建立 `prompt-invariants.md`，把 AI builder 或人工實作每個後續步驟都要遵守的規則列成短句。
8. 建立 `qa-checklist.md`，列出 typecheck、build、schema、desktop/mobile visual check 與 SEO/accessibility gate。

## 既有專案對齊流程

既有專案不要直接重構。先做 inventory，再建立對齊配置。

1. 掃描現有技術棧：package manager、framework、routing、Tailwind/CSS、component library、data fetching、SEO 實作。
2. 建立 route inventory：目前有哪些 route、頁面用途、資料來源、layout、SEO 與導航入口。
3. 建立 style inventory：收集全站色碼、CSS variables、Tailwind token、font、spacing、radius、shadow、button/card/input 樣式。
4. 建立 component inventory：列出共用元件、頁面局部元件、重複但尚未抽象的 pattern。
5. 建立 data inventory：列出 mock files、service layer、API client、WordPress REST endpoints、view model 與 schema。
6. 將 inventory 映射到 `frontend-project.config.json`、`theme-plan.config.json` 與 `style-system.config.json`。
7. 標記 drift：哪些現有樣式或元件違反主題計劃，例如裸色碼、巢狀卡片、過大 heading、單頁客製 spacing。
8. 只修正會阻礙後續維護的差異，不為了對齊文件而重做視覺設計。
9. 補 `prompt-invariants.md`，確保下一次 AI builder prompt 不會破壞既有 UI。

## 既有專案對齊配置範例

```json
{
  "$schema": "./frontend-project.schema.json",
  "version": 1,
  "project": {
    "name": "Existing Project",
    "kind": "site",
    "framework": "vite-react",
    "rendering": "csr",
    "language": "typescript",
    "locales": ["zh-TW"]
  },
  "alignment": {
    "mode": "existing-project",
    "preserveVisualDesign": true,
    "inventoryRequired": true,
    "allowedChanges": [
      "document current routes",
      "normalize style tokens without redesign",
      "extract repeated component contracts",
      "clarify mock/API boundary"
    ],
    "forbiddenChanges": [
      "full redesign",
      "routing migration without explicit migration task",
      "CMS integration before data contract",
      "changing brand direction without theme plan update"
    ]
  },
  "routes": {
    "source": "docs/route-map.md",
    "routingLibrary": "react-router-dom",
    "migrationTarget": "tanstack-router only when legacy-to-ssr migration is requested"
  },
  "theme": {
    "plan": "docs/theme-plan.md",
    "config": "docs/theme-plan.config.json",
    "styleSystem": "docs/style-system.config.json",
    "tokenStrategy": "derive from existing CSS first"
  },
  "data": {
    "mode": "inventory-first",
    "contract": "docs/data-contract.md",
    "mockDirectory": "src/data",
    "serviceDirectory": "src/services"
  },
  "qualityGates": {
    "commands": ["npm run build"],
    "visualChecks": ["before screenshot", "after screenshot", "mobile screenshot"],
    "acceptance": ["no visible redesign unless requested", "no data shape regression"]
  }
}
```

## Prompt 模板：初始化

```text
請依照 frontend-development skill 初始化此前端專案配置。

建立或更新：
- docs/frontend-project.config.json
- docs/project-contract.md
- docs/route-map.md
- docs/theme-plan.md
- docs/theme-plan.config.json
- docs/style-system.config.json
- docs/component-contracts.md
- docs/data-contract.md
- docs/prompt-invariants.md
- docs/qa-checklist.md

要求：
- 樣式系統必須包含 color system、typography、spacing、radius、shadow、component tokens。
- 使用 mock-first data contract。
- 不要接真實 API 或 WordPress，除非另有指示。
- 所有後續 prompt 必須遵守 prompt-invariants.md。
```

## Prompt 模板：既有專案對齊

```text
請依照 frontend-development skill 將此既有前端專案對齊到可維護配置。

先做 inventory，不要直接重設計。
請建立或更新：
- docs/frontend-project.config.json
- docs/route-map.md
- docs/theme-plan.md
- docs/style-system.config.json
- docs/component-contracts.md
- docs/data-contract.md
- docs/prompt-invariants.md
- docs/qa-checklist.md

要求：
- 從現有 UI 萃取 color system 與 style system。
- 保留既有視覺方向，除非明確列為 drift 並取得更新 theme plan 的理由。
- 將散落的樣式整理成 semantic tokens。
- 將重複元件整理成 component contracts。
- 將 mock、service、API/CMS 邊界寫進 data-contract.md。
```

## 對齊完成標準

對齊完成前，應能回答：

- 專案現在使用哪個 framework、routing、rendering mode 與 data strategy？
- 全域顏色系統、字體系統、spacing、radius、shadow 是否有共同來源？
- 新增頁面時應重用哪些 component contracts？
- mock data、API service、WordPress REST 或 CMS field map 的邊界是否清楚？
- 後續 AI builder prompt 是否有不可破壞的 invariants？
- build、typecheck、desktop/mobile visual check 是否被列為 handoff 前 gate？

如果以上任何一項沒有文件或設定檔可證明，就不應宣稱專案已完成對齊。
