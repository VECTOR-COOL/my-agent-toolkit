#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(
    'Usage: node scripts/inject-rules.mjs\n\n' +
      'Print SessionStart additionalContext JSON: references/global.md, the my-workflow router skill\n' +
      'and references/index.yaml (all under skills/my-workflow), so they are loaded without a slash command. Read-only.',
  );
  process.exit(0);
}

function read(...parts) {
  const file = path.join(root, ...parts);
  try {
    return readFileSync(file, 'utf8');
  } catch (error) {
    console.error('[ERROR] Cannot read ' + file + ': ' + error.message);
    process.exit(1);
  }
}

const rules = read('skills', 'my-workflow', 'references', 'global.md').replaceAll('](../', '](' + root + '/');
const index = read('skills', 'my-workflow', 'references', 'index.yaml');
// 入口 skill 的相對路徑在注入後沒有基準，改成 plugin 的絕對路徑
const router = read('skills', 'my-workflow', 'SKILL.md')
  .replace(/^---\n[\s\S]*?\n---\n\n?/, '')
  .replaceAll('../../', root + '/')
  .replaceAll('../', root + '/skills/');

const context = [
  'my-workflow plugin 已在對話開始載入，以下是全域規則與工作流入口，適用於本次對話的每個任務。plugin 根目錄：' + root + '（索引中 rules 的 file 路徑相對於此目錄）。',
  rules,
  '# 工作流入口（skill my-workflow，已載入，不必再用斜線命令）\n\n' + router,
  '## references/index.yaml（已載入）\n\n```yaml\n' + index + '```',
].join('\n\n');

console.log(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }),
);
