import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptDir = new URL('.', import.meta.url);
const validateScript = new URL('validate-agent-plugin.mjs', scriptDir);
const scaffoldScript = new URL('scaffold-agent-plugin.mjs', scriptDir);
const pluginSchema = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const mcpSchema = 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json';

function tempDir(name) {
  return mkdtempSync(join(tmpdir(), `${name}-`));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runValidate(root, ...args) {
  return spawnSync(process.execPath, [fileURLToPath(validateScript), root, ...args], {
    encoding: 'utf8',
  });
}

test('accepts a minimal portable skill plugin', () => {
  const root = tempDir('agent-plugin-valid');
  mkdirSync(join(root, 'skills', 'summarize'), { recursive: true });
  writeJson(join(root, 'plugin.json'), { $schema: pluginSchema, name: 'reports' });
  writeFileSync(
    join(root, 'skills', 'summarize', 'SKILL.md'),
    '---\nname: summarize\ndescription: Summarize records when a concise status update is requested.\n---\n\nSummarize the records.\n',
    'utf8',
  );

  const result = runValidate(root, '--json');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.valid, true);
  assert.deepEqual(report.errors, []);
});

test('rejects schema mismatch and invalid skill frontmatter', () => {
  const root = tempDir('agent-plugin-invalid');
  mkdirSync(join(root, 'skills', 'Bad-Skill'), { recursive: true });
  writeJson(join(root, 'plugin.json'), { $schema: pluginSchema, name: 'reports' });
  writeJson(join(root, 'mcp.json'), {
    $schema: 'https://agent-plugins.org/schemas/2.0.0/mcp.schema.json',
    mcpServers: {},
  });
  writeFileSync(
    join(root, 'skills', 'Bad-Skill', 'SKILL.md'),
    '---\nname: other-name\ndescription: invalid\n---\n',
    'utf8',
  );

  const result = runValidate(root, '--json');
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.valid, false);
  assert.match(report.errors.join('\n'), /mcp\.json.*schema/i);
  assert.match(report.errors.join('\n'), /parent directory/i);
});

test('reports Cursor placeholder incompatibility only for the Cursor target', () => {
  const root = tempDir('agent-plugin-cursor');
  writeJson(join(root, 'plugin.json'), { $schema: pluginSchema, name: 'reports' });
  writeJson(join(root, 'mcp.json'), {
    $schema: mcpSchema,
    mcpServers: {
      local: {
        type: 'stdio',
        command: 'node',
        args: ['${PLUGIN_ROOT}/server.mjs'],
        cwd: '${PLUGIN_DATA}/cache',
      },
    },
  });

  const portable = runValidate(root, '--json');
  assert.equal(portable.status, 0, portable.stderr || portable.stdout);

  const cursor = runValidate(root, '--target', 'cursor', '--json');
  assert.equal(cursor.status, 1);
  assert.match(JSON.parse(cursor.stdout).errors.join('\n'), /Cursor.*PLUGIN_ROOT|PLUGIN_DATA.*Cursor/i);
});

test('accepts v1 string metadata and plugin-relative cwd without enforcing SemVer', () => {
  const root = tempDir('agent-plugin-schema');
  mkdirSync(join(root, 'bin'), { recursive: true });
  writeFileSync(join(root, 'bin', 'server.js'), '', 'utf8');
  writeJson(join(root, 'plugin.json'), {
    $schema: pluginSchema,
    name: 'reports.tools',
    version: 'release-candidate',
    description: '',
  });
  writeJson(join(root, 'mcp.json'), {
    $schema: mcpSchema,
    mcpServers: {
      local: {
        type: 'stdio',
        command: './bin/server.js',
        cwd: './bin',
      },
    },
  });

  const result = runValidate(root, '--json');
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('allows documented OpenAI MCP extensions only for the OpenAI target', () => {
  const root = tempDir('agent-plugin-openai');
  writeJson(join(root, 'plugin.json'), { $schema: pluginSchema, name: 'reports' });
  writeJson(join(root, 'mcp.json'), {
    $schema: mcpSchema,
    mcpServers: {
      docs: {
        type: 'streamable-http',
        url: 'https://example.com/mcp',
        extensions: { 'com.openai': { auth: { type: 'none' } } },
      },
    },
  });

  const portable = runValidate(root, '--json');
  assert.equal(portable.status, 1);
  assert.match(JSON.parse(portable.stdout).errors.join('\n'), /not part of portable/i);

  const openai = runValidate(root, '--target', 'openai', '--json');
  assert.equal(openai.status, 0, openai.stderr || openai.stdout);
  assert.match(JSON.parse(openai.stdout).warnings.join('\n'), /outside the closed portable/i);
});

test('allows Cursor root placeholders only for the Cursor target', () => {
  const root = tempDir('agent-plugin-cursor-root');
  mkdirSync(join(root, 'bin'), { recursive: true });
  writeFileSync(join(root, 'bin', 'server.js'), '', 'utf8');
  writeJson(join(root, 'plugin.json'), { $schema: pluginSchema, name: 'reports' });
  writeJson(join(root, 'mcp.json'), {
    $schema: mcpSchema,
    mcpServers: {
      local: {
        type: 'stdio',
        command: '${CURSOR_PLUGIN_ROOT}/bin/server.js',
        cwd: '${CURSOR_PLUGIN_ROOT}',
      },
    },
  });

  const portable = runValidate(root, '--json');
  assert.equal(portable.status, 1);

  const cursor = runValidate(root, '--target', 'cursor', '--json');
  assert.equal(cursor.status, 0, cursor.stderr || cursor.stdout);
  assert.match(JSON.parse(cursor.stdout).warnings.join('\n'), /Cursor-specific/i);
});

test('scaffold dry-run does not write and real run refuses overwrite', () => {
  const parent = tempDir('agent-plugin-scaffold');
  const root = join(parent, 'demo-plugin');

  const dryRun = spawnSync(
    process.execPath,
    [
      fileURLToPath(scaffoldScript),
      root,
      '--name',
      'demo-plugin',
      '--skill',
      'summarize',
      '--remote-mcp',
      'docs=https://example.com/mcp',
      '--dry-run',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(dryRun.status, 0, dryRun.stderr || dryRun.stdout);
  assert.throws(() => readFileSync(join(root, 'plugin.json'), 'utf8'));

  execFileSync(
    process.execPath,
    [
      fileURLToPath(scaffoldScript),
      root,
      '--name',
      'demo-plugin',
      '--skill',
      'summarize',
      '--remote-mcp',
      'docs=https://example.com/mcp',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8')).name, 'demo-plugin');
  assert.equal(JSON.parse(readFileSync(join(root, 'mcp.json'), 'utf8')).$schema, mcpSchema);
  assert.match(
    readFileSync(join(root, 'skills', 'summarize', 'SKILL.md'), 'utf8'),
    /description: "TODO:/,
  );

  const overwrite = spawnSync(
    process.execPath,
    [fileURLToPath(scaffoldScript), root, '--name', 'demo-plugin'],
    { encoding: 'utf8' },
  );
  assert.equal(overwrite.status, 1);
  assert.match(overwrite.stderr, /already exists/i);

  const unsafeUrl = spawnSync(
    process.execPath,
    [
      fileURLToPath(scaffoldScript),
      join(parent, 'unsafe-plugin'),
      '--name',
      'unsafe-plugin',
      '--remote-mcp',
      'docs=https://user@example.com/mcp#token',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(unsafeUrl.status, 1);
  assert.match(unsafeUrl.stderr, /userinfo|fragment/i);
});
