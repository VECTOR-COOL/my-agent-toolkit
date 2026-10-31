#!/usr/bin/env node
/**
 * my-skills 獨立 skill 發布前檢查（唯讀，零依賴）。
 *
 * 檢查：
 *   1. 位置：my-skills/<分類>/<skill 名>/，SKILL.md 存在
 *   2. frontmatter 有 name、description，name 與資料夾名一致
 *   3. frontmatter 的 version 與 badge 版本一致（兩者都有時）
 *   4. .md 內的相對連結存在，且不跑出該 skill 資料夾
 *   5. 疑似金鑰、私鑰、個人絕對路徑
 *   6. 被 .gitignore 擋掉或尚未 git add 的檔
 *   7. 有登記在 my-skills/AGENTS.md 分類表與根 README.md
 *
 * 用法：node .agents/skills/my-skill-release/scripts/check-skill.mjs [skill 路徑或名稱 ...]
 *       不給參數就檢查 my-skills/ 下全部 skill。
 * 結束碼：0 通過；1 有錯；2 參數錯誤
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const skillsRoot = join(repoRoot, 'my-skills');

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log('用法: node .agents/skills/my-skill-release/scripts/check-skill.mjs [skill 路徑或名稱 ...]\n\n不給參數就檢查 my-skills/ 下全部 skill。唯讀；結束碼 0 通過、1 有錯、2 參數錯誤。');
  process.exit(0);
}

const rel = (p) => relative(repoRoot, p).split(sep).join('/');

function findSkillDirs(dir, depth = 0) {
  if (depth > 3) return [];
  if (existsSync(join(dir, 'SKILL.md'))) return [dir];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .flatMap((d) => findSkillDirs(join(dir, d.name), depth + 1));
}

const allSkills = findSkillDirs(skillsRoot);
let targets;
if (argv.length === 0) {
  targets = allSkills;
} else {
  targets = [];
  for (const arg of argv) {
    const asPath = resolve(process.cwd(), arg);
    const hit = existsSync(join(asPath, 'SKILL.md')) ? asPath : allSkills.find((d) => basename(d) === arg);
    if (!hit) {
      console.error(`找不到 skill：${arg}`);
      process.exit(2);
    }
    targets.push(hit);
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return d.name === 'node_modules' || d.name === '.git' ? [] : walk(p);
    return [p];
  });
}

function git(args) {
  const r = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  return r.status === 0 ? r.stdout : '';
}

const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '私鑰'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API key（sk-）'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bxox[abpr]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/[A-Za-z]:\\Users\\[^\\\s<>`"']+\\/, '個人絕對路徑（Windows）'],
  [/\/(?:Users|home)\/(?!<|\$|user\b|you\b|name\b)[A-Za-z0-9._-]+\//, '個人絕對路徑'],
];

const agentsMd = existsSync(join(skillsRoot, 'AGENTS.md')) ? readFileSync(join(skillsRoot, 'AGENTS.md'), 'utf8') : '';
const readme = existsSync(join(repoRoot, 'README.md')) ? readFileSync(join(repoRoot, 'README.md'), 'utf8') : '';

let errorCount = 0;
for (const dir of targets) {
  const errors = [];
  const warnings = [];
  const name = basename(dir);
  const parts = rel(dir).split('/');

  // 1. 位置
  if (parts[0] !== 'my-skills' || parts.length !== 3) warnings.push(`位置是 ${rel(dir)}，應為 my-skills/<分類>/<skill 名>/`);

  // 2–3. frontmatter
  const skillMd = readFileSync(join(dir, 'SKILL.md'), 'utf8');
  const fm = (skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1];
  if (!fm) {
    errors.push('SKILL.md 沒有 frontmatter');
  } else {
    const field = (k) => ((fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1] || '').trim().replace(/^["']|["']$/g, '');
    const fmName = field('name');
    if (!fmName) errors.push('frontmatter 缺 name');
    else if (fmName !== name) errors.push(`frontmatter name 是 ${fmName}，資料夾是 ${name}`);
    if (!field('description')) errors.push('frontmatter 缺 description');
    const fmVersion = field('version');
    const badge = (skillMd.match(/badge\/version-([0-9][0-9A-Za-z.-]*?)-[a-z]+\)/) || [])[1];
    if (fmVersion && badge && fmVersion !== badge) errors.push(`frontmatter version ${fmVersion} 與 badge ${badge} 不一致`);
  }

  // 4–5. 連結與機敏內容
  for (const file of walk(dir)) {
    if (statSync(file).size > 1024 * 1024) continue;
    const text = readFileSync(file, 'utf8');
    for (const [re, label] of SECRET_PATTERNS) {
      if (re.test(text)) (label.includes('路徑') ? warnings : errors).push(`${rel(file)} 疑似含${label}`);
    }
    if (!file.endsWith('.md')) continue;
    const body = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1].split('#')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      const abs = resolve(dirname(file), decodeURI(target));
      if (!(abs + sep).startsWith(dir + sep) && abs !== dir) errors.push(`${rel(file)} 連結跑出 skill 資料夾：${m[1]}`);
      else if (!existsSync(abs)) errors.push(`${rel(file)} 連結不存在：${m[1]}`);
    }
  }

  // 6. 會漏傳的檔
  const ignored = git(['ls-files', '--others', '--ignored', '--exclude-standard', '--', rel(dir)]).trim();
  if (ignored) errors.push(`被 .gitignore 擋掉（push 後不存在）：\n    ${ignored.split('\n').join('\n    ')}`);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', rel(dir)]).trim();
  if (untracked) warnings.push(`尚未 git add：\n    ${untracked.split('\n').join('\n    ')}`);

  // 7. 登記
  if (!agentsMd.includes(`\`${name}\``)) warnings.push('my-skills/AGENTS.md 分類表沒有列這個 skill');
  if (!readme.includes(`\`${name}\``)) warnings.push('根 README.md 沒有列這個 skill');

  errorCount += errors.length;
  const mark = errors.length ? '✗' : warnings.length ? '!' : '✓';
  console.log(`${mark} ${rel(dir)}`);
  for (const e of errors) console.log(`  錯誤：${e}`);
  for (const w of warnings) console.log(`  警告：${w}`);
}

console.log(errorCount ? `\n${errorCount} 個錯誤，修正後再發布。` : `\n通過（${targets.length} 個 skill）。`);
process.exit(errorCount ? 1 : 0);
