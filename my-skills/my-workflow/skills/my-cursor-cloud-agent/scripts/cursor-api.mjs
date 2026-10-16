// Cursor Cloud Agents API. Reads CURSOR_API_KEY. Never prints the key.
import { execFileSync } from 'node:child_process';

const BASE = 'https://api.cursor.com';
const DOC_API = 'https://cursor.com/docs/api';
const DOC_ENDPOINTS = 'https://cursor.com/docs/cloud-agent/api/endpoints';
const TERMINAL = new Set(['FINISHED', 'ERROR', 'CANCELLED', 'EXPIRED']);
const ACTIVE = new Set(['CREATING', 'RUNNING']);

function readUserEnv(name) {
  if (process.platform !== 'win32') return '';
  try {
    const out = execFileSync('reg', ['query', 'HKCU\\Environment', '/v', name], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 5000,
    });
    const line = out.split(/\r?\n/).find((row) => row.includes(name) && /REG_(?:EXPAND_)?SZ/.test(row));
    const match = line && line.match(/REG_(?:EXPAND_)?SZ\s+(.*)$/);
    return match ? match[1].trim() : '';
  } catch {
    return '';
  }
}

function loadKey() {
  const raw = process.env.CURSOR_API_KEY || readUserEnv('CURSOR_API_KEY') || '';
  return raw.trim().replace(/^["']|["']$/g, '');
}

const apiKey = loadKey();

function redact(text) {
  if (!text || !apiKey) return text || '';
  return String(text).split(apiKey).join('[redacted]');
}

function docFor(code) {
  if ([
    'agent_busy',
    'run_not_cancellable',
    'agent_id_conflict',
    'bad_request',
    'not_found',
    'stream_expired',
    'validation_error',
    'invalid_last_event_id',
    'missing_args',
    'no_active_run',
  ].includes(code)) {
    return DOC_ENDPOINTS;
  }
  return DOC_API;
}

function failJson(payload, exitCode = 1) {
  const code = payload.code || 'http_error';
  const line = JSON.stringify({
    ok: false,
    status: payload.status ?? 0,
    code,
    message: redact(String(payload.message || '')).slice(0, 500),
    doc: payload.doc || docFor(code),
    ...(payload.latestRunId ? { latestRunId: payload.latestRunId } : {}),
    ...(payload.agentStatus ? { agentStatus: payload.agentStatus } : {}),
  });
  process.stderr.write(`${line}\n`);
  process.exit(exitCode);
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function parseBody(text) {
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function messageFrom(body, text) {
  if (typeof body.message === 'string' && body.message) return body.message;
  if (typeof body.error === 'string' && body.error) return body.error;
  return redact(text || '').slice(0, 300);
}

function codeFrom(status, body) {
  const raw = typeof body.code === 'string' ? body.code : '';
  if (/^[a-z0-9_]+$/.test(raw)) return raw;
  const error = typeof body.error === 'string' ? body.error : '';
  if (/^[a-z0-9_]+$/.test(error)) return error;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 400) return 'bad_request';
  if (status === 409) return 'conflict';
  if (status === 410) return 'stream_expired';
  if (status === 429) return 'rate_limited';
  return 'http_error';
}

function failApi(result, extra = {}) {
  const body = parseBody(result.text);
  const code = extra.code || codeFrom(result.status, body);
  failJson({
    status: result.status,
    code,
    message: messageFrom(body, result.text),
    doc: docFor(code),
    ...extra,
  }, 1);
}

function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--auto-pr') {
      flags.autoPr = true;
      continue;
    }
    if (arg === '--model-param') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--') || !value.includes('=')) {
        failJson({ status: 0, code: 'missing_args', message: '--model-param 需要 id=value' }, 2);
      }
      flags.modelParams = flags.modelParams || [];
      flags.modelParams.push(value);
      i += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        failJson({ status: 0, code: 'missing_args', message: `${arg} 需要值` }, 2);
      }
      flags[arg.slice(2)] = value;
      i += 1;
      continue;
    }
    positionals.push(arg);
  }
  return { positionals, flags };
}

function clip(text, max = 500) {
  const value = String(text || '');
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function waitSeconds(flags) {
  if (flags.wait === undefined) return 60;
  const seconds = Number(flags.wait);
  if (!Number.isFinite(seconds) || seconds < 0) {
    failJson({ status: 0, code: 'missing_args', message: '--wait 需要 0 到 300 的秒數' }, 2);
  }
  return Math.min(300, seconds);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function request(method, path, body, timeoutMs = 60000) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
  const init = { method, headers, signal: AbortSignal.timeout(timeoutMs) };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let response;
  try {
    response = await fetch(`${BASE}${path}`, init);
  } catch (error) {
    failJson({
      status: 0,
      code: 'network',
      message: error instanceof Error ? error.message : 'unknown',
    }, 1);
  }
  const text = redact(await response.text());
  return { ok: response.ok, status: response.status, text };
}

function emitRaw(result) {
  if (!result.ok) failApi(result);
  if (result.text) {
    process.stdout.write(result.text.endsWith('\n') ? result.text : `${result.text}\n`);
  }
}

async function streamApi(path) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      signal: AbortSignal.timeout(300000),
    });
  } catch (error) {
    failJson({
      status: 0,
      code: 'network',
      message: error instanceof Error ? error.message : 'unknown',
    }, 1);
  }
  if (!response.ok) {
    const text = redact(await response.text());
    failApi({ ok: false, status: response.status, text });
  }
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    process.stdout.write(redact(decoder.decode(value, { stream: true })));
  }
}

function modelSelection(flags) {
  if (!flags.model) return undefined;
  const params = (flags.modelParams || []).map((entry) => {
    const eq = entry.indexOf('=');
    return { id: entry.slice(0, eq), value: entry.slice(eq + 1) };
  });
  const model = { id: flags.model };
  if (params.length > 0) model.params = params;
  return model;
}

function repoBody(flags) {
  const repo = { url: flags.repo };
  if (flags.ref) repo.startingRef = flags.ref;
  return repo;
}

async function loadStatus(agentId) {
  const agentResult = await request('GET', `/v1/agents/${agentId}`);
  if (!agentResult.ok) failApi(agentResult);
  const agent = parseBody(agentResult.text);
  let run = {};
  if (agent.latestRunId) {
    const runResult = await request('GET', `/v1/agents/${agentId}/runs/${agent.latestRunId}`);
    if (!runResult.ok) failApi(runResult);
    run = parseBody(runResult.text);
  }
  const runStatus = typeof run.status === 'string' ? run.status : '';
  return {
    agentId: agent.id || agentId,
    url: agent.url || `https://cursor.com/agents/${agentId}`,
    agentStatus: agent.status || '',
    runId: run.id || agent.latestRunId || '',
    runStatus,
    terminal: TERMINAL.has(runStatus),
    result: clip(run.result),
    branches: Array.isArray(run.git?.branches) ? run.git.branches.map((branch) => ({
      repoUrl: branch.repoUrl,
      branch: branch.branch,
      prUrl: branch.prUrl,
    })) : [],
  };
}

async function openAgent(flags) {
  if (!flags.prompt || !flags.repo) {
    failJson({ status: 0, code: 'missing_args', message: 'open 需要 --prompt --repo，--ref 可省略' }, 2);
  }
  const body = {
    prompt: { text: flags.prompt },
    repos: [repoBody(flags)],
    autoCreatePR: Boolean(flags.autoPr),
  };
  if (flags.name) body.name = flags.name;
  const model = modelSelection(flags);
  if (model) body.model = model;
  const result = await request('POST', '/v1/agents', body);
  if (!result.ok) failApi(result);
  const data = parseBody(result.text);
  writeJson({
    agentId: data.agent?.id || '',
    runId: data.run?.id || data.agent?.latestRunId || '',
    url: data.agent?.url || '',
    status: data.run?.status || data.agent?.status || '',
  });
}

async function sendPrompt(agentId, prompt) {
  const result = await request('POST', `/v1/agents/${agentId}/runs`, {
    prompt: { text: prompt },
  });
  if (result.ok) {
    const data = parseBody(result.text);
    writeJson({
      agentId,
      runId: data.run?.id || '',
      url: `https://cursor.com/agents/${agentId}`,
      status: data.run?.status || '',
    });
    return;
  }
  if (result.status === 409) {
    const body = parseBody(result.text);
    let latestRunId = '';
    let agentStatus = '';
    const agentResult = await request('GET', `/v1/agents/${agentId}`);
    if (agentResult.ok) {
      const agent = parseBody(agentResult.text);
      latestRunId = agent.latestRunId || '';
      agentStatus = agent.status || '';
    }
    failApi(result, {
      code: 'agent_busy',
      latestRunId,
      agentStatus,
    });
  }
  failApi(result);
}

async function watchAgent(agentId, seconds) {
  const maxMs = seconds * 1000;
  const started = Date.now();
  let snapshot = await loadStatus(agentId);
  while (!snapshot.terminal && ACTIVE.has(snapshot.runStatus)) {
    const elapsed = Date.now() - started;
    if (elapsed >= maxMs) {
      snapshot = { ...snapshot, timedOut: true };
      break;
    }
    await sleep(Math.min(15000, maxMs - elapsed));
    snapshot = await loadStatus(agentId);
  }
  writeJson(snapshot);
}

async function stopAgent(agentId, runId) {
  let targetRun = runId;
  if (!targetRun) {
    const agentResult = await request('GET', `/v1/agents/${agentId}`);
    if (!agentResult.ok) failApi(agentResult);
    targetRun = parseBody(agentResult.text).latestRunId || '';
  }
  if (!targetRun) {
    failJson({ status: 0, code: 'no_active_run', message: '這則沒有可取消的執行' }, 2);
  }
  const result = await request('POST', `/v1/agents/${agentId}/runs/${targetRun}/cancel`, {});
  if (result.ok) {
    const data = parseBody(result.text);
    writeJson({
      agentId,
      runId: data.run?.id || targetRun,
      url: `https://cursor.com/agents/${agentId}`,
      status: data.run?.status || 'CANCELLED',
    });
    return;
  }
  if (result.status === 409) {
    failApi(result, { code: 'run_not_cancellable' });
  }
  failApi(result);
}

async function recentAgents() {
  const result = await request('GET', '/v1/agents?limit=5');
  if (!result.ok) failApi(result);
  const data = parseBody(result.text);
  const items = Array.isArray(data.items) ? data.items : [];
  writeJson({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      url: item.url,
      latestRunId: item.latestRunId || '',
    })),
  });
}

if (!apiKey) {
  failJson({ status: 0, code: 'missing_key', message: '找不到環境變數 CURSOR_API_KEY' }, 2);
}

const [command, ...rest] = process.argv.slice(2);
const { positionals, flags } = parseArgs(rest);
const [agentId, runId] = positionals;

switch (command) {
  case 'check': {
    const result = await request('GET', '/v1/me');
    if (!result.ok) failApi(result);
    const me = parseBody(result.text);
    writeJson({ ok: true, apiKeyName: me.apiKeyName || '', userEmail: me.userEmail || '' });
    break;
  }
  case 'open':
    await openAgent(flags);
    break;
  case 'send':
    if (!agentId || !flags.prompt) {
      failJson({ status: 0, code: 'missing_args', message: 'send 需要 agentId 與 --prompt' }, 2);
    }
    await sendPrompt(agentId, flags.prompt);
    break;
  case 'status':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'status 需要 agentId' }, 2);
    writeJson(await loadStatus(agentId));
    break;
  case 'watch':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'watch 需要 agentId' }, 2);
    await watchAgent(agentId, waitSeconds(flags));
    break;
  case 'stop':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'stop 需要 agentId' }, 2);
    await stopAgent(agentId, runId);
    break;
  case 'recent':
    await recentAgents();
    break;
  case 'me':
    emitRaw(await request('GET', '/v1/me'));
    break;
  case 'repos':
    emitRaw(await request('GET', '/v1/repositories'));
    break;
  case 'models':
    emitRaw(await request('GET', '/v1/models'));
    break;
  case 'list':
    emitRaw(await request('GET', '/v1/agents'));
    break;
  case 'get':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'get 需要 agentId' }, 2);
    emitRaw(await request('GET', `/v1/agents/${agentId}`));
    break;
  case 'create': {
    if (!flags.name || !flags.prompt || !flags.repo) {
      failJson({ status: 0, code: 'missing_args', message: 'create 需要 --name --prompt --repo，--ref 可省略' }, 2);
    }
    const body = {
      name: flags.name,
      prompt: { text: flags.prompt },
      repos: [repoBody(flags)],
      autoCreatePR: Boolean(flags.autoPr),
    };
    const model = modelSelection(flags);
    if (model) body.model = model;
    emitRaw(await request('POST', '/v1/agents', body));
    break;
  }
  case 'follow':
    if (!agentId || !flags.prompt) {
      failJson({ status: 0, code: 'missing_args', message: 'follow 需要 agentId 與 --prompt' }, 2);
    }
    emitRaw(await request('POST', `/v1/agents/${agentId}/runs`, { prompt: { text: flags.prompt } }));
    break;
  case 'run':
    if (!agentId || !runId) failJson({ status: 0, code: 'missing_args', message: 'run 需要 agentId 與 runId' }, 2);
    emitRaw(await request('GET', `/v1/agents/${agentId}/runs/${runId}`));
    break;
  case 'stream':
    if (!agentId || !runId) failJson({ status: 0, code: 'missing_args', message: 'stream 需要 agentId 與 runId' }, 2);
    await streamApi(`/v1/agents/${agentId}/runs/${runId}/stream`);
    break;
  case 'cancel':
    if (!agentId || !runId) failJson({ status: 0, code: 'missing_args', message: 'cancel 需要 agentId 與 runId' }, 2);
    emitRaw(await request('POST', `/v1/agents/${agentId}/runs/${runId}/cancel`, {}));
    break;
  case 'usage':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'usage 需要 agentId' }, 2);
    emitRaw(await request('GET', `/v1/agents/${agentId}/usage`));
    break;
  case 'archive':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'archive 需要 agentId' }, 2);
    emitRaw(await request('POST', `/v1/agents/${agentId}/archive`, {}));
    break;
  case 'unarchive':
    if (!agentId) failJson({ status: 0, code: 'missing_args', message: 'unarchive 需要 agentId' }, 2);
    emitRaw(await request('POST', `/v1/agents/${agentId}/unarchive`, {}));
    break;
  default:
    failJson({
      status: 0,
      code: 'missing_args',
      message: '子命令：check open send status watch stop recent，或 me repos models list get create follow run stream cancel usage archive unarchive',
    }, 2);
}
