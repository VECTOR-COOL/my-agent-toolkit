# WordPress Skill 測試 Playbook

使用此 playbook 執行本 skill 的 scripts、驗證 examples、審查目標 WordPress 專案。

## 本 Skill 自檢

```powershell
node scripts/run-wp-skill-checks.mjs
node scripts/validate-wp-examples.mjs
```

## 驗證架構 Manifest

```powershell
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/plugin-basic.json --schema plugin
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/theme-basic.json --schema theme
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/hook-map.json --schema hook
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/dependency-map.json --schema dependency
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/review-report.json --schema review
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/content-setup.json --schema content
```

## 審查 WordPress 專案

```powershell
node scripts/audit-wp-code-patterns.mjs --root D:/path/to/wp-content/plugins/my-plugin
node scripts/audit-wp-code-patterns.mjs --root D:/path/to/wp-content/themes/my-theme --format json
```

## Audit 結果解讀

- `high`：安全或 fatal 風險，必須修。
- `medium`：效能、架構或平台風險，應修或說明原因。
- 無 finding 不代表通過 PHPCS；仍需依專案執行 WordPress Coding Standards / VIPCS。

## 使用 Examples

- 先讀對應 example 的 `architecture.json` 或 `hook-map.json`。
- 複製模式，不要照抄 prefix、namespace、text domain。
- 產出正式碼時必須替換 project prefix、capability、option names 與 content slugs。
- 需要建立文章、分類、標籤或主選單時，參考 `examples/content-setup-plugin/`，並保持 idempotent。
