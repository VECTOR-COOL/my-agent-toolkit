# Compatibility

## 先偵測專案類型

檢查 `package.json`、route folders 與 imports。

| Signal | 可能專案 |
| --- | --- |
| `@tanstack/react-start`, `@tanstack/react-router` | 現代 Lovable TanStack Start |
| `src/routes/__root.tsx`, `createFileRoute` | TanStack Router file routing |
| `react-router-dom`, `BrowserRouter`, `Routes` | Legacy Vite SPA |
| `src/pages` | Legacy 或非 TanStack convention |
| 只有 `vite.config.ts`，沒有 Start plugin | 可能是 SPA 或 custom Vite app |

## TanStack Start 規則

- 使用 `src/routes`。
- 使用 `createFileRoute`。
- Route loaders/server functions 負責主要資料。
- 重要內容保持 SSR-visible。
- Browser-only APIs 用 `typeof window !== "undefined"` 或 `useEffect` guard。
- Secrets 只放 server-only 環境，不進 client bundle。

## Legacy SPA 規則

- 除非使用者明確要求 migration，否則不要強制改成 TanStack route。
- 需要 migration 時，使用 `.agents/skills/lovable-legacy-to-ssr-migration`。
- UI preservation 優先；routing 與 style system 分階段處理。
- Lovable-hosted legacy React + Vite app 在公開部署 URL 可能對 verified crawlers 提供 on-request pre-rendering；這不等於專案已是 TanStack Start full SSR。

## Cross-Version Prompt Guardrail

```text
Before editing, inspect the existing routing setup.
If this is a TanStack Start project, use src/routes and createFileRoute.
If this is a legacy React Router SPA, do not migrate routing unless explicitly asked.
Do not mix BrowserRouter with TanStack Start routes.
```

## GitHub 與 Local IDE

以下情況使用 GitHub sync：

- 使用者需要 code ownership
- 會用 local IDE 修改
- 需要 pull requests 或 branches
- 計畫在 Lovable 以外部署

除非已確認 connected branch，不要假設 Lovable 正在編輯同一個 branch。
