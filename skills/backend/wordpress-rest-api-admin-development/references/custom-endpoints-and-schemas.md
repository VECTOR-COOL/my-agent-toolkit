# Custom Endpoints 與 Schema

本 reference 用於設計 WordPress custom REST endpoints、CPT/taxonomy/meta REST exposure 與管理端 API contract。

## `register_rest_route` 基本規則

Custom endpoint 應放在 plugin 或專案 mu-plugin，而不是散落在 theme template。建議 namespace 使用專案名與版本：

```php
register_rest_route('vector/v1', '/bootstrap', [
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'vector_get_bootstrap',
    'permission_callback' => function () {
        return current_user_can('edit_posts');
    },
    'args' => [
        'locale' => [
            'type' => 'string',
            'required' => false,
            'sanitize_callback' => 'sanitize_text_field',
        ],
    ],
]);
```

規則：

- Namespace 必須含版本，例如 `project/v1`。
- `permission_callback` 必填且語意清楚。
- `args` 要定義 type、required、sanitize/validate。
- Response shape 要穩定，不直接回傳任意 option 或 raw object。
- 錯誤用 `WP_Error`，並帶 HTTP status。

## `WP_Error` pattern

```php
return new WP_Error(
    'vector_missing_slug',
    '缺少 slug。',
    ['status' => 400]
);
```

常見錯誤碼：

- `400`: request invalid。
- `401`: 未認證。
- `403`: 權限不足。
- `404`: entity 不存在。
- `409`: 狀態衝突，例如 slug 已存在但不可更新。
- `500`: server error。

## CPT 與 taxonomy REST exposure

Custom post type 需要：

```php
'show_in_rest' => true,
'rest_base' => 'products',
'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
```

Custom taxonomy 需要：

```php
'show_in_rest' => true,
'rest_base' => 'product-categories',
```

若前端或管理腳本需要 meta，使用 `register_post_meta` 或 `register_meta` 時要設定：

```php
'show_in_rest' => true,
'single' => true,
'type' => 'string',
'auth_callback' => function () {
    return current_user_can('edit_posts');
},
```

Meta 欄位不要公開 secrets、internal IDs 或 plugin private state。

## Schema 與 OPTIONS

用 `OPTIONS /wp-json/<namespace>/<route>` 檢查 route 支援的 methods、args 與 schema。Agent 設計 manifest 或 client 前，應先讀 OPTIONS 結果。

Response schema 要記錄：

- required fields。
- nullable fields。
- HTML/string boundary。
- ID 與 slug 的關係。
- pagination 或 collection envelope。
- error body。

## 管理端 endpoint 設計

管理端 custom endpoint 可以用於：

- 彙整 site bootstrap 配置。
- 暴露 plugin option 的受控 subset。
- 批次 upsert terms/content。
- 驗證後端 readiness。
- 提供前端 build 所需但 core REST 缺少的 menu 或 option data。

不要用 custom endpoint 繞過 WordPress capability model。若 endpoint 寫入多個 resource，要在每個 resource 前檢查 capability，並在 response 回報每個 operation 的成功/失敗。

## PHP 範例

完整 minimal plugin 範例見 `examples/custom-endpoint-plugin.example.php`。
