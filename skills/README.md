# Third-party Skills Directory

本目錄保存可攜的第三方 skills。每一個技能資料夾均以 `SKILL.md` 為入口，並保留來源所附的 `references/`、`scripts/`、`assets/` 或其他支援檔案。

自建技能與第三方技能分開管理：自建內容位於 [`../my-skills/`](../my-skills/)，本目錄只收錄外部來源的可攜技能。

## 分類

| 分類 | Skills | 上游來源 |
| --- | --- | --- |
| [`design/`](./design/) | `ui-ux-pro-max`、`frontend-design`、`frontend-design-review`、`shadcn`、`web-design-guidelines` | nextlevelbuilder、anthropics、microsoft、shadcn-ui、vercel-labs |
| [`react/`](./react/) | `react-best-practices`、`composition-patterns` | vercel-labs |
| [`mobile/`](./mobile/) | `react-native-skills`、`app-store-review` | vercel-labs、safaiyeh |
| [`browser/`](./browser/) | `playwright` | OpenAI |
| [`cloudflare/`](./cloudflare/) | `cloudflare-deploy` | OpenAI |
| [`workflow/`](./workflow/) | `create-prd`、`user-stories`、`writing-plans`、`test-driven-development`、`verification-before-completion`、`requesting-code-review`、`receiving-code-review` | phuryn、obra |
| [`github/`](./github/) | `gh-fix-ci`、`gh-address-comments` | OpenAI |
| [`security/`](./security/) | `security-best-practices` | OpenAI |
| [`wordpress/`](./wordpress/) | `wp-plugin-development`、`wp-plugin-directory-guidelines`、`wp-rest-api`、`wp-performance`、`wp-phpstan`、`wp-wpcli-and-ops` | WordPress |

## 維護規則

- 僅從可追溯上游來源更新；保留原始授權與 attribution 檔案（如有）。
- 不在此處混入組織或專案專屬規則；這類內容應放在 `my-skills/`。
- 更新前先檢查上游授權、版本與相依資產是否一併變動。
