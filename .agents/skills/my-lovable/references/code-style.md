# Code Style

## TypeScript

- Service return 與 component props 使用明確 exported types。
- 優先使用 narrow types，避免 `any`。
- Mappers 保持 pure、可測試。
- Async states 複雜時可用 discriminated unions。
- Env parsing 集中處理。

## React

- Route files 聚焦 loader、head metadata、page composition。
- Components 以 presentational 為主，除非只擁有 local UI state。
- Data 經 props 傳入；data acquisition 交給 services/loaders。
- SSR routes 不用 `useEffect` 取得主要內容。
- Browser-only code 要 guard。

## Styling

- 跟隨既有 design system 與 tokens。
- 優先沿用 repo 已使用的 Tailwind utility composition。
- Page sections 不做浮動卡片外框，除非它們真的是 cards 或 tools。
- Grids、cards、images、buttons、media 要有穩定尺寸。
- 驗證 long text 與 mobile wrapping。

## File Naming

除非 repo 已有其他標準，檔案使用 kebab-case：

```text
product-card.tsx
products-service.ts
mock-products.ts
data-source.ts
```

## Imports

- Feature 內部優先使用本 feature local imports。
- `src/lib`、`src/services`、`src/components/ui` 只放真正跨 feature 共用的工具。
- 避免 features 之間 circular dependencies。

