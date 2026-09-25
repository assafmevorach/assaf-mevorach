// Production-server integration tests. Local test double only, never imported by the app.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
const exec = promisify(execFile);
const records = new Map();
const testToken = randomBytes(32).toString('hex');
const setupToken = randomBytes(32).toString('hex');
const machineToken = randomBytes(32).toString('hex');
let unavailable = false;
function get(key) {
  const row = records.get(key);
  if (row && row.expires && row.expires <= Date.now()) { records.delete(key); return null; }
  return row?.value ?? null;
}
const kv = createServer(async (req, res) => {
  if (unavailable) { res.writeHead(503).end(); return; }
  assert.equal(req.headers.authorization, `Bearer ${testToken}`);
  let raw = ''; for await (const chunk of req) raw += chunk;
  const [command, ...args] = JSON.parse(raw); let result;
  if (command === 'GET') result = get(args[0]);
  else if (command === 'DEL') result = Number(records.delete(args[0]));
  else if (command === 'SET') {
    const [key, value, ...options] = args;
    if (options.includes('NX') && get(key) !== null) result = null;
    else {
      const expiry = options.indexOf('EX');
      records.set(key, { value, expires: expiry < 0 ? null : Date.now() + options[expiry + 1] * 1000 }); result = 'OK';
    }
  } else if (command === 'EVAL') {
    const [script, , key, before, after] = args;
    if (script.includes("redis.call('INCR'")) {
      const previous = get(key); result = Number(previous ?? 0) + 1;
      records.set(key, { value: String(result), expires: previous === null ? Date.now() + Number(before) * 1000 : records.get(key).expires });
    } else {
      result = get(key) === before ? 1 : 0;
      if (result) records.set(key, { value: after, expires: null });
    }
  } else throw new Error(`Unsupported command ${command}`);
  res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ result }));
});
kv.listen(0, '127.0.0.1'); await once(kv, 'listening');
const free = createServer(); free.listen(0, '127.0.0.1'); await once(free, 'listening');
const port = free.address().port; await new Promise(resolve => free.close(resolve));
const origin = `http://localhost:${port}`;
let app; let logs = '';
async function start(configured) {
  const env = { ...process.env, PORT: String(port) };
  delete env.KV_REST_API_URL; delete env.KV_REST_API_TOKEN;
  if (configured) Object.assign(env, { KV_REST_API_URL: `http://127.0.0.1:${kv.address().port}`, KV_REST_API_TOKEN: testToken, FOUNDRY_SETUP_TOKEN: setupToken, FOUNDRY_ORCHESTRATOR_TOKEN: machineToken });
  app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  app.stdout.on('data', chunk => { logs += chunk; }); app.stderr.on('data', chunk => { logs += chunk; });
  for (let i = 0; i < 100; i++) {
    try { await curl('/foundry/login'); return; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  throw new Error('next start failed: ' + logs);
}
async function stop() { const ended = once(app, 'exit'); app.kill('SIGTERM'); await ended; }
async function curl(path, { body, cookie, bearer, badOrigin = false } = {}) {
  const args = ['-sS', '--max-time', '15', '-D', '-', origin + path];
  if (body !== undefined) args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-H', `Origin: ${badOrigin ? 'https://untrusted.example' : origin}`, '--data', JSON.stringify(body));
  if (cookie) args.push('-H', 'Cookie: ' + cookie);
  if (bearer) args.push('-H', 'Authorization: Bearer ' + bearer);
  const { stdout } = await exec('curl', args);
  const split = stdout.indexOf('\r\n\r\n'); const headers = stdout.slice(0, split); const content = stdout.slice(split + 4);
  return { status: Number(headers.match(/^HTTP\/\S+ (\d+)/)[1]), headers, content, json: () => JSON.parse(content) };
}
try {
  await start(false);
  assert.match((await curl('/foundry/login')).content, /Foundry is unavailable/);
  assert.equal((await curl('/api/foundry/login', { body: { password: 'a sufficiently long password' } })).status, 503);
  assert.equal((await curl('/foundry')).status, 307);
  await stop();
  console.log('PASS: unconfigured storage fails closed');
  await start(true);
  assert.match((await curl('/foundry/login')).content, /Set your password/);
  assert.equal((await curl('/foundry')).status, 307);
  assert.equal((await curl('/foundry', { cookie: '__Host-foundry=' + 'a'.repeat(64) })).status, 307);
  assert.equal((await curl('/api/foundry/data')).status, 401);
  const password = 'a sufficiently long password';
  assert.equal((await curl('/api/foundry/setup', { body: { password } })).status, 403);
  assert.equal((await curl('/api/foundry/setup', { body: { password: 'short', setupToken } })).status, 400);
  const raced = await Promise.all([1, 2].map(() => curl('/api/foundry/setup', { body: { password, setupToken } })));
  assert.deepEqual(raced.map(r => r.status).sort(), [200, 409]);
  assert.match(JSON.parse(get('foundry:password')), /^\$2[ab]\$12\$/);
  assert.equal((await curl('/api/foundry/setup', { body: { password, setupToken } })).status, 409);
  assert.match((await curl('/foundry/login')).content, /Enter password/);
  assert.equal((await curl('/api/foundry/login', { body: { password: 'wrong password long enough' } })).status, 401);
  assert.equal((await curl('/api/foundry/login', { body: { password }, badOrigin: true })).status, 403);
  const login = await curl('/api/foundry/login', { body: { password } }); assert.equal(login.status, 200);
  const cookie = login.headers.match(/set-cookie: ([^;]+)/i)[1];
  for (const pattern of [/HttpOnly/i, /Secure/i, /SameSite=lax/i, /Max-Age=2592000/i, /Path=\//i]) assert.match(login.headers, pattern);
  const dashboard = await curl('/foundry', { cookie }); assert.equal(dashboard.status, 200);
  for (const label of ['Now pursuing', 'Waiting on you', 'Waiting on me', 'Documents', 'Inputs']) assert.ok(dashboard.content.includes(label));
  assert.match(dashboard.headers, /private, no-store/i);
  console.log('PASS: setup race, repeat setup, password rejection, redirects, session cookie and dashboard');
  const initial = (await curl('/api/foundry/data', { cookie })).json();
  await Promise.all(['first concurrent input', 'second concurrent input'].map(text => curl('/api/foundry/inputs', { cookie, body: { text } }).then(r => assert.equal(r.status, 200))));
  let data = (await curl('/api/foundry/data', { cookie })).json(); assert.equal(data.inputs.length, initial.inputs.length + 2);
  const inputId = data.inputs[0].id;
  assert.equal((await curl('/api/foundry/comments', { bearer: machineToken, body: { inputId, text: 'Orchestrator reply' } })).status, 200);
  assert.equal((await curl('/api/foundry/comments', { cookie, body: { inputId, text: 'Founder reply' } })).status, 200);
  assert.equal((await curl('/api/foundry/waiting', { cookie, body: { list: 'waitingOnYou', id: data.waitingOnYou[0].id, done: true } })).status, 200);
  assert.equal((await curl('/api/foundry/projects', { bearer: machineToken, body: { id: data.projects[0].id, project: 'Website', task: 'Updated task', status: 'blocked' } })).status, 200);
  assert.equal((await curl('/api/foundry/documents', { bearer: machineToken, body: { label: 'Unsafe', url: 'javascript:alert(1)' } })).status, 400);
  data = (await curl('/api/foundry/data', { cookie })).json();
  assert.deepEqual(data.inputs[0].comments.map(c => c.author), ['Orchestrator', 'Founder']);
  assert.equal(data.waitingOnYou[0].done, true); assert.equal(data.projects[0].status, 'blocked');
  assert.equal((await curl('/api/foundry/inputs', { cookie, badOrigin: true, body: { text: 'No' } })).status, 403);
  assert.equal((await curl('/api/foundry/inputs', { body: { text: 'No' } })).status, 401);
  console.log('PASS: concurrent writes, comments, attribution, toggles, project updates, validation and CSRF');
  unavailable = true;
  assert.equal((await curl('/foundry', { cookie })).status, 503);
  assert.equal((await curl('/api/foundry/data', { cookie })).status, 503);
  unavailable = false;
  const logout = await curl('/api/foundry/logout', { cookie, body: {} }); assert.equal(logout.status, 200); assert.match(logout.headers, /Max-Age=0/i);
  assert.equal((await curl('/api/foundry/data', { cookie })).status, 401);
  assert.equal((await curl('/foundry', { cookie })).status, 307);
  const fresh = await curl('/api/foundry/login', { body: { password } });
  const expiringCookie = fresh.headers.match(/set-cookie: ([^;]+)/i)[1];
  for (const [key, record] of records) if (key.startsWith('foundry:session:')) record.value = JSON.stringify({ expires: Date.now() - 1 });
  assert.equal((await curl('/api/foundry/data', { cookie: expiringCookie })).status, 401);
  let limited;
  for (let i = 0; i < 22; i++) { limited = await curl('/api/foundry/login', { body: { password: 'wrong password long enough' } }); if (limited.status === 429) break; }
  assert.equal(limited.status, 429);
  console.log('PASS: outages fail closed, logout revokes, expiry enforced, auth attempts limited');
} finally {
  if (app && app.exitCode === null) await stop();
  await new Promise(resolve => kv.close(resolve));
}
