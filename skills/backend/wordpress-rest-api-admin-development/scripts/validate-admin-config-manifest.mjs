#!/usr/bin/env node

/**
 * 驗證 WordPress 管理端配置 manifest 的基本 shape。
 * 只使用 Node.js 內建 API，不需要 npm install。
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

if (isMainModule()) {
  const args = parseArgs(process.argv.slice(2));
  const file = args.file ? path.resolve(String(args.file)) : null;

  if (!file) {
    fail('缺少參數：--file <manifest.json>');
  }

  const manifest = await readJson(file);
  const issues = validateManifest(manifest);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(`ERROR: ${issue}`);
    }
    process.exit(1);
  }

  console.log(`OK: manifest 驗證通過：${file}`);
}

export function validateManifest(manifest) {
  const issues = [];

  if (!isObject(manifest)) {
    return ['manifest 必須是 JSON object。'];
  }

  if (manifest.version !== 1) {
    issues.push('version 必須是 1。');
  }

  if (manifest.site !== undefined) {
    if (!isObject(manifest.site)) {
      issues.push('site 必須是 object。');
    } else {
      if (manifest.site.baseUrl !== undefined && !isWpJsonBaseUrl(manifest.site.baseUrl)) {
        issues.push('site.baseUrl 必須是以 /wp-json 結尾的 URL。');
      }
      if (manifest.site.environment !== undefined && !isNonEmptyString(manifest.site.environment)) {
        issues.push('site.environment 必須是非空字串。');
      }
    }
  }

  if (manifest.settings !== undefined && !isObject(manifest.settings)) {
    issues.push('settings 必須是 object。');
  }

  validateArraySection(issues, manifest, 'taxonomies', validateTaxonomyGroup);
  validateArraySection(issues, manifest, 'pages', validateContentItem);
  validateArraySection(issues, manifest, 'posts', validateContentItem);
  validateArraySection(issues, manifest, 'media', validateMediaItem);
  validateArraySection(issues, manifest, 'users', validateUserItem);
  validateArraySection(issues, manifest, 'menus', validateMenuItem);
  validateArraySection(issues, manifest, 'customEndpointChecks', validateEndpointCheck);

  rejectSecrets(issues, manifest, []);

  return issues;
}

function validateTaxonomyGroup(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.taxonomy)) {
    issues.push(`${prefix}.taxonomy 必須是非空字串。`);
  }
  if (!Array.isArray(value.terms)) {
    issues.push(`${prefix}.terms 必須是 array。`);
    return;
  }
  value.terms.forEach((term, index) => {
    const termPrefix = `${prefix}.terms[${index}]`;
    if (!isObject(term)) {
      issues.push(`${termPrefix} 必須是 object。`);
      return;
    }
    if (!isNonEmptyString(term.name)) issues.push(`${termPrefix}.name 必須是非空字串。`);
    if (!isNonEmptyString(term.slug)) issues.push(`${termPrefix}.slug 必須是非空字串。`);
  });
}

function validateContentItem(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.slug)) issues.push(`${prefix}.slug 必須是非空字串。`);
  if (!isNonEmptyString(value.title)) issues.push(`${prefix}.title 必須是非空字串。`);
  if (value.status !== undefined && !['draft', 'publish', 'private', 'pending', 'future'].includes(value.status)) {
    issues.push(`${prefix}.status 必須是 draft、publish、private、pending 或 future。`);
  }
  if (value.content !== undefined && typeof value.content !== 'string') {
    issues.push(`${prefix}.content 必須是字串。`);
  }
}

function validateMediaItem(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.sourcePath) && !isNonEmptyString(value.url)) {
    issues.push(`${prefix} 必須提供 sourcePath 或 url。`);
  }
  if (value.filename !== undefined && !isNonEmptyString(value.filename)) {
    issues.push(`${prefix}.filename 必須是非空字串。`);
  }
}

function validateUserItem(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.username) && !isNonEmptyString(value.email)) {
    issues.push(`${prefix} 必須提供 username 或 email。`);
  }
  if (value.password !== undefined) {
    issues.push(`${prefix}.password 不可寫入 manifest。`);
  }
  if (value.roles !== undefined && !Array.isArray(value.roles)) {
    issues.push(`${prefix}.roles 必須是 array。`);
  }
}

function validateMenuItem(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.name) && !isNonEmptyString(value.location)) {
    issues.push(`${prefix} 必須提供 name 或 location。`);
  }
  if (value.items !== undefined && !Array.isArray(value.items)) {
    issues.push(`${prefix}.items 必須是 array。`);
  }
}

function validateEndpointCheck(value, prefix, issues) {
  if (!isObject(value)) {
    issues.push(`${prefix} 必須是 object。`);
    return;
  }
  if (!isNonEmptyString(value.name)) issues.push(`${prefix}.name 必須是非空字串。`);
  if (!isNonEmptyString(value.path) || !value.path.startsWith('/')) {
    issues.push(`${prefix}.path 必須是以 / 開頭的字串。`);
  }
  if (value.method !== undefined && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(value.method)) {
    issues.push(`${prefix}.method 必須是有效 HTTP method。`);
  }
  if (value.expectStatus !== undefined && !Number.isInteger(value.expectStatus)) {
    issues.push(`${prefix}.expectStatus 必須是整數。`);
  }
}

function validateArraySection(issues, manifest, section, validator) {
  if (manifest[section] === undefined) return;
  if (!Array.isArray(manifest[section])) {
    issues.push(`${section} 必須是 array。`);
    return;
  }
  manifest[section].forEach((item, index) => validator(item, `${section}[${index}]`, issues));
}

function rejectSecrets(issues, value, pathParts) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectSecrets(issues, item, [...pathParts, `[${index}]`]));
    return;
  }
  if (!isObject(value)) return;

  for (const [key, nested] of Object.entries(value)) {
    const lower = key.toLowerCase();
    const currentPath = [...pathParts, key].join('.');
    if (/(password|secret|token|api_?key|application_?password)/.test(lower)) {
      issues.push(`${currentPath} 看起來是 secret，不可放入 manifest。`);
    }
    rejectSecrets(issues, nested, [...pathParts, key]);
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    fail(`無法讀取或解析 JSON：${filePath}；${error.message}`);
  }
}

function isWpJsonBaseUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.pathname.replace(/\/+$/, '').endsWith('/wp-json');
  } catch {
    return false;
  }
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
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

function isMainModule() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
