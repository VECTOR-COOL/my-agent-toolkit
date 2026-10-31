#!/usr/bin/env node

import { cpSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_NAME = 'my-grokbot';
const DEST_PARTS = ['.cursor', 'skills', SKILL_NAME];
const DEST_REL = DEST_PARTS.join('/');

function usage() {
  return [
    '用法：',
    '  node my-skills/my-grokbot/scripts/export-cursor-skill.mjs <目標專案> [--dry-run] [--force]',
    '',
    '只把 my-grokbot 複製到 <目標專案>/.cursor/skills/my-grokbot/。',
    '預設不覆寫。--force 只刪除已再次驗證的那個目的地。',
    '',
    '選項：',
    '  --dry-run   只印計畫，不寫入',
    '  --force     覆寫已存在的目的地',
    '  --help      顯示這段說明',
  ].join('\n');
}

function fail(message, code = 1) {
  console.error('[ERROR] ' + message);
  process.exit(code);
}

function parseArgs(argv) {
  const result = { target: null, dryRun: false, force: false, help: false };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--force') result.force = true;
    else if (arg.startsWith('-')) throw new Error('Unknown option: ' + arg);
    else if (!result.target) result.target = arg;
    else throw new Error('Unexpected argument: ' + arg);
  }
  return result;
}

function keyOf(value) {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isSame(left, right) {
  return keyOf(left) === keyOf(right);
}

function isInside(parent, child) {
  const rel = path.relative(keyOf(parent), keyOf(child));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function isSameOrInside(parent, child) {
  return isSame(parent, child) || isInside(parent, child);
}

function relativeParts(from, to) {
  return path.relative(keyOf(from), keyOf(to)).split(path.sep).join('/');
}

function canonicalize(input) {
  const literal = path.resolve(input);
  const tail = [];
  let current = literal;
  while (true) {
    let linked = false;
    try {
      lstatSync(current);
      linked = true;
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw new Error('unresolved-path: ' + input);
      }
    }
    if (linked) break;
    const parent = path.dirname(current);
    if (parent === current) throw new Error('unresolved-path: ' + input);
    const base = path.basename(current);
    if (base === '' || base === '.' || base === '..') {
      throw new Error('unresolved-path: ' + input);
    }
    tail.push(base);
    current = parent;
  }
  let existing;
  try {
    existing = realpathSync(current);
  } catch (error) {
    throw new Error('unresolved-path: ' + input);
  }
  if (tail.length > 0 && !statSync(existing).isDirectory()) {
    throw new Error('unresolved-path: ' + input);
  }
  const canonical = tail.length === 0 ? existing : path.resolve(existing, ...tail.reverse());
  return { literal, existing, canonical };
}

function assertNoLinks(targetReal, literalDest) {
  let current = targetReal;
  for (const part of DEST_PARTS) {
    current = path.join(current, part);
    let info;
    try {
      info = lstatSync(current);
    } catch (error) {
      if (error && error.code === 'ENOENT') return;
      throw new Error('unresolved-path: ' + current);
    }
    if (info.isSymbolicLink()) throw new Error('symlink-overlap: ' + current);
  }
  if (!isSame(literalDest, current)) throw new Error('path-escape: ' + literalDest);
}

function locations(scriptLiteral, targetLiteral) {
  const scriptReal = realpathSync(scriptLiteral);
  const sourceLiteral = path.resolve(path.dirname(scriptLiteral), '..');
  const source = canonicalize(sourceLiteral);
  const target = canonicalize(targetLiteral);
  if (!statSync(target.existing).isDirectory() || !isSame(target.canonical, target.existing)) {
    throw new Error('path-escape: target');
  }
  const literalDest = path.resolve(target.literal, ...DEST_PARTS);
  if (relativeParts(target.literal, literalDest) !== DEST_REL) {
    throw new Error('path-escape: ' + literalDest);
  }
  const dest = canonicalize(literalDest);
  assertNoLinks(target.canonical, literalDest);
  if (!isSameOrInside(target.canonical, dest.existing)) {
    throw new Error('path-escape: ' + dest.existing);
  }
  if (!isSameOrInside(target.canonical, dest.canonical)) {
    throw new Error('path-escape: ' + dest.canonical);
  }
  if (relativeParts(target.canonical, dest.canonical) !== DEST_REL) {
    throw new Error('path-escape: ' + dest.canonical);
  }
  if (!isSameOrInside(source.canonical, scriptReal)) {
    throw new Error('script-outside-source: ' + scriptReal);
  }
  if (isSameOrInside(dest.canonical, scriptReal)) {
    throw new Error('script-inside-dest: ' + scriptReal);
  }
  if (isSame(source.canonical, dest.canonical)) {
    throw new Error('same-path: ' + dest.canonical);
  }
  if (isInside(source.canonical, dest.canonical)) {
    throw new Error('dest-inside-source: ' + dest.canonical);
  }
  if (isInside(dest.canonical, source.canonical)) {
    throw new Error('source-inside-dest: ' + source.canonical);
  }
  return { scriptReal, source, target, literalDest, dest };
}

function assertDeletable(found) {
  const again = locations(process.argv[1], found.target.literal);
  if (!isSame(again.literalDest, found.literalDest)) {
    throw new Error('unresolved-path: ' + found.literalDest);
  }
  if (!isSame(again.dest.canonical, found.dest.canonical)) {
    throw new Error('unresolved-path: ' + found.dest.canonical);
  }
  let info;
  try {
    info = lstatSync(found.literalDest);
  } catch (error) {
    throw new Error('unresolved-path: ' + found.literalDest);
  }
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error('symlink-delete: ' + found.literalDest);
  }
  const realDest = realpathSync(found.literalDest);
  if (!isSame(realDest, found.dest.canonical)) {
    throw new Error('unresolved-path: ' + realDest);
  }
  if (path.basename(realDest).toLowerCase() !== SKILL_NAME) {
    throw new Error('path-escape: ' + realDest);
  }
  if (isSameOrInside(found.source.canonical, realDest) || isSameOrInside(realDest, found.source.canonical)) {
    throw new Error('same-path: ' + realDest);
  }
  if (isSameOrInside(realDest, again.scriptReal)) {
    throw new Error('script-inside-dest: ' + again.scriptReal);
  }
  return found.literalDest;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message + '\n\n' + usage(), 2);
  }
  if (options.help) {
    console.log(usage());
    return;
  }
  if (!options.target) fail('需要目標專案。\n\n' + usage(), 2);

  const scriptLiteral = path.resolve(process.argv[1]);
  const targetLiteral = path.resolve(process.cwd(), options.target);
  if (!existsSync(targetLiteral) || !statSync(targetLiteral).isDirectory()) {
    fail('目標不是目錄：' + targetLiteral);
  }

  let found;
  try {
    found = locations(scriptLiteral, targetLiteral);
  } catch (error) {
    fail(error.message);
  }

  const exists = existsSync(found.literalDest);
  console.log((options.dryRun ? '[DRY-RUN] ' : '[WRITE] ') + 'destination=' + DEST_REL);
  if (exists && !options.force) fail('refuse-overwrite: ' + found.literalDest);
  if (options.dryRun) return;

  try {
    if (exists) rmSync(assertDeletable(found), { recursive: true, force: false });
    mkdirSync(path.dirname(found.literalDest), { recursive: true });
    cpSync(found.source.canonical, found.literalDest, { recursive: true, errorOnExist: true });
  } catch (error) {
    fail(error.message);
  }
}

main();
