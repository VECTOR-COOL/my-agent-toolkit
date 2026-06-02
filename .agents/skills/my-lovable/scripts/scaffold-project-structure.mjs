#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`用法：
node scaffold-project-structure.mjs --root <project-root> [--profile generic|wordpress] [--dry-run]

範例：
node scaffold-project-structure.mjs --root D:/projects/app --dry-run
node scaffold-project-structure.mjs --root D:/projects/app --profile wordpress
`);
  process.exit(0);
}

const root = path.resolve(args.root || process.cwd());
const dryRun = Boolean(args["dry-run"]);
const profile = args.profile || "generic";

const commonDirs = [
  "docs/architecture",
  "docs/prompts",
  "docs/qa",
  "scripts",
  "tests/fixtures",
  "tests/unit",
  "tests/e2e",
  "src/routes",
  "src/components/layout",
  "src/components/ui",
  "src/components/sections",
  "src/components/feedback",
  "src/features",
  "src/services",
  "src/data/mock",
  "src/data/fixtures",
  "src/i18n/locales",
  "src/lib/api",
  "src/lib/seo",
  "src/lib/utils",
  "src/config",
  "src/types",
];

const profileDirs = {
  generic: [],
  wordpress: [
    "src/features/posts/components",
    "src/features/posts/data",
    "src/features/posts/services",
    "src/features/pages/components",
    "src/features/pages/data",
    "src/features/pages/services",
  ],
};

if (!profileDirs[profile]) {
  fail(`Unknown profile: ${profile}. Use generic or wordpress.`);
}

const dirs = [...commonDirs, ...profileDirs[profile]];
const markerFiles = [
  ["docs/architecture/project-contract.md", projectContract()],
  ["docs/architecture/route-map.md", "# Route Map\n\n| Route | 用途 | Data | SEO |\n| --- | --- | --- | --- |\n"],
  ["docs/architecture/data-contract.md", "# Data Contract\n\n在這裡定義 entities、source、fields、states 與 SEO fields。\n"],
  ["docs/prompts/prompt-history.md", "# Prompt History\n\n記錄重要 Lovable prompts、執行結果與後續修正。\n"],
  ["docs/qa/visual-checklist.md", "# Visual Checklist\n\n- Desktop checked\n- Mobile checked\n- Long text checked\n- Empty states checked\n"],
  ["tests/fixtures/README.md", "# Fixtures\n\nFixtures 必須 deterministic，且 shape 要對齊 service/API 回傳格式。\n"],
  ["src/i18n/locales/en.json", "{}\n"],
  ["src/i18n/locales/zh-TW.json", "{}\n"],
];

console.log(`${dryRun ? "預覽建立" : "建立"} ${profile} Lovable 專案結構：${root}`);

for (const dir of dirs) {
  const target = path.join(root, dir);
  if (dryRun) {
    console.log(`dir  ${dir}`);
  } else {
    await mkdir(target, { recursive: true });
  }
}

for (const [file, content] of markerFiles) {
  const target = path.join(root, file);
  if (dryRun) {
    console.log(`file ${file}`);
  } else if (!existsSync(target)) {
    await writeFile(target, content, "utf8");
  }
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

function projectContract() {
  return `# Project Contract

## 產品

- Name:
- Audience:
- Primary goal:
- Non-goals:

## Architecture

- Lovable project type: unknown | TanStack Start | legacy SPA
- Data phase: mock | hybrid | api
- Integrations:
- i18n:
- SEO:

## Guardrails

- 未經確認，不要更改 routing 架構。
- 不要繞過 service-layer data access。
- Components 不要直接 import mock data。
`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
