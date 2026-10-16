# WordPress 程式碼風格

使用此 reference 處理 PHP、JavaScript、CSS、命名、i18n、escaping 與 enterprise review style。

## PHP 基準

- 新 PHP 程式碼在專案限制允許時，應以 PHP 8.1+ 為目標。
- 相容時，新 PHP 檔案使用 `declare(strict_types=1);`。
- 外掛程式碼使用 namespaces。
- enterprise plugin architecture 優先使用 OOP。
- bootstrap files 保持精簡。
- 除非需要 WordPress-provided globals，否則避免 global variables。
- 不使用 short PHP tags。

## 命名

- Class names 使用 `PascalCase`。
- Functions、methods 與 variables 使用英文 `snake_case`。
- Constants 使用 `UPPER_SNAKE_CASE`。
- Global functions、hooks、options、transients、cron events、script handles、shortcode tags 與 custom table names 必須使用 project prefix。
- 除非整合既有 API 必須使用，PHP functions、methods 或 variables 不使用 camelCase。

## WordPress Coding Standards

- PHP、JavaScript、CSS 與 documentation 遵守 WordPress Coding Standards。
- core API 足夠時，優先使用 WordPress core functions，不建立不必要 custom wrappers。
- 避免使用 deprecated WordPress APIs。
- 新程式碼優先使用 short array syntax `[]`，除非專案 standards 另有要求。
- functions 保持短小，hook callbacks 聚焦單一責任。

## 國際化

- user-facing strings 使用 translation functions：
  - `__()`
  - `_e()`
  - `esc_html__()`
  - `esc_attr__()`
  - 需要時使用 `printf()` 搭配已 escape 的 translated strings。
- 使用一致的 text domain。
- translated output 預設使用 `esc_html__()` 或 `esc_attr__()` escape。
- 不輸出未 escape 的 translated strings。

## PHP 註解

- 說明與註解使用 Traditional Chinese zh-TW。
- 註解用來說明非顯而易見的 security、permission、cache 或 lifecycle 決策。
- 不加入只是在重述簡單 assignment 的註解。

## JavaScript 與 CSS

- Gutenberg 開發在可使用 build process 時，使用 WordPress packages 與 `@wordpress/scripts`。
- browser-exposed configuration 不可包含 secrets。
- block/editor JavaScript 翻譯使用 `wp.i18n` 或 package imports。
- CSS scope 限定在 plugin、theme、block 或 admin screen。
- 避免 global CSS 意外影響 WordPress admin 或無關 frontend 區域。

## VIP-Style Review 預期

- 嚴格 validate、sanitize 與 escape。
- 除非 WordPress APIs 與 environment policy 允許，避免 filesystem writes。
- 避免 unbounded queries 與 heavy runtime work。
- normal render paths 避免 direct remote calls；若必要，必須 cache 並限制 timeout。
- 除非有正當理由且已 prepare，否則避免 direct SQL。
- privacy、data exposure 與 permission design 必須明確。

## Review 問題範例

- 這段程式碼是否使用正確 WordPress hook，而不是 hardcoding behavior？
- 每個 state-changing path 是否都有 nonce 與 capability checks？
- 所有 inputs 在使用前是否已 sanitized 或 validated？
- 每個 output 是否都在最後 render point escape？
- query 是否能 scale，且沒有 `posts_per_page => -1` 或未索引 meta scans？
- assets 是否只在需要的地方載入？
- secrets 是否保留在 server-side？
- 若環境需要，是否能同時支援 Composer 與 no-Composer deployment？
