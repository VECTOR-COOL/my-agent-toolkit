#!/usr/bin/env node

/**
 * 依 manifest dry-run 或套用 WordPress 管理端 REST 配置。
 * 預設只 dry-run；必須傳入 --apply 才會執行寫入。
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateManifest } from './validate-admin-config-manifest.mjs';

const args = parseArgs(process.argv.slice(2));
const file = args.file ? path.resolve(String(args.file)) : null;
const shouldApply = Boolean(args.apply);

if (!file) {
  fail('缺少參數：--file <manifest.json>');
}

if (args['dry-run'] && shouldApply) {
  fail('不可同時使用 --dry-run 與 --apply。');
}

const manifest = await readJson(file);
const issues = validateManifest(manifest);
if (issues.length > 0) {
  for (const issue of issues) console.error(`ERROR: ${issue}`);
  process.exit(1);
}

const baseUrl = resolveBaseUrl(manifest);
const authHeader = shouldApply ? resolveAuthHeader() : null;
const operations = buildOperations(manifest);

console.log(`WordPress 管理端配置 ${shouldApply ? 'APPLY' : 'DRY-RUN'}`);
console.log(`Manifest: ${file}`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Environment: ${manifest.site?.environment || '未指定'}`);
console.log(`Operations: ${operations.length}`);

if (!shouldApply) {
  for (const operation of operations) {
    printOperation(operation);
  }
  console.log('\nOK: dry-run 完成，未執行任何寫入。若確認要套用，請在受控測試站使用 --apply。');
  process.exit(0);
}

console.log('\nWARN: 即將執行寫入操作。');
for (const operation of operations) {
  await executeOperation(baseUrl, authHeader, operation);
}

console.log('\nOK: apply 完成。請檢查 WordPress 後台與 probe 結果。');

function buildOperations(manifest) {
  const operations = [];

  if (manifest.settings && Object.keys(manifest.settings).length > 0) {
    operations.push({
      kind: 'settings',
      action: 'update',
      method: 'POST',
      path: '/wp/v2/settings',
      payload: manifest.settings,
      summary: `更新 settings：${Object.keys(manifest.settings).join(', ')}`
    });
  }

  for (const group of manifest.taxonomies || []) {
    const endpoint = taxonomyEndpoint(group.taxonomy);
    for (const term of group.terms || []) {
      operations.push({
        kind: 'taxonomy',
        action: 'upsert',
        method: 'POST',
        path: endpoint,
        lookupPath: `${endpoint}?slug=${encodeURIComponent(term.slug)}`,
        payload: term,
        summary: `以 slug=${term.slug} upsert ${group.taxonomy} term`
      });
    }
  }

  for (const page of manifest.pages || []) {
    operations.push(contentOperation('/wp/v2/pages', page, 'page'));
  }

  for (const post of manifest.posts || []) {
    operations.push(contentOperation('/wp/v2/posts', post, 'post'));
  }

  for (const media of manifest.media || []) {
    operations.push({
      kind: 'media',
      action: 'manual-review',
      method: 'POST',
      path: '/wp/v2/media',
      payload: summarizeMedia(media),
      summary: `媒體 ${media.filename || media.sourcePath || media.url} 需要檔案上傳流程；目前只列入 dry-run 摘要`
    });
  }

  for (const user of manifest.users || []) {
    operations.push({
      kind: 'user',
      action: 'manual-review',
      method: 'POST',
      path: '/wp/v2/users',
      payload: sanitizeUserPayload(user),
      summary: `User ${user.username || user.email} 是高風險操作；需人工確認後另行處理`
    });
  }

  for (const menu of manifest.menus || []) {
    operations.push({
      kind: 'menu',
      action: 'manual-review',
      method: 'POST',
      path: '/wp/v2/menu-items',
      payload: menu,
      summary: `Menu ${menu.name || menu.location} 需依站台 theme/menu endpoint 能力確認後處理`
    });
  }

  for (const check of manifest.customEndpointChecks || []) {
    operations.push({
      kind: 'customEndpointCheck',
      action: 'check',
      method: check.method || 'GET',
      path: check.path,
      expectStatus: check.expectStatus || 200,
      summary: `檢查 custom endpoint：${check.name}`
    });
  }

  return operations;
}

function contentOperation(endpoint, item, kind) {
  return {
    kind,
    action: 'upsert',
    method: 'POST',
    path: endpoint,
    lookupPath: `${endpoint}?slug=${encodeURIComponent(item.slug)}&context=edit`,
    payload: item,
    summary: `以 slug=${item.slug} upsert ${kind}`
  };
}

async function executeOperation(baseUrl, authHeader, operation) {
  printOperation(operation);

  if (operation.action === 'manual-review') {
    console.log('  SKIP: 高風險或需站台特定流程，未自動套用。');
    return;
  }

  if (operation.action === 'check') {
    const response = await fetch(`${baseUrl}${operation.path}`, {
      method: operation.method,
      headers: {
        Accept: 'application/json',
        Authorization: authHeader
      }
    });
    if (response.status !== operation.expectStatus) {
      const body = await readResponseBody(response);
      throw new Error(`custom endpoint check 失敗：${operation.path} 預期 ${operation.expectStatus}，實際 ${response.status}；${formatWpError(response, body)}`);
    }
    console.log(`  OK: HTTP ${response.status}`);
    return;
  }

  let targetPath = operation.path;
  if (operation.lookupPath) {
    const existing = await requestJson(baseUrl, authHeader, 'GET', operation.lookupPath);
    if (Array.isArray(existing) && existing.length > 1) {
      throw new Error(`${operation.summary} 找到多筆既有資料，停止避免誤更新。`);
    }
    if (Array.isArray(existing) && existing.length === 1) {
      targetPath = `${operation.path}/${existing[0].id}`;
      console.log(`  UPDATE: 找到既有 ID ${existing[0].id}`);
    } else {
      console.log('  CREATE: 未找到既有資料');
    }
  }

  const result = await requestJson(baseUrl, authHeader, operation.method, targetPath, operation.payload);
  console.log(`  OK: WordPress ID ${result?.id ?? '未回傳'}`);
}

async function requestJson(baseUrl, authHeader, method, requestPath, payload) {
  const response = await fetch(`${baseUrl}${requestPath}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
      ...(payload ? { 'Content-Type': 'application/json' } : {})
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const body = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(formatWpError(response, body));
  }
  return body;
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return response.text();
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function printOperation(operation) {
  console.log(`\n- ${operation.summary}`);
  console.log(`  ${operation.method} ${operation.path}`);
  if (operation.lookupPath) console.log(`  lookup: GET ${operation.lookupPath}`);
  if (operation.action === 'manual-review') console.log('  risk: 需人工確認或站台特定實作');
  if (operation.payload) console.log(`  payload: ${JSON.stringify(operation.payload)}`);
}

function resolveBaseUrl(manifest) {
  const value = process.env.WP_REST_BASE_URL || manifest.site?.baseUrl;
  if (!value) fail('缺少 WP_REST_BASE_URL，且 manifest.site.baseUrl 未提供。');
  const normalized = value.replace(/\/+$/, '');
  try {
    const url = new URL(normalized);
    if (!url.pathname.replace(/\/+$/, '').endsWith('/wp-json')) {
      fail('Base URL 必須指向 /wp-json。');
    }
  } catch {
    fail('Base URL 不是有效 URL。');
  }
  return normalized;
}

function resolveAuthHeader() {
  const username = process.env.WP_REST_USERNAME;
  const password = process.env.WP_REST_APPLICATION_PASSWORD;
  if (!username || !password) {
    fail('執行 --apply 需要 WP_REST_USERNAME 與 WP_REST_APPLICATION_PASSWORD。');
  }
  return `Basic ${Buffer.from(`${username}:${password}`, 'utf8').toString('base64')}`;
}

function taxonomyEndpoint(taxonomy) {
  if (taxonomy === 'categories') return '/wp/v2/categories';
  if (taxonomy === 'tags') return '/wp/v2/tags';
  return `/wp/v2/${taxonomy}`;
}

function summarizeMedia(media) {
  return {
    sourcePath: media.sourcePath,
    url: media.url,
    filename: media.filename,
    title: media.title,
    altText: media.altText
  };
}

function sanitizeUserPayload(user) {
  const copy = { ...user };
  delete copy.password;
  return copy;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    fail(`無法讀取或解析 JSON：${filePath}；${error.message}`);
  }
}

function formatWpError(response, body) {
  if (body && typeof body === 'object' && typeof body.code === 'string') {
    return `HTTP ${response.status} ${body.code} - ${body.message || '無錯誤訊息'}`;
  }
  if (typeof body === 'string' && body.trim()) {
    return `HTTP ${response.status} ${response.statusText} - ${body.trim().slice(0, 160)}`;
  }
  return `HTTP ${response.status} ${response.statusText}`;
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
