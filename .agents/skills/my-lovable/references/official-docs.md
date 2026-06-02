# Lovable 官方文件摘要

研究日期：2026-06-02。平台行為若會影響架構，請重新查官方文件確認。

## 來源

- Lovable prompting best practices: https://docs.lovable.dev/prompting/prompting-one
- Lovable debugging prompts: https://docs.lovable.dev/prompting/prompting-debugging
- From idea to working app: https://docs.lovable.dev/tips-tricks/from-idea-to-app
- GitHub integration: https://docs.lovable.dev/integrations/github
- Building apps using TanStack Start: https://lovable.dev/blog/building-apps-using-tanstack-start

## 實務結論

- 先建立 project plan，必要時讓 Plan mode 釐清問題，再進入 code generation。
- 依 component 與 feature 小步建立，不要一次要求完整重寫整個 app。
- 早期就使用真實內容或 realistic mock data，才能測試版面品質。
- 後端契約未完成時，採 frontend-first mock development。
- 每次改動要小且可驗證；長 prompt 要拆成多個 feature prompts。
- 若錯誤反覆出現，先要求 root-cause analysis，再請 Lovable 修。
- 需要 code ownership、local IDE、pull request、branch 或外部部署時，使用 GitHub integration。
- Lovable 官方文件目前說明：2026-05-13 後建立的新 app 預設使用 TanStack Start SSR，Enterprise plan 例外；較舊 React + Vite app 在 Lovable 公開部署 URL 上對 verified crawlers 使用 on-request pre-rendering。
- 新專案應優先以 TanStack Start 方向規劃，可依 route 使用 SSR/SSG/CSR 與 server functions。
- 既有專案可能仍是 legacy SPA；改 routing 或 rendering 前要先檢查 repo，不要宣稱舊 React + Vite app 已原地升級為 TanStack Start SSR。

## Agent 規則

Lovable 平台行為會影響架構決策時，不只依賴記憶。請確認最新官方文件或目標 repo。
