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
