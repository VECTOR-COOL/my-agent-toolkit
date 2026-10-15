#!/usr/bin/env node

/**
 * WordPress 管理端 REST client 最小範例。
 *
 * 需要 Node.js 20+，且需設定：
 *   WP_REST_BASE_URL=https://example.com/wp-json
 *   WP_REST_USERNAME=admin@example.com
 *   WP_REST_APPLICATION_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
 */

const baseUrl = requiredEnv('WP_REST_BASE_URL').replace(/\/+$/, '');
const username = requiredEnv('WP_REST_USERNAME');
const applicationPassword = requiredEnv('WP_REST_APPLICATION_PASSWORD');

const client = createWpRestClient({ baseUrl, username, applicationPassword });
const currentUser = await client.request('/wp/v2/users/me?context=edit');

console.log(JSON.stringify({
  id: currentUser.id,
  name: currentUser.name,
  slug: currentUser.slug,
  roles: currentUser.roles || []
}, null, 2));

function createWpRestClient({ baseUrl, username, applicationPassword }) {
  const token = Buffer.from(`${username}:${applicationPassword}`, 'utf8').toString('base64');

  return {
    async request(path, options = {}) {
      const response = await fetch(`${baseUrl}${normalizePath(path)}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${token}`,
          ...(options.body && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
          ...(options.headers || {})
        }
      });

      const body = await readResponseBody(response);
      if (!response.ok) {
        const detail = formatWpError(response, body);
        throw new Error(`WordPress REST API 請求失敗：${detail}`);
      }

      return body;
    }
  };
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
  return `HTTP ${response.status} ${response.statusText}`;
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少必要環境變數：${name}`);
  }
  return value;
}
