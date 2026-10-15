#!/usr/bin/env node

/**
 * Validate bundled JSON5-like schema examples by evaluating them as object literals.
 *
 * Usage:
 *   node scripts/validate-skill-schemas.mjs
 *   node scripts/validate-skill-schemas.mjs --schemas references/schemas
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const args = parseArgs(process.argv.slice(2));
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemasDir = path.resolve(process.cwd(), args.schemas || path.join(skillRoot, 'references', 'schemas'));

let files;
try {
  files = (await readdir(schemasDir)).filter((file) => file.endsWith('.json5'));
} catch (error) {
  fail(`Cannot read schemas directory "${schemasDir}": ${error.message}`);
}

if (files.length === 0) {
  fail(`No .json5 files found in ${schemasDir}`);
}

const issues = [];

for (const file of files) {
  const fullPath = path.join(schemasDir, file);
  const source = await readFile(fullPath, 'utf8');

  try {
    const value = vm.runInNewContext(`(${source})`, Object.create(null), {
      filename: fullPath,
      timeout: 1000,
    });

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      issues.push([file, 'Schema must evaluate to an object literal.']);
    }
  } catch (error) {
    issues.push([file, error.message]);
  }
}

if (issues.length > 0) {
  for (const [file, message] of issues) {
    console.error(`${file}: ${message}`);
  }
  fail(`${issues.length} schema file(s) failed validation.`);
}

console.log(`OK: ${files.length} schema file(s) parsed successfully.`);

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index++) {
    const arg = rawArgs[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = rawArgs[index + 1];
    parsed[key] = next && !next.startsWith('--') ? next : true;
    if (parsed[key] === next) index++;
  }
  return parsed;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
