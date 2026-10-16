#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const PLUGIN_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const MCP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json';
const PLUGIN_NAME = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME = /^(?!.*--)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function usage() {
  return [
    'Usage:',
    '  node scaffold-agent-plugin.mjs <plugin-root> --name <plugin-name> [options]',
    '',
    'Options:',
    '  --skill <name>              Add a minimal Agent Skill (repeatable)',
    '  --remote-mcp <name>=<url>    Add a Streamable HTTP MCP server (repeatable)',
    '  --dry-run                   Print the file plan without writing',
    '  --force                     Replace files that this command owns',
    '  --help                      Show this help',
    '',
    'This command creates only the portable Agent Plugins core. Client adapters',
    'must be added separately after reading the target client reference.',
  ].join('\n');
}

function fail(message) {
  console.error('[ERROR] ' + message);
  process.exitCode = 1;
}

function parseArgs(argv) {
  const result = {
    root: null,
    name: null,
    skills: [],
    remoteMcp: [],
    dryRun: false,
    force: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--force') result.force = true;
    else if (arg === '--name') result.name = argv[++index];
    else if (arg === '--skill') result.skills.push(argv[++index]);
    else if (arg === '--remote-mcp') result.remoteMcp.push(argv[++index]);
    else if (arg.startsWith('-')) throw new Error('Unknown option: ' + arg);
    else if (!result.root) result.root = arg;
    else throw new Error('Unexpected argument: ' + arg);
  }

  return result;
}

function parseRemoteServer(value) {
  const separator = value?.indexOf('=') ?? -1;
  if (separator < 1) throw new Error('--remote-mcp must use <name>=<url>');
  const name = value.slice(0, separator);
  const urlText = value.slice(separator + 1);
  if (!SKILL_NAME.test(name)) throw new Error('Invalid MCP server name: ' + name);

  let url;
  try {
    url = new URL(urlText);
  } catch {
    throw new Error('Invalid MCP server URL: ' + urlText);
  }
  if (url.protocol !== 'https:') {
    throw new Error('Remote MCP server URL must use HTTPS: ' + urlText);
  }
  if (url.username || url.password || url.hash) {
    throw new Error('Remote MCP server URL must not contain userinfo or a fragment: ' + urlText);
  }

  return [name, { type: 'streamable-http', url: url.href }];
}

function planFiles(options) {
  if (!options.root) throw new Error('Plugin root is required');
  if (!options.name || !PLUGIN_NAME.test(options.name) || options.name.length > 64) {
    throw new Error('Plugin name must satisfy Agent Plugins v1 naming rules');
  }

  const files = new Map();
  files.set(
    'plugin.json',
    JSON.stringify({ $schema: PLUGIN_SCHEMA, name: options.name }, null, 2) + '\n',
  );

  const uniqueSkills = [...new Set(options.skills)];
  for (const skill of uniqueSkills) {
    if (!skill || !SKILL_NAME.test(skill) || skill.length > 64) {
      throw new Error('Invalid Agent Skill name: ' + skill);
    }
    const body = [
      '---',
      'name: ' + skill,
      'description: "TODO: Describe what this skill does and when to use it."',
      '---',
      '',
      '# ' + skill,
      '',
      'TODO: Replace this scaffold text before validation or publication.',
      '',
    ].join('\n');
    files.set('skills/' + skill + '/SKILL.md', body);
  }

  if (options.remoteMcp.length > 0) {
    const entries = options.remoteMcp.map(parseRemoteServer);
    if (new Set(entries.map(([name]) => name)).size !== entries.length) {
      throw new Error('MCP server names must be unique');
    }
    files.set(
      'mcp.json',
      JSON.stringify({ $schema: MCP_SCHEMA, mcpServers: Object.fromEntries(entries) }, null, 2) + '\n',
    );
  }

  return files;
}

function applyPlan(root, files, options) {
  const absoluteRoot = resolve(root);
  const conflicts = [];

  for (const relativePath of files.keys()) {
    const target = resolve(absoluteRoot, relativePath);
    if (existsSync(target) && !options.force) conflicts.push(relativePath);
  }
  if (conflicts.length > 0) {
    throw new Error('Refusing to overwrite already exists: ' + conflicts.join(', '));
  }

  console.log(options.dryRun ? '[DRY-RUN] Planned files:' : '[WRITE] Created files:');
  for (const [relativePath, content] of files) {
    console.log('  ' + relativePath);
    if (options.dryRun) continue;
    const target = resolve(absoluteRoot, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
  }
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
  } else {
    applyPlan(options.root, planFiles(options), options);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
