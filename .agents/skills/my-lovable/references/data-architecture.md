# Data Architecture

## 資料階段

| Phase | 使用時機 | 規則 |
| --- | --- | --- |
| `mock` | UI 設計中或 backend 尚未完成 | Mock shape 必須對齊預期 API shape。 |
| `hybrid` | 部分 entities 已串 API，部分仍是 mock | 切換邏輯放在 services，不放 components。 |
| `api` | Backend/API 已就緒 | Production 不可默默 fallback 到假資料。 |

## Model Layers

當 real API 與 UI view model 不同時，請分層命名：

- `ApiEntity`: backend 原始 response。
- `DomainEntity`: app 內部標準化物件。
- `ViewModel`: 某個 component 或 route 的 display-ready object。

資料轉換放在 `src/services`、`src/lib/mappers` 或 feature services。Component 應收到已可安全 render 的 props 或 loader data。

## Service Layer Contract

```text
route loader / server function
  -> feature service or shared service
  -> API client or mock provider
  -> mapper/validator
  -> component props
```

規則：

- Component 不直接用 `fetch` 取得主要 route content。
- Component 不直接從 `src/data/mock` import mock fixtures。
- Route loader 要明確處理 empty state 與 error state。
- Server-only secrets 不可放在 `VITE_` env。
- Public env 可用 `VITE_`，例如 `VITE_SITE_URL` 或公開 API base URL。

## 建議檔案

```text
src/config/data-source.ts
src/services/client.ts
src/services/errors.ts
src/features/products/services/products-service.ts
src/features/products/data/mock-products.ts
src/features/products/types.ts
src/lib/mappers/products.ts
```

## Entity Contract Template

```md
## Entity: Product

- Source: mock | REST | Supabase | Lovable Cloud
- Route usage: /products, /products/$slug
- Identity: id, slug
- Required fields: title, summary, image, price
- Optional fields: badge, gallery, seo
- Empty state: no products published
- Error state: show retry and preserve layout height
- SEO fields: title, description, image, canonical
```

## Prompt 規則

要求 Lovable 新增資料時，請包含：

- 精確 entity fields
- realistic example object
- mock files 放在哪裡
- route loaders 應呼叫哪個 service function
- components 不可碰哪些資料來源

