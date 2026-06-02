#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`用法：
node audit-frontend-project.mjs --root <project-root>

檢查：
- TanStack Start / React Router 專案類型訊號
- 建議目錄是否存在
- components 是否直接 import mock/fixtures 或直接 fetch
- browser API 是否缺少明顯 SSR guard
`);
  process.exit(0);
}

const root = path.resolve(args.root || process.cwd());
const findings = [];

await detectProjectType();
await checkExpectedDirs();
await scanSource();

if (findings.length === 0) {
  console.log("未發現問題。");
  process.exit(0);
}

for (const finding of findings) {
  console.log(`[${finding.level}] ${finding.message}`);
}

const hasError = findings.some((finding) => finding.level === "error");
process.exit(hasError ? 1 : 0);

async function detectProjectType() {
  const pkgPath = path.join(root, "package.json");
  if (!existsSync(pkgPath)) {
    findings.push({ level: "warn", message: "找不到 package.json；無法判斷專案類型。" });
    return;
  }

  let pkg;
  try {
    pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  } catch (error) {
    findings.push({ level: "error", message: `package.json 無法解析：${error.message}` });
    return;
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const hasStart = Boolean(deps["@tanstack/react-start"]);
  const hasRouter = Boolean(deps["@tanstack/react-router"]);
  const hasReactRouter = Boolean(deps["react-router-dom"]);

  if (hasStart || hasRouter) {
    findings.push({ level: "info", message: "偵測到 TanStack Start/Router dependency。" });
  }
  if (hasReactRouter) {
    findings.push({ level: "warn", message: "偵測到 react-router-dom；除非正在 migration，否則應視為 legacy SPA。" });
  }
  if (!hasStart && !hasRouter && !hasReactRouter) {
    findings.push({ level: "warn", message: "未偵測到 TanStack 或 React Router dependency。" });
  }
}

async function checkExpectedDirs() {
  const expected = [
    "src/routes",
    "src/components",
    "src/services",
    "src/data",
    "src/i18n",
    "docs/architecture",
    "docs/prompts",
    "tests/fixtures",
  ];

  for (const dir of expected) {
    if (!existsSync(path.join(root, dir))) {
      findings.push({ level: "warn", message: `缺少建議目錄：${dir}` });
    }
  }

  if (existsSync(path.join(root, "src/pages"))) {
    findings.push({ level: "warn", message: "src/pages 已存在；新的 TanStack Start 專案應避免使用此目錄。" });
  }
}

async function scanSource() {
  const src = path.join(root, "src");
  if (!existsSync(src)) return;
  const files = await collectFiles(src, [".ts", ".tsx", ".js", ".jsx"]);

  for (const file of files) {
    const rel = slash(path.relative(root, file));
    const content = await readFile(file, "utf8");

    if (/BrowserRouter|<Routes\b|from\s+["']react-router-dom["']/.test(content)) {
      findings.push({ level: "warn", message: `${rel} 使用 React Router SPA patterns。` });
    }

    if (/components\//.test(rel) && /from\s+["'][^"']*(data\/mock|mock-|fixtures)/.test(content)) {
      findings.push({ level: "error", message: `${rel} 直接 import mock/fixture data；應改由 services 取得。` });
    }

    if (/components\//.test(rel) && /\bfetch\s*\(/.test(content)) {
      findings.push({ level: "warn", message: `${rel} 直接呼叫 fetch；主要資料應來自 services/loaders。` });
    }

    if (/\bwindow\.|\blocalStorage\b|\bsessionStorage\b/.test(content) && !/typeof window/.test(content) && !/useEffect/.test(content)) {
      findings.push({ level: "warn", message: `${rel} 使用 browser APIs，但沒有明顯 SSR guard。` });
    }
  }
}

async function collectFiles(dir, extensions) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await collectFiles(full, extensions));
    } else if (extensions.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function parseArgs(raw) {
  const parsed = {};
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];
    if (!item.startsWith("--")) continue;
    const eqIndex = item.indexOf("=");
    if (eqIndex > 2) {
      parsed[item.slice(2, eqIndex)] = item.slice(eqIndex + 1);
      continue;
    }

    const key = item.slice(2);
    const next = raw[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function slash(value) {
  return value.replaceAll(path.sep, "/");
}
