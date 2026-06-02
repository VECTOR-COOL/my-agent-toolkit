#!/usr/bin/env node

/**
 * WordPress REST API 連線測試腳本
 *
 * 用法：
 *   node scripts/test-wordpress-api.mjs
 *   bun run scripts/test-wordpress-api.mjs
 *
 * 也可以透過環境變數覆寫預設設定：
 *   VITE_WP_API_URL=https://your-domain.com/wp-json/wp/v2 node scripts/test-wordpress-api.mjs
 *   VITE_API_BASE_URL=https://your-domain.com/wp-json/wp/v2 node scripts/test-wordpress-api.mjs
 */

const API_BASE_URL =
  process.env.VITE_WP_API_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://cms.uavs.tw/wp-json/wp/v2';

const endpoints = [
  { name: 'Posts', path: '/posts?per_page=1', required: true },
  { name: 'Pages', path: '/pages?per_page=1', required: true },
  { name: 'Categories', path: '/categories?per_page=1', required: true },
  { name: 'Tags', path: '/tags?per_page=1', required: true },
  { name: 'Media', path: '/media?per_page=1', required: true },
  { name: 'Users', path: '/users?per_page=1', required: false },
  { name: 'Search', path: '/search?search=a&per_page=1', required: true },
];

async function testEndpoint(name, path, required) {
  const url = `${API_BASE_URL}${path}`;
  const optionalLabel = required ? '' : ' (optional)';
  console.log(`\nTesting ${name}${optionalLabel}...`);
  console.log(`URL: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const mark = required ? '❌' : '⚠️ ';
      const write = required ? console.error : console.log;
      write(`${mark} Failed: ${await formatWpError(response)}`);
      return { ok: false, required };
    }

    const data = await response.json();
    const count = Array.isArray(data) ? data.length : 1;
    
    console.log(`✅ Success: HTTP ${response.status} (${duration}ms)`);
    console.log(`   Retrieved ${count} record(s).`);
    
    // 顯示是否有分頁 Headers
    const total = response.headers.get('x-wp-total');
    if (total) {
      console.log(`   Total records available: ${total}`);
    }

    return { ok: true, required };
  } catch (error) {
    const mark = required ? '❌' : '⚠️ ';
    const write = required ? console.error : console.log;
    write(`${mark} Error: ${error.message}`);
    return { ok: false, required };
  }
}

async function formatWpError(response) {
  const parts = [`HTTP ${response.status} ${response.statusText}`];
  const body = await readWpErrorBody(response);

  if (isWpErrorResponse(body)) {
    parts.push(body.code, body.message);
    if (body.data?.status) parts.push(`data.status=${body.data.status}`);
  } else if (typeof body === 'string' && body.trim()) {
    parts.push(body.trim());
  }

  return parts.join(' - ');
}

async function readWpErrorBody(response) {
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

function isWpErrorResponse(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.code === 'string' &&
      typeof value.message === 'string'
  );
}

async function runTests() {
  console.log('=============================================');
  console.log(' WordPress REST API Connectivity Test');
  console.log('=============================================');
  console.log(`Base URL: ${API_BASE_URL}`);

  let passed = 0;
  let requiredFailed = 0;
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.name, endpoint.path, endpoint.required);
    if (result.ok) {
      passed++;
    } else if (result.required) {
      requiredFailed++;
    }
  }

  console.log('\n=============================================');
  if (requiredFailed === 0) {
    console.log('🎉 Required API tests passed.');
  } else {
    console.log(`⚠️  ${passed}/${endpoints.length} tests passed. Required failures: ${requiredFailed}.`);
    process.exitCode = 1;
  }
  console.log('=============================================');
}

runTests();
