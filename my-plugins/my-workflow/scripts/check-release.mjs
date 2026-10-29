#!/usr/bin/env node
/**
 * my-workflow 發布前檢查（唯讀，零依賴）。
 *
 * 檢查：
 *   1. 版本號一致：以 pack.yaml 為準，比對所有寫版本的地方
 *   2. 會漏傳的檔案：plugin 目錄裡被 .gitignore 擋掉的檔（本機有、push 後沒有）與尚未 git add 的檔
 *   3. claude plugin validate（plugin 與 repo 根的 marketplace；沒有 claude 指令就略過）
 *   4. --remote：比對 origin/main 上的版本，確認使用者會拿到哪一版
 *
 * 用法：node my-plugins/my-workflow/scripts/check-release.mjs [--remote] [--help]
 * 結束碼：0 通過；1 有錯；2 參數錯誤
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(pluginRoot, '..', '..');

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log('用法: node my-plugins/my-workflow/scripts/check-release.mjs [--remote]\n\n  --remote  另外比對 origin/main 的版本（會先 git fetch origin main）\n\n唯讀；結束碼 0 通過、1 有錯、2 參數錯誤。');
  process.exit(0);
}
const unknown = argv.filter((a) => a !== '--remote');
if (unknown.length > 0) {
  console.error(`未知選項：${unknown.join(' ')}`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const ok = [];

function read(rel) {
  const p = join(repoRoot, rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
}

// 1. 版本號一致
const pack = read('my-plugins/my-workflow/pack.yaml');
const version = pack && (pack.match(/^version:\s*(\S+)/m) || [])[1];
if (!version) {
  errors.push('pack.yaml 讀不到 version');
} else {
  const checks = [
    ['my-plugins/my-workflow/.claude-plugin/plugin.json', (t) => JSON.parse(t).version],
    ['my-plugins/my-workflow/plugin.json', (t) => JSON.parse(t).version],
    ['my-plugins/my-workflow/references/index.yaml', (t) => (t.match(/^version:\s*(\S+)/m) || [])[1]],
    ['project.json', (t) => JSON.parse(t).version],
    ['my-plugins/my-workflow/AGENTS.md', (t) => (t.match(/\*\*版本\*\*：`([^`]+)`/) || [])[1]],
    ['my-plugins/my-workflow/README.md', (t) => (t.match(/版本 `([^`]+)`/) || [])[1]],
    ['README.md', (t) => (t.match(/badge\/version-([0-9.]+)-/) || [])[1]],
  ];
  for (const [rel, get] of checks) {
    const text = read(rel);
    let found;
    try {
      found = text === null ? undefined : get(text);
    } catch (error) {
      errors.push(`${rel} 解析失敗：${error.message}`);
      continue;
    }
    if (found === undefined) errors.push(`${rel} 找不到版本號`);
    else if (found !== version) errors.push(`${rel} 版本是 ${found}，pack.yaml 是 ${version}`);
  }
  if (!errors.some((e) => e.includes('版本'))) ok.push(`版本號一致：${version}（8 處）`);
}

// 2. 會漏傳的檔案
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.isFile()) out.push(relative(repoRoot, full).replace(/\\/g, '/'));
  }
  return out;
}
const files = walk(pluginRoot);
const ignored = spawnSync('git', ['check-ignore', '--stdin'], { cwd: repoRoot, input: files.join('\n'), encoding: 'utf8' });
const ignoredFiles = String(ignored.stdout || '').split(/\r?\n/).filter(Boolean);
if (ignoredFiles.length > 0) {
  errors.push(`以下檔案被 .gitignore 擋住，push 後使用者拿不到（在 .gitignore 加 ! 例外）：\n${ignoredFiles.map((f) => `    ${f}`).join('\n')}`);
} else ok.push('plugin 內沒有被 .gitignore 擋掉的檔案');
const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'my-plugins/my-workflow'], { cwd: repoRoot, encoding: 'utf8' });
const untrackedFiles = String(untracked.stdout || '').split(/\r?\n/).filter(Boolean);
if (untrackedFiles.length > 0) warnings.push(`以下檔案還沒 git add：\n${untrackedFiles.map((f) => `    ${f}`).join('\n')}`);

// 3. claude plugin validate
const probe = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (probe.error || probe.status !== 0) {
  warnings.push('找不到 claude 指令，略過 claude plugin validate');
} else {
  for (const target of ['./my-plugins/my-workflow', '.']) {
    const v = spawnSync('claude', ['plugin', 'validate', target], { cwd: repoRoot, encoding: 'utf8' });
    const out = `${v.stdout || ''}${v.stderr || ''}`;
    if (v.status !== 0 || /Validation failed/i.test(out)) errors.push(`claude plugin validate ${target} 失敗：\n${out.trim()}`);
    else ok.push(`claude plugin validate ${target} 通過`);
  }
}

// 4. 遠端 main
if (argv.includes('--remote')) {
  spawnSync('git', ['fetch', '-q', 'origin', 'main'], { cwd: repoRoot });
  const remote = spawnSync('git', ['show', 'origin/main:my-plugins/my-workflow/.claude-plugin/plugin.json'], { cwd: repoRoot, encoding: 'utf8' });
  if (remote.status !== 0) warnings.push('讀不到 origin/main 的 plugin.json');
  else {
    const mainVersion = JSON.parse(remote.stdout).version;
    if (mainVersion === version) ok.push(`origin/main 已是 ${mainVersion}，使用者更新會拿到這版`);
    else warnings.push(`origin/main 是 ${mainVersion}，本機是 ${version}：合併到 main 前使用者拿不到新版`);
  }
}

for (const m of ok) console.log(`✓ ${m}`);
for (const m of warnings) console.log(`! ${m}`);
for (const m of errors) console.log(`✗ ${m}`);
console.log(errors.length ? `\n未通過：${errors.length} 個錯誤` : '\n通過');
process.exit(errors.length ? 1 : 0);
