#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const PLUGIN_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const MCP_SCHEMA = 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json';
const PLUGIN_ROOT = '$' + '{PLUGIN_ROOT}';
const PLUGIN_DATA = '$' + '{PLUGIN_DATA}';
const CURSOR_PLUGIN_ROOT = '$' + '{CURSOR_PLUGIN_ROOT}';
const PLUGIN_NAME_RE = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SKILL_NAME_RE = /^(?!.*--)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SKILL_FIELDS = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
]);

function usage() {
  return [
    'Usage: node validate-agent-plugin.mjs <plugin-root> [options]',
    '',
    'Options:',
    '  --target portable|cursor|openai  Apply client compatibility checks',
    '  --json                           Emit machine-readable output',
    '  --help                           Show this help',
  ].join('\n');
}

function parseArgs(argv) {
  let root;
  let target = 'portable';
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help') return { help: true };
    if (arg === '--json') {
      json = true;
      continue;
    }
    if (arg === '--target') {
      target = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith('--')) throw new Error('Unknown option: ' + arg);
    if (root) throw new Error('Only one plugin root may be supplied.');
    root = arg;
  }

  if (!root) throw new Error('Plugin root is required.');
  if (!['portable', 'cursor', 'openai'].includes(target)) {
    throw new Error('Invalid target: ' + target);
  }
  return { root: path.resolve(root), target, json };
}

function readJson(file, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(path.basename(file) + ': invalid or unreadable JSON (' + error.message + ')');
    return null;
  }
}

function resolvesInside(root, candidate) {
  try {
    const realRoot = fs.realpathSync.native(root);
    const realCandidate = fs.realpathSync.native(candidate);
    return realCandidate === realRoot || realCandidate.startsWith(realRoot + path.sep);
  } catch {
    return false;
  }
}

function unknownKeys(value, allowed, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(label + ': unknown field "' + key + '"');
  }
}

function validName(value, label, pattern, errors) {
  if (typeof value !== 'string' || !pattern.test(value) || value.length > 64) {
    errors.push(label + ': does not satisfy the portable 1-64 character naming rules');
  }
}

function scalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  if (/^(?:true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  if (/^(?:null|~)$/i.test(trimmed)) return null;
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseFrontmatter(text, file, errors) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    errors.push(file + ': missing YAML frontmatter');
    return null;
  }
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) {
    errors.push(file + ': unterminated YAML frontmatter');
    return null;
  }

  const result = {};
  const lines = normalized.slice(4, end).split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      errors.push(file + ': unsupported nested YAML syntax on line ' + (index + 2));
      continue;
    }
    const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (!match) {
      errors.push(file + ': unsupported top-level YAML syntax on line ' + (index + 2));
      continue;
    }
    const key = match[1];
    let value = match[2] ?? '';
    if (key === 'metadata' && value === '') {
      const metadata = {};
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        const nested = /^\s+([A-Za-z0-9_.-]+):(?:\s*(.*))?$/.exec(lines[index + 1]);
        if (!nested) {
          errors.push(file + ': invalid metadata entry on line ' + (index + 3));
        } else {
          metadata[nested[1]] = scalar(nested[2] ?? '');
        }
        index += 1;
      }
      result[key] = metadata;
      continue;
    }
    if (value === '|' || value === '>') {
      const parts = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        parts.push(lines[index + 1].trim());
        index += 1;
      }
      value = parts.join(value === '>' ? ' ' : '\n');
    }
    result[key] = scalar(value);
  }
  return result;
}

function validatePluginManifest(root, errors) {
  const file = path.join(root, 'plugin.json');
  if (!fs.existsSync(file)) {
    errors.push('plugin.json: missing required root manifest');
    return null;
  }
  if (!resolvesInside(root, file)) {
    errors.push('plugin.json: path does not resolve inside the plugin root');
    return null;
  }
  const manifest = readJson(file, errors);
  if (!manifest) return null;

  unknownKeys(
    manifest,
    new Set(['$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions']),
    'plugin.json',
    errors,
  );
  if (manifest.$schema !== PLUGIN_SCHEMA) {
    errors.push('plugin.json: $schema must be ' + PLUGIN_SCHEMA);
  }
  validName(manifest.name, 'plugin.json name', PLUGIN_NAME_RE, errors);
  if (manifest.version !== undefined && typeof manifest.version !== 'string') {
    errors.push('plugin.json: version must be a string (Semantic Versioning is recommended)');
  }
  if (manifest.description !== undefined && typeof manifest.description !== 'string') {
    errors.push('plugin.json: description must be a string');
  }
  if (manifest.author !== undefined) {
    if (!isObject(manifest.author)) {
      errors.push('plugin.json: author must be an object');
    } else {
      unknownKeys(manifest.author, new Set(['name', 'email', 'url']), 'plugin.json author', errors);
      for (const [key, value] of Object.entries(manifest.author)) {
        if (typeof value !== 'string') errors.push('plugin.json author ' + key + ': must be a string');
      }
    }
  }
  for (const key of ['homepage', 'repository', 'license']) {
    if (manifest[key] !== undefined && typeof manifest[key] !== 'string') {
      errors.push('plugin.json: ' + key + ' must be a string');
    }
  }
  if (manifest.keywords !== undefined && (
    !Array.isArray(manifest.keywords) ||
    manifest.keywords.some((value) => typeof value !== 'string')
  )) {
    errors.push('plugin.json: keywords must be an array of strings');
  }
  if (manifest.extensions !== undefined && (
    !manifest.extensions ||
    typeof manifest.extensions !== 'object' ||
    Array.isArray(manifest.extensions)
  )) {
    errors.push('plugin.json: extensions must be an object');
  } else if (manifest.extensions !== undefined) {
    for (const [namespace, value] of Object.entries(manifest.extensions)) {
      if (!isObject(value)) errors.push('plugin.json extension ' + namespace + ': must be an object');
    }
  }
  return manifest;
}

function validateSkills(root, errors, warnings) {
  const skillsRoot = path.join(root, 'skills');
  if (!fs.existsSync(skillsRoot)) return;
  const realRoot = fs.realpathSync.native(root);
  if (!fs.statSync(skillsRoot).isDirectory()) {
    errors.push('skills: fixed component location must resolve to a directory');
    return;
  }
  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
  for (const entry of entries) {
    const skillRoot = path.join(skillsRoot, entry.name);
    let isDirectory = false;
    try {
      const realSkillRoot = fs.realpathSync.native(skillRoot);
      if (realSkillRoot !== realRoot && !realSkillRoot.startsWith(realRoot + path.sep)) {
        errors.push('skills/' + entry.name + ': path escapes the plugin root');
        continue;
      }
      isDirectory = fs.statSync(skillRoot).isDirectory();
    } catch {
      errors.push('skills/' + entry.name + ': path cannot be resolved');
      continue;
    }
    if (!isDirectory) {
      warnings.push('skills/' + entry.name + ': only direct child skill directories are discoverable');
      continue;
    }
    const file = path.join(skillRoot, 'SKILL.md');
    if (!fs.existsSync(file)) {
      errors.push('skills/' + entry.name + ': missing SKILL.md');
      continue;
    }
    if (!resolvesInside(root, file)) {
      errors.push('skills/' + entry.name + '/SKILL.md: path escapes the plugin root');
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    const frontmatter = parseFrontmatter(text, 'skills/' + entry.name + '/SKILL.md', errors);
    if (!frontmatter) continue;
    for (const key of Object.keys(frontmatter)) {
      if (!SKILL_FIELDS.has(key)) {
        errors.push('skills/' + entry.name + '/SKILL.md: unsupported portable field "' + key + '"');
      }
    }
    validName(frontmatter.name, 'skills/' + entry.name + '/SKILL.md name', SKILL_NAME_RE, errors);
    if (frontmatter.name !== entry.name) {
      errors.push('skills/' + entry.name + '/SKILL.md: name must match its parent directory');
    }
    if (typeof frontmatter.description !== 'string' || !frontmatter.description.trim()) {
      errors.push('skills/' + entry.name + '/SKILL.md: description is required');
    } else if (frontmatter.description.length > 1024) {
      errors.push('skills/' + entry.name + '/SKILL.md: description exceeds 1024 characters');
    }
    if (frontmatter.compatibility !== undefined && (
      typeof frontmatter.compatibility !== 'string' ||
      frontmatter.compatibility.length < 1 ||
      frontmatter.compatibility.length > 500
    )) {
      errors.push('skills/' + entry.name + '/SKILL.md: compatibility must be a 1-500 character string');
    }
    for (const key of ['license', 'allowed-tools']) {
      if (frontmatter[key] !== undefined && typeof frontmatter[key] !== 'string') {
        errors.push('skills/' + entry.name + '/SKILL.md: ' + key + ' must be a string');
      }
    }
    if (frontmatter.metadata !== undefined) {
      if (!isObject(frontmatter.metadata)) {
        errors.push('skills/' + entry.name + '/SKILL.md: metadata must be a string-to-string mapping');
      } else {
        for (const [key, value] of Object.entries(frontmatter.metadata)) {
          if (typeof value !== 'string') {
            errors.push('skills/' + entry.name + '/SKILL.md: metadata.' + key + ' must be a string');
          }
        }
      }
    }
    if (/\b(?:TODO|CHANGEME|REPLACE_ME)\b/i.test(text)) {
      errors.push('skills/' + entry.name + '/SKILL.md: unresolved placeholder remains');
    }
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateServerExtensions(name, server, target, errors, warnings) {
  if (server.extensions === undefined) return;
  if (target !== 'openai') {
    errors.push('mcp.json server ' + name + ': extensions are not part of portable Agent Plugins v1');
    return;
  }
  if (!isObject(server.extensions) || !isObject(server.extensions['com.openai'])) {
    errors.push('mcp.json server ' + name + ': OpenAI extensions must contain an object at com.openai');
    return;
  }
  for (const [namespace, value] of Object.entries(server.extensions)) {
    if (namespace !== 'com.openai' || !isObject(value)) {
      errors.push('mcp.json server ' + name + ': unsupported OpenAI extension namespace ' + namespace);
    }
  }
  warnings.push(
    'mcp.json server ' + name +
    ': extensions.com.openai follows OpenAI packaging docs but is outside the closed portable v1 MCP schema',
  );
}

function validateRemoteServer(name, server, target, errors, warnings) {
  const fields = new Set(['type', 'url', 'headers']);
  if (target === 'openai') fields.add('extensions');
  unknownKeys(server, fields, 'mcp.json server ' + name, errors);
  validateServerExtensions(name, server, target, errors, warnings);
  if (server.type !== 'streamable-http' && server.type !== 'sse') {
    errors.push('mcp.json server ' + name + ': remote type must be streamable-http or sse');
  }
  try {
    const url = new URL(server.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
    if (url.username || url.password || url.hash) throw new Error('userinfo and fragments are forbidden');
    const hostname = url.hostname.toLowerCase();
    const loopback = hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname === '[0:0:0:0:0:0:0:1]';
    if (!loopback && url.protocol !== 'https:') {
      throw new Error('non-loopback URLs must use HTTPS');
    }
  } catch (error) {
    errors.push('mcp.json server ' + name + ': invalid URL (' + error.message + ')');
  }
  if (server.headers !== undefined) {
    if (!isObject(server.headers)) {
      errors.push('mcp.json server ' + name + ': headers must be an object');
    } else {
      const seen = new Set();
      for (const [header, value] of Object.entries(server.headers)) {
        const lower = header.toLowerCase();
        if (seen.has(lower)) errors.push('mcp.json server ' + name + ': duplicate header ' + header);
        seen.add(lower);
        if (typeof value !== 'string') errors.push('mcp.json server ' + name + ': header values must be strings');
        try {
          new Headers([[header, String(value)]]);
        } catch {
          errors.push('mcp.json server ' + name + ': invalid HTTP header ' + header);
        }
      }
    }
  }
}

function pathEscapesRoot(root, value) {
  const resolved = path.resolve(root, value);
  return resolved !== root && !resolved.startsWith(root + path.sep);
}

function placeholderEscapes(value, placeholder) {
  if (value === placeholder) return false;
  const tail = value.slice(placeholder.length + 1);
  let depth = 0;
  for (const part of tail.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (depth === 0) return true;
      depth -= 1;
    } else {
      depth += 1;
    }
  }
  return false;
}

function validateStdioServer(root, name, server, target, errors, warnings) {
  const fields = new Set(['type', 'command', 'args', 'env', 'cwd']);
  if (target === 'openai') fields.add('extensions');
  unknownKeys(server, fields, 'mcp.json server ' + name, errors);
  validateServerExtensions(name, server, target, errors, warnings);
  if (server.type !== 'stdio') errors.push('mcp.json server ' + name + ': local server type must be stdio');
  if (typeof server.command !== 'string' || !server.command.trim()) {
    errors.push('mcp.json server ' + name + ': command is required');
  } else {
    if (server.command.includes(PLUGIN_ROOT) || server.command.includes(PLUGIN_DATA)) {
      errors.push('mcp.json server ' + name + ': placeholders are not allowed in command');
    }
    const cursorCommand = target === 'cursor' && (
      server.command === CURSOR_PLUGIN_ROOT ||
      server.command.startsWith(CURSOR_PLUGIN_ROOT + '/')
    );
    const hasSeparator = /[\\/]/.test(server.command);
    if (hasSeparator && !server.command.startsWith('./') && !cursorCommand) {
      errors.push('mcp.json server ' + name + ': bundled commands must use a relative ./ path');
    }
    if (!hasSeparator && /\s/.test(server.command)) {
      errors.push('mcp.json server ' + name + ': command must be one executable token');
    }
    if (server.command.startsWith('./')) {
      const commandPath = path.resolve(root, server.command);
      if (pathEscapesRoot(root, server.command) || !fs.existsSync(commandPath) || !fs.statSync(commandPath).isFile()) {
        errors.push('mcp.json server ' + name + ': bundled command does not exist inside the plugin');
      }
    } else if (cursorCommand) {
      const relativeCommand = '.' + server.command.slice(CURSOR_PLUGIN_ROOT.length);
      const commandPath = path.resolve(root, relativeCommand);
      if (
        placeholderEscapes(server.command, CURSOR_PLUGIN_ROOT) ||
        !fs.existsSync(commandPath) ||
        !fs.statSync(commandPath).isFile()
      ) {
        errors.push('mcp.json server ' + name + ': Cursor command does not exist inside the plugin');
      }
    }
  }
  if (server.args !== undefined && (
    !Array.isArray(server.args) ||
    server.args.some((value) => typeof value !== 'string')
  )) {
    errors.push('mcp.json server ' + name + ': args must be an array of strings');
  }
  if (server.env !== undefined) {
    if (!isObject(server.env)) {
      errors.push('mcp.json server ' + name + ': env must be an object');
    } else {
      for (const [key, value] of Object.entries(server.env)) {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          errors.push('mcp.json server ' + name + ': invalid environment variable name ' + key);
        }
        if (['PLUGIN_ROOT', 'PLUGIN_DATA'].includes(key.toUpperCase())) {
          errors.push('mcp.json server ' + name + ': reserved environment variable name ' + key);
        }
        if (typeof value !== 'string') errors.push('mcp.json server ' + name + ': env values must be strings');
      }
    }
  }
  if (server.cwd !== undefined) {
    if (typeof server.cwd !== 'string') {
      errors.push('mcp.json server ' + name + ': cwd must be a string');
    } else if (server.cwd.startsWith('./')) {
      if (pathEscapesRoot(root, server.cwd)) {
        errors.push('mcp.json server ' + name + ': cwd escapes the plugin root');
      } else {
        const cwdPath = path.resolve(root, server.cwd);
        if (!fs.existsSync(cwdPath) || !fs.statSync(cwdPath).isDirectory()) {
          errors.push('mcp.json server ' + name + ': cwd does not resolve to a plugin directory');
        }
      }
    } else if (
      target === 'cursor' &&
      (server.cwd === CURSOR_PLUGIN_ROOT || server.cwd.startsWith(CURSOR_PLUGIN_ROOT + '/'))
    ) {
      if (placeholderEscapes(server.cwd, CURSOR_PLUGIN_ROOT)) {
        errors.push('mcp.json server ' + name + ': cwd escapes CURSOR_PLUGIN_ROOT');
      }
    } else if (server.cwd === PLUGIN_ROOT || server.cwd.startsWith(PLUGIN_ROOT + '/')) {
      if (placeholderEscapes(server.cwd, PLUGIN_ROOT)) {
        errors.push('mcp.json server ' + name + ': cwd escapes PLUGIN_ROOT');
      }
    } else if (server.cwd === PLUGIN_DATA || server.cwd.startsWith(PLUGIN_DATA + '/')) {
      if (placeholderEscapes(server.cwd, PLUGIN_DATA)) {
        errors.push('mcp.json server ' + name + ': cwd escapes PLUGIN_DATA');
      }
    } else {
      errors.push('mcp.json server ' + name + ': cwd must start with ./, ' + PLUGIN_ROOT + ', or ' + PLUGIN_DATA);
    }
  }
}

function validateMcp(root, target, errors, warnings) {
  const file = path.join(root, 'mcp.json');
  if (!fs.existsSync(file)) return;
  if (!resolvesInside(root, file)) {
    errors.push('mcp.json: path does not resolve inside the plugin root');
    return;
  }
  const config = readJson(file, errors);
  if (!config) return;
  unknownKeys(config, new Set(['$schema', 'mcpServers']), 'mcp.json', errors);
  if (config.$schema !== MCP_SCHEMA) errors.push('mcp.json: $schema must be ' + MCP_SCHEMA);
  if (!isObject(config.mcpServers)) {
    errors.push('mcp.json: mcpServers must be an object');
    return;
  }
  for (const [name, server] of Object.entries(config.mcpServers)) {
    if (!isObject(server)) {
      errors.push('mcp.json server ' + name + ': definition must be an object');
      continue;
    }
    if (server.url !== undefined) validateRemoteServer(name, server, target, errors, warnings);
    else validateStdioServer(root, name, server, target, errors, warnings);
  }
  if (target === 'cursor') {
    const serialized = JSON.stringify(config);
    if (serialized.includes(PLUGIN_ROOT) || serialized.includes(PLUGIN_DATA)) {
      errors.push(
        'Cursor does not expand ' + PLUGIN_ROOT + ' or ' + PLUGIN_DATA +
        '; use a Cursor-specific adapter with ' + '$' + '{CURSOR_PLUGIN_ROOT}',
      );
    }
    if (serialized.includes(CURSOR_PLUGIN_ROOT)) {
      warnings.push(
        'mcp.json uses Cursor-specific ' + CURSOR_PLUGIN_ROOT +
        '; validate this adapter separately from the portable package',
      );
    }
  }
}

function validateContainment(root, errors) {
  const realRoot = fs.realpathSync.native(root);
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name);
      let real;
      try {
        real = fs.realpathSync.native(candidate);
      } catch (error) {
        errors.push(path.relative(root, candidate) + ': cannot resolve path (' + error.message + ')');
        continue;
      }
      if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
        errors.push(path.relative(root, candidate) + ': link escapes the plugin root');
        continue;
      }
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(candidate);
    }
  };
  visit(root);
}

function scanSecrets(root, errors) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
    /\bgh[opusr]_[A-Za-z0-9]{20,}\b/,
    /\bAIza[0-9A-Za-z_-]{30,}\b/,
  ];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        visit(candidate);
        continue;
      }
      if (!entry.isFile() || fs.statSync(candidate).size > 1024 * 1024) continue;
      const content = fs.readFileSync(candidate, 'utf8');
      if (patterns.some((pattern) => pattern.test(content))) {
        errors.push(path.relative(root, candidate) + ': possible secret detected');
      }
    }
  };
  visit(root);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message + '\n\n' + usage());
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log(usage());
    return;
  }
  if (!fs.existsSync(options.root) || !fs.statSync(options.root).isDirectory()) {
    console.error('Plugin root is not a directory: ' + options.root);
    process.exitCode = 2;
    return;
  }

  const errors = [];
  const warnings = [];
  validateContainment(options.root, errors);
  validatePluginManifest(options.root, errors);
  validateSkills(options.root, errors, warnings);
  validateMcp(options.root, options.target, errors, warnings);
  scanSecrets(options.root, errors);

  const result = {
    valid: errors.length === 0,
    target: options.target,
    root: options.root,
    errors,
    warnings,
  };
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log((result.valid ? 'PASS' : 'FAIL') + ' ' + options.root);
    for (const warning of warnings) console.log('WARN ' + warning);
    for (const error of errors) console.log('ERROR ' + error);
  }
  if (!result.valid) process.exitCode = 1;
}

main();
