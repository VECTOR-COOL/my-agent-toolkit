# Lovable TanStack Start SSR 架構參考

> 來源：https://docs.lovable.dev
>
> 本文件整理 Lovable 新版 SEO-friendly SSR 架構（TanStack Start）的關鍵資訊，
> 供開發 WordPress Headless CMS 前端時參考。

---

## 架構概覽

### 新版 vs 舊版比較

| 特性 | 舊版（Legacy） | 新版（TanStack Start） |
| --- | --- | --- |
| **框架** | Vite + React Router | TanStack Start (TanStack Router) |
| **渲染** | CSR（Client-Side Rendering） | SSR / SSG / CSR（可依 route 選擇） |
| **後端邏輯** | 獨立 Edge Functions | TanStack Server Functions |
| **運行時** | 靜態 hosting（Cloudflare Pages） | Cloudflare Workers |
| **樣式** | Tailwind v3 + HSL | Tailwind v4 + oklch |
| **SEO** | Lovable 公開部署 URL 對 verified crawlers 提供 on-request pre-rendering；第三方 scanner 可能只看到 SPA shell | 原生 SSR，搜尋引擎與一般訪客都可收到 rendered HTML |

---

## 專案結構

```
src/
├── routes/                    # 檔案路由（TanStack Router file-based routing）
│   ├── __root.tsx             # 根 layout（唯一）
│   ├── index.tsx              # 首頁 /
│   ├── about.tsx              # /about
│   ├── news.index.tsx         # /news（列表）
│   ├── news.$slug.tsx         # /news/:slug（動態路由）
│   └── ...
├── components/                # React 元件
├── styles.css                 # 全域樣式（Tailwind v4 @theme inline）
├── data/                      # Mock 測試資料
├── services/                  # 資料服務層（mock ↔ API 切換）
├── config/                    # 設定檔（data_source 等）
├── lib/api/                   # Server Functions、API client
├── types/                     # TypeScript 型別定義
└── utils/                     # 工具函式
```

---

## TanStack Start 核心概念

### 檔案路由（File-Based Routing）

每個 route 檔案使用 `createFileRoute` 定義：

```tsx
// src/routes/news.index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/news/")({
  component: NewsListPage,
  loader: async () => {
    // 在 server 端取得資料
    const posts = await get_posts();
    return { posts };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: "最新消息 | UAVS" },
      { name: "description", content: "UAVS 最新消息與公告" },
      { property: "og:title", content: "最新消息 | UAVS" },
    ],
  }),
});
```

### 動態路由

```tsx
// src/routes/news.$slug.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/news/$slug")({
  component: NewsDetailPage,
  loader: async ({ params }) => {
    const post = await get_post_by_slug(params.slug);
    if (!post) throw new Error("Post not found");
    return { post };
  },
  head: ({ loaderData }) => {
    const { post } = loaderData;
    const seo = get_seo_data(post);
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.description },
        { property: "og:image", content: seo.image },
      ],
    };
  },
});
```

---

## Server Functions（createServerFn）

TanStack Start 的 Server Functions 讓你在 server 端執行程式碼，不會暴露到瀏覽器：

```tsx
import { createServerFn } from "@tanstack/react-start";

export const fetchPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    // 這段程式碼只在 server 執行
    // 可以安全使用 API keys、直接連資料庫等
    const response = await fetch(
      `${process.env.WP_API_URL}/posts?_embed`
    );
    if (!response.ok) throw new Error("API 請求失敗");
    return response.json();
  }
);
```

### 何時使用 Server Functions

| 場景 | 建議 |
| --- | --- |
| 公開資料（文章列表、頁面內容） | Route `loader` + service layer |
| 需要 API key / secret 的請求 | `createServerFn` |
| CORS 被阻擋的 API | `createServerFn` 做 server proxy |
| 使用者提交表單 | `createServerFn` with `POST` |

---

## SEO 配置

### Route-level `head()`

每個 route 可定義 `head()` 函式產生 SEO meta：

```tsx
head: ({ loaderData }) => ({
  meta: [
    { title: "頁面標題 | 網站名" },
    { name: "description", content: "頁面描述" },
    { property: "og:title", content: "頁面標題" },
    { property: "og:description", content: "頁面描述" },
    { property: "og:image", content: "https://example.com/og.jpg" },
    { property: "og:url", content: "https://example.com/path" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [
    { rel: "canonical", href: "https://example.com/path" },
  ],
}),
```

### Root Layout（`__root.tsx`）

全域 head 設定放在 `__root.tsx`：

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      // Google Fonts
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap",
      },
    ],
  }),
});
```

---

## 環境變數

Lovable 專案使用 Vite 環境變數：

```bash
# .env（本地開發）
VITE_DATA_SOURCE=mock
VITE_WP_API_URL=https://cms.uavs.tw/wp-json/wp/v2
VITE_SITE_URL=https://uavs.tw
```

- `VITE_` 開頭：client + server 都可存取
- 無 `VITE_` 開頭：僅 server 端可存取（適合放 secret）

### Lovable 部署環境變數

在 Lovable Dashboard 設定：
1. 進入專案 → Settings → Environment Variables
2. 新增 `VITE_DATA_SOURCE`、`VITE_WP_API_URL` 等
3. 部署後生效

---

## 資料取得模式

### 推薦模式：Service Layer + Route Loader

```
Route Loader ─────→ Service Layer ─────→ Mock Data (開發)
                         │
                         └──────────────→ WordPress REST API (正式)
```

### 不推薦模式

```
❌ Component ─→ useEffect ─→ fetch (主要內容不應只靠 client-side)
❌ Component ─→ import mockData (不經 service layer)
```

---

## Lovable 開發注意事項

1. **不要使用 react-router-dom**：新版用 TanStack Router
2. **不要建立 `src/pages/`**：檔案路由在 `src/routes/`
3. **客戶端專屬程式碼**：`window`、`localStorage`、需要 DOM 的動畫放 `useEffect` 或加 guard
4. **SSR 安全**：避免在 module scope 存取 browser API
5. **圖片**：使用 Lovable Assets 或 `public/` 目錄
6. **部署**：Lovable 自動部署到 Cloudflare Workers
7. **版本判斷**：Lovable 官方文件目前說明 2026-05-13 後新 app 預設 TanStack Start SSR（Enterprise plan 例外）；既有 React + Vite app 不可宣稱已原地升級成 TanStack Start。

---

## 官方文件連結

- [Lovable Documentation](https://docs.lovable.dev)
- [Lovable Integrations](https://docs.lovable.dev/integrations)
- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
