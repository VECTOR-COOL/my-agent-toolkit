#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, realpathSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  return [
    'Usage:',
    '  node scripts/update-plugin.mjs check',
    '  node scripts/update-plugin.mjs update [--apply]',
    '',
    'check   向遠端查詢，只報告 plugin 是否有新內容，以及本機連結是否還指到這個 plugin。',
    'update  預設只列出將做的事。加上 --apply 才會 git pull --ff-only，並補上缺少的資料夾連結。',
    '',
    '不會自動掃描、不會複製 plugin、不會 commit、不會覆蓋已經指到別處的連結。',
    'ChatGPT 網頁與 grok.com 不能用這個指令更新。',
  ].join('\n');
}

function fail(message, code = 1) {
  console.error(message);
  process.exitCode = code;
}

function runGit(args, cwd) {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error.stderr?.toString?.() ?? '';
    const stdout = error.stdout?.toString?.() ?? '';
    throw new Error((stderr || stdout || error.message).trim());
  }
}

function repoRoot() {
  return runGit(['rev-parse', '--show-toplevel'], pluginRoot);
}

function linkPaths() {
  const home = os.homedir();
  return [
    ['Cursor', path.join(home, '.cursor', 'plugins', 'local', 'my-workflow')],
    ['Codex', path.join(home, '.codex', 'plugins', 'my-workflow')],
    ['Grok Build', path.join(home, '.grok', 'plugins', 'my-workflow')],
  ];
}

function inspectLink(linkPath) {
  if (!existsSync(linkPath)) return { state: 'missing' };
  let stat;
  try {
    stat = lstatSync(linkPath);
  } catch (error) {
    return { state: 'unreadable', detail: error.message };
  }
  if (!stat.isSymbolicLink()) return { state: 'not-link' };
  try {
    const real = realpathSync(linkPath);
    const pluginReal = realpathSync(pluginRoot);
    if (real === pluginReal) return { state: 'ok', real };
    return { state: 'wrong', real };
  } catch (error) {
    return { state: 'broken', detail: error.message };
  }
}

function linkLabel(status) {
  if (status.state === 'ok') return '已連結';
  if (status.state === 'missing') return '尚未連結';
  if (status.state === 'not-link') return '路徑已存在，但不是連結';
  if (status.state === 'wrong') return '連結指到別處：' + status.real;
  if (status.state === 'broken') return '連結失效';
  return '無法讀取';
}

function upstreamStatus(root) {
  let upstream;
  try {
    upstream = runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], root);
  } catch {
    return { upstream: null };
  }
  runGit(['fetch', '--quiet', upstream.split('/')[0]], root);
  const behind = Number(runGit(['rev-list', '--count', 'HEAD..@{u}'], root));
  const ahead = Number(runGit(['rev-list', '--count', '@{u}..HEAD'], root));
  const relativePlugin = path.relative(root, pluginRoot).split(path.sep).join('/');
  const pluginBehind = Number(runGit(['rev-list', '--count', 'HEAD..@{u}', '--', relativePlugin], root));
  const dirty = runGit(['status', '--porcelain'], root).length > 0;
  return { upstream, behind, ahead, pluginBehind, dirty, relativePlugin };
}

function reportLinks() {
  const rows = linkPaths().map(([name, linkPath]) => ({ name, linkPath, status: inspectLink(linkPath) }));
  for (const row of rows) {
    console.log(row.name + '：' + linkLabel(row.status));
    console.log('  ' + row.linkPath);
  }
  return rows;
}

function check() {
  const root = repoRoot();
  const status = upstreamStatus(root);
  if (!status.upstream) {
    console.log('沒有追蹤的遠端分支，無法檢查更新。');
    reportLinks();
    process.exitCode = 1;
    return;
  }
  console.log('遠端：' + status.upstream);
  if (status.pluginBehind > 0) {
    console.log('plugin 有 ' + status.pluginBehind + ' 個新提交。');
  } else if (status.behind > 0) {
    console.log('plugin 沒有新內容。這個 repo 另有 ' + status.behind + ' 個尚未拉下的提交。');
  } else if (status.ahead > 0) {
    console.log('plugin 已是遠端內容。本機另有 ' + status.ahead + ' 個尚未推送的提交。');
  } else {
    console.log('plugin 已是最新。');
  }
  if (status.dirty) console.log('工作區有未提交變更。更新會停下來，不會自動拉。');
  reportLinks();
  console.log('ChatGPT 網頁與 grok.com 不能用這個指令更新。');
}

function update(apply) {
  const root = repoRoot();
  const status = upstreamStatus(root);
  if (!status.upstream) {
    fail('沒有追蹤的遠端分支，無法更新。');
    return;
  }
  if (status.ahead > 0 && status.behind > 0) {
    fail('本機與遠端都有新提交，需要先人工處理，不會自動合併。');
    return;
  }
  if (status.behind > 0 && status.dirty) {
    fail('工作區有未提交變更，不會拉遠端。請先處理這些變更。');
    return;
  }

  const links = reportLinks();
  const blocked = links.filter((row) => row.status.state !== 'ok' && row.status.state !== 'missing');
  if (blocked.length > 0) {
    fail('有連結指到別處或不是連結。不會覆蓋。');
    return;
  }

  if (!apply) {
    if (status.behind > 0) console.log('將執行：git pull --ff-only');
    else console.log('遠端沒有新提交。');
    const missing = links.filter((row) => row.status.state === 'missing');
    if (missing.length > 0) console.log('將補上缺少的資料夾連結：' + missing.map((row) => row.name).join('、'));
    console.log('這是預覽。要真的更新，請加 --apply。');
    return;
  }

  if (status.behind > 0) {
    runGit(['pull', '--ff-only'], root);
    console.log('已拉下遠端。');
  } else {
    console.log('遠端沒有新提交。');
  }
  for (const row of links) {
    if (row.status.state !== 'missing') continue;
    mkdirSync(path.dirname(row.linkPath), { recursive: true });
    symlinkSync(pluginRoot, row.linkPath, 'junction');
    console.log('已連結 ' + row.name + '：' + row.linkPath);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(usage());
    return;
  }
  const command = args[0];
  const apply = args.includes('--apply');
  try {
    if (command === 'check') check();
    else if (command === 'update') update(apply);
    else fail('未知指令：' + command + '\n\n' + usage(), 2);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

main();
