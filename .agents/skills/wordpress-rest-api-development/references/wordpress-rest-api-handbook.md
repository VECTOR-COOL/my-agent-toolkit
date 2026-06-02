# WordPress REST API 官方文件參考

> 來源：https://developer.wordpress.org/rest-api/
>
> 本文件為 WordPress REST API Handbook 的精簡整理，供 Lovable 開發時快速查閱。
> 完整文件請參閱官方 Handbook。

---

## 核心概念

WordPress REST API 是 WordPress 核心內建的 HTTP JSON API，自 WordPress 4.7 起成為核心功能。

- **Base URL 格式**：`https://{your-site}/wp-json/wp/v2`
- **API Discovery**：`GET https://{your-site}/wp-json/` 回傳所有可用的 namespace 與 route
- **數據格式**：JSON
- **認證方式**：Cookie（WordPress 內部）、Application Passwords（REST）、OAuth

---

## 全域查詢參數

所有端點共用的重要查詢參數：

| 參數 | 說明 | 範例 |
| --- | --- | --- |
| `_fields` | 限制回傳欄位，減少 payload | `?_fields=id,title,slug` |
| `_embed` | 內嵌相關資源（作者、分類、特色圖片等） | `?_embed` |
| `_embed=<relation>` | 只內嵌指定關聯（WP 5.4+） | `?_embed=author,wp:term` |
| `context` | 回傳欄位的範圍 | `?context=view` |
| `page` | 分頁頁碼（預設 1） | `?page=2` |
| `per_page` | 每頁數量（預設 10，最大 100） | `?per_page=20` |
| `search` | 搜尋關鍵字 | `?search=無人機` |
| `order` | 排序方向 | `?order=asc` |
| `orderby` | 排序欄位 | `?orderby=title` |

---

## 分頁 Response Headers

WordPress REST API 回應包含重要的分頁 header：

```
X-WP-Total: 42        # 總筆數
X-WP-TotalPages: 5    # 總頁數
```

前端應讀取這些 header 來實作分頁 UI。

---

## Context（回傳範圍）

| Context | 用途 | 說明 |
| --- | --- | --- |
| `view` | 公開讀取（預設） | 回傳所有公開欄位 |
| `embed` | 內嵌用精簡版 | 僅回傳最基本欄位 |
| `edit` | 編輯用完整版 | 需認證，包含 `raw` 內容 |

---

## `_embedded` 物件結構

使用 `?_embed` 時，回應中會多出 `_embedded` 物件，包含：

```json
{
  "_embedded": {
    "author": [{ "id": 1, "name": "Admin", "avatar_urls": {...} }],
    "wp:featuredmedia": [{ "id": 55, "source_url": "https://...", "media_details": {...} }],
    "wp:term": [
      [{ "id": 1, "name": "新聞", "slug": "news" }],   // categories
      [{ "id": 5, "name": "無人機", "slug": "drone" }]  // tags
    ]
  }
}
```

---

## 核心端點一覽

### Posts（文章）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/posts` | 列出文章 |
| `GET` | `/wp/v2/posts/<id>` | 取得單篇文章 |
| `GET` | `/wp/v2/posts?slug=<slug>&_embed` | 以 slug 查詢（常用） |
| `POST` | `/wp/v2/posts` | 新增文章（需認證） |
| `POST/PUT` | `/wp/v2/posts/<id>` | 更新文章（需認證） |
| `DELETE` | `/wp/v2/posts/<id>` | 刪除文章（需認證） |

**常用查詢組合**：
```
# 取得最新 10 篇文章含內嵌資源
GET /wp/v2/posts?_embed&per_page=10

# 取得特定分類的文章
GET /wp/v2/posts?categories=3&_embed

# 取得特定 slug 的文章
GET /wp/v2/posts?slug=hello-world&_embed

# 搜尋文章
GET /wp/v2/posts?search=無人機&_embed

# 只取需要的欄位
GET /wp/v2/posts?_fields=id,title,slug,excerpt,featured_media,date&_embed
```

---

### Pages（頁面）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/pages` | 列出頁面 |
| `GET` | `/wp/v2/pages/<id>` | 取得單一頁面 |
| `GET` | `/wp/v2/pages?slug=<slug>&_embed` | 以 slug 查詢 |

Pages 與 Posts 結構類似，差異：
- 無 `categories`、`tags` 欄位
- 有 `parent`（父頁面 ID）、`menu_order`（排序）

---

### Categories（分類）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/categories` | 列出分類 |
| `GET` | `/wp/v2/categories/<id>` | 取得單一分類 |
| `GET` | `/wp/v2/categories?slug=<slug>` | 以 slug 查詢 |

---

### Tags（標籤）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/tags` | 列出標籤 |
| `GET` | `/wp/v2/tags/<id>` | 取得單一標籤 |
| `GET` | `/wp/v2/tags?slug=<slug>` | 以 slug 查詢 |

---

### Media（媒體）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/media` | 列出媒體 |
| `GET` | `/wp/v2/media/<id>` | 取得單一媒體 |

---

### Users（使用者）

| 方法 | 端點 | 說明 |
| --- | --- | --- |
| `GET` | `/wp/v2/users` | 列出使用者 |
| `GET` | `/wp/v2/users/<id>` | 取得使用者 |

---

### 自訂文章類型（Custom Post Types）

WordPress 註冊自訂 post type 並啟用 `show_in_rest` 後，會自動產生端點：

```
GET /wp/v2/{rest_base}
GET /wp/v2/{rest_base}/<id>
GET /wp/v2/{rest_base}?slug=<slug>&_embed
```

例如自訂 `projects` → `/wp/v2/projects`

---

## Yoast SEO REST API 擴充

當 WordPress 安裝 Yoast SEO 外掛時，REST API 回應會自動包含額外欄位：

### `yoast_head`（HTML 字串）

完整的 SEO meta tags HTML 字串，可直接注入 `<head>`：

```json
{
  "yoast_head": "<!-- Yoast SEO plugin --><title>文章標題 | 網站名</title><meta name=\"description\" content=\"...\" />..."
}
```

### `yoast_head_json`（結構化 JSON）

SEO 資料的結構化 JSON，適合前端框架使用：

```json
{
  "yoast_head_json": {
    "title": "文章標題 | 網站名",
    "description": "文章摘要...",
    "robots": {
      "index": "index",
      "follow": "follow"
    },
    "canonical": "https://example.com/post-slug/",
    "og_locale": "zh_TW",
    "og_type": "article",
    "og_title": "文章標題",
    "og_description": "文章摘要...",
    "og_url": "https://example.com/post-slug/",
    "og_site_name": "網站名稱",
    "og_image": [
      {
        "width": 1200,
        "height": 630,
        "url": "https://example.com/wp-content/uploads/og-image.jpg",
        "type": "image/jpeg"
      }
    ],
    "twitter_card": "summary_large_image",
    "twitter_title": "文章標題",
    "twitter_description": "文章摘要...",
    "twitter_image": "https://example.com/wp-content/uploads/og-image.jpg",
    "schema": {
      "@context": "https://schema.org",
      "@graph": [...]
    }
  }
}
```

### Yoast 專用端點

```
GET /wp-json/yoast/v1/get_head?url=<encoded-url>
```

以 URL 查詢任意頁面的 SEO 資料。

---

## Headless 注意事項

1. **CORS**：WordPress 預設不設 CORS header。Headless 架構需在 WordPress 加入 CORS 設定，或由前端 server 代理 API 請求。
2. **認證**：公開讀取（GET published content）不需認證。建立/更新/刪除需認證。
3. **canonical URL**：Yoast 產生的 canonical 可能指向 WordPress 後端 URL，Headless 前端需覆寫為正式前端網域。
4. **快取**：WordPress REST API 回應預設不含快取 header，建議前端加上適當快取策略。
5. **Rate Limit**：依主機設定，需注意大量請求時的限制。

---

## 官方文件連結

- [REST API Handbook](https://developer.wordpress.org/rest-api/)
- [REST API Reference](https://developer.wordpress.org/rest-api/reference/)
- [Posts Reference](https://developer.wordpress.org/rest-api/reference/posts/)
- [Pages Reference](https://developer.wordpress.org/rest-api/reference/pages/)
- [Categories Reference](https://developer.wordpress.org/rest-api/reference/categories/)
- [Tags Reference](https://developer.wordpress.org/rest-api/reference/tags/)
- [Media Reference](https://developer.wordpress.org/rest-api/reference/media/)
- [Users Reference](https://developer.wordpress.org/rest-api/reference/users/)
- [Using the REST API](https://developer.wordpress.org/rest-api/using-the-rest-api/)
- [Yoast SEO REST API](https://developer.yoast.com/features/rest-api/)
