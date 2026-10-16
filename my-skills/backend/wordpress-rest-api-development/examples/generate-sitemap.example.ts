/**
 * Headless frontend sitemap.xml generation example.
 *
 * WordPress core sitemap output is XML at /wp-sitemap.xml, not a JSON REST
 * endpoint. For a headless frontend, generate sitemap.xml on the frontend
 * domain and use WordPress REST API only as the content source.
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

const SITE_URL = (
  runtimeEnv.VITE_SITE_URL ??
  runtimeEnv.SITE_URL ??
  "https://example.com"
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

type WpSitemapRecord = {
  id: number;
  slug: string;
  modified?: string;
  link?: string;
};

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

async function wpCollection<T>(
  path: string,
  query: Record<string, QueryValue> = {},
) {
  const firstPageUrl = buildUrl(path, { ...query, page: 1 });
  const firstPageResponse = await fetch(firstPageUrl, {
    headers: { Accept: "application/json" },
  });

  if (!firstPageResponse.ok) {
    throw new WordPressRestApiError(
      firstPageResponse,
      await readWpErrorBody(firstPageResponse),
    );
  }

  const firstPage = (await firstPageResponse.json()) as T[];
  const totalPages = Number(firstPageResponse.headers.get("X-WP-TotalPages") || 1);
  const pages = [firstPage];

  for (let page = 2; page <= totalPages; page++) {
    const response = await fetch(buildUrl(path, { ...query, page }), {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new WordPressRestApiError(response, await readWpErrorBody(response));
    }
    pages.push((await response.json()) as T[]);
  }

  return pages.flat();
}

export async function buildSitemapXml() {
  const [pages, posts] = await Promise.all([
    wpCollection<WpSitemapRecord>("pages", {
      per_page: 100,
      status: "publish",
      orderby: "modified",
      order: "desc",
    }),
    wpCollection<WpSitemapRecord>("posts", {
      per_page: 100,
      status: "publish",
      orderby: "modified",
      order: "desc",
    }),
  ]);

  const entries: SitemapEntry[] = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: 1 },
    ...pages.map((page) => ({
      loc: page.slug === "home" ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
      lastmod: page.modified,
      changefreq: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: post.modified,
      changefreq: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return renderSitemap(entries);
}

function buildUrl(path: string, query: Record<string, QueryValue> = {}) {
  const url = new URL(`${WP_API_BASE_URL}/${path.replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
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

function renderSitemap(entries: SitemapEntry[]) {
  const urls = dedupeByLoc(entries)
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : "";
      const changefreq = entry.changefreq
        ? `<changefreq>${entry.changefreq}</changefreq>`
        : "";
      const priority =
        entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        lastmod ? `    ${lastmod}` : "",
        changefreq ? `    ${changefreq}` : "",
        priority ? `    ${priority}` : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function dedupeByLoc(entries: SitemapEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.loc, entry])).values());
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * TanStack Start route sketch:
 *
 * // src/routes/sitemap[.]xml.ts
 * export const Route = createFileRoute("/sitemap.xml")({
 *   server: {
 *     handlers: {
 *       GET: async () =>
 *         new Response(await buildSitemapXml(), {
 *           headers: { "Content-Type": "application/xml; charset=utf-8" },
 *         }),
 *     },
 *   },
 * });
 */
