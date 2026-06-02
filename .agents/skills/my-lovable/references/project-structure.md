# Project Structure

以下是現代 Lovable/TanStack Start app 的預設目標架構。若 repo 已有更明確且一致的 convention，優先沿用既有 convention。

```text
project-root/
  docs/
    architecture/
      project-contract.md
      route-map.md
      data-contract.md
      decisions.md
    prompts/
      00-knowledge-file.md
      01-foundation.md
      02-layout-shell.md
      03-feature-prompts.md
      prompt-history.md
    qa/
      visual-checklist.md
      release-checklist.md
      seo-checklist.md
  scripts/
    audit-project.mjs
    seed-fixtures.mjs
    validate-fixtures.mjs
  tests/
    fixtures/
      README.md
    e2e/
    unit/
  src/
    routes/
    components/
      layout/
      ui/
      sections/
      feedback/
    features/
      feature-name/
        components/
        data/
        services/
        types.ts
        index.ts
    services/
    data/
      mock/
      fixtures/
    i18n/
      locales/
        en.json
        zh-TW.json
      config.ts
      keys.ts
    lib/
      api/
      seo/
      utils/
    config/
    types/
    styles.css
```

## 目錄規則

- `docs/architecture`: 專案契約與決策紀錄，不放行銷文案。
- `docs/prompts`: Lovable prompts、Knowledge file drafts、prompt history、negative prompts。
- `docs/qa`: visual、SEO、release、migration checklists。
- `scripts/`: 可重複執行的 deterministic automation。Lovable/React 專案優先用 Node `.mjs`。
- `tests/fixtures`: validator 與測試共用 fixtures。
- `src/routes`: TanStack route files。新的 TanStack Start 專案不要建立 `src/pages`。
- `src/components/layout`: app shell、header、footer、navigation。
- `src/components/ui`: Button、Dialog、Tabs、Input 等 primitives。
- `src/components/sections`: 可重用的頁面 section，但不承擔 domain service。
- `src/features/*`: feature 擁有的 components、services、data、types。
- `src/services`: 跨 feature service layer 與 API clients。
- `src/data/mock`: 形狀對齊 real API 的 mock data。
- `src/i18n`: locale files、key helpers、formatting config。
- `src/lib/seo`: route metadata helpers、canonical URL helpers、schema builders。

## Skill 目錄模式

Skill folder 保持精簡：

```text
skill-name/
  SKILL.md
  agents/openai.yaml
  references/
  scripts/
  assets/        # 只有模板或輸出素材真的需要被複製時才建立
```

不要在 skill 內加入 README、changelog 或額外 user docs，除非它們本身就是 agent 需要載入的 references。

