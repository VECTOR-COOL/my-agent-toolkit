/**
 * WordPress REST API examples for fetching common data types.
 *
 * This file is intentionally self-contained so it can be copied into a
 * Lovable / TanStack Start project service layer and adapted as needed.
 *
 * Recommended usage:
 * - Keep these functions in a service module, not directly inside UI components.
 * - During development, call equivalent mock functions with the same return shape.
 * - Switch between mock and WordPress REST API through a single data source config.
 */

type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv: RuntimeEnv = {
  ...((globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}),
  ...((import.meta as { env?: RuntimeEnv }).env ?? {}),
};

const WP_API_BASE_URL = (
  runtimeEnv.VITE_WP_API_URL ??
  runtimeEnv.VITE_API_BASE_URL ??
  runtimeEnv.WP_API_BASE_URL ??
  "https://example.com/wp-json/wp/v2"
).replace(/\/+$/, "");

type QueryValue = string | number | boolean | undefined | null;

type WpCollectionResponse<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

type WpRendered = {
  rendered: string;
};

export type WpPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: "post" | string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
};

export type WpPage = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: "page" | string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt?: WpRendered;
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
};

export type WpTerm = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: "category" | "post_tag" | string;
  parent?: number;
};

export type WpMedia = {
  id: number;
  date: string;
  slug: string;
  type: "attachment";
  link: string;
  title: WpRendered;
  alt_text: string;
  caption: WpRendered;
  description: WpRendered;
  media_type: string;
  mime_type: string;
  source_url: string;
};

export type WpUser = {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls?: Record<string, string>;
};

export type WpComment = {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  content: WpRendered;
  status: string;
  type: string;
};

export type WpSearchResult = {
  id: number;
  title: string;
  url: string;
  type: "post" | "page" | "attachment" | string;
  subtype: string;
};

function buildUrl(path: string, query: Record<string, QueryValue> = {}) {
  const url = new URL(`${WP_API_BASE_URL}/${path.replace(/^\/+/, "")}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function wpFetch<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  init?: RequestInit,
) {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `WordPress REST API error: ${response.status} ${response.statusText}`,
    );
  }

  return response;
}

async function wpCollection<T>(
  path: string,
  query: Record<string, QueryValue> = {},
) {
  const response = await wpFetch<T[]>(path, query);
  const items = (await response.json()) as T[];

  return {
    items,
    total: Number(response.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? 0),
  } satisfies WpCollectionResponse<T>;
}

async function wpItem<T>(
  path: string,
  query: Record<string, QueryValue> = {},
) {
  const response = await wpFetch<T>(path, query);
  return (await response.json()) as T;
}

export function getPosts(options: {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: number;
  tagId?: number;
  authorId?: number;
  orderBy?: "date" | "modified" | "title" | "slug";
  order?: "asc" | "desc";
} = {}) {
  return wpCollection<WpPost>("posts", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 10,
    search: options.search,
    categories: options.categoryId,
    tags: options.tagId,
    author: options.authorId,
    orderby: options.orderBy ?? "date",
    order: options.order ?? "desc",
    _embed: true,
  });
}

export async function getPostBySlug(slug: string) {
  const response = await wpCollection<WpPost>("posts", {
    slug,
    per_page: 1,
    _embed: true,
  });

  return response.items[0] ?? null;
}

export function getPostById(id: number) {
  return wpItem<WpPost>(`posts/${id}`, {
    _embed: true,
  });
}

export function getPages(options: {
  page?: number;
  perPage?: number;
  parentId?: number;
  orderBy?: "date" | "modified" | "title" | "menu_order";
  order?: "asc" | "desc";
} = {}) {
  return wpCollection<WpPage>("pages", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 20,
    parent: options.parentId,
    orderby: options.orderBy ?? "menu_order",
    order: options.order ?? "asc",
    _embed: true,
  });
}

export async function getPageBySlug(slug: string) {
  const response = await wpCollection<WpPage>("pages", {
    slug,
    per_page: 1,
    _embed: true,
  });

  return response.items[0] ?? null;
}

export function getCategories(options: {
  page?: number;
  perPage?: number;
  parentId?: number;
  hideEmpty?: boolean;
} = {}) {
  return wpCollection<WpTerm>("categories", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 100,
    parent: options.parentId,
    hide_empty: options.hideEmpty ?? false,
    orderby: "name",
    order: "asc",
  });
}

export function getTags(options: {
  page?: number;
  perPage?: number;
  search?: string;
  hideEmpty?: boolean;
} = {}) {
  return wpCollection<WpTerm>("tags", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 100,
    search: options.search,
    hide_empty: options.hideEmpty ?? false,
    orderby: "name",
    order: "asc",
  });
}

export function getMediaById(id: number) {
  return wpItem<WpMedia>(`media/${id}`);
}

export function getMedia(options: {
  page?: number;
  perPage?: number;
  mediaType?: "image" | "video" | "audio" | "application";
} = {}) {
  return wpCollection<WpMedia>("media", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 20,
    media_type: options.mediaType,
    orderby: "date",
    order: "desc",
  });
}

export function getUsers(options: {
  page?: number;
  perPage?: number;
  search?: string;
} = {}) {
  return wpCollection<WpUser>("users", {
    page: options.page ?? 1,
    per_page: options.perPage ?? 20,
    search: options.search,
  });
}

export function getCommentsByPostId(
  postId: number,
  options: {
    page?: number;
    perPage?: number;
  } = {},
) {
  return wpCollection<WpComment>("comments", {
    post: postId,
    page: options.page ?? 1,
    per_page: options.perPage ?? 20,
    orderby: "date",
    order: "asc",
  });
}

export function searchWordPress(options: {
  search: string;
  page?: number;
  perPage?: number;
  type?: "post" | "term" | "post-format";
  subtype?: "post" | "page" | "category" | "post_tag" | "any";
}) {
  return wpCollection<WpSearchResult>("search", {
    search: options.search,
    page: options.page ?? 1,
    per_page: options.perPage ?? 10,
    type: options.type,
    subtype: options.subtype,
  });
}

/**
 * Fetch a custom post type registered with show_in_rest: true.
 *
 * Example endpoint:
 * - /wp-json/wp/v2/products
 * - /wp-json/wp/v2/cases
 * - /wp-json/wp/v2/events
 */
export function getCustomPostType<T extends WpPost>(
  restBase: string,
  options: {
    page?: number;
    perPage?: number;
    search?: string;
    orderBy?: "date" | "modified" | "title" | "slug";
    order?: "asc" | "desc";
  } = {},
) {
  return wpCollection<T>(restBase, {
    page: options.page ?? 1,
    per_page: options.perPage ?? 10,
    search: options.search,
    orderby: options.orderBy ?? "date",
    order: options.order ?? "desc",
    _embed: true,
  });
}

export async function getCustomPostBySlug<T extends WpPost>(
  restBase: string,
  slug: string,
) {
  const response = await wpCollection<T>(restBase, {
    slug,
    per_page: 1,
    _embed: true,
  });

  return response.items[0] ?? null;
}

async function exampleUsage() {
  const latestPosts = await getPosts({ perPage: 6 });
  const aboutPage = await getPageBySlug("about");
  const categories = await getCategories({ hideEmpty: true });
  const tags = await getTags({ search: "react" });
  const images = await getMedia({ mediaType: "image", perPage: 12 });
  const authors = await getUsers({ search: "admin" });
  const searchResults = await searchWordPress({
    search: "headless",
    subtype: "post",
  });
  const products = await getCustomPostType<WpPost>("products", {
    perPage: 8,
  });

  return {
    latestPosts,
    aboutPage,
    categories,
    tags,
    images,
    authors,
    searchResults,
    products,
  };
}

void exampleUsage;
