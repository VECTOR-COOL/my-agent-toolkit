#!/usr/bin/env node

/**
 * Fetch main WordPress REST API resources mapped to this skill's schema files.
 *
 * Usage:
 *   node --experimental-strip-types examples/fetch-main-data-by-schemas.ts
 *   node --experimental-strip-types examples/fetch-main-data-by-schemas.ts --base-url https://cms.example.com/wp-json/wp/v2
 *   node --experimental-strip-types examples/fetch-main-data-by-schemas.ts --types post,page,category,tag,media,user,search
 *   node --experimental-strip-types examples/fetch-main-data-by-schemas.ts --custom-rest-base products
 *   node --experimental-strip-types examples/fetch-main-data-by-schemas.ts --out-dir fixtures/wp-api
 *
 * If the project already uses tsx:
 *   npx tsx examples/fetch-main-data-by-schemas.ts --per-page 1
 *
 * Environment aliases:
 *   VITE_WP_API_URL=https://cms.example.com/wp-json/wp/v2
 *   VITE_API_BASE_URL=https://cms.example.com/wp-json/wp/v2
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CliArgs = Record<string, string | boolean>;
type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

type FetchResult = {
  ok: boolean;
};

type ResourceType =
  | "post"
  | "page"
  | "category"
  | "tag"
  | "media"
  | "user"
  | "search"
  | "custom-post-type";

type ResourceConfig = {
  type: ResourceType;
  name: string;
  schema: string;
  path: string;
  query: QueryParams;
  required: boolean;
  summarize: (item: WpRecord) => string;
};

type WpRendered = {
  rendered?: string;
};

type WpRecord = {
  id?: number;
  slug?: string;
  type?: string;
  subtype?: string;
  title?: string | WpRendered;
  name?: string;
  taxonomy?: string;
  count?: number;
  featured_media?: number;
  media_type?: string;
  alt_text?: string;
  source_url?: string;
  link?: string;
  url?: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, "..");
const schemasDir = path.join(skillRoot, "references", "schemas");

const args = parseArgs(process.argv.slice(2));
const apiBaseUrl = stripTrailingSlash(
  String(
    args["base-url"] ||
      process.env.VITE_WP_API_URL ||
      process.env.VITE_API_BASE_URL ||
      "https://cms.uavs.tw/wp-json/wp/v2",
  ),
);

const requestedTypes = new Set<ResourceType>(
  String(args.types || "post,page,category,tag,media,user,search")
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean) as ResourceType[],
);

const perPage = Number(args["per-page"] || 3);
const searchKeyword = String(args.search || "a");
const customRestBase = args["custom-rest-base"]
  ? String(args["custom-rest-base"])
  : "";
const outDir = args["out-dir"] ? path.resolve(String(args["out-dir"])) : "";

const resources: ResourceConfig[] = [
  {
    type: "post",
    name: "Posts",
    schema: "post.json5",
    path: "/posts",
    query: { _embed: "1", per_page: perPage, orderby: "date", order: "desc" },
    required: true,
    summarize: summarizePostLike,
  },
  {
    type: "page",
    name: "Pages",
    schema: "page.json5",
    path: "/pages",
    query: {
      _embed: "1",
      per_page: perPage,
      orderby: "menu_order",
      order: "asc",
    },
    required: true,
    summarize: summarizePostLike,
  },
  {
    type: "category",
    name: "Categories",
    schema: "category.json5",
    path: "/categories",
    query: { per_page: 100, hide_empty: false, orderby: "name", order: "asc" },
    required: true,
    summarize: summarizeTerm,
  },
  {
    type: "tag",
    name: "Tags",
    schema: "tag.json5",
    path: "/tags",
    query: { per_page: 100, hide_empty: false, orderby: "name", order: "asc" },
    required: true,
    summarize: summarizeTerm,
  },
  {
    type: "media",
    name: "Media",
    schema: "media.json5",
    path: "/media",
    query: {
      per_page: perPage,
      media_type: "image",
      orderby: "date",
      order: "desc",
    },
    required: true,
    summarize: summarizeMedia,
  },
  {
    type: "user",
    name: "Users",
    schema: "user.json5",
    path: "/users",
    query: { per_page: perPage },
    required: false,
    summarize: summarizeUser,
  },
  {
    type: "search",
    name: "Search",
    schema: "search.json5",
    path: "/search",
    query: { search: searchKeyword, per_page: perPage },
    required: true,
    summarize: summarizeSearchResult,
  },
];

if (customRestBase) {
  requestedTypes.add("custom-post-type");
  resources.push({
    type: "custom-post-type",
    name: `Custom Post Type (${customRestBase})`,
    schema: "custom-post-type.json5",
    path: `/${customRestBase}`,
    query: { _embed: "1", per_page: perPage, orderby: "date", order: "desc" },
    required: false,
    summarize: summarizePostLike,
  });
}

await main();

async function main() {
  if (outDir) {
    await mkdir(outDir, { recursive: true });
  }

  console.log("WordPress REST API main data fetch");
  console.log(`Base URL: ${apiBaseUrl}`);
  console.log(`Schemas: ${schemasDir}`);

  let requiredFailures = 0;

  for (const resource of resources.filter((item) =>
    requestedTypes.has(item.type),
  )) {
    const result = await fetchResource(resource);
    if (!result.ok && resource.required) requiredFailures++;
  }

  if (requiredFailures > 0) {
    console.error(
      `\nFailed: ${requiredFailures} required resource(s) could not be fetched.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nDone.");
}

async function fetchResource(resource: ResourceConfig): Promise<FetchResult> {
  const schemaPath = path.join(schemasDir, resource.schema);
  const schemaExists = await fileExists(schemaPath);
  const url = buildUrl(resource.path, resource.query);

  console.log(`\n[${resource.type}] ${resource.name}`);
  console.log(
    `Schema: references/schemas/${resource.schema}${schemaExists ? "" : " (missing)"}`,
  );
  console.log(`GET ${url}`);

  if (!schemaExists) {
    console.error("Schema file is missing.");
    return { ok: false };
  }

  try {
    const startedAt = Date.now();
    const response = await fetch(url);
    const duration = Date.now() - startedAt;

    if (!response.ok) {
      const body = await readWpErrorBody(response);
      const message = formatWpError(response, body);
      if (resource.required) console.error(message);
      else console.log(`${message} (optional)`);
      return { ok: false };
    }

    const data = (await response.json()) as unknown;
    const items = Array.isArray(data) ? (data as WpRecord[]) : [data as WpRecord];
    const total = response.headers.get("x-wp-total");
    const totalPages = response.headers.get("x-wp-totalpages");

    console.log(`Status: ${response.status} (${duration}ms)`);
    console.log(`Records: ${items.length}${total ? ` / total ${total}` : ""}`);
    if (totalPages) console.log(`Total pages: ${totalPages}`);

    for (const [index, item] of items.slice(0, 3).entries()) {
      console.log(`- ${index + 1}. ${resource.summarize(item)}`);
    }

    if (outDir) {
      const outputPath = path.join(outDir, `${resource.type}.json`);
      await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      console.log(`Saved: ${outputPath}`);
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (resource.required) console.error(message);
    else console.log(`${message} (optional)`);
    return { ok: false };
  }
}

function buildUrl(resourcePath: string, query: QueryParams) {
  const url = new URL(`${apiBaseUrl}${resourcePath}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function summarizePostLike(item: WpRecord) {
  const title =
    typeof item.title === "string" ? item.title : item.title?.rendered || "";

  return [
    `id=${item.id}`,
    `slug=${item.slug}`,
    `type=${item.type}`,
    `title="${stripHtml(title)}"`,
    `featured_media=${item.featured_media ?? 0}`,
  ].join(" | ");
}

function summarizeTerm(item: WpRecord) {
  return [
    `id=${item.id}`,
    `slug=${item.slug}`,
    `taxonomy=${item.taxonomy}`,
    `name="${item.name || ""}"`,
    `count=${item.count ?? 0}`,
  ].join(" | ");
}

function summarizeMedia(item: WpRecord) {
  return [
    `id=${item.id}`,
    `slug=${item.slug}`,
    `media_type=${item.media_type}`,
    `alt="${item.alt_text || ""}"`,
    `source_url=${item.source_url || ""}`,
  ].join(" | ");
}

function summarizeUser(item: WpRecord) {
  return [
    `id=${item.id}`,
    `slug=${item.slug}`,
    `name="${item.name || ""}"`,
    `link=${item.link || ""}`,
  ].join(" | ");
}

function summarizeSearchResult(item: WpRecord) {
  return [
    `id=${item.id}`,
    `type=${item.type}`,
    `subtype=${item.subtype}`,
    `title="${typeof item.title === "string" ? item.title : ""}"`,
    `url=${item.url || ""}`,
  ].join(" | ");
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

async function readWpErrorBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return response.text();
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function formatWpError(response: Response, body: unknown) {
  const parts = [`HTTP ${response.status} ${response.statusText}`];
  if (isWpErrorResponse(body)) {
    parts.push(body.code, body.message);
    if (body.data?.status) parts.push(`data.status=${body.data.status}`);
  } else if (typeof body === "string" && body.trim()) {
    parts.push(body.trim());
  }
  return parts.join(" - ");
}

function isWpErrorResponse(
  value: unknown,
): value is { code: string; message: string; data?: { status?: number } } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
  );
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(rawArgs: string[]): CliArgs {
  const parsed: CliArgs = {};

  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : true;
    if (parsed[key] === next) index++;
  }

  return parsed;
}
