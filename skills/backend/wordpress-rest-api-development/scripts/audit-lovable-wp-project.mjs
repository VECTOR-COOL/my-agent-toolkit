#!/usr/bin/env node

/**
 * Static audit for Lovable/TanStack Start projects using WordPress REST API data.
 *
 * Usage:
 *   node scripts/audit-lovable-wp-project.mjs --root .
 */

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root || process.cwd());
const src = path.join(root, 'src');

if (!existsSync(src)) {
  fail(`Cannot find src directory under ${root}`);
}

const files = await listSourceFiles(src);
const issues = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  const text = await readFile(file, 'utf8');
  const normalized = rel.toLowerCase();
  const isService = normalized.includes('/services/');
  const isData = normalized.includes('/data/');
  const isType = normalized.includes('/types/');
  const isConfig = normalized.includes('/config/');

  if (!isService && !isData && !isType && /from\s+["'][^"']*(mock_|mock-|\/data\/|\\data\\)/.test(text)) {
    issues.push([rel, 'UI/routes should not import mock data directly; route through services.']);
  }

  if (!isService && !isConfig && /VITE_DATA_SOURCE|VITE_WP_API_URL|VITE_API_BASE_URL/.test(text)) {
    issues.push([rel, 'Environment data-source logic should live in config/service code, not UI files.']);
  }

  if (!isService && !isConfig && /fetch\s*\(\s*[^)]*wp-json\/wp\/v2/.test(text)) {
    issues.push([rel, 'Direct WordPress fetch found outside service/config layer.']);
  }
}

const expected = [
  ['src/config/data_source.ts', 'data source config'],
  ['src/types/wordpress.ts', 'WordPress TypeScript types'],
];

for (const [relativePath, label] of expected) {
  if (!existsSync(path.join(root, relativePath))) {
    issues.push([relativePath, `Missing ${label}.`]);
  }
}

const servicesDir = path.join(src, 'services');
if (!existsSync(servicesDir)) {
  issues.push(['src/services', 'Missing service layer directory.']);
}

if (issues.length > 0) {
  for (const [file, message] of issues) {
    console.error(`${file}: ${message}`);
  }
  fail(`${issues.length} project audit issue(s) found.`);
}

console.log(`OK: ${files.length} source file(s) audited. WordPress data access is service-layer oriented.`);

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await listSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    parsed[key] = next && !next.startsWith('--') ? next : true;
    if (parsed[key] === next) index++;
  }
  return parsed;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
