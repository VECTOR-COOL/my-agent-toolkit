# WordPress 安全檢查表

每次處理 plugin、theme、REST API、AJAX、shortcode、admin page、block render callback、database 與 settings 任務時，都使用此 checklist。

## 零容忍要求

- 所有 input 在儲存、查詢或用於 control flow 前必須 sanitize 與 validate。
- 每個 output 必須 late escape，並在輸出 HTML、attributes、URLs、JavaScript、textarea content 或 JSON 前立即處理。
- 所有 forms、AJAX requests、REST writes、destructive actions 與 sensitive queries 必須使用 nonce intent checks。
- protected UI、settings changes、data writes、deletes、exports、imports 與 private reads 前必須使用 `current_user_can()` 檢查 capability。
- 優先使用 WordPress core APIs，而不是 direct SQL。direct SQL 不可避免時必須使用 `$wpdb->prepare()`。
- 不可將 secrets、private options、tokens、cookies、Application Passwords、non-public user data 或 protected edit URLs 暴露到 frontend。

## Nonce

Forms、AJAX、REST writes 與 state-changing links 必須使用 nonce checks。

常用 functions：

```php
wp_nonce_field()
wp_create_nonce()
check_admin_referer()
check_ajax_referer()
wp_verify_nonce()
```

規則：

- 使用 action-specific nonce names，例如 `my_plugin_update_settings`。
- mutation 前必須 verify nonce。
- Nonce 證明 intent，不是 authorization；必須永遠搭配 `current_user_can()`。
- AJAX 優先使用 `check_ajax_referer( 'action_name', 'nonce' )`。
- REST API 只有在 route 依賴 cookie-authenticated browser requests 時才需要驗證 nonce；但永遠保留 `permission_callback`。

## Capability Checks

依操作使用最小必要 capability。

```php
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( esc_html__( '權限不足。', 'my-plugin' ) );
}
```

指引：

- Settings pages 通常使用 `manage_options`。
- Content editing 應使用 post-specific capabilities，例如 `edit_post`、`delete_post` 或 custom capabilities。
- Public read endpoints 若暴露 authenticated data，可使用 `read` 或 custom permission model。
- 不要假設 authenticated user 是 administrator。

## Sanitization 與 Validation

常用 sanitizers：

```php
sanitize_text_field()
sanitize_textarea_field()
sanitize_email()
sanitize_key()
sanitize_title()
sanitize_file_name()
absint()
intval()
floatval()
wp_kses()
wp_kses_post()
esc_url_raw()
```

規則：

- 依 destination 與 expected shape sanitize strings。
- Enumerations 使用 allowlists validate。
- IDs 使用 `absint()`，需要時確認 object existence。
- URLs 儲存時使用 `esc_url_raw()`；涉及 remote requests 時使用 `wp_http_validate_url()`。
- Arrays 必須 recursively validate；不要信任 nested request payloads。

## Escaping

常用 escaping functions：

```php
esc_html()
esc_attr()
esc_url()
esc_textarea()
esc_js()
wp_json_encode()
esc_html__()
esc_attr__()
```

規則：

- 在 output boundaries late escape。
- REST / AJAX JSON response 不是 HTML render boundary；回傳 sanitized data，讓消費端依實際輸出 context escape。
- 預設使用 translation-ready escaping，例如 `esc_html__()` 與 `esc_attr__()`。
- 只有 trusted post-like HTML 使用 `wp_kses_post()`；custom HTML 應定義更嚴格的 `wp_kses()` allowlist。
- scripts 內 JSON output 使用 `wp_json_encode()`。

## Database

優先使用 core APIs：

- `WP_Query`、`get_posts()`、taxonomy APIs、metadata APIs、Options API、Settings API、users APIs、comments APIs。
- core API 可安全且有效率表達 query 時，不要使用 direct SQL。

SQL 不可避免時：

```php
global $wpdb;

$user_id = absint( $_GET['user_id'] ?? 0 );

$sql = $wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = %d",
    $user_id
);

$results = $wpdb->get_results( $sql );
```

規則：

- 不可把 user input 串接進 SQL。
- 每個 dynamic value 都要使用 prepare 佔位符。
- Dynamic table 或 column names 必須使用 allowlists validate；佔位符無法保護 identifiers。
- 如果有更具體的方法可用，不要用 `$wpdb->query()` 做 reads。

## REST API

- 每個 `register_rest_route()` 都必須包含 `permission_callback`。
- 避免 `__return_true`；只有 intentional public read-only data 且已說明原因時才使用。
- request params 必須透過 route `args` validate 與 sanitize。
- errors 使用 `WP_Error` 回傳。
- 未經權限保護，不可暴露 private metadata、secrets、unpublished content、protected user fields 或 edit URLs。

## AJAX

每個 AJAX action 必須：

- 註冊 `wp_ajax_{$action}`。
- 只有 intentional public unauthenticated behavior 才註冊 `wp_ajax_nopriv_{$action}`。
- 使用 `check_ajax_referer()`。
- protected operations 使用 `current_user_can()`。
- 使用 `wp_send_json_success()` 或 `wp_send_json_error()` 回傳。

## Secrets

- 不可 hardcode API keys、tokens、cookies、Application Passwords 或 private URLs。
- 不可把 secrets 放入 `wp_localize_script()`、inline scripts、block attributes、HTML data attributes、REST responses 或 logs。
- server-side secrets 應存放於 environment configuration、secure options 或 approved secret management。
- examples 與 debugging output 必須 redact secrets。
