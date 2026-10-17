#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rulesFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'rules', 'my-rules.md');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/inject-rules.mjs\n\nPrint rules/my-rules.md as SessionStart additionalContext JSON. Read-only.');
  process.exit(0);
}

let rules;
try {
  rules = readFileSync(rulesFile, 'utf8');
} catch (error) {
  console.error('[ERROR] Cannot read ' + rulesFile + ': ' + error.message);
  process.exit(1);
}

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: 'my-workflow plugin 的常駐規則如下，適用於本次對話的每個任務。\n\n' + rules,
    },
  }),
);
