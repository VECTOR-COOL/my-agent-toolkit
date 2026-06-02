/**
 * WordPress REST API TypeScript 型別定義
 *
 * 這些型別對齊 WordPress REST API 回應格式（含 ?_embed 與 Yoast SEO）。
 * 用於 Lovable TanStack Start 專案的 mock 資料與正式 API 回應。
 *
 * 使用方式：將此檔案複製到專案的 src/types/wordpress.ts
 */

// ============================================================
// 基礎共用型別
// ============================================================

/** WordPress rendered 欄位（title、content、excerpt 等） */
export interface WPRendered {
  rendered: string;
  /** 僅在 edit context 出現 */
  raw?: string;
}

/** WordPress rendered + protected 欄位（content、excerpt） */
export interface WPRenderedProtected extends WPRendered {
  protected: boolean;
}

/** WordPress GUID 欄位 */
export interface WPGUID {
  rendered: string;
}

// ============================================================
// Media（媒體）型別
// ============================================================

/** 媒體圖片尺寸 */
export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
  filesize?: number;
}

/** 媒體詳細資訊 */
export interface WPMediaDetails {
  width: number;
  height: number;
  file: string;
  filesize?: number;
  sizes: {
    thumbnail?: WPMediaSize;
    medium?: WPMediaSize;
    medium_large?: WPMediaSize;
    large?: WPMediaSize;
    full?: WPMediaSize;
    [key: string]: WPMediaSize | undefined;
  };
  image_meta?: Record<string, unknown>;
}

/** 媒體物件（完整回應 或 _embedded 中的 wp:featuredmedia） */
export interface WPMedia {
  id: number;
  date: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  slug: string;
  status: string;
  type: "attachment";
  link: string;
  title: WPRendered;
  description?: WPRendered;
  caption: WPRendered;
  alt_text: string;
  author: number;
  media_type: "image" | "video" | "audio" | "file";
  mime_type: string;
  post: number | null;
  source_url: string;
  guid?: WPGUID;
  media_details: WPMediaDetails;
  meta?: Record<string, unknown>;
}

// ============================================================
// Author / User 型別
// ============================================================

/** 使用者頭像 URL */
export interface WPAvatarUrls {
  "24": string;
  "48": string;
  "96": string;
}

/** 使用者（公開欄位） */
export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: WPAvatarUrls;
  meta?: Record<string, unknown>;
}

// ============================================================
// Term（分類法）型別
// ============================================================

/** 分類（Category） */
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "category";
  parent: number;
  meta?: Record<string, unknown>;
  yoast_head?: string;
  yoast_head_json?: WPYoastHeadJson;
}

/** 標籤（Tag） */
export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "post_tag";
  meta?: Record<string, unknown>;
  yoast_head?: string;
  yoast_head_json?: WPYoastHeadJson;
}

/** _embedded 中的 term（精簡版） */
export interface WPEmbeddedTerm {
  id: number;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

// ============================================================
// Yoast SEO 型別
// ============================================================

/** Yoast OG Image */
export interface WPYoastOgImage {
  width: number;
  height: number;
  url: string;
  type?: string;
}

/** Yoast SEO head JSON（yoast_head_json 欄位） */
export interface WPYoastHeadJson {
  title?: string;
  description?: string;
  robots?: {
    index?: string;
    follow?: string;
    "max-snippet"?: string;
    "max-image-preview"?: string;
    "max-video-preview"?: string;
  };
  canonical?: string;
  og_locale?: string;
  og_type?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_site_name?: string;
  article_published_time?: string;
  article_modified_time?: string;
  og_image?: WPYoastOgImage[];
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema?: {
    "@context": string;
    "@graph": unknown[];
  };
}

// ============================================================
// _embedded 型別
// ============================================================

/** Post/Page _embedded 物件 */
export interface WPEmbedded {
  author?: WPUser[];
  "wp:featuredmedia"?: WPMedia[];
  /** [0] = categories, [1] = tags（僅 Post 有） */
  "wp:term"?: WPEmbeddedTerm[][];
}

// ============================================================
// Post（文章）型別
// ============================================================

/** WordPress Post（文章） */
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: "post";
  link: string;
  title: WPRendered;
  content: WPRenderedProtected;
  excerpt: WPRenderedProtected;
  guid: WPGUID;
  author: number;
  featured_media: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  sticky: boolean;
  template: string;
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio";
  meta: Record<string, unknown>;
  categories: number[];
  tags: number[];
  /** Yoast SEO HTML blob（需安裝 Yoast 外掛） */
  yoast_head?: string;
  /** Yoast SEO 結構化 JSON（需安裝 Yoast 外掛） */
  yoast_head_json?: WPYoastHeadJson;
  /** 使用 ?_embed 時出現 */
  _embedded?: WPEmbedded;
}

// ============================================================
// Page（頁面）型別
// ============================================================

/** WordPress Page（頁面） */
export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: "publish" | "future" | "draft" | "pending" | "private";
  type: "page";
  link: string;
  title: WPRendered;
  content: WPRenderedProtected;
  excerpt: WPRenderedProtected;
  guid: WPGUID;
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: "open" | "closed";
  ping_status: "open" | "closed";
  template: string;
  meta: Record<string, unknown>;
  yoast_head?: string;
  yoast_head_json?: WPYoastHeadJson;
  _embedded?: Omit<WPEmbedded, "wp:term">;
}

// ============================================================
// Search 型別
// ============================================================

/** 搜尋結果項目（注意：title 是 string 不是 object） */
export interface WPSearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
}

// ============================================================
// API Response 輔助型別
// ============================================================

/** API 分頁資訊（從 Response Headers 取得） */
export interface WPPaginationInfo {
  total: number;
  totalPages: number;
}

/** API 列表回應（含分頁） */
export interface WPListResponse<T> {
  data: T[];
  pagination: WPPaginationInfo;
}

// ============================================================
// 工具型別
// ============================================================

/** 取得特色圖片 URL 的輔助函式 */
export function get_featured_image_url(post: WPPost | WPPage): string | null {
  return (
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null
  );
}

/** 取得特色圖片 alt 文字 */
export function get_featured_image_alt(post: WPPost | WPPage): string {
  return (
    post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ||
    post.title.rendered ||
    ""
  );
}

/** 取得作者名稱 */
export function get_author_name(post: WPPost | WPPage): string {
  return post._embedded?.author?.[0]?.name ?? "Unknown";
}

/** 取得分類列表（僅 Post） */
export function get_categories(post: WPPost): WPEmbeddedTerm[] {
  return post._embedded?.["wp:term"]?.[0] ?? [];
}

/** 取得標籤列表（僅 Post） */
export function get_tags(post: WPPost): WPEmbeddedTerm[] {
  return post._embedded?.["wp:term"]?.[1] ?? [];
}

/** 移除 HTML 標籤 */
export function strip_html(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/** 取得 SEO 資料（含 fallback） */
export function get_seo_data(
  post: WPPost | WPPage | null,
  defaults?: { title?: string; description?: string; image?: string }
) {
  const site_name = defaults?.title ?? "UAVS";
  const default_description = defaults?.description ?? "UAVS 官方網站";
  const default_image =
    defaults?.image ?? "https://uavs.tw/og-default.jpg";

  if (!post) {
    return {
      title: site_name,
      description: default_description,
      image: default_image,
    };
  }

  const title =
    post.yoast_head_json?.title ||
    post.title?.rendered ||
    site_name;

  const description =
    post.yoast_head_json?.description ||
    strip_html(post.excerpt?.rendered) ||
    default_description;

  const image =
    post.yoast_head_json?.og_image?.[0]?.url ||
    get_featured_image_url(post) ||
    default_image;

  return { title, description, image };
}
