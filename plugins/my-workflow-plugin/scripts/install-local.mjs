#!/usr/bin/env node

import { existsSync, lstatSync, mkdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = {
  cursor: () => path.join(os.homedir(), '.cursor', 'plugins', 'local', 'my-workflow-plugin'),
  codex: () => path.join(os.homedir(), '.codex', 'plugins', 'my-workflow-plugin'),
  grok: () => path.join(os.homedir(), '.grok', 'plugins', 'my-workflow-plugin'),
};

function usage() {
  return [
    'Usage:',
    '  node scripts/install-local.mjs --target cursor|codex|grok|all [--apply] [--force]',
    '',
    'Create a folder link (Windows junction) from the user plugin directory',
    'back to this plugin. Does not copy files.',
    '',
    'Options:',
    '  --target    cursor, codex, grok, or all',
    '  --apply     Create the link. Default is dry-run',
    '  --force     Replace a link that already points elsewhere',
    '  --help      Show this help',
    '',
    'Without --apply nothing is written. Links must not be created inside the plugin.',
  ].join('\n');
}

function fail(message, code = 1) {
  console.error('[ERROR] ' + message);
  process.exitCode = code;
}

function parseArgs(argv) {
  const result = { target: null, apply: false, force: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--apply') result.apply = true;
    else if (arg === '--force') result.force = true;
    else if (arg === '--target') result.target = argv[++index];
    else if (arg.startsWith('-')) throw new Error('Unknown option: ' + arg);
    else throw new Error('Unexpected argument: ' + arg);
  }
  return result;
}

function inspect(linkPath) {
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
    return real === realpathSync(pluginRoot) ? { state: 'ok', real } : { state: 'wrong', real };
  } catch (error) {
    return { state: 'broken', detail: error.message };
  }
}

function selectedTargets(name) {
  if (name === 'all') return Object.keys(targets);
  if (name && targets[name]) return [name];
  throw new Error('Invalid --target. Use cursor, codex, grok, or all.');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message + '\n\n' + usage(), 2);
    return;
  }
  if (options.help || !options.target) {
    console.log(usage());
    if (!options.help && !options.target) process.exitCode = 2;
    return;
  }

  let names;
  try {
    names = selectedTargets(options.target);
  } catch (error) {
    fail(error.message + '\n\n' + usage(), 2);
    return;
  }

  console.log(options.apply ? '[APPLY] Folder links:' : '[DRY-RUN] Folder links:');
  console.log('Plugin: ' + pluginRoot);

  for (const name of names) {
    const linkPath = targets[name]();
    if (linkPath.startsWith(pluginRoot + path.sep) || linkPath === pluginRoot) {
      fail('Refusing to create a link inside the plugin: ' + linkPath);
      return;
    }
    const status = inspect(linkPath);
    if (status.state === 'ok') {
      console.log(name + ': already linked');
      console.log('  ' + linkPath);
      continue;
    }
    if (status.state === 'not-link' || status.state === 'wrong') {
      if (!options.force) {
        fail(name + ' exists and is not this plugin. Will not overwrite: ' + linkPath);
        return;
      }
    }
    console.log(name + ': ' + linkPath);
    if (!options.apply) continue;
    mkdirSync(path.dirname(linkPath), { recursive: true });
    if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true });
    symlinkSync(pluginRoot, linkPath, 'junction');
    console.log('  linked');
  }

  if (!options.apply) console.log('Preview only. Add --apply to create links.');
}

main();
