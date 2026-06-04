# WordPress REST API 檢查表

使用此 checklist 處理 `register_rest_route()`、custom endpoints、REST-backed admin UI、headless features、WPGraphQL-compatible data design 與 API security review。

## Route 設計

- 在 `rest_api_init` 註冊 routes。
- namespace 使用 plugin 或 project name，version 使用 `my-plugin/v1` 這類格式。
- 使用穩定 route paths 與 HTTP methods。
- success 與 error states 的 response shapes 保持一致。
- errors 使用 `WP_Error`；正常回傳使用 `WP_REST_Response` 或 REST 可接受 arrays。

### HeadPress Composition API routes

若任務涉及 HeadPress API，主推下列 frontend-first endpoints：

```txt
GET /site
GET /page
GET /page/{path}
```

舊端點只作相容 alias 並標示 deprecated：

```txt
GET /site-layout
GET /route?path=/about
```

`/page` 是 Frontend Page Data Endpoint，不是 WordPress `page` post type。`/page/{path}` 必須支援多層 path，route pattern 可使用：

```php
register_rest_route( 'headpress/api/v1', '/page(?:/(?P<path>.*))?', [
    'methods'             => 'GET',
    'callback'            => 'headpress_get_page',
    'permission_callback' => '__return_true',
] );
```

公開 read-only endpoint 使用 `__return_true` 前，必須確認 response 不暴露 private options、user emails、edit links、draft/private content 或 secrets。詳細 response contract 見 `skills/backend/wordpress-rest-api-development/references/headpress-composition-api.md`。

## Permission Callback

每個 route 都必須包含 `permission_callback`。

```php
register_rest_route(
    'my-plugin/v1',
    '/items',
    [
        'methods'             => 'GET',
        'callback'            => 'my_plugin_get_items',
        'permission_callback' => static function (): bool {
            return current_user_can( 'read' );
        },
    ]
);
```

規則：

- 不可省略 `permission_callback`。
- 除非 endpoint 明確公開 read-only 且已說明理由，否則不可使用 `__return_true`。
- Mutating endpoints 必須檢查 write capability，例如 `manage_options`、`edit_post` 或 custom capability。
- Permission checks 必須保護 private data，不只是保護 writes。

## Request Args

- 所有可接受 params 都定義 `args`。
- 使用 `validate_callback` 檢查 shape、range、enum 與 object existence。
- 使用 `sanitize_callback` 做 type-specific sanitization。
- 使用 bounded pagination defaults；不可允許 unbounded `per_page`。
- arrays 必須 recursively sanitize。

## 錯誤處理

使用 `WP_Error`，並提供有意義的 code、message 與 HTTP status。

```php
return new WP_Error(
    'my_plugin_forbidden',
    __( '你沒有權限執行此操作。', 'my-plugin' ),
    [ 'status' => 403 ]
);
```

規則：

- error messages 不可洩漏 sensitive internal details。
- 保留可行動的 status codes：400、401、403、404、409、429、500。
- production API errors 不可轉成 empty success responses。

## 資料暴露

- 除非必要且 permission-protected，不可暴露 secrets、private options、user emails、unpublished content、edit URLs、tokens 或 internal IDs。
- headless public endpoints 只回傳 frontend 需要的 public data。
- REST / JSON response 回傳 sanitized data；不要為了 HTML context 預先 `esc_html()`，HTML escape 應留到真正 render 邊界。
- 暴露 metadata 時使用 allowlists。
- 考慮 WPGraphQL compatibility：fields 應 typed、documented、permission-aware，且不要耦合 REST-only assumptions。

## 快取

- expensive reads 使用 Transients API 或 object cache。
- response 會依 user 或 query 不同時，cache keys 必須包含 permission 與 request params。
- private per-user data 不可放入 public cache key。
- source data 變更時透過 `save_post`、`deleted_post` 或 option update hooks 等機制 invalidate cache。

## CORS

- 不要全域放寬 CORS。
- 若需要 cross-origin access，說明 allowed origins、methods、credentials behavior 與 data exposure。
- 不可用 permissive CORS 繞過 authentication 或 permission design。

## REST Nonces

- Cookie-authenticated browser requests 可能需要來自 `wp_create_nonce( 'wp_rest' )` 的 REST nonce。
- 驗證 browser intent，但仍以 `permission_callback` 作為 authorization gate。
- 不可把 REST nonce 當成 capability checks 的替代品。

## 測試

- 測試 anonymous、logged-in low-privilege 與 authorized users。
- 測試 invalid params、適用時 missing nonce、permission denied、empty result、cache hit 與 cache invalidation。
- 確認 response 不包含 protected fields。
