/**
 * WordPress REST API navigation fetching example.
 *
 * Copy the relevant pieces into src/services/wordpress/navigation.ts.
 * Keep this logic out of Header/Nav components; components should receive
 * normalized NavItem[] data from a route loader or layout loader.
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

type WpErrorResponse = {
  code: string;
  message: string;
  data?: {
    status?: number;
    params?: Record<string, string>;
    details?: Record<string, unknown>;
    [key: string]: unknown;
  };
  additional_errors?: WpErrorResponse[];
};

class WordPressRestApiError extends Error {
  status: number;
  statusText: string;
  url: string;
  body: WpErrorResponse | unknown;

  constructor(response: Response, body: WpErrorResponse | unknown) {
    const errorBody = isWpErrorResponse(body) ? body : null;
    super(
      [
        `WordPress REST API error: ${response.status} ${response.statusText}`,
        errorBody?.code,
        errorBody?.message,
      ]
        .filter(Boolean)
        .join(" - "),
    );
    this.name = "WordPressRestApiError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.body = body;
  }
}

type WpRendered = {
  rendered?: string;
};

export type WpMenuLocation = {
  name: string;
  description: string;
  menu: number;
};

export type WpNavMenu = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  locations?: string[];
  auto_add?: boolean;
};

export type WpMenuItem = {
  id: number;
  title: WpRendered;
  type: "taxonomy" | "post_type" | "post_type_archive" | "custom" | string;
  type_label?: string;
  status?: string;
  parent: number;
  attr_title?: string;
  classes?: string[];
  description?: string;
  menu_order: number;
  object?: string;
  object_id?: number;
  target?: "" | "_blank" | string;
  url: string;
  xfn?: string[];
  invalid?: boolean;
  menus?: number | number[];
};

export type WpNavigationPost = {
  id: number;
  slug: string;
  status: string;
  type: "wp_navigation" | string;
  title: WpRendered;
  content: WpRendered & { protected?: boolean };
};

export type NavItem = {
  id: number;
  label: string;
  href: string;
  target?: "_blank";
  rel?: string;
  children: NavItem[];
};

function buildUrl(path: string, query: Record<string, QueryValue> = {}) {
  const url = new URL(`${WP_API_BASE_URL}/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function wpJson<T>(
  path: string,
  query: Record<string, QueryValue> = {},
) {
  const response = await fetch(buildUrl(path, query), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new WordPressRestApiError(response, await readWpErrorBody(response));
  }

  return (await response.json()) as T;
}

async function readWpErrorBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return response.text();
  }

  try {
    return (await response.json()) as WpErrorResponse | unknown;
  } catch {
    return null;
  }
}

function isWpErrorResponse(value: unknown): value is WpErrorResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

export function getMenuLocations() {
  return wpJson<WpMenuLocation[]>("menu-locations");
}

export function getNavMenus() {
  return wpJson<WpNavMenu[]>("menus");
}

export function getMenuItemsByMenuId(menuId: number) {
  return wpJson<WpMenuItem[]>("menu-items", {
    menus: menuId,
    per_page: 100,
    orderby: "menu_order",
    order: "asc",
  });
}

export function getNavigationPosts() {
  return wpJson<WpNavigationPost[]>("navigation", {
    per_page: 100,
    status: "publish",
  });
}

export async function getMenuItemsByLocation(locationName = "primary") {
  const locations = await getMenuLocations();
  const location = locations.find((item) => item.name === locationName);

  if (!location || !location.menu) {
    return [];
  }

  return getMenuItemsByMenuId(location.menu);
}

export async function getNavTreeByLocation(locationName = "primary") {
  const items = await getMenuItemsByLocation(locationName);
  return buildNavTree(items);
}

export function buildNavTree(items: WpMenuItem[]): NavItem[] {
  const byId = new Map<number, NavItem>();
  const roots: NavItem[] = [];

  const sorted = [...items].sort((a, b) => {
    if (a.parent !== b.parent) return a.parent - b.parent;
    return a.menu_order - b.menu_order;
  });

  for (const item of sorted) {
    if (item.invalid) continue;

    byId.set(item.id, {
      id: item.id,
      label: stripHtml(item.title.rendered) || item.url,
      href: normalizeMenuUrl(item.url),
      target: item.target === "_blank" ? "_blank" : undefined,
      rel: item.xfn?.join(" ") || undefined,
      children: [],
    });
  }

  for (const item of sorted) {
    const navItem = byId.get(item.id);
    if (!navItem) continue;

    const parent = item.parent ? byId.get(item.parent) : null;
    if (parent) parent.children.push(navItem);
    else roots.push(navItem);
  }

  return roots;
}

function normalizeMenuUrl(url: string) {
  const frontendSiteUrl = runtimeEnv.VITE_SITE_URL?.replace(/\/+$/, "");
  const wordpressSiteUrl = runtimeEnv.VITE_WP_SITE_URL?.replace(/\/+$/, "");

  if (!frontendSiteUrl || !wordpressSiteUrl) return url;

  return url.replace(wordpressSiteUrl, frontendSiteUrl);
}

function stripHtml(value?: string) {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function exampleUsage() {
  const primaryNav = await getNavTreeByLocation("primary");
  const footerNav = await getNavTreeByLocation("footer");

  return {
    primaryNav,
    footerNav,
  };
}

void exampleUsage;
