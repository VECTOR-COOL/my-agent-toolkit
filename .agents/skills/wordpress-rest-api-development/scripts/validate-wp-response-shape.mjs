#!/usr/bin/env node

/**
 * Validate essential WordPress REST API response shape.
 *
 * Usage:
 *   node scripts/validate-wp-response-shape.mjs --type post --url https://cms.uavs.tw/wp-json/wp/v2/posts?_embed
 *   node scripts/validate-wp-response-shape.mjs --type page --file fixtures/pages.json
 */

import { readFile } from 'node:fs/promises';

const args = parseArgs(process.argv.slice(2));
const type = args.type || 'post';

const validators = {
  post: [
    ['id', 'number'],
    ['slug', 'string'],
    ['date', 'string'],
    ['title.rendered', 'string'],
    ['content.rendered', 'string'],
    ['excerpt.rendered', 'string'],
    ['featured_media', 'number'],
    ['author', 'number'],
    ['categories', 'array'],
    ['tags', 'array'],
  ],
  page: [
    ['id', 'number'],
    ['slug', 'string'],
    ['date', 'string'],
    ['title.rendered', 'string'],
    ['content.rendered', 'string'],
    ['excerpt.rendered', 'string'],
    ['featured_media', 'number'],
    ['author', 'number'],
    ['parent', 'number'],
    ['menu_order', 'number'],
  ],
  category: [
    ['id', 'number'],
    ['name', 'string'],
    ['slug', 'string'],
    ['taxonomy', 'string'],
    ['count', 'number'],
    ['parent', 'number'],
    ['description', 'string'],
  ],
  tag: [
    ['id', 'number'],
    ['name', 'string'],
    ['slug', 'string'],
    ['taxonomy', 'string'],
    ['count', 'number'],
    ['description', 'string'],
  ],
  media: [
    ['id', 'number'],
    ['slug', 'string'],
    ['title.rendered', 'string'],
    ['source_url', 'string'],
    ['alt_text', 'string'],
    ['media_type', 'string'],
    ['mime_type', 'string'],
    ['media_details', 'object'],
  ],
  search: [
    ['id', 'number'],
    ['title', 'string'],
    ['url', 'string'],
    ['type', 'string'],
    ['subtype', 'string'],
  ],
};

if (!validators[type]) {
  fail(`Unknown --type "${type}". Use one of: ${Object.keys(validators).join(', ')}`);
}

if (!args.url && !args.file) {
  fail('Pass either --url or --file.');
}

const payload = args.url ? await readUrl(args.url) : await readJsonFile(args.file);
const records = Array.isArray(payload) ? payload : [payload];

if (records.length === 0) {
  fail('Response is an empty array; provide at least one record for shape validation.');
}

let failures = 0;

records.forEach((record, index) => {
  for (const [path, expected] of validators[type]) {
    const value = getPath(record, path);
    if (!matchesType(value, expected)) {
      failures++;
      console.error(
        `Record ${index}: expected ${path} to be ${expected}, got ${describe(value)}`
      );
    }
  }

  if ((type === 'post' || type === 'page') && record.featured_media > 0) {
    const media = getPath(record, '_embedded.wp:featuredmedia.0.source_url');
    if (record._embedded && !matchesType(media, 'string')) {
      failures++;
      console.error(`Record ${index}: _embedded.wp:featuredmedia[0].source_url is missing.`);
    }
  }

  if ((type === 'post' || type === 'page') && record.yoast_head_json) {
    for (const path of ['yoast_head_json.title', 'yoast_head_json.description']) {
      if (!matchesType(getPath(record, path), 'string')) {
        failures++;
        console.error(`Record ${index}: ${path} should be a string when Yoast data exists.`);
      }
    }
  }
});

if (failures > 0) {
  fail(`${failures} shape issue(s) found in ${records.length} ${type} record(s).`);
}

console.log(`OK: ${records.length} ${type} record(s) match the essential WordPress REST shape.`);

async function readUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    fail(`HTTP ${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

async function readJsonFile(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`Cannot read JSON file "${path}": ${error.message}`);
  }
}

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

function getPath(value, path) {
  return path.split('.').reduce((current, key) => {
    if (current == null) return undefined;
    if (/^\d+$/.test(key)) return current[Number(key)];
    return current[key];
  }, value);
}

function matchesType(value, expected) {
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  return typeof value === expected;
}

function describe(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
