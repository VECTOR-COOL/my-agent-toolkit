#!/usr/bin/env node
/**
 * 掃描 WordPress 專案或範例中的常見安全、hook、REST 與效能風險。
 * 這不是 PHPCS 的替代品；目標是讓 agent 快速抓出高風險模式。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const allowedExtensions = new Set(['.php', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.html']);
const ignoredDirs = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build']);

function parseArgs(argv) {
  const args = { root: process.cwd(), format: 'text' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') {
      args.root = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--format') {
      args.format = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function listFiles(root) {
  const files = [];
  function walk(current) {
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          walk(fullPath);
        }
        continue;
      }
      if (entry.isFile() && allowedExtensions.has(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  walk(root);
  return files;
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function addFinding(findings, severity, file, line, rule, message) {
  findings.push({ severity, file, line, rule, message });
}

function auditFile(file, root, findings) {
  const content = readFileSync(file, 'utf8');
  const rel = file.replace(root, '').replace(/^[/\\]/, '');

  for (const match of content.matchAll(/register_rest_route\s*\(/g)) {
    const snippet = content.slice(match.index, match.index + 900);
    if (!snippet.includes('permission_callback')) {
      addFinding(findings, 'high', rel, lineNumber(content, match.index), 'rest-permission-callback', 'REST route 可能缺少 permission_callback。');
    }
  }

  for (const match of content.matchAll(/wp_ajax(?:_nopriv)?_[a-zA-Z0-9_]+/g)) {
    const nearby = content.slice(Math.max(0, match.index - 800), match.index + 1600);
    if (!nearby.includes('check_ajax_referer')) {
      addFinding(findings, 'high', rel, lineNumber(content, match.index), 'ajax-nonce', 'AJAX handler 可能缺少 check_ajax_referer()。');
    }
    if (!nearby.includes('current_user_can') && !match[0].startsWith('wp_ajax_nopriv_')) {
      addFinding(findings, 'medium', rel, lineNumber(content, match.index), 'ajax-capability', '登入 AJAX handler 可能缺少 current_user_can()。');
    }
  }

  if (/\$wpdb->(?:query|get_results|get_row|get_var)\s*\(/.test(content) && !content.includes('$wpdb->prepare')) {
    addFinding(findings, 'high', rel, 1, 'wpdb-prepare', '直接 SQL 可能缺少 $wpdb->prepare()。');
  }

  for (const match of content.matchAll(/posts_per_page\s*['"]?\s*=>\s*-1/g)) {
    addFinding(findings, 'medium', rel, lineNumber(content, match.index), 'unbounded-query', 'production code 不應使用 posts_per_page => -1。');
  }

  for (const match of content.matchAll(/\beval\s*\(/g)) {
    addFinding(findings, 'high', rel, lineNumber(content, match.index), 'eval', '不可使用 eval()。');
  }

  for (const match of content.matchAll(/wp_enqueue_(?:script|style)\s*\([^)]*https?:\/\//g)) {
    addFinding(findings, 'medium', rel, lineNumber(content, match.index), 'remote-asset', '遠端 asset 需要明確來源、隱私與完整性策略。');
  }

  for (const match of content.matchAll(/\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*['"][^'"]{8,}/gi)) {
    addFinding(findings, 'high', rel, lineNumber(content, match.index), 'hardcoded-secret', '疑似 hardcoded secret。');
  }
}

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root);
if (!statSync(root).isDirectory()) {
  console.error(`不是目錄：${root}`);
  process.exit(2);
}

const findings = [];
for (const file of listFiles(root)) {
  auditFile(file, root, findings);
}

if (args.format === 'json') {
  console.log(JSON.stringify({ root, findings }, null, 2));
} else if (findings.length === 0) {
  console.log(`WordPress pattern audit 通過：${root}`);
} else {
  console.log(`WordPress pattern audit 發現 ${findings.length} 個項目：`);
  for (const finding of findings) {
    console.log(`[${finding.severity}] ${finding.file}:${finding.line} ${finding.rule} - ${finding.message}`);
  }
}

process.exit(findings.some((finding) => finding.severity === 'high') ? 1 : 0);
