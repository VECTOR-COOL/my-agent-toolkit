# WordPress 管理端 REST 配置

本 reference 用於規劃透過 authenticated HTTP REST API 建立或維護 WordPress 後端配置資料。先探測能力，再建立 manifest，再 dry-run，最後才 apply。

## 官方端點基準

- Discovery: `GET /wp-json/`
- Settings: `/wp/v2/settings`
- Posts: `/wp/v2/posts`
- Pages: `/wp/v2/pages`
- Categories: `/wp/v2/categories`
- Tags: `/wp/v2/tags`
- Media: `/wp/v2/media`
- Users: `/wp/v2/users`
- Menu items: `/wp/v2/menu-items`
- Menu locations: `/wp/v2/menu-locations`
- Navigation: `/wp/v2/navigation`
- Plugins/Themes/Templates 等端點依 WordPress 版本、權限與站台設定而定。

先用 discovery 與 OPTIONS 確認端點存在、method 可用、欄位 schema 與 required capability；不要只靠記憶假設可寫。

## 配置順序

建議依依賴關係排序：

1. 探測站台與認證：base URL、user、roles/capabilities、settings endpoint。
2. Settings：站名、描述、時區、日期格式、permalink 相關設定需確認是否可由 REST 寫入。
3. Taxonomies：categories/tags 或 custom taxonomy terms。
4. Media：先上傳後取得 media id，再綁定 featured media 或內容。
5. Pages/posts/custom post types：用 slug 做 upsert key。
6. Menus/navigation：先確認 classic menu、menu item 或 block navigation 模式。
7. Users：高風險，僅在測試站或明確授權時建立/更新。
8. Custom endpoint checks：確認專案自訂 route、schema 與 permission。

## Manifest section

### `settings`

`settings` 是物件，key 對應 WordPress settings endpoint 支援的欄位。常見欄位包含 `title`、`description`、`timezone`、`date_format`、`time_format`、`posts_per_page`。

注意：

- 不是所有 WordPress option 都可由 core REST settings 寫入。
- plugin options 通常需要自訂 endpoint 或 plugin 專屬 REST route。
- 修改前先 GET 現值，dry-run 顯示差異。

### `taxonomies`

建議 shape：

```json
{
  "taxonomy": "categories",
  "terms": [
    { "name": "最新消息", "slug": "news", "description": "" }
  ]
}
```

以 `taxonomy + slug` 查既有 term。Core categories/tags 可用 `/wp/v2/categories`、`/wp/v2/tags`；custom taxonomy 需確認 `show_in_rest` 與 route base。

### `media`

建議 shape：

```json
{
  "sourcePath": "assets/hero.jpg",
  "filename": "hero.jpg",
  "title": "首頁主圖",
  "altText": "首頁主圖"
}
```

Media upload 需要 multipart/body 與 `Content-Disposition`。大型檔案、覆蓋既有媒體、刪除媒體都需要明確確認。若無法穩定比對檔案雜湊，至少用 filename/title 做候選比對並回報不確定性。

### `pages` / `posts`

建議 shape：

```json
{
  "slug": "about",
  "status": "publish",
  "title": "關於我們",
  "content": "<p>內容</p>",
  "excerpt": "",
  "featuredMediaSlug": "about-hero"
}
```

以 endpoint + slug 做 upsert。更新前保留原始 `id`、`modified`、`status` 摘要，避免覆蓋非預期內容。Production 不要直接 publish 未審核內容。

### `users`

Users 是高風險 section。只允許在明確授權情境建立或更新，且不得把密碼放入 manifest。若需要建立 user，密碼應由安全通道或 WordPress 後台處理。

建議 shape：

```json
{
  "username": "editor01",
  "email": "editor01@example.com",
  "roles": ["editor"],
  "name": "Editor 01"
}
```

### `menus`

WordPress menu REST 能力受版本與 theme 類型影響。Classic theme 常見流程是 menu/menu-items/menu-locations；block theme 可能使用 navigation post。先探測 `/wp/v2/menu-items`、`/wp/v2/menu-locations`、`/wp/v2/navigation`，再選定策略。

Menu item 必須保留 hierarchy：`parent`、`menu_order`、URL/object/object_id/type。不要把多層選單扁平化。

### `customEndpointChecks`

建議 shape：

```json
{
  "name": "site bootstrap",
  "method": "GET",
  "path": "/vector/v1/bootstrap",
  "expectStatus": 200
}
```

用於驗證自訂 endpoint 是否存在、是否需要 auth、回應 shape 是否符合前後端契約。

## 不建議透過 manifest 管理的項目

- Production user password。
- Application Passwords 本身。
- 第三方 API keys、SMTP passwords、payment secrets。
- 大量 production content 覆蓋或刪除。
- 無法 rollback 的 plugin/theme activation。

這些項目應改用人工確認、專案部署流程、server secret manager 或專屬 migration。
