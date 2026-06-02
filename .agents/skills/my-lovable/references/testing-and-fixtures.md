# Testing And Fixtures

## 目錄規劃

```text
tests/
  fixtures/
    products.json
    users.json
  unit/
  e2e/
docs/qa/
  visual-checklist.md
  release-checklist.md
  seo-checklist.md
src/data/mock/
  mock-products.ts
src/features/products/data/
  mock-products.ts
```

若資料只屬於單一 feature，優先放 feature-local mock data。跨 feature 共用資料才放 `src/data/mock`。

## Fixture 規則

- Shape 要對齊 real API。
- 包含 edge cases：long title、missing image、empty list、draft/unpublished equivalent、invalid slug。
- 內容密度要足以測試 layout。
- IDs 與 slugs 要 deterministic。
- 不可使用 production secrets 或 private user data。

## 建議檢查

- TypeScript build。
- Route render smoke test。
- Fixture shape validation。
- Service-layer audit：components 不直接 import fixtures。
- Desktop 與 mobile browser screenshot check。
- 若 task 包含 route metadata，檢查 SEO head/canonical。

## QA Prompt

```text
Create QA fixtures and checks for [feature].

Include:
- normal data
- empty state
- long text
- missing media
- API error simulation

Keep fixture shape aligned with the service return type.
Do not import fixtures directly from components.
```

