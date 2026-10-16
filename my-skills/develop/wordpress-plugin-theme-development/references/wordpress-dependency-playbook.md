# WordPress 依賴關係 Playbook

使用此 playbook 設計 plugin dependencies、theme-plugin boundary、Composer/no-Composer 與 soft dependency fallback。

## 依賴分類

- WordPress Core version：用 plugin header 或文件說明最低版本。
- PHP version：用 plugin header、runtime guard 或 Composer 設定。
- Required plugin：WordPress 6.5+ 可使用 `Requires Plugins` header。
- Soft dependency：用 `class_exists()`、`function_exists()`、`defined()` 或 active plugin check。
- Composer dependency：只能在部署流程支援時作為主要方案；Plesk/shared hosting 要有替代路徑。

## 常用外掛依賴

| 外掛 | 常見 slug / folder | 檢查方式 | 整合原則 |
| --- | --- | --- | --- |
| ACF / Advanced Custom Fields | `advanced-custom-fields` | `function_exists('acf_add_local_field_group')` | field groups 放在 `acf/init`，輸出 ACF 值仍需 escape。 |
| Elementor | `elementor` | `did_action('elementor/loaded')` | widgets/hooks 只在 Elementor loaded 後註冊，保留 non-Elementor fallback。 |
| WPML Multilingual CMS | `sitepress-multilingual-cms` | `defined('ICL_SITEPRESS_VERSION')` | 使用 WPML hooks/API 處理語系與 translated object，不自行拼語系 URL。 |

ACF、Elementor、WPML 都應預設視為 soft dependency，除非使用者明確要求專案強依賴。強依賴時，WordPress.org 外掛可使用 `Requires Plugins` header；商業外掛或非 WordPress.org slug 通常需要 runtime guard 與 admin notice。

## Theme 與 Plugin 邊界

- Theme 可以依賴 plugin 提供 CPT 或 block，但必須有缺失 fallback。
- Plugin 不應依賴特定 theme 才能執行核心資料邏輯。
- Theme 中呼叫 plugin API 前先檢查 function/class 是否存在。

## Required Plugin Strategy

- 強依賴使用 `Requires Plugins` header 或 activation guard。
- 軟依賴使用 runtime check，缺少時停用相關功能而非讓站台 fatal。
- admin notice 必須 escape，且只顯示給有權限的使用者。

## Composer 與 No-Composer

- Composer 適合企業專案的 autoload 與 packages。
- 不可要求使用者在 production shared hosting 上一定能執行 Composer。
- 替代方案：提交 vendor build、手動 includes、移除非必要 dependency。

## 審查問題

- 依賴缺失時是否 fatal？
- 依賴檢查是否在正確 lifecycle？
- 是否把 secret 或 private config 當成 frontend dependency？
- theme 是否對 plugin API 有 fallback？
- ACF/Elementor/WPML 不存在時，是否仍有 core WordPress 或 block theme fallback？
