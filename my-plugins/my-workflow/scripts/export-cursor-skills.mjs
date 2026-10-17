#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  return [
    'Usage:',
    '  node scripts/export-cursor-skills.mjs <target-repo> [--dry-run] [--force]',
    '',
    'Copy skills into <target-repo>/.cursor/skills/<skill-name>/',
    'and rules/my-rules.md into <target-repo>/.cursor/rules/my-rules.mdc',
    '',
    'Options:',
    '  --dry-run   Print the file plan without writing',
    '  --force     Replace files this command already exported',
    '  --help      Show this help',
    '',
    'Default writes new files only. Existing paths are skipped unless --force.',
    'Does not copy README. Paths must stay inside the target repo.',
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
  const skillsRoot = path.join(packRoot, 'skills');
  if (existsSync(skillsRoot)) {
    for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md');
      if (!existsSync(skillFile)) continue;
      const item = {
        kind: 'skill',
        from: path.join(skillsRoot, entry.name),
        to: path.join(targetRoot, '.cursor', 'skills', entry.name),
        extras: [],
      };
      // 入口 skill 的 ../../references 在匯出後要落在自己底下
      if (entry.name === 'my-workflow') {
        item.extras.push({ from: path.join(packRoot, 'references'), toName: 'references' });
        item.extras.push({ from: path.join(packRoot, 'agents'), toName: 'agents' });
      }
      plan.push(item);
    }
  }
  const rulesFile = path.join(packRoot, 'rules', 'my-rules.md');
  if (existsSync(rulesFile)) {
    plan.push({
      kind: 'rule',
      from: rulesFile,
      to: path.join(targetRoot, '.cursor', 'rules', 'my-rules.mdc'),
    });
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
    fail('No skills to export.');
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
    if (exists) rmSync(item.to, { recursive: true, force: true });
    if (item.kind === 'rule') {
      mkdirSync(path.dirname(item.to), { recursive: true });
      const body = readFileSync(item.from, 'utf8').replace(/\]\(\.\.\/(README\.md|references\/)/g, '](../../$1');
      writeFileSync(item.to, '---\ndescription: my-workflow 常駐通用規則\nalwaysApply: true\n---\n\n' + body);
      continue;
    }
    mkdirSync(item.to, { recursive: true });
    cpSync(item.from, item.to, { recursive: true });
    for (const extra of item.extras) {
      if (existsSync(extra.from)) cpSync(extra.from, path.join(item.to, extra.toName), { recursive: true });
    }
    if (item.extras.length > 0) {
      const skillMd = path.join(item.to, 'SKILL.md');
      const text = readFileSync(skillMd, 'utf8')
        .replaceAll('](../../references/', '](references/')
        .replaceAll('](../../rules/my-rules.md)', '](../../rules/my-rules.mdc)')
        .replaceAll('](../../AGENTS.md)', '](https://github.com/VECTOR-COOL/my-agent-toolkit/blob/main/my-plugins/my-workflow/AGENTS.md)')
        .replaceAll('](../../scripts/export-cursor-skills.mjs)', '](https://github.com/VECTOR-COOL/my-agent-toolkit/blob/main/my-plugins/my-workflow/scripts/export-cursor-skills.mjs)');
      writeFileSync(skillMd, text);
    }
  }
  if (skipped > 0 && !options.force) {
    console.log('Skipped ' + skipped + ' existing path(s). Use --force to replace.');
  }
}

main();
