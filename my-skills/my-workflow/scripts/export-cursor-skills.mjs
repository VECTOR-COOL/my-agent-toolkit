#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  return [
    'Usage:',
    '  node scripts/export-cursor-skills.mjs <target-repo> [--dry-run] [--force]',
    '',
    'Copy skills into <target-repo>/.cursor/skills/<skill-name>/',
    '',
    'Options:',
    '  --dry-run   Print the file plan without writing',
    '  --force     Replace files this command already exported',
    '  --help      Show this help',
    '',
    'Default writes new files only. Existing paths are skipped unless --force.',
    'Does not copy rules or README. Paths must stay inside the target repo.',
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
  const entryParts = ['SKILL.md', 'references', 'agents']
    .map((name) => ({
      from: path.join(packRoot, name),
      toName: name,
    }))
    .filter((part) => existsSync(part.from));
  if (entryParts.some((part) => part.toName === 'SKILL.md')) {
    plan.push({
      kind: 'entry',
      to: path.join(targetRoot, '.cursor', 'skills', 'my-workflow'),
      parts: entryParts,
    });
  }
  const skillsRoot = path.join(packRoot, 'skills');
  if (!existsSync(skillsRoot)) return plan;
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'my-workflow') continue;
    const skillFile = path.join(skillsRoot, entry.name, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    plan.push({
      kind: 'skill',
      from: path.join(skillsRoot, entry.name),
      to: path.join(targetRoot, '.cursor', 'skills', entry.name),
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
    mkdirSync(item.to, { recursive: true });
    if (item.kind === 'entry') {
      for (const part of item.parts) {
        cpSync(part.from, path.join(item.to, part.toName), { recursive: true });
      }
      continue;
    }
    cpSync(item.from, item.to, { recursive: true });
  }
  if (skipped > 0 && !options.force) {
    console.log('Skipped ' + skipped + ' existing path(s). Use --force to replace.');
  }
}

main();
