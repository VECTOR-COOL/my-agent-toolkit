---
name: wordpress-rest-api-development
description: UAVTW 前端以 WordPress Headless CMS（cms.uavs.tw）為後端資料來源。開發時先用 mock 資料對齊 REST API 格式，再透過 VITE_DATA_SOURCE 切換為正式 API。適用 Lovable TanStack Start SSR 專案。
---

# Skill：WordPress REST API 測試資料開發規範

## 目的

本 Skill 用於協助開發前端網站時，先使用測試資料進行 UI、版型、SEO、路由與資料流程開發。

正式上線或 API 串接完成後，再將資料來源切換為 WordPress Headless CMS 的 REST API。

本專案前端網站：

- 正式網址：`https://uavs.tw`
- 後端 CMS：`https://cms.uavs.tw`
- 後端架構：**WordPress Headless CMS**（本專案後端資料皆來自 WordPress，非 Lovable 內建資料庫）
- 資料交換方式：WordPress REST API
- 前端部署方式：Lovable 綁定正式網域上線
- 前端需支援 SEO（TanStack Start SSR + 各 route `head()`）

與 repo 其他文件對照：`AGENTS.md`、`.lovable/project.json`。

---

## 核心原則

開發時請先使用測試資料，但測試資料的欄位結構必須盡量對齊 WordPress REST API 回傳格式。

不要為了前端方便而任意設計與 WordPress REST API 差異過大的資料格式。

正式串接 API 時，應該只需要替換資料來源，不應大幅修改 UI 元件、頁面邏輯或 SEO 邏輯。

**SSR 補充（本專案）**：主要內容優先在 route `loader` 或 `createServerFn` 取得，讓 HTML 首屏含內容；勿讓整頁主要區塊僅靠 client `useEffect` 才出現。

---

## 開發階段資料來源策略

| 模式 | 用途 | 資料來源 |
| --- | --- | --- |
| `mock` | 開發、版型確認、UI 測試、尚未串接 CMS 時 | 本地測試資料（`src/data/`） |
| `api` | 正式串接、預備上線、正式上線 | WordPress REST API |

---

## 什麼時機使用測試資料

1. UI 版型尚在開發中
2. WordPress CMS 尚未建立完成
3. WordPress 文章、頁面、分類、媒體資料尚未完整建立
4. API 欄位尚未確認穩定
5. 需要快速確認首頁、列表頁、詳情頁、分類頁版型
6. 需要先測試 RWD、SEO meta、OG 圖片、空資料狀態
7. 後端 API 暫時無法連線或資料不足
8. 開發過程不希望因後端資料異動導致 UI 反覆跑版

開發初期一律以 `mock` 模式為主。

---

## 什麼時機切換到正式 API

1. WordPress CMS 已建立完成
2. 必要文章類型已建立（posts、pages、categories、media、自訂 post type 等）
3. WordPress REST API 可以正常存取（可先執行 `npm run test:wp-api`）
4. API 回傳資料結構穩定
5. 主要頁面需要的欄位都已確認存在
6. SEO 需要的欄位可以從 API 或 fallback 規則取得
7. 圖片、分類、slug、日期、摘要等資料可正常回傳
8. 前端已完成基本版型與元件拆分

正式串接前，應先在 preview 環境切換為 `api` 模式驗證，不建議直接在正式網域首次切換。

---

## 建議切換流程

### 第一階段：純測試資料開發

使用 `mock` 模式。完成首頁／列表／詳情／分類 UI、SEO meta 架構、loading／empty／error、RWD。不需等待 CMS 完整資料。

### 第二階段：測試資料與 API 結構對齊

仍用 `mock`，但欄位名稱與巢狀結構接近 WordPress REST API（`title.rendered`、`_embedded` 等）。

### 第三階段：局部切換 API

使用 `api` 模式，依序驗證：文章列表 → 文章詳情 → 頁面 → 分類 → 媒體 → SEO 欄位。API 未齊全時可局部 fallback mock（僅開發環境）。

### 第四階段：全站 API 模式

首頁、列表、詳情、分類、SEO、圖片皆來自 API；mock 僅作開發後備。

### 第五階段：正式上線

正式網域 `https://uavs.tw` 使用 `api` 模式。API Base：

```txt
https://cms.uavs.tw/wp-json/wp/v2
```

---

## 正式與測試資料切換規則

使用**單一設定**控制資料來源，不要在每個元件手動判斷。

```ts
const data_source = "mock"; // mock | api
```

環境變數（與 `AGENTS.md` 一致，優先使用下列名稱）：

```txt
VITE_DATA_SOURCE=mock
VITE_WP_API_URL=https://cms.uavs.tw/wp-json/wp/v2
VITE_SITE_URL=https://uavs.tw
```

相容別名（若既有程式已使用可保留，新程式請用 `VITE_WP_API_URL`）：

```txt
VITE_API_BASE_URL=https://cms.uavs.tw/wp-json/wp/v2
```

| 環境 | VITE_DATA_SOURCE | 說明 |
| --- | --- | --- |
| 開發 | `mock` | 快速 UI |
| API 測試 / Preview | `api` | 驗證 CMS |
| 正式 | `api` | 上線 |

---

## 切換資料來源的實作原則

前端元件不應直接知道目前是 mock 或 api。透過 **service layer** 統一取得資料。

錯誤：在 component 內 `import { mock_posts } from "@/data/mock_posts"`。

正確：`import { get_posts } from "@/services/posts_service"`，元件使用 `post.title.rendered`。

**本專案 SSR**：公開讀取可經 `createServerFn` 或 route `loader` 呼叫 service，避免在瀏覽器暴露需權限的 token；若 CORS 阻擋直連 CMS，改由 server 代理 fetch。

---

## 建議資料夾結構

```txt
src/
  config/
    data_source.ts

  data/
    mock_posts.ts
    mock_pages.ts
    mock_categories.ts

  services/
    posts_service.ts
    pages_service.ts
    categories_service.ts
    media_service.ts

  lib/api/              # 可選：createServerFn、Zod、wp-client.server.ts
  types/
    wordpress.ts

  utils/
    wordpress_mapper.ts
```

現有過渡 mock：`src/data/newsData.ts`、`src/data/faqData.ts` — 串接後逐步改為 WordPress 形狀或移入 `mock_*.ts`。

---

## data_source 設定範例

```ts
export const data_source = import.meta.env.VITE_DATA_SOURCE || "mock";

export const api_base_url =
  import.meta.env.VITE_WP_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://cms.uavs.tw/wp-json/wp/v2";

export const use_mock_data = data_source === "mock";
```

---

## posts_service 範例

```ts
import { use_mock_data, api_base_url } from "@/config/data_source";
import { mock_posts } from "@/data/mock_posts";

export async function get_posts() {
  if (use_mock_data) {
    return mock_posts;
  }

  const response = await fetch(`${api_base_url}/posts?_embed`);

  if (!response.ok) {
    throw new Error("無法取得文章列表");
  }

  return await response.json();
}

export async function get_post_by_slug(slug: string) {
  if (use_mock_data) {
    return mock_posts.find((post) => post.slug === slug) || null;
  }

  const response = await fetch(`${api_base_url}/posts?slug=${slug}&_embed`);

  if (!response.ok) {
    throw new Error("無法取得文章內容");
  }

  const posts = await response.json();

  return posts?.[0] || null;
}
```

---

## 測試資料格式原則

測試資料應模擬 WordPress REST API（含 `_embedded`、`title.rendered`、`content.rendered` 等）。完整範例見本 Skill 建立時的使用者規格；新增 mock 時請複製該結構。

---

## SEO 資料處理原則

優先順序：

1. API SEO 欄位（如 Yoast `yoast_head_json`）
2. WordPress title / excerpt / featured image
3. 前端 fallback（站名、預設 og 圖）

動態頁在 `createFileRoute` 的 `head({ loaderData })` 填入 CMS 資料；`canonical`、`og:url` 使用 `VITE_SITE_URL` 組絕對網址。

```ts
export function get_seo_data(post: any) {
  const title =
    post?.yoast_head_json?.title || post?.title?.rendered || "UAVS";

  const description =
    post?.yoast_head_json?.description ||
    strip_html(post?.excerpt?.rendered) ||
    "UAVS 官方網站";

  const image =
    post?.yoast_head_json?.og_image?.[0]?.url ||
    post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "https://uavs.tw/og-default.jpg";

  return { title, description, image };
}

function strip_html(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}
```

---

## WordPress REST API 對應端點

正式 API Base URL：

```txt
https://cms.uavs.tw/wp-json/wp/v2
```

常用端點：

```txt
/posts
/posts?_embed
/posts?slug={slug}&_embed

/pages
/pages?_embed
/pages?slug={slug}&_embed

/categories
/categories?slug={slug}

/media/{id}
```

自訂文章類型依 WordPress 註冊的 REST route 為準（如 `/projects`、`/services`）。

---

## API 與 Mock 的替換原則

切換時**不應修改** `src/routes/`、`src/components/`（除非 API 結構與預期不符）。

只修改：

- `VITE_DATA_SOURCE`、`VITE_WP_API_URL`
- `src/services/`、`src/config/`、`src/lib/api/`

---

## fallback 原則

- **正式環境**：API 失敗顯示 loading／錯誤／空狀態，**不要**顯示 mock 假資料。
- **開發環境**：可於 `import.meta.env.DEV` 時 fallback 到 mock 方便除錯。

```ts
export async function get_posts() {
  if (use_mock_data) {
    return mock_posts;
  }

  try {
    const response = await fetch(`${api_base_url}/posts?_embed`);
    if (!response.ok) throw new Error("API 回應錯誤");
    return await response.json();
  } catch (error) {
    console.error("取得文章失敗", error);
    if (import.meta.env.DEV) {
      return mock_posts;
    }
    return [];
  }
}
```

---

## 開發注意事項

1. 不要在元件中直接寫死 mock data
2. 不要讓 UI 綁死非 WordPress 形狀的測試欄位
3. mock 不可當正式站內容
4. 所有資料取得集中在 service / server fn
5. SEO 欄位需 fallback
6. 處理無圖、HTML 摘要、slug 404、API 錯誤勿白畫面
7. CORS 問題改 server 代理，勿在前端暴露 secret

---

## Lovable 開發時請遵守

建立或修改頁面時，優先 mock 完成畫面，但：

- 結構對齊 WordPress REST API
- 經 service 取資料，不直接 import mock 檔
- 保留 `mock` ↔ `api` 切換
- 處理 SEO、loading、empty、error
- 不因 CMS 未完成而阻塞 UI

---

## 預設資料來源規則

```txt
開發初期：mock
UI 確認階段：mock
CMS 串接測試：api
Preview 驗證：api
正式上線：api
API 異常除錯（僅 DEV）：mock
```

---

## 後端連線測試

串接前請執行 repo 內測試腳本確認 CMS 可連線：

```bash
npm run test:wp-api
# 或
bun run scripts/test-wordpress-api.mjs
```

可透過環境變數覆寫 API 位址：

```bash
VITE_WP_API_URL=https://cms.uavs.tw/wp-json/wp/v2 npm run test:wp-api
```

---

## 最終目標

前端開發可不依賴正式 CMS，先用測試資料完成畫面與 SEO 架構；CMS 與 REST API 就緒後，僅切換資料來源設定即可上線，避免大幅改動頁面與元件。
