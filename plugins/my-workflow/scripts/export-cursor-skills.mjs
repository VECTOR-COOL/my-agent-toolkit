#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  return [
    'Usage:',
    '  node scripts/export-cursor-skills.mjs <target-repo> [--dry-run] [--force]',
    '',
    'Copy plugin skills into <target-repo>/.cursor/skills/',
    'and plugin rules into <target-repo>/.cursor/rules/.',
    '',
    'Options:',
    '  --dry-run   Print the file plan without writing',
    '  --force     Replace files this command already exported',
    '  --help      Show this help',
    '',
    'Default writes new files only. Existing paths are skipped unless --force.',
    'Does not copy adapters or README. Paths must stay inside the target repo.',
  ].join('\n');
}

function fail(message, code = 1) {
  console.error('[ERROR] ' + message);
  process.exitCode = code;
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

function inside(root, candidate) {
  const realRoot = path.resolve(root);
  const realCandidate = path.resolve(candidate);
  return realCandidate === realRoot || realCandidate.startsWith(realRoot + path.sep);
}

function collectPlan(targetRoot) {
  const plan = [];
  const skillsRoot = path.join(pluginRoot, 'skills');
  if (existsSync(skillsRoot)) {
    for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md');
      if (!existsSync(skillFile)) continue;
      const from = path.join(skillsRoot, entry.name);
      const to = path.join(targetRoot, '.cursor', 'skills', entry.name);
      plan.push({ from, to, kind: 'skill' });
    }
  }

  const rulesRoot = path.join(pluginRoot, 'rules');
  if (existsSync(rulesRoot)) {
    for (const entry of readdirSync(rulesRoot, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.mdc')) continue;
      const from = path.join(rulesRoot, entry.name);
      const to = path.join(targetRoot, '.cursor', 'rules', entry.name);
      plan.push({ from, to, kind: 'rule' });
    }
  }

  return plan;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message + '\n\n' + usage(), 2);
    return;
  }
  if (options.help) {
    console.log(usage());
    return;
  }
  if (!options.target) {
    fail('Target repo is required.\n\n' + usage(), 2);
    return;
  }

  const targetRoot = path.resolve(process.cwd(), options.target);
  if (!existsSync(targetRoot) || !statSync(targetRoot).isDirectory()) {
    fail('Target repo is not a directory: ' + targetRoot);
    return;
  }
  if (targetRoot.includes('..') && !inside(path.resolve(process.cwd()), targetRoot)) {
    fail('Target path is not allowed: ' + options.target);
    return;
  }

  const plan = collectPlan(targetRoot);
  if (plan.length === 0) {
    fail('No skills or rules to export.');
    return;
  }

  console.log(options.dryRun ? '[DRY-RUN] Export plan:' : '[WRITE] Export:');
  let skipped = 0;
  for (const item of plan) {
    if (!inside(targetRoot, item.to)) {
      fail('Export path escapes the target repo: ' + item.to);
      return;
    }
    const exists = existsSync(item.to);
    if (exists && !options.force) {
      console.log('  skip ' + path.relative(targetRoot, item.to));
      skipped += 1;
      continue;
    }
    console.log('  ' + path.relative(targetRoot, item.to));
    if (options.dryRun) continue;
    mkdirSync(path.dirname(item.to), { recursive: true });
    cpSync(item.from, item.to, { recursive: true });
  }
  if (skipped > 0 && !options.force) {
    console.log('Skipped ' + skipped + ' existing path(s). Use --force to replace.');
  }
}

main();
