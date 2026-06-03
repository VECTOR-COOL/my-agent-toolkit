#!/usr/bin/env node
/**
 * 驗證 WordPress skill 的 architecture manifest。
 * 僅使用 Node.js 內建能力，避免額外供應鏈依賴。
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemaMap = {
  plugin: 'references/schemas/wp-plugin-architecture.schema.json',
  theme: 'references/schemas/wp-theme-architecture.schema.json',
  hook: 'references/schemas/wp-hook-map.schema.json',
  dependency: 'references/schemas/wp-dependency-map.schema.json',
  review: 'references/schemas/wp-review-report.schema.json',
  content: 'references/schemas/wp-content-setup.schema.json',
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function typeOf(value) {
  if (Array.isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }
  if (Number.isInteger(value)) {
    return 'integer';
  }
  return typeof value;
}

function validateValue(value, schema, path, issues) {
  if (!schema || typeof schema !== 'object') {
    return;
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(value);
    if (!allowed.includes(actual)) {
      issues.push(`${path}: expected ${allowed.join('|')}, got ${actual}`);
      return;
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    issues.push(`${path}: expected one of ${schema.enum.join(', ')}`);
  }

  if (schema.type === 'object' && schema.required) {
    for (const key of schema.required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        issues.push(`${path}.${key}: required property missing`);
      }
    }
  }

  if (schema.type === 'object' && schema.properties && value && typeof value === 'object') {
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateValue(value[key], childSchema, `${path}.${key}`, issues);
      }
    }
  }

  if (schema.type === 'array' && schema.items && Array.isArray(value)) {
    value.forEach((item, index) => validateValue(item, schema.items, `${path}[${index}]`, issues));
  }
}

const args = parseArgs(process.argv.slice(2));
if (!args.file || !args.schema || !schemaMap[args.schema]) {
  console.error('用法：node scripts/validate-wp-architecture-manifest.mjs --file <manifest.json> --schema plugin|theme|hook|dependency|review|content');
  process.exit(2);
}

const manifestPath = resolve(args.file);
const schemaPath = resolve(skillRoot, schemaMap[args.schema]);
const manifest = readJson(manifestPath);
const schema = readJson(schemaPath);
const issues = [];

validateValue(manifest, schema, '$', issues);

if (issues.length > 0) {
  console.error(`Manifest 驗證失敗：${manifestPath}`);
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`Manifest 驗證通過：${manifestPath}`);
