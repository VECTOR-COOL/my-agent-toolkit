# WordPress Hooks Playbook

使用此 playbook 規劃 actions、filters、custom hooks、hook priority 與 callback 命名。

## 選擇 Actions 或 Filters

- Action：執行副作用，例如註冊 CPT、enqueue assets、渲染 admin page、排程 Cron。
- Filter：修改並回傳值，例如調整 query args、內容輸出、設定值。
- 不要用 action 回傳資料，也不要在 filter 中做昂貴副作用。

## 常用 Lifecycle

- `plugins_loaded`：載入外掛服務與相依外掛檢查。
- `init`：CPT、taxonomy、shortcode、rewrite-aware registration。
- `admin_menu`：admin menu/page。
- `admin_init`：Settings API。
- `rest_api_init`：REST routes。
- `wp_enqueue_scripts`：frontend assets。
- `admin_enqueue_scripts`：admin assets，必須檢查 `$hook_suffix`。
- `enqueue_block_editor_assets`：block editor assets。

## Callback 命名

- methods 使用 `snake_case`，名稱描述 hook 目的，例如 `register_post_types()`、`enqueue_admin_assets()`。
- custom hooks 使用 project prefix，例如 `my_plugin_after_sync`。
- hook map 應記錄 hook name、type、callback、priority、lifecycle、security requirement。

## Priority

- 預設使用 `10`。
- 需要在 Core 或其他 plugin 前後執行時才調整 priority。
- 調整 priority 必須有註解說明依賴原因。

## 安全與 Hook

- hook callback 不是安全邊界；AJAX、REST、admin actions 仍需 nonce/capability。
- `init` 註冊不代表公開可讀；REST 與 admin UI 必須另外做 permission design。
- filter 中避免存取 unsanitized request data。
