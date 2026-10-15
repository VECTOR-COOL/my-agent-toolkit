/**
 * Lovable / TanStack Start navigation service example.
 *
 * This shows the frontend contract:
 * - WordPress raw menu fields stay inside services/mappers.
 * - Layout/Header components receive NavItem[] only.
 * - Mock and API modes return the same normalized shape.
 */

type DataSource = "mock" | "api";
type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv: RuntimeEnv = {
  ...((globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}),
  ...((import.meta as { env?: RuntimeEnv }).env ?? {}),
};

const dataSource = (runtimeEnv.VITE_DATA_SOURCE || "mock") as DataSource;
const apiBaseUrl = (
  runtimeEnv.VITE_WP_API_URL ||
  runtimeEnv.VITE_API_BASE_URL ||
  "https://example.com/wp-json/wp/v2"
).replace(/\/+$/, "");
const siteUrl = (runtimeEnv.VITE_SITE_URL || "https://example.com").replace(
  /\/+$/,
  "",
);
const wpSiteUrl = (runtimeEnv.VITE_WP_SITE_URL || "").replace(/\/+$/, "");

export type NavItem = {
  id: number;
  label: string;
  href: string;
  target?: "_blank";
  rel?: string;
  children: NavItem[];
};

type WpMenuLocation = {
  name: string;
  description: string;
  menu: number;
};

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

type WpMenuItem = {
  id: number;
  title: { rendered?: string };
  parent: number;
  menu_order: number;
  url: string;
  target?: string;
  xfn?: string[];
  invalid?: boolean;
};

const mockNavByLocation: Record<string, NavItem[]> = {
  primary: [
    { id: 1, label: "首頁", href: "/", children: [] },
    {
      id: 2,
      label: "服務項目",
      href: "/services",
      children: [
        { id: 3, label: "顧問服務", href: "/services/consulting", children: [] },
        { id: 4, label: "教育訓練", href: "/services/training", children: [] },
      ],
    },
    { id: 5, label: "最新消息", href: "/posts", children: [] },
    { id: 6, label: "聯絡我們", href: "/contact", children: [] },
  ],
  footer: [
    { id: 7, label: "隱私權政策", href: "/privacy", children: [] },
    { id: 8, label: "服務條款", href: "/terms", children: [] },
  ],
};

export async function getNavigation(locationName = "primary") {
  if (dataSource === "mock") {
    return mockNavByLocation[locationName] ?? [];
  }

  try {
    const locations = await wpJson<WpMenuLocation[]>("menu-locations");
    const location = locations.find((item) => item.name === locationName);

    if (!location?.menu) return [];

    const items = await wpJson<WpMenuItem[]>("menu-items", {
      menus: location.menu,
      per_page: 100,
      orderby: "menu_order",
      order: "asc",
    });

    return mapWpMenuItemsToNavTree(items);
  } catch (error) {
    console.error(`Failed to load navigation: ${locationName}`, error);
    if (import.meta.env.DEV) return mockNavByLocation[locationName] ?? [];
    throw error;
  }
}

function mapWpMenuItemsToNavTree(items: WpMenuItem[]) {
  const byId = new Map<number, NavItem>();
  const roots: NavItem[] = [];

  for (const item of [...items].sort(sortMenuItems)) {
    if (item.invalid) continue;
    byId.set(item.id, {
      id: item.id,
      label: stripHtml(item.title.rendered) || item.url,
      href: mapCmsUrlToFrontendUrl(item.url),
      target: item.target === "_blank" ? "_blank" : undefined,
      rel: item.xfn?.join(" ") || undefined,
      children: [],
    });
  }

  for (const item of [...items].sort(sortMenuItems)) {
    const navItem = byId.get(item.id);
    if (!navItem) continue;

    const parent = item.parent ? byId.get(item.parent) : null;
    if (parent) parent.children.push(navItem);
    else roots.push(navItem);
  }

  return roots;
}

function sortMenuItems(a: WpMenuItem, b: WpMenuItem) {
  if (a.parent !== b.parent) return a.parent - b.parent;
  return a.menu_order - b.menu_order;
}

function mapCmsUrlToFrontendUrl(url: string) {
  if (!wpSiteUrl) return url;
  return url.replace(wpSiteUrl, siteUrl);
}

function stripHtml(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

async function wpJson<T>(
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
) {
  const url = new URL(`${apiBaseUrl}/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: { Accept: "application/json" } });

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

/**
 * Route/layout loader usage:
 *
 * loader: async () => {
 *   const [primaryNav, footerNav] = await Promise.all([
 *     getNavigation("primary"),
 *     getNavigation("footer"),
 *   ]);
 *   return { primaryNav, footerNav };
 * }
 *
 * Header usage:
 *
 * function Header({ nav }: { nav: NavItem[] }) {
 *   return <nav>{nav.map((item) => <a href={item.href}>{item.label}</a>)}</nav>;
 * }
 */
