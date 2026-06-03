#!/usr/bin/env node
/**
 * 執行 WordPress skill 的本地自檢。
 */
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;

const checks = [
  ['validate examples', ['scripts/validate-wp-examples.mjs']],
  ['validate plugin manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/plugin-basic.json', '--schema', 'plugin']],
  ['validate plugin oop example manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/plugin-oop-basic/architecture.json', '--schema', 'plugin']],
  ['validate rest ajax example manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/plugin-rest-ajax-secure/architecture.json', '--schema', 'plugin']],
  ['validate content setup example manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/content-setup-plugin/architecture.json', '--schema', 'plugin']],
  ['validate theme manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/theme-basic.json', '--schema', 'theme']],
  ['validate theme example manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/theme-block-basic/architecture.json', '--schema', 'theme']],
  ['validate hook manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/hook-map.json', '--schema', 'hook']],
  ['validate dependency manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/dependency-map.json', '--schema', 'dependency']],
  ['validate review manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/review-report.json', '--schema', 'review']],
  ['validate content setup manifest', ['scripts/validate-wp-architecture-manifest.mjs', '--file', 'examples/architecture-manifests/content-setup.json', '--schema', 'content']],
  ['audit examples', ['scripts/audit-wp-code-patterns.mjs', '--root', 'examples']],
];

let failed = false;
for (const [label, args] of checks) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(node, args.map((arg) => (arg.endsWith('.mjs') ? join(skillRoot, arg) : arg)), {
    cwd: skillRoot,
    encoding: 'utf8',
  });
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    failed = true;
    console.error(`檢查失敗：${label}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log('\nWordPress skill 自檢全部通過。');
