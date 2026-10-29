#!/usr/bin/env node
/**
 * 通用正式環境發佈打包腳本（零外部依賴，僅使用 Node.js 內建模組與 git、tar）。
 *
 * 流程：
 *   1. 前置檢查：執行設定檔 lint 指令（失敗即中止）
 *   2. 取得快照：`git stash create` 取得含已追蹤修改的暫時 tree（無修改則用 HEAD）
 *   3. 導出：`git archive --worktree-attributes` 依 .gitattributes (export-ignore) 產出 ZIP
 *   4. 審核：列出壓縮包條目，比對禁則清單；有洩漏就刪除壓縮包並失敗
 *
 * 專案差異全部放在設定檔（預設 repo 根目錄的 release.config.json），腳本本身不含專案專屬內容。
 * 用法：node scripts/pack-release.mjs [--dry-run] [--out <路徑>] [--name <名稱>] [--config <路徑>] [--skip-lint] [--force] [--help]
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';

const HELP = [
  '用法: node scripts/pack-release.mjs [選項]',
  '',
  '選項:',
  '  --dry-run, -n     只預覽納入清單與審核結果，不留下 .zip',
  '  --out <path>      輸出 .zip 路徑（預設 <outDir>/<name>-<version>-<YYYYMMDD>.zip）',
  '  --name <slug>     檔名前綴（優先於設定檔與 package.json）',
  '  --config <path>   設定檔路徑（預設 repo 根目錄的 release.config.json，不存在就用預設值）',
  '  --skip-lint       略過前置檢查',
  '  --force           輸出檔已存在時覆寫（預設會拒絕）',
  '  --help, -h        顯示此說明',
  '',
  '結束碼: 0 成功；1 檢查、打包或審核失敗；2 參數或設定錯誤',
].join('\n');

// 預設禁則：機敏檔與 AI／開發治理檔。專案特有的路徑放設定檔的 forbiddenExtra。
const DEFAULT_FORBIDDEN = [
  String.raw`(^|/)\.env(\.(?!example$|sample$)[^/]+)?$`,
  String.raw`(^|/)(id_rsa|id_ed25519)(\.pub)?$`,
  String.raw`\.(pem|key|p12|pfx)$`,
  String.raw`^\.git(/|$)`,
  String.raw`^\.(agents|claude|cursor|codex|windsurf)(/|$)`,
  String.raw`^\.github/copilot-instructions\.md$`,
  String.raw`^(AGENTS|CLAUDE|GEMINI|MEMORY|NOTE)\.md$`,
  String.raw`^dist(/|$)`,
];

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { dryRun: false, skipLint: false, force: false, help: false, out: '', name: '', config: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run' || a === '-n') out.dryRun = true;
    else if (a === '--skip-lint') out.skipLint = true;
    else if (a === '--force') out.force = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (['--out', '--name', '--config'].includes(a)) {
      if (!argv[i + 1]) fail(`${a} 需要值\n\n${HELP}`, 2);
      out[a.slice(2)] = argv[++i];
    } else fail(`未知選項：${a}\n\n${HELP}`, 2);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(HELP);
  process.exit(0);
}

function git(gitArgs, opts = {}) {
  return spawnSync('git', gitArgs, { encoding: 'utf8', ...opts });
}

const top = git(['rev-parse', '--show-toplevel']);
if (top.status !== 0) fail('不在 git 儲存庫內，無法打包。', 2);
const repoRoot = resolve(String(top.stdout).trim());

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return fail(`${label} 不是合法 JSON：${path}\n${error.message}`, 2);
  }
}

const configPath = args.config ? resolve(process.cwd(), args.config) : join(repoRoot, 'release.config.json');
if (args.config && !existsSync(configPath)) fail(`找不到設定檔：${configPath}`, 2);
const config = existsSync(configPath) ? readJson(configPath, '設定檔') : {};

function detectName() {
  if (args.name) return args.name;
  if (config.name) return String(config.name);
  const pkgPath = join(repoRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = readJson(pkgPath, 'package.json');
    if (pkg.name) return String(pkg.name).replace(/^@[^/]+\//, '');
  }
  return basename(repoRoot).replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function detectVersion() {
  const v = config.version;
  if (v && v.file && v.regex) {
    const file = join(repoRoot, v.file);
    if (!existsSync(file)) fail(`設定檔指定的版本檔不存在：${v.file}`, 2);
    let match;
    try {
      match = readFileSync(file, 'utf8').match(new RegExp(v.regex));
    } catch (error) {
      return fail(`version.regex 不合法：${error.message}`, 2);
    }
    if (!match || !match[1]) fail(`在 ${v.file} 找不到版本（version.regex 需有一個擷取群組）`, 2);
    return `v${match[1].replace(/^v/i, '')}`;
  }
  const pkgPath = join(repoRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = readJson(pkgPath, 'package.json');
    if (pkg.version) return `v${String(pkg.version).replace(/^v/i, '')}`;
  }
  const verFile = join(repoRoot, 'VERSION');
  if (existsSync(verFile)) {
    const text = readFileSync(verFile, 'utf8').trim();
    if (text) return `v${text.replace(/^v/i, '')}`;
  }
  console.error('警告：找不到版本來源（release.config.json、package.json、VERSION），檔名使用 unversioned。');
  return 'unversioned';
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function buildForbidden() {
  const sources = [...DEFAULT_FORBIDDEN, ...(Array.isArray(config.forbiddenExtra) ? config.forbiddenExtra : [])];
  return sources.map((s) => {
    try {
      return new RegExp(s, 'i');
    } catch (error) {
      return fail(`禁則不是合法正規表示式：${s}\n${error.message}`, 2);
    }
  });
}

// 以 git archive 的 tar 格式列出條目（GNU tar 與 bsdtar 都能讀 tar；GNU tar 讀不了 zip）
function listEntries(treeRef) {
  return new Promise((resolveList, rejectList) => {
    const g = spawn('git', ['archive', '--worktree-attributes', '--format=tar', treeRef], { cwd: repoRoot });
    const t = spawn('tar', ['-tf', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    g.stderr.on('data', (d) => (err += d));
    t.stderr.on('data', (d) => (err += d));
    t.stdout.on('data', (d) => (out += d));
    g.stdout.pipe(t.stdin);
    t.stdin.on('error', () => {});
    t.on('error', (e) => rejectList(new Error(`無法執行 tar：${e.message}`)));
    g.on('error', (e) => rejectList(new Error(`無法執行 git：${e.message}`)));
    t.on('close', (code) => {
      if (code !== 0) return rejectList(new Error(`tar 列出失敗：${err.trim()}`));
      return resolveList(out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
    });
  });
}

async function main() {
  // 1. 前置檢查
  if (!args.skipLint && Array.isArray(config.lint) && config.lint.length > 0) {
    const [cmd, ...cmdArgs] = config.lint;
    const resolved = cmd === 'node' ? process.execPath : cmd;
    const lint = spawnSync(resolved, cmdArgs, { cwd: repoRoot, encoding: 'utf8' });
    if (lint.error || lint.status !== 0) {
      fail(`前置檢查未通過，中止打包：\n${lint.stdout || ''}${lint.stderr || ''}${lint.error ? lint.error.message : ''}`);
    }
  }

  // 2. 快照（含已追蹤檔案的未提交修改，不含未追蹤檔）
  const stash = git(['stash', 'create'], { cwd: repoRoot });
  const treeRef = String(stash.stdout || '').trim() || 'HEAD';

  const outDir = config.outDir || 'dist';
  const defaultName = `${detectName()}-${detectVersion()}-${todayStr()}.zip`;
  const outPath = args.out ? resolve(process.cwd(), args.out) : join(repoRoot, outDir, defaultName);
  if (!args.dryRun && existsSync(outPath) && !args.force) {
    fail(`輸出檔已存在，不覆寫：${outPath}\n要覆寫請加 --force，或用 --out 換路徑。`);
  }
  const targetZip = args.dryRun ? join(tmpdir(), `pack-release-dryrun-${process.pid}.zip`) : outPath;
  if (!args.dryRun) mkdirSync(dirname(outPath), { recursive: true });

  try {
    // 3. 導出 ZIP
    const archive = git(['archive', '--worktree-attributes', '--format=zip', '-o', targetZip, treeRef], { cwd: repoRoot });
    if (archive.status !== 0 || !existsSync(targetZip)) fail(`git archive 失敗：${archive.stderr || archive.stdout}`);

    // 4. 審核
    const entries = await listEntries(treeRef);
    const forbidden = buildForbidden();
    const leaked = entries.filter((e) => forbidden.some((re) => re.test(e)));
    if (leaked.length > 0) {
      rmSync(targetZip, { force: true });
      fail(`打包審核失敗，已清除壓縮檔。發現不應發佈的檔案：\n${leaked.map((e) => `  ${e}`).join('\n')}`);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          ...(args.dryRun ? { dryRun: true } : {}),
          sourceRef: treeRef === 'HEAD' ? 'HEAD' : `worktree(${treeRef.slice(0, 8)})`,
          output: args.dryRun ? null : relative(repoRoot, outPath).replace(/\\/g, '/'),
          sizeMB: Number((statSync(targetZip).size / (1024 * 1024)).toFixed(2)),
          totalEntries: entries.length,
          topLevelIncluded: [...new Set(entries.map((e) => e.split('/')[0]))].sort(),
          leakedSensitiveOrDevFiles: 0,
        },
        null,
        2,
      ),
    );
  } finally {
    if (args.dryRun) rmSync(targetZip, { force: true });
  }
}

main().catch((error) => fail(`打包失敗：${error.message}`));
