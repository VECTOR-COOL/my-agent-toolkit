import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'export-cursor-skill.mjs');
const skillRoot = path.resolve(path.dirname(script), '..');

function run(scriptPath, args) {
  return spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });
}

function makeRepo() {
  return mkdtempSync(path.join(tmpdir(), 'my-grokbot-export-'));
}

test('help', () => {
  const result = run(script, ['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--dry-run/);
  assert.match(result.stdout, /--force/);
  assert.match(result.stdout, /my-grokbot/);
});

test('dry-run 只印唯一目的地', () => {
  const repo = makeRepo();
  try {
    const result = run(script, [repo, '--dry-run']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /destination=\.cursor\/skills\/my-grokbot/);
    assert.equal(existsSync(path.join(repo, '.cursor')), false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('初次匯出', () => {
  const repo = makeRepo();
  const dest = path.join(repo, '.cursor', 'skills', 'my-grokbot', 'SKILL.md');
  try {
    const result = run(script, [repo]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(dest, 'utf8'), readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8'));
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('預設拒絕覆寫', () => {
  const repo = makeRepo();
  const destRoot = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  const marker = path.join(destRoot, 'KEEP.txt');
  try {
    assert.equal(run(script, [repo]).status, 0);
    writeFileSync(marker, 'keep');
    const result = run(script, [repo]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /refuse-overwrite/);
    assert.equal(readFileSync(marker, 'utf8'), 'keep');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('明示 force 才覆寫', () => {
  const repo = makeRepo();
  const destRoot = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  const marker = path.join(destRoot, 'KEEP.txt');
  try {
    assert.equal(run(script, [repo]).status, 0);
    writeFileSync(marker, 'keep');
    const result = run(script, [repo, '--force']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(marker), false);
    assert.equal(existsSync(path.join(destRoot, 'SKILL.md')), true);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('source 等於 destination 時拒絕', () => {
  const repo = makeRepo();
  const destRoot = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  const copied = path.join(destRoot, 'scripts', 'export-cursor-skill.mjs');
  try {
    mkdirSync(path.dirname(copied), { recursive: true });
    cpSync(script, copied);
    writeFileSync(path.join(destRoot, 'KEEP.txt'), 'keep');
    const result = run(copied, [repo, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /same-path|script-inside-dest/);
    assert.equal(readFileSync(path.join(destRoot, 'KEEP.txt'), 'utf8'), 'keep');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('destination 位於 source 內時拒絕', () => {
  const nested = path.join(skillRoot, '.cursor');
  try {
    const result = run(script, [skillRoot, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /dest-inside-source/);
    assert.equal(existsSync(nested), false);
  } finally {
    if (existsSync(nested)) rmSync(nested, { recursive: true, force: true });
  }
});

test('source 位於 destination 內時拒絕', () => {
  const repo = makeRepo();
  const destRoot = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  const copied = path.join(destRoot, 'inner', 'scripts', 'export-cursor-skill.mjs');
  const marker = path.join(destRoot, 'KEEP.txt');
  try {
    mkdirSync(path.dirname(copied), { recursive: true });
    cpSync(script, copied);
    writeFileSync(marker, 'keep');
    const result = run(copied, [repo, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /source-inside-dest|script-inside-dest/);
    assert.equal(readFileSync(marker, 'utf8'), 'keep');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('從 generated copy 執行會打到自己', () => {
  const repo = makeRepo();
  const generated = path.join(repo, '.cursor', 'skills', 'my-grokbot', 'scripts', 'export-cursor-skill.mjs');
  const skillFile = path.join(repo, '.cursor', 'skills', 'my-grokbot', 'SKILL.md');
  try {
    assert.equal(run(script, [repo]).status, 0);
    const before = readFileSync(skillFile, 'utf8');
    const result = run(generated, [repo, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /same-path|script-inside-dest/);
    assert.equal(readFileSync(skillFile, 'utf8'), before);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('junction 解析後重疊時拒絕', (t) => {
  const repo = makeRepo();
  const link = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  try {
    mkdirSync(path.dirname(link), { recursive: true });
    try {
      symlinkSync(skillRoot, link, 'junction');
    } catch (error) {
      t.skip('無法建立 junction：' + error.message);
      return;
    }
    const result = run(script, [repo, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /symlink-overlap|same-path|dest-inside-source/);
    assert.equal(existsSync(path.join(skillRoot, 'SKILL.md')), true);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('symlink 解析後重疊時拒絕', (t) => {
  const repo = makeRepo();
  const link = path.join(repo, '.cursor', 'skills', 'my-grokbot');
  try {
    mkdirSync(path.dirname(link), { recursive: true });
    try {
      symlinkSync(skillRoot, link, 'dir');
    } catch (error) {
      t.skip('無法建立 symlink：' + error.message);
      return;
    }
    const result = run(script, [repo, '--force']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /symlink-overlap|same-path|dest-inside-source/);
    assert.equal(existsSync(path.join(skillRoot, 'SKILL.md')), true);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('參數錯誤回傳非零', () => {
  const result = run(script, ['--unknown']);
  assert.equal(result.status, 2);
});
