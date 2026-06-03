#!/usr/bin/env node

/**
 * Read-only 探測 WordPress 管理端 REST API 能力。
 * 只使用 Node.js 內建 API，不會執行任何寫入操作。
 */

const baseUrl = requiredEnv('WP_REST_BASE_URL').replace(/\/+$/, '');
const username = requiredEnv('WP_REST_USERNAME');
const applicationPassword = requiredEnv('WP_REST_APPLICATION_PASSWORD');
const authHeader = createBasicAuthHeader(username, applicationPassword);

validateBaseUrl(baseUrl);

const checks = [
  { name: 'REST discovery', path: '/', auth: false, required: true },
  { name: '目前使用者', path: '/wp/v2/users/me?context=edit', auth: true, required: true },
  { name: 'Settings', path: '/wp/v2/settings', auth: true, required: false },
  { name: 'Pages OPTIONS', path: '/wp/v2/pages', method: 'OPTIONS', auth: true, required: false },
  { name: 'Posts OPTIONS', path: '/wp/v2/posts', method: 'OPTIONS', auth: true, required: false },
  { name: 'Menu items OPTIONS', path: '/wp/v2/menu-items', method: 'OPTIONS', auth: true, required: false },
  { name: 'Navigation OPTIONS', path: '/wp/v2/navigation', method: 'OPTIONS', auth: true, required: false }
];

console.log('WordPress 管理端 REST API read-only probe');
console.log(`Base URL: ${baseUrl}`);
console.log(`Username: ${maskUsername(username)}`);

let requiredFailures = 0;
for (const check of checks) {
  const result = await runCheck(check);
  if (!result.ok && check.required) requiredFailures++;
}

if (requiredFailures > 0) {
  fail(`必要檢查失敗：${requiredFailures} 項。`);
}

console.log('\nOK: read-only probe 完成。');

async function runCheck(check) {
  const method = check.method || 'GET';
  const url = `${baseUrl}${normalizePath(check.path)}`;
  const headers = { Accept: 'application/json' };
  if (check.auth) headers.Authorization = authHeader;

  try {
    const response = await fetch(url, { method, headers });
    const body = await readResponseBody(response);

    if (!response.ok) {
      const level = check.required ? 'ERROR' : 'WARN';
      console.log(`\n${level}: ${check.name} 失敗：${formatWpError(response, body)}`);
      return { ok: false };
    }

    console.log(`\nOK: ${check.name} HTTP ${response.status}`);
    printProbeSummary(check, body);
    return { ok: true };
  } catch (error) {
    const level = check.required ? 'ERROR' : 'WARN';
    console.log(`\n${level}: ${check.name} 請求失敗：${error.message}`);
    return { ok: false };
  }
}

function printProbeSummary(check, body) {
  if (check.path === '/' && body && typeof body === 'object') {
    const namespaces = Array.isArray(body.namespaces) ? body.namespaces.join(', ') : '無 namespaces';
    const routeCount = body.routes && typeof body.routes === 'object' ? Object.keys(body.routes).length : 0;
    console.log(`  Namespaces: ${namespaces}`);
    console.log(`  Routes: ${routeCount}`);
    return;
  }

  if (check.path.startsWith('/wp/v2/users/me') && body && typeof body === 'object') {
    console.log(`  User ID: ${body.id ?? '未知'}`);
    console.log(`  Name: ${body.name ?? '未知'}`);
    console.log(`  Roles: ${Array.isArray(body.roles) ? body.roles.join(', ') : '未回傳'}`);
    return;
  }

  if ((check.method || 'GET') === 'OPTIONS' && body && typeof body === 'object') {
    const methods = Array.isArray(body.methods) ? body.methods.join(', ') : '未回傳';
    const args = body.endpoints?.flatMap((endpoint) => Object.keys(endpoint.args || {})) || [];
    console.log(`  Methods: ${methods}`);
    console.log(`  Args: ${[...new Set(args)].slice(0, 20).join(', ') || '未回傳'}`);
    return;
  }

  if (body && typeof body === 'object') {
    console.log(`  Fields: ${Object.keys(body).slice(0, 20).join(', ')}`);
  }
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return response.text();
  }

  try {
    return await response.json();
  } catch {
    return null;
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

function validateBaseUrl(value) {
  try {
    const url = new URL(value);
    if (!url.pathname.replace(/\/+$/, '').endsWith('/wp-json')) {
      fail('WP_REST_BASE_URL 必須指向 /wp-json，例如 https://example.com/wp-json。');
    }
  } catch {
    fail('WP_REST_BASE_URL 不是有效 URL。');
  }
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function maskUsername(value) {
  if (!value.includes('@')) return value.slice(0, 2) + '***';
  const [name, domain] = value.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

function createBasicAuthHeader(user, password) {
  return `Basic ${Buffer.from(`${user}:${password}`, 'utf8').toString('base64')}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    fail(`缺少必要環境變數：${name}`);
  }
  return value;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
