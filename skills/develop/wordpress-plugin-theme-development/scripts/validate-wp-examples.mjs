#!/usr/bin/env node
/**
 * 驗證 bundled examples 具有可學習的基本結構與安全訊號。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examplesRoot = join(skillRoot, 'examples');

const requiredPaths = [
  'plugin-oop-basic/plugin-oop-basic.php',
  'plugin-oop-basic/includes/Plugin.php',
  'plugin-oop-basic/includes/Admin_Settings.php',
  'plugin-rest-ajax-secure/plugin-rest-ajax-secure.php',
  'plugin-rest-ajax-secure/includes/Rest_Controller.php',
  'plugin-rest-ajax-secure/includes/Ajax_Controller.php',
  'theme-block-basic/style.css',
  'theme-block-basic/functions.php',
  'theme-block-basic/theme.json',
  'theme-block-basic/templates/index.html',
  'block-dynamic-basic/block.json',
  'block-dynamic-basic/render.php',
  'content-setup-plugin/content-setup-plugin.php',
  'content-setup-plugin/includes/Content_Setup.php',
  'architecture-manifests/plugin-basic.json',
  'architecture-manifests/theme-basic.json',
  'architecture-manifests/hook-map.json',
  'architecture-manifests/dependency-map.json',
  'architecture-manifests/review-report.json',
  'architecture-manifests/content-setup.json',
];
const unfinishedMarker = 'TO' + 'DO';
const unfinishedPattern = new RegExp(`${unfinishedMarker}|\\[${unfinishedMarker}`);

function walkFiles(root) {
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  walk(root);
  return files;
}

const issues = [];
for (const relPath of requiredPaths) {
  const fullPath = join(examplesRoot, relPath);
  if (!existsSync(fullPath)) {
    issues.push(`缺少範例檔案：${relPath}`);
  } else if (readFileSync(fullPath, 'utf8').trim().length === 0) {
    issues.push(`範例檔案是空的：${relPath}`);
  }
}

for (const file of walkFiles(examplesRoot)) {
  const content = readFileSync(file, 'utf8');
  const rel = file.replace(examplesRoot, '').replace(/^[/\\]/, '');
  if (unfinishedPattern.test(content)) {
    issues.push(`範例不可包含未完成佔位內容：${rel}`);
  }
}

const combinedPhp = walkFiles(examplesRoot)
  .filter((file) => file.endsWith('.php'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

for (const requiredSignal of ['current_user_can', 'wp_verify_nonce', 'check_ajax_referer', 'sanitize_text_field', 'esc_html', 'permission_callback', 'register_activation_hook']) {
  if (!combinedPhp.includes(requiredSignal)) {
    issues.push(`PHP examples 缺少安全或架構訊號：${requiredSignal}`);
  }
}

if (issues.length > 0) {
  console.error('Examples 驗證失敗：');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('Examples 驗證通過。');
