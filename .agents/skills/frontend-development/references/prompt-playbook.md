# Prompt Playbook

## Prompt 結構

AI builder prompt 建議使用：

```text
Goal:
Scope:
Current files:
Data shape:
UI behavior:
States:
Responsive requirements:
Do not change:
Verification:
Ask clarifying questions before coding if anything is ambiguous.
```

## Knowledge File Prompt

```text
請為這個專案建立 AI builder knowledge/context file。

請包含：
- 產品願景與目標使用者
- route map
- roles and permissions
- 依優先順序排列的 feature list
- data entities 與目前 mock/API phase
- design system guidance
- i18n requirements
- SEO/custom-domain assumptions
- AI builder 必須保留的 files 與 architecture rules

如果資訊不足，請先提出需要釐清的問題，不要直接開始寫 code。
```

## Foundation Prompt

```text
請建立 frontend React/TanStack Start app 的 project foundation。

請使用這個結構：
- src/routes 放 route files
- src/components/layout, ui, sections 放共用 UI 與 layout
- src/features 放 feature-owned components/services/types/data
- src/services 放 shared service clients
- src/data/mock 放 mock fixtures
- src/i18n/locales 放 locale JSON
- docs/architecture 與 docs/prompts 放 contracts

不要建立 src/pages。
不要使用 react-router-dom。
這一階段不要串接 backend services。
第一版採 frontend-first，使用 realistic mock data。
```

## Feature Prompt

```text
請建立 [feature name] feature，對應 route [path]。

Files:
- route: src/routes/[route-file].tsx
- service: src/features/[feature]/services/[feature]-service.ts
- mock data: src/features/[feature]/data/mock-[feature].ts
- components: src/features/[feature]/components/*
- types: src/features/[feature]/types.ts

Data:
[paste exact entity contract or example object]

Requirements:
- route loader 必須透過 service 取得資料
- components 只接收 props，不可直接 import mock data
- include loading, empty, error, and missing-image states
- preserve existing layout and design tokens
- 不要修改 unrelated routes 或 global styles
```

## Debugging Prompt

```text
目前進入 error loop，請先停止套用修正。

請先做 root-cause analysis：
- summarize the failing error
- list the files involved
- show the expected type/contract and actual value
- propose the smallest fix
- explain what should not be changed

等我確認後再修改 code。
```

## Refactor Prompt

```text
只重構 [area]。

Goals:
- reduce duplication in [specific files]
- 保持 rendered UI 不變
- 保持 routes、data contracts、public URLs 不變
- preserve service-layer boundaries

Do not:
- redesign the UI
- rename routes
- connect new services
- change mock/API field shapes
```

## 維護原則

Prompt 可以保留英文欄位名稱與技術片語，因為多數 AI builder 對清楚的英文任務欄位反應穩定；但任務描述、規則與限制預設使用中文，方便後續維護與討論。
