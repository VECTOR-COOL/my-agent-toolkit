---
name: my-lovable
description: 通用 Lovable 專案架構、前端資料層與 prompt 組裝 Skill。Use when planning or building a Lovable app/site/dashboard, TanStack Start SSR frontend, route map, project contract, component decomposition, mock/API data strategy, service layer, docs/prompts/i18n/tests/scripts structure, Lovable Knowledge file, staged Lovable prompts, existing Lovable project audit, or cross-version compatibility between new TanStack Start and legacy React/Vite SPA projects. For WordPress Headless CMS data contracts, pair with lovable-wordpress-headless-project or wordpress-rest-api-development.
---

# My Lovable

## 目的

使用本 skill 來規格化 Lovable 專案的前期規劃。它會把模糊的 app/site 需求整理成相容 Lovable 的資料架構、元件拆分、目錄規劃、prompt 拆分與驗證流程。

一般 Lovable 前端專案優先使用本 skill。若專案明確是 WordPress Headless，請在需要 CMS schema、REST API 契約或 mock/API 切換細節時，再載入 `.agents/skills/lovable-wordpress-headless-project` 或 `.agents/skills/wordpress-rest-api-development`。

## 載入順序

採用 progressive disclosure，不要一次載入所有 reference。

1. 先讀 `references/index.md`。
2. 只載入目前任務需要的 reference。
3. 若要在既有專案建立目錄，先執行 `scripts/scaffold-project-structure.mjs --root <project-root> --dry-run` 預覽。
4. 若要檢查既有專案，執行 `scripts/audit-lovable-project.mjs --root <project-root>`。
5. 若 Lovable 平台行為會影響架構決策，請重新確認官方文件；本 skill 記錄的研究狀態是 2026-06-02。

## 核心規則

- 將 Lovable 視為專案生成與快速迭代介面，將 GitHub/local IDE 視為程式碼治理介面。
- Lovable 官方文件目前說明：2026-05-13 後建立的新 app 預設使用 TanStack Start SSR（Enterprise plan 例外）；既有專案仍需先檢查 repo，不可只憑平台名稱假設架構。
- 新 Lovable 專案預設以 TanStack Start + TanStack Router + route-level SSR/SSG/CSR 為方向，除非實際 repo 或官方文件顯示不是這個架構。
- 舊 Lovable 專案要先偵測 React Router/Vite SPA 型態，再套用 TanStack Start 規則。
- 後端契約未完成時，先 frontend-first + mock data；mock shape 必須對齊未來 API shape。
- 所有資料讀取放在 service/query module。Component 不直接 fetch API，也不直接 import mock fixture。
- 主要 route 內容需 SSR-visible。不要把核心內容移到 `useEffect` 才出現。
- 依 feature、route、component 小步拆 prompt。不要在同一個 prompt 要求 Lovable 同時重設計、重構、接後端與修 SEO。
- Prompt 要明確說明：要改什麼、不改什麼、預期檔案、資料 shape、狀態處理與驗證方式。
- Docs 是工作契約，不是行銷文件。保留 PRD、route map、data contract、prompt history 與 decisions。
- 既有專案已有 i18n 時，不要 hardcode 新可見文字；新增文字要進 locale files，key 需穩定。

## 預設流程

1. 判斷專案模式：new app、existing Lovable app、legacy SPA migration、CMS/API integration、UI-only iteration。
2. 依 `references/index.md` 載入對應 reference。
3. 擬定 project contract：受眾、routes、roles、data entities、UI scenes、integrations、SEO/i18n requirements、non-goals。
4. 選擇資料階段：`mock`、`hybrid` 或 `api`。
5. 先規劃目錄結構與 component split，再編輯程式碼。
6. 將 Lovable prompts 拆成小批次：foundation、layout shell、feature sections、data layer、states、i18n、tests、polish。
7. 若在 local repo 工作，透過 build/tests/browser screenshots 驗證。
8. 回報剩餘 Lovable 動作：Sync、Publish、env variables、custom domain、backend/API work、SEO scan 或 user visual review。

## Reference Index

| 需求 | 載入 |
| --- | --- |
| 判斷要讀哪個 reference | `references/index.md` |
| Lovable 官方文件摘要 | `references/official-docs.md` |
| 專案與資料夾架構 | `references/project-structure.md` |
| Data model、mock/API strategy、service layer | `references/data-architecture.md` |
| Component decomposition 與 build order | `references/component-decomposition.md` |
| Lovable prompt templates 與 prompt sequencing | `references/prompt-playbook.md` |
| TanStack Start、SSR、legacy SPA 相容性 | `references/compatibility.md` |
| Test data、fixtures、validation、QA 目錄 | `references/testing-and-fixtures.md` |
| 多國語/i18n 目錄與 prompt 規則 | `references/i18n.md` |
| 現代前端程式碼風格 | `references/code-style.md` |

## Scripts

這些 scripts 是 skill 的輔助工具。除非使用者要求，否則不要複製到目標 app。

```bash
node .agents/skills/my-lovable/scripts/scaffold-project-structure.mjs --root D:/path/to/project --dry-run
node .agents/skills/my-lovable/scripts/scaffold-project-structure.mjs --root D:/path/to/project --profile generic
node .agents/skills/my-lovable/scripts/audit-lovable-project.mjs --root D:/path/to/project
```

## 交付檢查

完成 Lovable 架構或 prompt 任務時，回報：

- 選定的 project mode 與 data phase
- 規劃或建立的 directory structure
- 產出的 prompts 或修改的 files
- 專案是 TanStack Start 或 legacy SPA
- Lovable、GitHub、backend、i18n、SEO 或 QA 的後續工作
