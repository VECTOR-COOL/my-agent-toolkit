#!/usr/bin/env node
/**
 * 通用正式環境發佈打包腳本（零外部依賴，僅使用 Node.js 內建模組與 git、tar）。
 *
 * 模式：
 *   完整發佈包（預設）  依 .gitattributes (export-ignore) 打包整個專案
 *   增量更新檔（--since）只打包自指定 ref 以來「新增與修改」的發佈檔，並產出 CHANGES.txt
 *                        列出刪除項目（解壓覆蓋不會刪檔，需在正式機手動移除）
 *
 * 流程：前置檢查 → 工作區狀態檢查 → git stash create 快照 → git archive → 審核（檔名禁則 + 內容掃描）→ sha256
 * 專案差異全放設定檔（預設 repo 根目錄 release.config.json），腳本不含專案專屬內容。
 */

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';

const HELP = [
  '用法: node scripts/pack-release.mjs [選項]',
  '',
  '選項:',
  '  --dry-run, -n       只預覽與審核，不留下 .zip / .sha256 / CHANGES.txt',
  '  --since <ref>       增量更新檔：只打包自 <ref>（tag、commit、分支）以來新增與修改的發佈檔',
  '  --out <path>        輸出 .zip 路徑（預設 <outDir>/<name>-<version>-<YYYYMMDD>[-patch-<ref>].zip）',
  '  --name <slug>       檔名前綴（優先於設定檔與 package.json）',
  '  --config <path>     設定檔（預設 repo 根目錄 release.config.json，不存在就用預設值）',
  '  --strict            有未追蹤檔（不在快照內）就失敗，而不只是警告',
  '  --require-clean     工作區有任何未提交修改或未追蹤檔就失敗',
  '  --skip-lint         略過前置檢查',
  '  --no-checksum       不產生 .sha256',
  '  --force             輸出檔已存在時覆寫（預設拒絕）',
  '  --help, -h          顯示此說明',
  '',
  '結束碼: 0 成功；1 檢查、打包或審核失敗；2 參數或設定錯誤',
].join('\n');

// 預設禁則（檔名）：機敏檔與 AI／開發治理檔。專案特有的放設定檔 forbiddenExtra，要放行的放 forbiddenRemove。
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

// 內容掃描：高信心樣式命中就失敗；啟發式樣式只警告。
const SECRET_PATTERNS = [
  { rule: '私鑰區塊', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/ },
  { rule: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { rule: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { rule: 'Anthropic／OpenAI 金鑰', re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{32,}\b/ },
  { rule: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
];
const HEURISTIC_PATTERNS = [
  { rule: '疑似寫死的密碼或金鑰', re: /(?:password|passwd|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"\s$<{][^'"\s]{7,}['"]/i },
];
const SCAN_SKIP = /\.(example|sample|dist|template)$/i;
const SCAN_MAX_BYTES = 1024 * 1024;

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { dryRun: false, skipLint: false, force: false, strict: false, requireClean: false, noChecksum: false, help: false, out: '', name: '', config: '', since: '' };
  const withValue = ['--out', '--name', '--config', '--since'];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run' || a === '-n') out.dryRun = true;
    else if (a === '--skip-lint') out.skipLint = true;
    else if (a === '--force') out.force = true;
    else if (a === '--strict') out.strict = true;
    else if (a === '--require-clean') out.requireClean = true;
    else if (a === '--no-checksum') out.noChecksum = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (withValue.includes(a)) {
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
  return spawnSync('git', gitArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
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

// 占位目錄：內容不發佈（如上傳圖檔 img/），但目錄本身要存在。以 git archive --add-virtual-file 放入空的 .gitkeep。
function readPlaceholders() {
  const list = Array.isArray(config.placeholders) ? config.placeholders : [];
  return list.map((raw) => {
    const dir = String(raw).replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
    if (!dir || dir.startsWith('/') || /^[a-zA-Z]:/.test(dir) || dir.split('/').includes('..') || dir.includes(':')) {
      return fail(`placeholders 路徑不合法（要是 repo 內的相對目錄）：${raw}`, 2);
    }
    return `${dir}/.gitkeep`;
  });
}

function buildForbidden() {
  const remove = Array.isArray(config.forbiddenRemove) ? config.forbiddenRemove : [];
  const base = DEFAULT_FORBIDDEN.filter((s) => !remove.some((r) => s.includes(r)));
  const sources = [...base, ...(Array.isArray(config.forbiddenExtra) ? config.forbiddenExtra : [])];
  return sources.map((s) => {
    try {
      return new RegExp(s, 'i');
    } catch (error) {
      return fail(`禁則不是合法正規表示式：${s}\n${error.message}`, 2);
    }
  });
}

// 內容掃描需要解開檔案：把 git archive 的 tar 輸出交給 tar（GNU tar 與 bsdtar 都能讀 tar；zip 只有 bsdtar 能讀，所以不用 tar 讀 zip）
function archiveTar(treeRef, pathspecs, virtualFiles = []) {
  const gitArgs = ['--literal-pathspecs', 'archive', '--worktree-attributes', '--format=tar', ...virtualFiles.map((f) => `--add-virtual-file=${f}:`), treeRef];
  if (pathspecs && pathspecs.length > 0) gitArgs.push('--', ...pathspecs);
  return spawn('git', gitArgs, { cwd: repoRoot });
}

function pipeToTar(treeRef, pathspecs, tarArgs, collectStdout) {
  return new Promise((resolveRun, rejectRun) => {
    const g = archiveTar(treeRef, pathspecs);
    const t = spawn('tar', tarArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    g.stderr.on('data', (d) => (err += d));
    t.stderr.on('data', (d) => (err += d));
    if (collectStdout) t.stdout.on('data', (d) => (out += d));
    else t.stdout.resume();
    g.stdout.pipe(t.stdin);
    t.stdin.on('error', () => {});
    t.on('error', (e) => rejectRun(new Error(`無法執行 tar：${e.message}`)));
    g.on('error', (e) => rejectRun(new Error(`無法執行 git：${e.message}`)));
    t.on('close', (code) => (code === 0 ? resolveRun(out) : rejectRun(new Error(`tar 失敗：${err.trim()}`))));
  });
}

// 直接解析 git archive 的 tar 標頭取檔名：不依賴 tar -t 的顯示格式（GNU tar 會把非 ASCII 檔名跳脫成八進位）
function readTarNames(stream) {
  return new Promise((resolveNames, rejectNames) => {
    const names = [];
    let pending = Buffer.alloc(0);
    let skip = 0; // 還要略過的資料位元組
    let collect = null; // { type, size, padded } 需要讀完整內容的擴充標頭
    let paxPath = null;
    let longName = null;
    let done = false;
    const cstr = (buf) => {
      const end = buf.indexOf(0);
      return buf.subarray(0, end === -1 ? buf.length : end).toString('utf8');
    };
    const parsePax = (data) => {
      let i = 0;
      while (i < data.length) {
        const sp = data.indexOf(0x20, i);
        if (sp === -1) break;
        const len = parseInt(data.subarray(i, sp).toString('utf8'), 10);
        if (!Number.isFinite(len) || len <= 0) break;
        const rec = data.subarray(sp + 1, i + len - 1).toString('utf8');
        const eq = rec.indexOf('=');
        if (eq > 0 && rec.slice(0, eq) === 'path') paxPath = rec.slice(eq + 1);
        i += len;
      }
    };
    const pump = () => {
      for (;;) {
        if (done) return;
        if (skip > 0) {
          const n = Math.min(skip, pending.length);
          pending = pending.subarray(n);
          skip -= n;
          if (skip > 0) return;
        }
        if (collect) {
          if (pending.length < collect.padded) return;
          const data = pending.subarray(0, collect.size);
          pending = pending.subarray(collect.padded);
          if (collect.type === 'x') parsePax(data);
          else longName = cstr(data);
          collect = null;
          continue;
        }
        if (pending.length < 512) return;
        const h = pending.subarray(0, 512);
        pending = pending.subarray(512);
        if (h.every((x) => x === 0)) {
          done = true;
          return;
        }
        const type = String.fromCharCode(h[156] || 48);
        const size = parseInt(cstr(h.subarray(124, 136)).trim() || '0', 8);
        const padded = Math.ceil(size / 512) * 512;
        if (type === 'x' || type === 'L') {
          collect = { type, size, padded };
          continue;
        }
        if (type === 'g') {
          skip = padded;
          continue;
        }
        const prefix = cstr(h.subarray(345, 500));
        let name = longName ?? paxPath ?? (prefix ? `${prefix}/${cstr(h.subarray(0, 100))}` : cstr(h.subarray(0, 100)));
        longName = null;
        paxPath = null;
        if (type !== '5' && !name.endsWith('/')) names.push(name);
        skip = padded;
      }
    };
    stream.on('data', (chunk) => {
      pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
      pump();
    });
    stream.on('end', () => resolveNames(names));
    stream.on('error', rejectNames);
  });
}

async function listFiles(treeRef, pathspecs, virtualFiles = []) {
  const g = archiveTar(treeRef, pathspecs, virtualFiles);
  let err = '';
  g.stderr.on('data', (d) => (err += d));
  const exited = new Promise((resolveExit, rejectExit) => {
    g.on('error', (e) => rejectExit(new Error(`無法執行 git：${e.message}`)));
    g.on('close', (code) => (code === 0 ? resolveExit() : rejectExit(new Error(`git archive 失敗：${err.trim()}`))));
  });
  const [names] = await Promise.all([readTarNames(g.stdout), exited]);
  return names;
}

function walk(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, base));
    else if (entry.isFile()) files.push(relative(base, full).replace(/\\/g, '/'));
  }
  return files;
}

async function scanContents(treeRef, pathspecs) {
  const scan = config.contentScan || {};
  if (scan.enabled === false) return { errors: [], warnings: [], skipped: true };
  const allow = (Array.isArray(scan.allow) ? scan.allow : []).map((s) => new RegExp(s, 'i'));
  const tmp = mkdtempSync(join(tmpdir(), 'pack-release-scan-'));
  const errors = [];
  const warnings = [];
  try {
    await pipeToTar(treeRef, pathspecs, ['-xf', '-', '-C', tmp], false);
    for (const rel of walk(tmp)) {
      if (SCAN_SKIP.test(rel) || allow.some((re) => re.test(rel))) continue;
      const full = join(tmp, rel);
      if (statSync(full).size > SCAN_MAX_BYTES) continue;
      const buf = readFileSync(full);
      if (buf.includes(0)) continue; // 二進位
      const text = buf.toString('utf8');
      for (const p of SECRET_PATTERNS) if (p.re.test(text)) errors.push(`${rel}（${p.rule}）`);
      for (const p of HEURISTIC_PATTERNS) if (p.re.test(text)) warnings.push(`${rel}（${p.rule}）`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return { errors, warnings, skipped: false };
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function workspaceState() {
  const status = git(['status', '--porcelain=v1', '-uall'], { cwd: repoRoot });
  const lines = String(status.stdout || '').split(/\r?\n/).filter(Boolean);
  const untracked = lines.filter((l) => l.startsWith('?? ')).map((l) => l.slice(3));
  const modified = lines.filter((l) => !l.startsWith('?? ')).map((l) => l.slice(3));
  return { untracked, modified };
}

function parseNameStatus(raw) {
  const parts = String(raw).split('\0').filter(Boolean);
  const items = [];
  for (let i = 0; i + 1 < parts.length; i += 2) items.push({ status: parts[i][0], path: parts[i + 1] });
  return items;
}

async function main() {
  // 1. 前置檢查
  if (!args.skipLint && Array.isArray(config.lint) && config.lint.length > 0) {
    const [cmd, ...cmdArgs] = config.lint;
    const lint = spawnSync(cmd === 'node' ? process.execPath : cmd, cmdArgs, { cwd: repoRoot, encoding: 'utf8' });
    if (lint.error || lint.status !== 0) {
      fail(`前置檢查未通過，中止打包：\n${lint.stdout || ''}${lint.stderr || ''}${lint.error ? lint.error.message : ''}`);
    }
  }

  // 2. 工作區狀態：未追蹤檔不在快照內；未提交修改會被包進去
  const { untracked, modified } = workspaceState();
  if ((args.requireClean || config.requireClean) && (untracked.length > 0 || modified.length > 0)) {
    fail(`--require-clean：工作區不乾淨（未提交修改 ${modified.length}、未追蹤 ${untracked.length}）。先 commit 或清理。`);
  }
  if (untracked.length > 0) {
    const shown = untracked.slice(0, 20).map((p) => `  ${p}`).join('\n');
    const msg = `警告：${untracked.length} 個未追蹤檔不會進發佈包（要納入請先 git add）：\n${shown}${untracked.length > 20 ? '\n  …' : ''}`;
    if (args.strict || config.strict) fail(msg.replace('警告：', '--strict：'));
    console.error(msg);
  }

  // 3. 快照
  const stash = git(['stash', 'create'], { cwd: repoRoot });
  const treeRef = String(stash.stdout || '').trim() || 'HEAD';

  // 4. 決定打包內容（完整或增量）
  let pathspecs = [];
  let changes = null;
  let sinceSha = '';
  if (args.since) {
    const rev = git(['rev-parse', '--verify', `${args.since}^{commit}`], { cwd: repoRoot });
    if (rev.status !== 0) fail(`--since 找不到 ref：${args.since}`, 2);
    sinceSha = String(rev.stdout).trim();
    const [oldFiles, newFiles] = await Promise.all([listFiles(sinceSha), listFiles(treeRef)]);
    const oldSet = new Set(oldFiles);
    const newSet = new Set(newFiles);
    const diff = git(['-c', 'core.quotepath=false', 'diff', '--name-status', '--no-renames', '-z', sinceSha, treeRef], { cwd: repoRoot });
    const touched = new Set(parseNameStatus(diff.stdout).filter((i) => i.status !== 'D').map((i) => i.path));
    // 新進發佈範圍（原本被 export-ignore、現在放行）也算新增
    const changed = newFiles.filter((p) => touched.has(p) || !oldSet.has(p));
    changes = {
      added: changed.filter((p) => !oldSet.has(p)).sort(),
      modified: changed.filter((p) => oldSet.has(p)).sort(),
      deleted: oldFiles.filter((p) => !newSet.has(p)).sort(),
    };
    pathspecs = changed;
    if (changed.length === 0 && changes.deleted.length === 0) fail(`自 ${args.since} 以來發佈範圍內沒有變更，不需要更新檔。`);
    if (pathspecs.join('').length > 100000) fail('變更檔案過多，超出命令列長度限制；請改打完整發佈包。');
  }

  // 占位目錄：完整包補上缺的；更新檔只補「上一版發佈包裡沒有」的（正式機已有的目錄不重複放）
  const placeholderFiles = readPlaceholders();
  let virtualFiles = [];
  let placeholdersToCreate = [];
  if (placeholderFiles.length > 0) {
    const current = new Set(await listFiles(treeRef, pathspecs));
    const missing = placeholderFiles.filter((f) => !current.has(f));
    if (args.since) {
      const prior = await listFiles(sinceSha);
      const newDirs = missing.filter((f) => {
        const dir = f.slice(0, -'/.gitkeep'.length);
        return !prior.some((p) => p === f || p.startsWith(`${dir}/`));
      });
      if (pathspecs.length > 0) virtualFiles = newDirs;
      else placeholdersToCreate = newDirs.map((f) => f.slice(0, -'/.gitkeep'.length));
    } else {
      virtualFiles = missing;
    }
  }

  const outDir = config.outDir || 'dist';
  const patchSuffix = args.since ? `-patch-${sinceSha.slice(0, 7)}` : '';
  const defaultName = `${detectName()}-${detectVersion()}-${todayStr()}${patchSuffix}.zip`;
  const outPath = args.out ? resolve(process.cwd(), args.out) : join(repoRoot, outDir, defaultName);
  const sidecars = [`${outPath}.sha256`, outPath.replace(/\.zip$/i, '') + '.CHANGES.txt'];
  if (!args.dryRun) {
    const exists = [outPath, ...sidecars].filter((p) => existsSync(p));
    if (exists.length > 0 && !args.force) fail(`輸出檔已存在，不覆寫：\n${exists.map((p) => `  ${p}`).join('\n')}\n要覆寫請加 --force，或用 --out 換路徑。`);
    mkdirSync(dirname(outPath), { recursive: true });
  }
  const targetZip = args.dryRun ? join(tmpdir(), `pack-release-dryrun-${process.pid}.zip`) : outPath;
  const hasZip = !args.since || pathspecs.length > 0;

  try {
    let entries = [];
    if (hasZip) {
      // 5. 導出 ZIP
      const archiveArgs = ['--literal-pathspecs', 'archive', '--worktree-attributes', '--format=zip', ...virtualFiles.map((f) => `--add-virtual-file=${f}:`), '-o', targetZip, treeRef];
      if (pathspecs.length > 0) archiveArgs.push('--', ...pathspecs);
      const archive = git(archiveArgs, { cwd: repoRoot });
      if (archive.status !== 0 || !existsSync(targetZip)) {
        const hint = virtualFiles.length && /add-virtual-file/.test(archive.stderr || '') ? '\n占位目錄需要較新的 Git（支援 --add-virtual-file）；請升級 Git，或在 repo 內提交各目錄的 .gitkeep。' : '';
        fail(`git archive 失敗：${archive.stderr || archive.stdout}${hint}`);
      }

      // 6. 審核：檔名禁則 + 內容掃描
      entries = await listFiles(treeRef, pathspecs, virtualFiles);
      const forbidden = buildForbidden();
      const placeholderSet = new Set(placeholderFiles);
      const leaked = entries.filter((e) => !placeholderSet.has(e) && forbidden.some((re) => re.test(e)));
      const content = leaked.length === 0 ? await scanContents(treeRef, pathspecs) : { errors: [], warnings: [], skipped: false };
      if (leaked.length > 0 || content.errors.length > 0) {
        rmSync(targetZip, { force: true });
        fail(
          '打包審核失敗，已清除壓縮檔。\n' +
            (leaked.length ? `不應發佈的檔案：\n${leaked.map((e) => `  ${e}`).join('\n')}\n` : '') +
            (content.errors.length ? `內容含疑似機敏資料：\n${content.errors.map((e) => `  ${e}`).join('\n')}\n` : ''),
        );
      }
      if (content.warnings.length > 0) console.error(`警告：以下檔案內容疑似寫死密碼或金鑰，請人工確認：\n${content.warnings.map((e) => `  ${e}`).join('\n')}`);
      var contentWarnings = content.warnings;
    }

    // 7. 校驗碼與變更清單
    let checksum = null;
    let changesFile = null;
    if (hasZip && !args.dryRun && !args.noChecksum) {
      checksum = `${outPath}.sha256`;
      writeFileSync(checksum, `${sha256File(outPath)}  ${basename(outPath)}\n`);
    }
    if (changes && !args.dryRun) {
      changesFile = sidecars[1];
      const block = (title, list) => `${title}（${list.length}）\n${list.length ? list.map((p) => `  ${p}`).join('\n') : '  無'}\n`;
      writeFileSync(
        changesFile,
        [
          `更新檔：${hasZip ? basename(outPath) : '（無檔案需要覆蓋）'}`,
          `基準：${args.since} (${sinceSha.slice(0, 12)})`,
          `日期：${todayStr()}`,
          '',
          block('新增', changes.added),
          block('修改', changes.modified),
          block('刪除（解壓覆蓋不會刪檔，需在正式機手動移除）', changes.deleted),
          ...(placeholdersToCreate.length ? [block('需建立的空目錄（此更新檔沒有其他檔案可附帶占位）', placeholdersToCreate)] : []),
        ].join('\n'),
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: args.since ? 'patch' : 'full',
          ...(args.dryRun ? { dryRun: true } : {}),
          ...(args.since ? { since: args.since, changes: { added: changes.added.length, modified: changes.modified.length, deleted: changes.deleted.length } } : {}),
          sourceRef: treeRef === 'HEAD' ? 'HEAD' : `worktree(${treeRef.slice(0, 8)})`,
          includesUncommittedChanges: modified.length > 0,
          untrackedNotIncluded: untracked.length,
          output: args.dryRun || !hasZip ? null : relative(repoRoot, outPath).replace(/\\/g, '/'),
          checksum: checksum ? relative(repoRoot, checksum).replace(/\\/g, '/') : null,
          changesFile: changesFile ? relative(repoRoot, changesFile).replace(/\\/g, '/') : null,
          sizeMB: hasZip ? Number((statSync(targetZip).size / (1024 * 1024)).toFixed(3)) : 0,
          totalEntries: entries.length,
          topLevelIncluded: [...new Set(entries.map((e) => e.split('/')[0]))].sort(),
          placeholdersAdded: virtualFiles.map((f) => f.slice(0, -'/.gitkeep'.length)),
          contentWarnings: typeof contentWarnings === 'undefined' ? 0 : contentWarnings.length,
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
