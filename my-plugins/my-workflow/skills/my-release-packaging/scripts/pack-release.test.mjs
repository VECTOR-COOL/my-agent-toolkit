#!/usr/bin/env node
/**
 * pack-release.mjs 的自動測試（node:test，零依賴）。
 * 執行：node --test scripts/pack-release.test.mjs
 * 每個測試建立獨立的暫存 git 儲存庫，不碰真實專案。
 */
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'pack-release.mjs');
const dirs = [];

function sh(cwd, cmd, args) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `${cmd} ${args.join(' ')} 失敗：${r.stderr}`);
  return r.stdout;
}

function makeRepo(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'pack-release-test-'));
  dirs.push(dir);
  sh(dir, 'git', ['init', '-q']);
  sh(dir, 'git', ['config', 'user.email', 't@t']);
  sh(dir, 'git', ['config', 'user.name', 't']);
  const base = {
    'app/index.php': '<?php echo 1;',
    'app/lib.php': '<?php echo 2;',
    'AGENTS.md': '# a',
    'docs/a.md': 'doc',
    '.env.example': 'KEY=',
    'package.json': '{"name":"shop","version":"2.3.4"}',
    '.gitattributes': '/docs export-ignore\n/AGENTS.md export-ignore\n/package.json export-ignore\n/.gitattributes export-ignore\n/.gitignore export-ignore\n',
    '.gitignore': 'dist/\n',
    ...files,
  };
  for (const [p, c] of Object.entries(base)) write(dir, p, c);
  sh(dir, 'git', ['add', '-A']);
  sh(dir, 'git', ['commit', '-qm', 'init']);
  return dir;
}

function write(dir, p, c) {
  const full = join(dir, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, c);
}

function run(dir, args = []) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
  let json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {}
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('完整發佈包', () => {
  it('依 export-ignore 打包，版本取自 package.json，並產生 sha256', () => {
    const dir = makeRepo();
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.json.output, /^dist\/shop-v2\.3\.4-\d{8}\.zip$/);
    assert.deepEqual(r.json.topLevelIncluded, ['.env.example', 'app']);
    assert.ok(existsSync(join(dir, r.json.checksum)));
    assert.match(readFileSync(join(dir, r.json.checksum), 'utf8'), /^[0-9a-f]{64} {2}shop-v2\.3\.4-\d{8}\.zip\n$/);
  });

  it('--dry-run 不留下任何檔案', () => {
    const dir = makeRepo();
    const r = run(dir, ['--dry-run']);
    assert.equal(r.status, 0);
    assert.equal(r.json.dryRun, true);
    assert.equal(existsSync(join(dir, 'dist')), false);
  });

  it('輸出已存在時拒絕，--force 才覆寫', () => {
    const dir = makeRepo();
    assert.equal(run(dir, ['--out', 'dist/x.zip']).status, 0);
    assert.equal(run(dir, ['--out', 'dist/x.zip']).status, 1);
    assert.equal(run(dir, ['--out', 'dist/x.zip', '--force']).status, 0);
  });

  it('版本可由設定檔的 regex 取得', () => {
    const dir = makeRepo({ 'core/v.php': "define('_VERSION','9.8.7');", 'release.config.json': JSON.stringify({ name: 'game', version: { file: 'core/v.php', regex: "_VERSION','([^']+)'" } }) });
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.json.output, /game-v9\.8\.7-/);
  });
});

describe('安全審核', () => {
  it('追蹤到未排除的機敏檔名：失敗並刪除 zip', () => {
    const dir = makeRepo({ '.env': 'SECRET=1' });
    const r = run(dir, ['--out', 'dist/leak.zip']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\.env/);
    assert.equal(existsSync(join(dir, 'dist/leak.zip')), false);
  });

  it('forbiddenExtra 可加專案特有禁則', () => {
    const dir = makeRepo({ 'app/acount.json': '{}', 'release.config.json': JSON.stringify({ forbiddenExtra: ['(^|/)acount\\.json$'] }) });
    assert.equal(run(dir).status, 1);
  });

  it('forbiddenRemove 可放行預設禁則', () => {
    const dir = makeRepo({ 'NOTE.md': 'n', 'release.config.json': JSON.stringify({ forbiddenRemove: ['AGENTS|CLAUDE'] }) });
    assert.equal(run(dir).status, 0);
  });

  it('內容含私鑰：失敗（檔名正常也擋得住）', () => {
    const dir = makeRepo({ 'app/config.php': '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----' });
    const r = run(dir);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /私鑰區塊/);
  });

  it('內容含 GitHub token：失敗', () => {
    const dir = makeRepo({ 'app/c.php': `$t = 'ghp_${'a'.repeat(36)}';` });
    assert.equal(run(dir).status, 1);
  });

  it('寫死密碼只警告，不失敗', () => {
    const dir = makeRepo({ 'app/db.php': "$password = 'hunter2hunter2';" });
    const r = run(dir);
    assert.equal(r.status, 0);
    assert.equal(r.json.contentWarnings, 1);
  });

  it('*.example 不做內容掃描', () => {
    const dir = makeRepo({ 'app/db.php.example': '-----BEGIN PRIVATE KEY-----' });
    assert.equal(run(dir).status, 0);
  });

  it('contentScan.enabled=false 可關閉內容掃描', () => {
    const dir = makeRepo({ 'app/c.php': '-----BEGIN PRIVATE KEY-----', 'release.config.json': JSON.stringify({ contentScan: { enabled: false } }) });
    assert.equal(run(dir).status, 0);
  });
});

describe('工作區狀態', () => {
  it('未追蹤檔：警告並計數；--strict 失敗', () => {
    const dir = makeRepo();
    write(dir, 'app/new.php', '<?php');
    const warn = run(dir);
    assert.equal(warn.status, 0);
    assert.equal(warn.json.untrackedNotIncluded, 1);
    assert.match(warn.stderr, /app\/new\.php/);
    assert.equal(run(dir, ['--strict', '--out', 'dist/s.zip']).status, 1);
  });

  it('--require-clean：有未提交修改就失敗', () => {
    const dir = makeRepo();
    write(dir, 'app/index.php', '<?php echo 99;');
    assert.equal(run(dir, ['--require-clean']).status, 1);
  });

  it('未提交的修改會進包並標示', () => {
    const dir = makeRepo();
    write(dir, 'app/index.php', '<?php echo 99;');
    const r = run(dir);
    assert.equal(r.json.includesUncommittedChanges, true);
  });

  it('未 commit 的 .gitattributes 立即生效', () => {
    const dir = makeRepo();
    write(dir, '.gitattributes', readFileSync(join(dir, '.gitattributes'), 'utf8') + '/app/lib.php export-ignore\n');
    sh(dir, 'git', ['add', '.gitattributes']);
    const r = run(dir, ['--dry-run']);
    assert.equal(r.status, 0);
    assert.equal(r.json.totalEntries, 2);
  });
});

describe('設定與參數', () => {
  it('lint 指令失敗：中止', () => {
    const dir = makeRepo({ 'release.config.json': JSON.stringify({ lint: ['node', '-e', 'process.exit(3)'] }) });
    assert.equal(run(dir).status, 1);
    assert.equal(run(dir, ['--skip-lint']).status, 0);
  });

  it('壞的設定檔：結束碼 2', () => {
    const dir = makeRepo({ 'release.config.json': '{bad' });
    assert.equal(run(dir).status, 2);
  });

  it('未知選項：結束碼 2', () => {
    assert.equal(run(makeRepo(), ['--nope']).status, 2);
  });
});

describe('增量更新檔 --since', () => {
  function repoWithRelease() {
    const dir = makeRepo();
    sh(dir, 'git', ['tag', 'v1']);
    return dir;
  }

  it('只含新增與修改的發佈檔，並在 CHANGES.txt 列出刪除', () => {
    const dir = repoWithRelease();
    write(dir, 'app/index.php', '<?php echo 100;'); // 修改
    write(dir, 'app/added.php', '<?php'); // 新增
    write(dir, 'docs/b.md', 'ignored'); // 在 export-ignore 內，不該出現
    sh(dir, 'git', ['rm', '-q', 'app/lib.php']); // 刪除
    sh(dir, 'git', ['add', '-A']);
    sh(dir, 'git', ['commit', '-qm', 'change']);
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.mode, 'patch');
    assert.deepEqual(r.json.changes, { added: 1, modified: 1, deleted: 1 });
    assert.deepEqual(r.json.topLevelIncluded, ['app']);
    assert.equal(r.json.totalEntries, 2);
    const changes = readFileSync(join(dir, r.json.changesFile), 'utf8');
    assert.match(changes, /新增（1）\n {2}app\/added\.php/);
    assert.match(changes, /修改（1）\n {2}app\/index\.php/);
    assert.match(changes, /刪除[^\n]*（1）\n {2}app\/lib\.php/);
    assert.doesNotMatch(changes, /docs\/b\.md/);
    assert.match(r.json.output, /-patch-[0-9a-f]{7}\.zip$/);
  });

  it('包含未提交的修改', () => {
    const dir = repoWithRelease();
    write(dir, 'app/index.php', '<?php echo 5;');
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.changes.modified, 1);
  });

  it('發佈範圍沒有變更：失敗並說明', () => {
    const dir = repoWithRelease();
    write(dir, 'docs/only.md', 'x');
    sh(dir, 'git', ['add', '-A']);
    sh(dir, 'git', ['commit', '-qm', 'docs only']);
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /沒有變更/);
  });

  it('只有刪除：不產生 zip，仍產生 CHANGES.txt', () => {
    const dir = repoWithRelease();
    sh(dir, 'git', ['rm', '-q', 'app/lib.php']);
    sh(dir, 'git', ['commit', '-qm', 'del']);
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.output, null);
    assert.match(readFileSync(join(dir, r.json.changesFile), 'utf8'), /app\/lib\.php/);
  });

  it('--since 找不到 ref：結束碼 2', () => {
    assert.equal(run(makeRepo(), ['--since', 'nope']).status, 2);
  });

  it('增量包同樣做機敏審核', () => {
    const dir = repoWithRelease();
    write(dir, 'app/k.php', '-----BEGIN PRIVATE KEY-----');
    sh(dir, 'git', ['add', '-A']);
    sh(dir, 'git', ['commit', '-qm', 'k']);
    assert.equal(run(dir, ['--since', 'v1']).status, 1);
  });

  it('超過 100 字元的長路徑也能處理', () => {
    const dir = repoWithRelease();
    const long = `app/${'很長的目錄名稱'.repeat(8)}/${'x'.repeat(60)}.php`;
    write(dir, long, '<?php');
    sh(dir, 'git', ['add', '-A']);
    sh(dir, 'git', ['commit', '-qm', 'long']);
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.changes.added, 1);
    assert.match(readFileSync(join(dir, r.json.changesFile), 'utf8'), /很長的目錄名稱/);
  });

  it('檔名含空白與中文也能處理', () => {
    const dir = repoWithRelease();
    write(dir, 'app/有 空白.php', '<?php');
    sh(dir, 'git', ['add', '-A']);
    sh(dir, 'git', ['commit', '-qm', 'u']);
    const r = run(dir, ['--since', 'v1']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.json.changes.added, 1);
  });
});
