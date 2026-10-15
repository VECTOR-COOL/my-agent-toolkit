# 認證、權限與安全

本 reference 用於 authenticated WordPress REST 管理操作。預設使用 Application Passwords，並把所有 secret 留在 server-only 或本機受控腳本環境。

## 自然語言配置回覆

當使用者只是詢問「如何配置連線授權」或「安全檢查怎麼做」時，先用自然語言說明，不要請使用者把 Application Password、JWT、cookie、nonce 或 admin 密碼貼在聊天中。若需要實際測試，要求使用者在本機 server-only env 或受控 shell 中設定環境變數。

應說明的最小配置：

```bash
WP_REST_BASE_URL=https://example.com/wp-json
WP_REST_USERNAME=admin@example.com
WP_REST_APPLICATION_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
```

- `WP_REST_BASE_URL` 指向 `/wp-json`，不要指向 `/wp-json/wp/v2`。
- `WP_REST_USERNAME` 是 WordPress 使用者名稱或 email。
- `WP_REST_APPLICATION_PASSWORD` 是 WordPress 使用者 Profile 產生的 Application Password，不是登入密碼。
- HTTP client 以 Basic Auth 傳送，不把 secret 寫入 URL query string。
- 實際寫入前先做 read-only probe、OPTIONS schema/capability 檢查與 dry-run。

安全檢查摘要：

- 站台必須使用 HTTPS。
- 帳號採最小權限；不要預設使用 administrator。
- Secret 只放 server-only env、本機受控腳本或 CI secret store。
- 不使用 `VITE_`、`NEXT_PUBLIC_` 等 public prefix。
- Manifest、fixture、log、error message 不得包含 secret。
- 收到 401/403 時保留 WordPress error body 判斷是認證失敗或權限不足。
- Production 寫入、刪除、user/role/plugin/theme/settings 操作必須再次取得明確授權。

## 認證策略

| 方法 | 適用情境 | 預設 |
| --- | --- | --- |
| Application Passwords | server-to-WordPress、管理腳本、CI read-only probe | 是 |
| Cookie + `X-WP-Nonce` | wp-admin 內 plugin/admin page | 否 |
| OAuth/JWT plugin | 已有委派授權或外部登入需求 | 否 |
| Basic Auth dev plugin | 本機測試 | 否 |

Application Passwords 是 WordPress core 支援的 REST 認證方式。用 Basic Auth header 傳送：

```txt
Authorization: Basic base64(username:applicationPassword)
```

## Secret boundary

- 使用 `WP_REST_USERNAME` 與 `WP_REST_APPLICATION_PASSWORD`。
- 不使用 `VITE_`、`NEXT_PUBLIC_` 或任何 public env prefix。
- 不把 secret 寫入 manifest、README、console log、error stack 或 Git。
- CI log 顯示時遮罩 username/password。
- 若 Application Password 洩漏，立即在 WordPress user profile 撤銷。

## Capability 檢查

認證只代表身份，不代表能做所有操作。每個 endpoint 還會檢查 capability。

常見例子：

- 更新 settings 通常需要管理權限。
- 建立/更新 posts/pages 需要對應 post type capability。
- 讀取 `context=edit` 需要編輯權限。
- 建立 users、安裝 plugins、切 theme 是高權限操作。
- Custom endpoint 由 `permission_callback` 決定。

Probe 時優先呼叫：

```txt
GET /wp/v2/users/me?context=edit
GET /wp/v2/settings
OPTIONS /wp/v2/posts
OPTIONS /wp/v2/pages
```

若收到 401/403，保留 WordPress error code/message，不要改寫成泛用錯誤。

## Mutating operation guardrails

所有寫入操作都要滿足：

- 已確認目標 base URL 與環境名稱。
- 已完成 read-only probe。
- 已 dry-run 並列出操作摘要。
- 已確認 upsert key 與可能影響的既有 entity。
- 已確認 production 是否允許寫入。
- 已確認沒有 secret 出現在 payload。

高風險操作需要額外確認：刪除、user 建立/更新、role/capability 變更、plugin/theme 操作、settings 大範圍覆蓋、publish production content。

## Custom endpoint permission

不要使用：

```php
'permission_callback' => '__return_true'
```

除非 endpoint 完全公開且只回傳可公開資料。寫入操作至少要檢查 capability，例如：

```php
'permission_callback' => function () {
    return current_user_can('manage_options');
}
```

對內容編輯 endpoint，優先使用更小權限，例如 `edit_posts`、`edit_pages` 或自訂 capability。

## 錯誤處理

WordPress REST error 通常是：

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": { "status": 403 }
}
```

保留 `code`、`message`、`data.status`。Agent 回報時要說明是認證失敗、權限不足、端點不存在、schema validation 失敗或 server error。

## 安全 review checklist

- Secret 是否只存在於 server-only env。
- Manifest 是否不含密碼與 API keys。
- Endpoint 是否最小權限。
- Request params 是否 sanitize/validate。
- Rich HTML 是否有清楚 trust boundary。
- Public endpoint 是否不洩漏 private IDs、user email、internal option names、edit links。
- Cache 是否區分 public/authenticated response。
