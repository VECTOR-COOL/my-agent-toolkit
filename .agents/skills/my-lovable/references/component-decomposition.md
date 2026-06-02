# Component Decomposition

## 依責任拆分

優先順序：

1. Route：URL、loader、route-level SEO、page composition。
2. Layout：shell、header、footer、navigation、providers。
3. Section：hero、listing、filters、content blocks、CTA。
4. Feature component：domain behavior 與 local state。
5. UI primitive：button、card、dialog、tabs、input。

## Route Build Order

每個 route 先定義：

- path 與 route file
- route loader data
- SEO metadata
- section list 與視覺順序
- loading、empty、error、not-found states
- mobile 與 desktop layout expectations

## Component Contract Template

```md
Component: ProductCard
Location: src/features/products/components/product-card.tsx
Props:
- product: ProductViewModel
- variant: "compact" | "featured"
States:
- missing image
- long title
- unavailable price
Must not:
- fetch data
- import mock fixtures
- hardcode locale text
```

## 拆分判斷

- UI block 重複、具備明確 state、或代表清楚 feature concept 時，才抽 component。
- 單一路由專用 section 可先留在 route，直到複雜度或重用需求足以支持抽出。
- 避免巨大 `Index.tsx`。Route 應像 composition，不應包含所有 card 與 mapper。
- 不要建立只包住簡單 Tailwind classes、但沒有降低重複的抽象。
- Layout components 保持 data-agnostic。

## Lovable Prompt 拆分

建議順序：

1. Foundation and file map。
2. Layout shell。
3. One route and its sections。
4. One feature service and mock data。
5. State handling and responsive polish。
6. i18n/SEO/tests after the visible flow is stable。

