#!/usr/bin/env node

/**
 * Run local WordPress REST API development checks.
 *
 * Usage:
 *   node scripts/run-wordpress-rest-api-tests.mjs
 *   WP_LIVE_API_TEST=1 node scripts/run-wordpress-rest-api-tests.mjs
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const checks = [
  ['Schema examples', 'validate-skill-schemas.mjs', []],
];

if (process.env.WP_PROJECT_ROOT) {
  checks.push(['Lovable project audit', 'audit-lovable-wp-project.mjs', ['--root', process.env.WP_PROJECT_ROOT]]);
}

if (process.env.WP_RESPONSE_FILE && process.env.WP_RESPONSE_TYPE) {
  checks.push([
    'Response fixture shape',
    'validate-wp-response-shape.mjs',
    ['--type', process.env.WP_RESPONSE_TYPE, '--file', process.env.WP_RESPONSE_FILE],
  ]);
}

if (process.env.WP_RESPONSE_URL && process.env.WP_RESPONSE_TYPE) {
  checks.push([
    'Live response shape',
    'validate-wp-response-shape.mjs',
    ['--type', process.env.WP_RESPONSE_TYPE, '--url', process.env.WP_RESPONSE_URL],
  ]);
}

if (process.env.WP_LIVE_API_TEST === '1') {
  checks.push(['Live API connectivity', 'test-wordpress-api.mjs', []]);
}

let failed = 0;

for (const [name, script, args] of checks) {
  console.log(`\n== ${name} ==`);
  const code = await run(process.execPath, [path.join(scriptsDir, script), ...args]);
  if (code !== 0) failed++;
}

if (failed > 0) {
  console.error(`\nERROR: ${failed}/${checks.length} check(s) failed.`);
  process.exit(1);
}

console.log(`\nOK: ${checks.length} check(s) passed.`);

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', env: process.env });
    child.on('close', resolve);
    child.on('error', (error) => {
      console.error(error.message);
      resolve(1);
    });
  });
}
