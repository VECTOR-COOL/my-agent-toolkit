# WordPress 外掛開發檢查表

使用此 checklist 處理 plugin architecture、custom functionality、admin pages、activation、uninstall、Cron、custom tables、CPTs、taxonomies、shortcodes 與 enqueue work。

## 外掛架構

- 外掛主檔必須包含有效 plugin header。
- Bootstrap file 可保持 minimal procedural code；實作預設使用 namespaced OOP。
- 新 PHP 檔案在與專案相容時使用 `declare(strict_types=1);`。
- 使用 project namespace，例如 `Vendor\PluginName`。
- 在專用 class 或 bootstrap function 中註冊 hooks；不要在 file load time 執行 business logic。
- Global functions、option names、transients、cron events、shortcode tags、script handles 與 table names 必須加 prefix。
- 除非需要 WordPress-provided globals，例如 `$wpdb`，否則避免 global variables。

## Composer 與 No-Composer 部署

- enterprise deployment 支援 build artifacts 時，可使用 Composer autoloading。
- 當目標可能是 Plesk 或 shared hosting，不可讓 Composer 成為唯一 deployment path。
- 需要時提供以下替代方案之一：
  - plugin classes 使用手動 `require_once` bootstrap。
  - policy 允許時提交 `vendor/` build artifact。
  - 使用 single-file 或 small-file implementation，並明確 includes。
- 不可在 runtime 從 remote URLs 抓取 dependencies。

## Hooks

- 優先使用 actions 與 filters，而不是覆寫 core behavior。
- 使用符合 lifecycle 的 hooks：
  - `plugins_loaded` 用於 plugins available 後載入 plugin services。
  - `init` 用於 CPTs、taxonomies、shortcodes 與 rewrite-aware registration。
  - `admin_menu` 用於 admin pages。
  - `admin_init` 用於 Settings API registration。
  - `rest_api_init` 用於 REST routes。
  - `wp_enqueue_scripts`、`admin_enqueue_scripts` 與 `enqueue_block_editor_assets` 用於 assets。
- 除非 request branch 穩定且有明確目的，否則避免在 request branches 內註冊 hooks。

## Activation、Deactivation、Uninstall 流程

- Activation hook 只做必要初始化：default options、CPT registration 後 rewrite flush、輕量 schema setup。
- Activation 期間不可執行 remote calls、bulk imports、heavy indexing、emails 或 long migrations。
- Deactivation 應停止 scheduled events 與 temporary runtime behavior，不應刪除 user data。
- Uninstall 必須明確處理不可逆資料刪除，並應尊重 `delete_data_on_uninstall` 這類 user option。
- 使用 `register_uninstall_hook()` 或 `uninstall.php`，除非有明確理由，不要兩者並用。

## Custom Post Types 與 Taxonomies

- 在 `init` 註冊。
- 使用穩定 slugs 與 labels。
- 需要時以 `capability_type`、`map_meta_cap` 或 custom capabilities 明確定義 capability behavior。
- 只有資料確實要供 API 使用時才 expose to REST。
- 依產品需求提供 rewrite、archive、menu 與 supports settings。

## Settings 與 Admin Pages

- 實務可行時，settings forms 使用 Settings API。
- 渲染 protected UI 前，以 capability checks 保護 admin pages。
- 使用 Settings API 時使用 `settings_fields()` 與 `do_settings_sections()`。
- 透過 `register_setting()` 的 `sanitize_callback` sanitize settings。
- 渲染 fields 時 escape stored values。

## Shortcodes

- 在 `init` 註冊 shortcodes。
- 使用 `shortcode_atts()` 與 type-specific sanitizers sanitize shortcode attributes。
- 回傳 strings；不要直接 echo。
- output late escape。
- 除非已 cache，避免在 shortcode render paths 執行 heavy queries。

## AJAX

- 使用 `wp_ajax_` 註冊 authenticated actions。
- 只有明確公開行為才註冊 `wp_ajax_nopriv_`。
- 執行前驗證 nonce、capability 與 sanitized input。
- 使用 `wp_send_json_success()` 或 `wp_send_json_error()` 回傳 JSON。

## Custom Tables 與 dbDelta

- 只有 core post/meta/taxonomy/user storage 不足時才使用 custom tables。
- 使用 `$wpdb->prefix` 與 project-specific suffix。
- 使用 `dbDelta()` 建立或變更 schema。
- 儲存 schema version option，並讓 migrations idempotent。
- lookup columns 必須有適當 indexes。
- 不可在一般 frontend requests 執行 unbounded migrations。

## WP Cron

- 只有尚未 scheduled 時才 schedule events。
- event names 使用 project prefix。
- Cron jobs 必須 bounded、idempotent 且 retry-safe。
- Deactivation 時 clear scheduled hooks。
- remote API results 必須 cache 並處理 timeouts。

## Enqueue

- frontend assets 使用 `wp_enqueue_scripts`。
- admin assets 使用 `admin_enqueue_scripts`，並檢查 `$hook_suffix`。
- block assets 盡量使用 block metadata。
- 註冊 dependencies 與 versions。
- `filemtime()` 只在 development 或 local stable path 適用時使用。
- 除非必要，不要在每個 admin 或 frontend page 全域 enqueue plugin assets。
