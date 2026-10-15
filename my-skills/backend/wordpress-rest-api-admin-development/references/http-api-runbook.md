# HTTP API Runbook

本 runbook 用於以 HTTP REST API 探測、dry-run 與套用 WordPress 後端配置。

## Base URL

環境變數 `WP_REST_BASE_URL` 應指向：

```txt
https://example.com/wp-json
```

不要指到 `/wp-json/wp/v2`；腳本會自行組 path。

## Discovery

先呼叫：

```txt
GET /wp-json/
```

檢查：

- `namespaces` 是否包含 `wp/v2` 與專案 custom namespace。
- `routes` 是否包含目標 route。
- 站台是否回傳 JSON，而不是 HTML、WAF 頁或 login redirect。

## OPTIONS

對每個即將使用的 endpoint 執行 OPTIONS：

```txt
OPTIONS /wp/v2/pages
OPTIONS /wp/v2/settings
OPTIONS /vector/v1/bootstrap
```

用它確認 methods、args、schema 與權限錯誤。不同 WordPress 版本與 plugin 可能讓 schema 不同。

## Read-before-write

寫入前先讀既有資料：

- Page/post：`GET /wp/v2/pages?slug=<slug>&context=edit`
- Category/tag：`GET /wp/v2/categories?slug=<slug>`
- User：`GET /wp/v2/users?search=<email>&context=edit`
- Settings：`GET /wp/v2/settings`
- Menu/navigation：先 discovery 再選 endpoint。

Dry-run 應顯示 create/update/skip，不要只顯示 request count。

## Pagination

Collection response 可能分頁。讀取時處理：

```txt
X-WP-Total
X-WP-TotalPages
```

大量查詢最多 `per_page=100`，超過時逐頁讀取。不要假設第一頁就是完整資料。

## Media upload

Media upload 通常：

```txt
POST /wp/v2/media
Content-Disposition: attachment; filename="hero.jpg"
Content-Type: image/jpeg
```

上傳後再 PATCH alt text/title：

```txt
POST /wp/v2/media/<id>
```

注意檔案大小、MIME type、重複檔名與權限。

## Idempotent upsert

建議 upsert key：

- Settings：setting key。
- Term：taxonomy + slug。
- Page/post：post type endpoint + slug。
- Media：filename 或 manifest 指定 key。
- Menu item：menu + title/url/object/type + parent key。
- Custom endpoint：manifest-defined unique key。

若 upsert key 找到多筆，停止並回報衝突，不要任選第一筆更新。

## Dry-run output

Dry-run 至少列出：

- 目標站台與環境。
- 已認證 user 摘要。
- 每個 operation 的 method/path。
- create/update/skip/unsupported。
- payload 摘要，不列 secret。
- 需要人工確認的風險。

## Apply output

Apply 後回報：

- 成功操作與 WordPress IDs。
- 失敗操作與 WordPress error body。
- 被略過的 unsupported section。
- 仍需 wp-admin 人工設定的項目。

## Rollback notes

REST API 不等於 migration framework。執行前記錄既有值與 entity ID。對 production：

- 不自動刪除未知既有資料。
- 不自動 publish 大量內容。
- 不自動變更 user roles。
- 不自動切換 theme/plugin。

需要 rollback 時優先用記錄的 old values 手動或專案 migration 還原。
