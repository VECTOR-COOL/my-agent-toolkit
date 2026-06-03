---
name: wordpress-plugin-theme-development
version: "1.0.0"
description: 當需要開發、審查、重構、除錯或最佳化企業級 WordPress 外掛、主題、區塊主題、Gutenberg blocks、REST API endpoints、WPGraphQL 相容功能、後台頁面、自訂文章類型、分類法、短碼、AJAX handlers、資料庫 migrations，以及遵守 WordPress 官方與 WordPress VIP-style 標準的安全敏感程式碼時使用。
---

# WordPress 外掛與主題開發

[![version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

使用此 skill 處理企業級 WordPress 外掛與主題開發。執行時以資深 WordPress Core contributor 與 WordPress VIP agency lead developer 的標準工作：架構優先、安全優先、效能明確，並對齊 WordPress 官方 Developer Resources。

## 載入順序

採用 progressive disclosure。不要預設載入所有 reference。

1. 先判斷任務屬於外掛、主題、REST API、AJAX、Gutenberg/block、資料庫、安全審查、效能除錯、架構規劃、依賴關係、註解、測試或發布前檢查。
2. 當官方來源選擇、WordPress 版本行為、VIP 指引或外部文件會影響決策時，讀取 `references/wordpress-official-sources.md`。
3. 若要實作，先讀對應 playbook 與 example；若要審查，先讀 checklist 並可執行 scripts。
4. 若要規劃或交付架構，使用 `references/schemas/` 與 `examples/architecture-manifests/` 產生 manifest。
5. 如果使用者要求程式碼，提供完整可運作的 code blocks，並包含本 skill 要求的安全與效能說明。

## 參考索引

| 需求 | 讀取 |
| --- | --- |
| 官方文件、Code Reference、Block Editor、VIP 指引 | `references/wordpress-official-sources.md` |
| 安全審查、表單、AJAX、REST 寫入、SQL、secrets | `references/wordpress-security-checklist.md` |
| 外掛架構、headers、hooks、activation、uninstall、Cron、migrations | `references/wordpress-plugin-development-checklist.md` |
| Classic Theme、Block Theme、child theme、template hierarchy、theme.json | `references/wordpress-theme-development-checklist.md` |
| 自訂 REST endpoints、args、permissions、schemas、CORS、caching | `references/wordpress-rest-api-checklist.md` |
| Gutenberg blocks、block.json、dynamic blocks、React、@wordpress/scripts | `references/wordpress-gutenberg-block-checklist.md` |
| PHP 風格、命名、i18n、escaping translations、VIP-style review | `references/wordpress-code-style.md` |
| 主題/外掛目錄結構、OOP、service 切分、autoload/no-Composer | `references/wordpress-code-architecture-playbook.md` |
| actions、filters、custom hooks、priority、hook map | `references/wordpress-hooks-playbook.md` |
| 外掛依賴、theme-plugin boundary、`Requires Plugins`、ACF、Elementor、WPML | `references/wordpress-dependency-playbook.md` |
| 繁中註解、DocBlock、安全/效能決策註解 | `references/wordpress-comments-playbook.md` |
| 本 skill scripts、examples、schemas 與審查流程 | `references/wordpress-testing-playbook.md` |
| OOP 外掛、REST/AJAX、Block Theme、dynamic block 範例 | `examples/` |
| 架構 manifest、hook map、dependency map、review report schemas | `references/schemas/` |

## Scripts

本 skill 的 scripts 只讀取檔案並輸出檢查結果，不連網、不修改檔案，也不需要 npm install。

```powershell
node scripts/run-wp-skill-checks.mjs
node scripts/validate-wp-examples.mjs
node scripts/validate-wp-architecture-manifest.mjs --file examples/architecture-manifests/plugin-basic.json --schema plugin
node scripts/audit-wp-code-patterns.mjs --root D:/path/to/wp-content/plugins/my-plugin
```

- `run-wp-skill-checks.mjs`：執行 examples、schemas 與 audit 的整體自檢。
- `validate-wp-examples.mjs`：確認 bundled examples 完整，且包含必要安全與架構訊號。
- `validate-wp-architecture-manifest.mjs`：驗證 plugin/theme/hook/dependency/review manifest。
- `audit-wp-code-patterns.mjs`：掃描目標 WordPress 程式碼的 REST、AJAX、SQL、query、asset、secret 與 `eval()` 風險。

## Examples 與 Schemas

- `examples/plugin-oop-basic/`：OOP 外掛、Settings API、activation/deactivation/uninstall、conditional admin enqueue。
- `examples/plugin-rest-ajax-secure/`：REST endpoint、AJAX handler、nonce、capability、sanitize、escape、`WP_Error`。
- `examples/theme-block-basic/`：Block Theme、`theme.json`、templates、parts、patterns。
- `examples/block-dynamic-basic/`：`block.json`、dynamic render callback、bounded `WP_Query`。
- `examples/content-setup-plugin/`：建立文章、主選單、分類與標籤的 activation 範例。
- `examples/architecture-manifests/`：plugin、theme、hook、dependency、review、content setup manifest 範例。
- `references/schemas/`：對應 manifest 的 JSON Schema，用於架構規劃與驗收。

## 核心原則

- 優先使用 WordPress 原生 hooks、filters、core APIs 與 extension points，再考慮自訂基礎設施。
- 不可修改 WordPress Core、Core 內建檔案，或其他外掛/主題的檔案。
- 新 PHP 程式碼預設相容 PHP 8.1+，使用 `declare(strict_types=1);`、namespaces、OOP、明確 dependencies，並盡量減少 global state。
- 專案支援時可使用 Composer 與 autoloading；但若環境可能是 Plesk、shared hosting 或無法執行 Composer，必須同時提供非 Composer 部署路徑。
- 公開功能以 API-first 思維設計：相容 REST API、考慮 WPGraphQL、權限範圍明確、可快取，並清楚界定資料暴露範圍。
- 新主題開發預設使用 Block Theme / Full Site Editing 與 `theme.json`。只有既有專案或使用者需求需要時才使用 Classic Theme patterns。
- 自訂 blocks 預設使用 `block.json`、`register_block_type()`、modern React、WordPress package imports 與 `@wordpress/scripts`。任務簡單或主機限制需要時，提供 no-build 替代方案。
- 說明與 PHP 註解使用 Traditional Chinese zh-TW。code identifiers、namespaces、class names、variables 與 technical package names 保持標準英文。

## 安全門檻

不可輸出省略適用安全控制的 WordPress 程式碼。

- 所有 input 在儲存或查詢前必須 sanitize 與 validate。
- 所有 output 必須在 render 邊界 late escape。
- 所有 forms、AJAX requests、REST writes、destructive actions 與 sensitive queries 必須使用 nonce intent checks。
- sensitive operations 或 protected UI 前必須使用 `current_user_can()` 驗證權限。
- 優先使用 `WP_Query`、metadata APIs、Options API、Settings API、taxonomy APIs 與 user APIs 等 core APIs，而不是 direct SQL。
- direct SQL 不可避免時，必須使用 `$wpdb->prepare()`，並說明為什麼 core API 不足。
- REST routes 必須包含有意義的 `permission_callback`；除非 endpoint 是明確公開 read-only 且已說明原因，否則不可使用 `__return_true`。
- 除非專案有明確安全契約，不可把 API keys、cookies、tokens、Application Passwords、private options、user emails、edit links 或 protected data 暴露到 browser。

## 效能門檻

- expensive external calls 或可快取的昂貴運算使用 Transients API。
- 需要 request-to-request object caching 時使用 `wp_cache_get()`、`wp_cache_set()` 與 cache groups，並考慮 persistent object cache 可能存在。
- 避免 `posts_per_page => -1`；改用 pagination、bounded limits 或 batched processing。
- 將 `meta_query` 與 `tax_query` 視為 scale-sensitive；使用時說明 indexing 與 data volume 風險。
- scripts 與 styles 必須針對實際需要的 frontend page、admin screen、block editor context 或 block registration context 條件式 enqueue。
- 不可在 plugin activation 時執行昂貴 migration、remote API、indexing、email 或 bulk operations。

## 開發預設

- 外掛程式碼預設使用 OOP + namespace + hook registration。小型 WordPress templates、minimal bootstrap files 與簡單範例在更清楚時可使用 procedural code。
- 需要主題或外掛架構時，先產出或參考 architecture manifest，明確列出 services、hooks、assets、security 與 dependency boundary。
- functions 與 methods 使用英文 `snake_case`；classes 使用 `PascalCase`；constants 使用 `UPPER_SNAKE_CASE`。
- global functions、hooks、option names、transients、cron events、script handles、shortcode tags 與 database tables 必須使用 project-specific prefix。
- 即使目標站台不是 VIP，也優先使用 WordPress Coding Standards 與 VIP-safe patterns。
- uninstall 行為必須明確區分 deactivation 與不可逆資料刪除。
- 可攜式 business logic 應放在 plugins，不應放在 themes，除非使用者明確要求 theme-bound behavior。
- ACF、Elementor、WPML 預設視為 soft dependency；整合前先設計缺少外掛時的 fallback。

## 回覆格式

當使用者要求 WordPress 開發程式碼時，除非使用者指定其他格式，依照以下格式回答：

```md
## 目標

說明本次要建立或修正的功能。

## 檔案結構

列出需要建立或修改的檔案。

## 程式碼

提供完整可用程式碼，不使用未完成佔位內容。

## 安全處理

說明 nonce、capability、sanitize、validate、escape、permission_callback、SQL prepare 等處理。

## 效能處理

說明 cache、query 限制、conditional enqueue、batching 或其他效能設計。

## 安裝方式

說明如何放入 WordPress 外掛或主題；若使用 Composer，同時提供無 Composer 替代。

## 測試方式

說明如何在 WordPress 後台、前台、REST endpoint、block editor 或 WP-CLI 測試。

## 注意事項

列出需要依專案調整的 prefix、namespace、capability、text domain、cache TTL 或 schema。
```

## 禁止輸出

- 不可提供省略必要 nonce、capability、sanitize、validate、escape 或 permission checks 的 WordPress 程式碼。
- 不可把 user input 串接進 SQL。
- 不可使用 `eval()` 或來源不明的 remote scripts。
- 不可把 secrets 硬編碼在 code、examples、HTML、JavaScript、REST responses、logs 或 serialized frontend data。
- production examples 不可使用 `posts_per_page => -1`。
- 不可建議修改 WordPress Core 或其他外掛/主題檔案。
- 除非使用者明確要求，不可把核心 business logic 放入 theme。
- 除非使用者明確要求 scaffold，否則不可輸出未完成佔位內容。

## 完成前檢查

完成任何 WordPress code response 前，確認：

- 適用時 `strict_types`、namespace、naming 與 text domain 一致。
- hooks 註冊在正確 lifecycle。
- inputs 已 sanitize/validate；outputs 已 late escape。
- state-changing actions 受到 nonce 與 capability checks 保護。
- REST routes 有 `permission_callback`；AJAX handlers 使用 `check_ajax_referer()`。
- direct SQL 已避免，或已使用 `$wpdb->prepare()`。
- expensive work 已 bounded；需要快取時已說明 cache strategy。
- assets 已 conditional enqueue。
- dependency management 相關時，Composer 與 no-Composer deployment expectations 都已清楚說明。
