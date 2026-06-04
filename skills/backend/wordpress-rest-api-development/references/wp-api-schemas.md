# WordPress REST API 資料 Schema 參考

> 所有 schema 以 `?_embed` 啟用時的完整回應為基準。
> 每個資源的完整 JSON 結構請見對應的 `.json5` 檔案（含詳細註解）。

---

## Schema 檔案索引

| 檔案 | 資源 | 端點 | 說明 |
| --- | --- | --- | --- |
| `schemas/post.json5` | Post（文章） | `GET /wp/v2/posts?_embed` | 含 `_embedded`、Yoast SEO、`_links` 完整結構 |
| `schemas/page.json5` | Page（頁面） | `GET /wp/v2/pages?_embed` | 標記與 Post 差異（`parent`、`menu_order`、無 `categories`/`tags`） |
| `schemas/category.json5` | Category（分類） | `GET /wp/v2/categories` | 含 `count`、`parent`（層級結構） |
| `schemas/tag.json5` | Tag（標籤） | `GET /wp/v2/tags` | 標記與 Category 差異（無 `parent`，`taxonomy: "post_tag"`） |
| `schemas/media.json5` | Media（媒體） | `GET /wp/v2/media/<id>` | 含 `media_details.sizes`、EXIF 中繼資料 |
| `schemas/user.json5` | User（使用者） | `GET /wp/v2/users/<id>` | 含 `avatar_urls`，標記 public vs edit-only 欄位 |
| `schemas/custom-post-type.json5` | Custom Post Type | `GET /wp/v2/{rest_base}?_embed` | 含自訂 `meta`、自訂 taxonomy 範例 |
| `schemas/search.json5` | Search（搜尋） | `GET /wp/v2/search?search=<keyword>` | ⚠️ `title` 是 string 不是 object |
| `schemas/nav-menu.json5` | Nav Menu（選單） | `GET /wp/v2/menus` | Classic theme 選單本體與 location 指派資訊 |
| `schemas/menu-location.json5` | Menu Location（選單位置） | `GET /wp/v2/menu-locations` | `menu` 欄位指向指派的 nav menu ID |
| `schemas/menu-item.json5` | Menu Item（選單項目） | `GET /wp/v2/menu-items?menus=<id>` | 含 `title.rendered`、`url`、`parent`、`menu_order` |
| `schemas/navigation.json5` | Navigation（Block Theme） | `GET /wp/v2/navigation` | Block theme/FSE 的 `wp_navigation` posts |
| `schemas/error-response.json5` | Error Response（錯誤回應） | 任一非 2xx REST response | 含 `code`、`message`、`data.status`，不可靜默轉成空資料 |
| `schemas/headpress-site-response.json5` | HeadPress Site Response | `GET /site` | 全站共用資料、menus、SEO defaults、global settings |
| `schemas/headpress-page-response.json5` | HeadPress Page Response | `GET /page`、`GET /page/{path}` | 前端整頁資料：site、route、entity、sections、seo、media、archive、collections |

---

## 前端常用存取路徑速查

| 用途 | 存取路徑 |
| --- | --- |
| 文章標題 | `post.title.rendered` |
| 文章內容 HTML | `post.content.rendered` |
| 文章摘要 HTML | `post.excerpt.rendered` |
| 文章 slug | `post.slug` |
| 發佈日期 | `post.date` |
| 特色圖片 URL | `post._embedded?.["wp:featuredmedia"]?.[0]?.source_url` |
| 特色圖片 alt | `post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text` |
| 作者名稱 | `post._embedded?.author?.[0]?.name` |
| 分類名稱列表 | `post._embedded?.["wp:term"]?.[0]?.map(t => t.name)` |
| 標籤名稱列表 | `post._embedded?.["wp:term"]?.[1]?.map(t => t.name)` |
| SEO 標題 | `post.yoast_head_json?.title` |
| SEO 描述 | `post.yoast_head_json?.description` |
| OG 圖片 | `post.yoast_head_json?.og_image?.[0]?.url` |
| 分類文章數量 | `category.count` |
| 媒體特定尺寸 URL | `media.media_details.sizes.{size}.source_url` |
| 指派選單 ID | `menuLocation.menu` |
| 選單項目文字 | `menuItem.title.rendered` |
| 選單項目 URL | `menuItem.url` |
| 選單項目父層 | `menuItem.parent` |
| 選單項目排序 | `menuItem.menu_order` |
| API 錯誤代碼 | `error.code` |
| API 錯誤訊息 | `error.message` |
| API HTTP status | `error.data.status` |

---

## 各資源差異速查

### Post vs Page

| 欄位 | Post | Page |
| --- | --- | --- |
| `categories` | ✅ `number[]` | ❌ 無 |
| `tags` | ✅ `number[]` | ❌ 無 |
| `format` | ✅ string | ❌ 無 |
| `sticky` | ✅ boolean | ❌ 無 |
| `parent` | ❌ 無 | ✅ `number` |
| `menu_order` | ❌ 無 | ✅ `number` |
| `_embedded["wp:term"]` | ✅ | ❌ 無 |

### Category vs Tag

| 欄位 | Category | Tag |
| --- | --- | --- |
| `taxonomy` | `"category"` | `"post_tag"` |
| `parent` | ✅ `number`（有層級） | ❌ 無（扁平結構） |

### Search 特殊注意

| 欄位 | Post/Page | Search |
| --- | --- | --- |
| `title` | `{ rendered: string }` | `string`（⚠️ 直接是字串） |
| `link` | ✅ | ❌（改用 `url`） |
| `content` | ✅ | ❌ 無 |
| `_embedded` | ✅ | ❌ 無 |

### Error Response 特殊注意

| 欄位 | 說明 |
| --- | --- |
| `code` | WordPress REST error code，例如 `rest_no_route`、`rest_invalid_param`、`rest_forbidden` |
| `message` | 可供記錄或顯示在受控 error state 的錯誤訊息 |
| `data.status` | HTTP status number，service layer 必須保留 |
| `data.params` / `data.details` | 驗證錯誤時可能出現，用來標示哪個 request parameter 錯誤 |
| `additional_errors` | 多重錯誤時可能出現，shape 與主要 error 相同 |

Service layer 遇到非 2xx response 時，先解析此 error body，再丟出包含 status、url、body 的錯誤；production 不可把錯誤轉成 `[]`、`null` 或 mock 資料。

### HeadPress Composition API 特殊注意

`/page` 是 Frontend Page Data Endpoint，不等於 WordPress `page` post type。它根據 frontend path 回傳整頁渲染資料。

| 舊端點 | 新主力端點 |
| --- | --- |
| `/site-layout` | `/site` |
| `/route?path=/about` | `/page/about` |
| `/route?path=/` | `/page` |

`/page/{path}` 支援多層 path，例如 `/page/about/team`、`/page/blog/my-post`、`/page/category/news`。詳細 contract 見 `references/headpress-composition-api.md`。

### Classic Menu vs Block Navigation

| 用途 | Classic Menu | Block Navigation |
| --- | --- | --- |
| 選單位置 | `/wp/v2/menu-locations` | 通常不使用 theme location |
| 選單項目 | `/wp/v2/menu-items?menus=<id>` | `/wp/v2/navigation` 的 `content.rendered` |
| 前端建議 | 用 service/mapper 組 `NavItem[]` tree | 若需可控 tree，優先做 custom normalized endpoint |
| 排序/階層 | `parent` + `menu_order` | 需解析 blocks 或由後端 normalize |
