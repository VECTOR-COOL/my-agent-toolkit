/**
 * WordPress REST API Service Layer 範例
 *
 * 所有資料取得都集中在 service layer，元件不直接 import mock 或呼叫 API。
 * 透過 VITE_DATA_SOURCE 環境變數切換 mock / api 模式。
 *
 * 使用方式：
 *   1. 複製 data-source-config.ts 到 src/config/data_source.ts
 *   2. 複製各 service 到 src/services/
 *   3. Route loader 中呼叫 service function
 */

// ============================================================
// src/config/data_source.ts
// ============================================================

export const data_source =
  import.meta.env.VITE_DATA_SOURCE || "mock";

export const api_base_url =
  import.meta.env.VITE_WP_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://cms.uavs.tw/wp-json/wp/v2";

export const site_url =
  import.meta.env.VITE_SITE_URL || "https://uavs.tw";

export const use_mock_data = data_source === "mock";

// ============================================================
// src/services/posts_service.ts
// ============================================================

// import { use_mock_data, api_base_url } from "@/config/data_source";
// import { mock_posts } from "@/data/mock_posts";
// import type { WPPost, WPPaginationInfo } from "@/types/wordpress";

interface WPErrorResponse {
  code: string;
  message: string;
  data?: {
    status?: number;
    params?: Record<string, string>;
    details?: Record<string, unknown>;
    [key: string]: unknown;
  };
  additional_errors?: WPErrorResponse[];
}

class WordPressRestApiError extends Error {
  status: number;
  statusText: string;
  url: string;
  body: WPErrorResponse | unknown;

  constructor(response: Response, body: WPErrorResponse | unknown) {
    const errorBody = is_wp_error_response(body) ? body : null;
    super(
      [
        `WordPress REST API error: ${response.status} ${response.statusText}`,
        errorBody?.code,
        errorBody?.message,
      ]
        .filter(Boolean)
        .join(" - ")
    );
    this.name = "WordPressRestApiError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.body = body;
  }
}

interface GetPostsOptions {
  page?: number;
  per_page?: number;
  categories?: number;
  tags?: number;
  search?: string;
  orderby?: string;
  order?: "asc" | "desc";
}

interface GetPostsResult {
  posts: WPPost[];
  pagination: WPPaginationInfo;
}

/**
 * 取得文章列表
 *
 * @example
 * // Route loader 中使用
 * loader: async () => {
 *   const { posts, pagination } = await get_posts({ per_page: 10 });
 *   return { posts, pagination };
 * }
 */
export async function get_posts(
  options: GetPostsOptions = {}
): Promise<GetPostsResult> {
  if (use_mock_data) {
    const { page = 1, per_page = 10, categories, search } = options;

    let filtered = [...mock_posts];

    // 模擬分類篩選
    if (categories) {
      filtered = filtered.filter((p) => p.categories.includes(categories));
    }

    // 模擬搜尋
    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.rendered.toLowerCase().includes(keyword) ||
          p.content.rendered.toLowerCase().includes(keyword)
      );
    }

    // 模擬分頁
    const total = filtered.length;
    const totalPages = Math.ceil(total / per_page);
    const start = (page - 1) * per_page;
    const paged = filtered.slice(start, start + per_page);

    return {
      posts: paged,
      pagination: { total, totalPages },
    };
  }

  // === 正式 API 模式 ===
  try {
    const params = new URLSearchParams();
    params.set("_embed", "");
    if (options.page) params.set("page", String(options.page));
    if (options.per_page) params.set("per_page", String(options.per_page));
    if (options.categories) params.set("categories", String(options.categories));
    if (options.tags) params.set("tags", String(options.tags));
    if (options.search) params.set("search", options.search);
    if (options.orderby) params.set("orderby", options.orderby);
    if (options.order) params.set("order", options.order);

    const response = await fetch(`${api_base_url}/posts?${params.toString()}`);

    await assert_wp_response_ok(response);

    const posts = await response.json();
    const total = parseInt(response.headers.get("X-WP-Total") || "0");
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "0");

    return {
      posts,
      pagination: { total, totalPages },
    };
  } catch (error) {
    console.error("取得文章列表失敗", error);

    // 開發環境 fallback 到 mock
    if (import.meta.env.DEV) {
      console.warn("DEV fallback: 使用 mock 資料");
      return {
        posts: mock_posts,
        pagination: { total: mock_posts.length, totalPages: 1 },
      };
    }

    throw error;
  }
}

/**
 * 以 slug 取得單篇文章
 *
 * @example
 * // 動態路由 loader 中使用
 * loader: async ({ params }) => {
 *   const post = await get_post_by_slug(params.slug);
 *   if (!post) throw notFound();
 *   return { post };
 * }
 */
export async function get_post_by_slug(slug: string): Promise<WPPost | null> {
  if (use_mock_data) {
    return mock_posts.find((post) => post.slug === slug) || null;
  }

  try {
    const response = await fetch(
      `${api_base_url}/posts?slug=${encodeURIComponent(slug)}&_embed`
    );

    await assert_wp_response_ok(response);

    const posts = await response.json();
    return posts?.[0] || null;
  } catch (error) {
    console.error(`取得文章失敗: ${slug}`, error);

    if (import.meta.env.DEV) {
      return mock_posts.find((post) => post.slug === slug) || null;
    }

    throw error;
  }
}

// ============================================================
// src/services/pages_service.ts
// ============================================================

// import { use_mock_data, api_base_url } from "@/config/data_source";
// import { mock_pages } from "@/data/mock_pages";
// import type { WPPage } from "@/types/wordpress";

/**
 * 取得頁面列表
 */
export async function get_pages(): Promise<WPPage[]> {
  if (use_mock_data) {
    return mock_pages;
  }

  try {
    const response = await fetch(`${api_base_url}/pages?_embed&per_page=100`);
    await assert_wp_response_ok(response);
    return await response.json();
  } catch (error) {
    console.error("取得頁面列表失敗", error);
    if (import.meta.env.DEV) return mock_pages;
    throw error;
  }
}

/**
 * 以 slug 取得單一頁面
 */
export async function get_page_by_slug(slug: string): Promise<WPPage | null> {
  if (use_mock_data) {
    return mock_pages.find((page) => page.slug === slug) || null;
  }

  try {
    const response = await fetch(
      `${api_base_url}/pages?slug=${encodeURIComponent(slug)}&_embed`
    );
    await assert_wp_response_ok(response);
    const pages = await response.json();
    return pages?.[0] || null;
  } catch (error) {
    console.error(`取得頁面失敗: ${slug}`, error);
    if (import.meta.env.DEV) {
      return mock_pages.find((page) => page.slug === slug) || null;
    }
    throw error;
  }
}

// ============================================================
// src/services/categories_service.ts
// ============================================================

// import { use_mock_data, api_base_url } from "@/config/data_source";
// import { mock_categories } from "@/data/mock_categories";
// import type { WPCategory } from "@/types/wordpress";

/**
 * 取得分類列表
 */
export async function get_categories_list(): Promise<WPCategory[]> {
  if (use_mock_data) {
    return mock_categories;
  }

  try {
    const response = await fetch(
      `${api_base_url}/categories?per_page=100&hide_empty=true`
    );
    await assert_wp_response_ok(response);
    return await response.json();
  } catch (error) {
    console.error("取得分類列表失敗", error);
    if (import.meta.env.DEV) return mock_categories;
    throw error;
  }
}

/**
 * 以 slug 取得單一分類
 */
export async function get_category_by_slug(
  slug: string
): Promise<WPCategory | null> {
  if (use_mock_data) {
    return mock_categories.find((cat) => cat.slug === slug) || null;
  }

  try {
    const response = await fetch(
      `${api_base_url}/categories?slug=${encodeURIComponent(slug)}`
    );
    await assert_wp_response_ok(response);
    const categories = await response.json();
    return categories?.[0] || null;
  } catch (error) {
    console.error(`取得分類失敗: ${slug}`, error);
    if (import.meta.env.DEV) {
      return mock_categories.find((cat) => cat.slug === slug) || null;
    }
    throw error;
  }
}

async function assert_wp_response_ok(response: Response) {
  if (response.ok) return;
  throw new WordPressRestApiError(response, await read_wp_error_body(response));
}

async function read_wp_error_body(response: Response) {
  const content_type = response.headers.get("content-type") ?? "";
  if (!content_type.includes("application/json")) {
    return response.text();
  }

  try {
    return (await response.json()) as WPErrorResponse | unknown;
  } catch {
    return null;
  }
}

function is_wp_error_response(value: unknown): value is WPErrorResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

// ============================================================
// 使用範例：Route Loader
// ============================================================

/*
// src/routes/news.index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { get_posts } from "@/services/posts_service";
import { get_categories_list } from "@/services/categories_service";

export const Route = createFileRoute("/news/")({
  component: NewsListPage,

  loader: async () => {
    const [postsResult, categories] = await Promise.all([
      get_posts({ per_page: 12 }),
      get_categories_list(),
    ]);
    return {
      posts: postsResult.posts,
      pagination: postsResult.pagination,
      categories,
    };
  },

  head: () => ({
    meta: [
      { title: "最新消息 | UAVS 無人機應用研究院" },
      { name: "description", content: "UAVS 最新消息、公告與活動資訊。" },
    ],
  }),
});

function NewsListPage() {
  const { posts, pagination, categories } = Route.useLoaderData();

  return (
    <div>
      <h1>最新消息</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title.rendered}</h2>
          <img
            src={post._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
            alt={post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || ""}
          />
          <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        </article>
      ))}
    </div>
  );
}
*/

/*
// src/routes/news.$slug.tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { get_post_by_slug } from "@/services/posts_service";
import { get_seo_data } from "@/types/wordpress";

export const Route = createFileRoute("/news/$slug")({
  component: NewsDetailPage,

  loader: async ({ params }) => {
    const post = await get_post_by_slug(params.slug);
    if (!post) throw notFound();
    return { post };
  },

  head: ({ loaderData }) => {
    const seo = get_seo_data(loaderData.post);
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

function NewsDetailPage() {
  const { post } = Route.useLoaderData();

  return (
    <article>
      <h1>{post.title.rendered}</h1>
      <time dateTime={post.date}>
        {new Date(post.date).toLocaleDateString("zh-TW")}
      </time>
      <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </article>
  );
}
*/
