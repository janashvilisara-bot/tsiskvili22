const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.TALENTOS_OFFLINE_PORT || 48731);
const APP_DIR = path.join(__dirname, '..', 'dist');
const SEED_PATH = path.join(APP_DIR, 'offline-seed.json');
const DATA_DIR = path.join(process.env.APPDATA || process.env.HOME || process.cwd(), 'TalentOS Offline');
const DATA_PATH = path.join(DATA_DIR, 'offline-data.json');
const ADMIN_PATH = path.join(DATA_DIR, 'offline-admin.json');
const CLOUD_SESSION_PATH = path.join(DATA_DIR, 'cloud-session.json');
const SYNC_QUEUE_PATH = path.join(DATA_DIR, 'sync-queue.json');
const SYNC_STATE_PATH = path.join(DATA_DIR, 'sync-state.json');
const CLOUD_URL = process.env.TALENTOS_CLOUD_URL || process.env.VITE_TALENTOS_CLOUD_URL || 'https://kiurxtmqgcjhxjvvynab.supabase.co';
const CLOUD_KEY = process.env.TALENTOS_CLOUD_PUBLISHABLE_KEY || process.env.VITE_TALENTOS_CLOUD_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImtpdXJ4dG1xZ2NqaHhqdnZ5bmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjQ1MTQsImV4cCI6MjA3NjY0MDUxNH0.6v-iocqHkNc7UN6-N2ZiduPdSpIHr4M7G5J_WzwQKEU';
const CLOUD_FUNCTIONS = new Set(['send-cloudsms', 'send-sms', 'send-email', 'send-password-reset', 'ai-assistant', 'ai-feedback-recommendation', 'ai-performance-review', 'employee-risk-prediction', 'analyze-cv-match', 'signify-oauth', 'signify-sign', 'signify-webhook', 'database-backup', 'globalcell-api', 'herio-auth', 'herio-jobs-sync', 'talentos-jobs-publish', 'talentos-jobs-webhook']);
const SYNC_PAGE_SIZE = 1000;
let syncTimer = null;

const json = (res, status, body, extra = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS', ...extra });
  res.end(JSON.stringify(body));
};

const ensureData = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) {
    const seed = fs.existsSync(SEED_PATH) ? JSON.parse(fs.readFileSync(SEED_PATH, 'utf8')) : { tables: {} };
    fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
  }
};

const readData = () => {
  ensureData();
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
};

const writeData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
const readAdmin = () => fs.existsSync(ADMIN_PATH) ? JSON.parse(fs.readFileSync(ADMIN_PATH, 'utf8')) : null;
const readCloudSession = () => fs.existsSync(CLOUD_SESSION_PATH) ? JSON.parse(fs.readFileSync(CLOUD_SESSION_PATH, 'utf8')) : null;
const writeCloudSession = (session) => fs.writeFileSync(CLOUD_SESSION_PATH, JSON.stringify(session, null, 2));
const readSyncQueue = () => fs.existsSync(SYNC_QUEUE_PATH) ? JSON.parse(fs.readFileSync(SYNC_QUEUE_PATH, 'utf8')) : [];
const writeSyncQueue = (queue) => fs.writeFileSync(SYNC_QUEUE_PATH, JSON.stringify(queue, null, 2));
const writeSyncState = (state) => fs.writeFileSync(SYNC_STATE_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), ...state }, null, 2));
const enqueueSync = (entry) => writeSyncQueue([...readSyncQueue(), { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...entry }]);
const hash = (password, salt) => crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
const tableRows = (data, table) => data.tables?.[table] || [];

const cloudHeaders = (session, extra = {}) => ({
  apikey: CLOUD_KEY,
  Authorization: `Bearer ${session.access_token}`,
  ...extra,
});

const isNewer = (candidate, current) => {
  const a = Date.parse(candidate?.updated_at || candidate?.created_at || '') || 0;
  const b = Date.parse(current?.updated_at || current?.created_at || '') || 0;
  return a >= b;
};

const applyFilters = (rows, params) => {
  let output = [...rows];
  for (const [key, value] of params.entries()) {
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue;
    const [op, ...rest] = value.split('.');
    const expected = rest.join('.');
    if (op === 'eq') output = output.filter((row) => String(row[key] ?? '') === expected);
    if (op === 'neq') output = output.filter((row) => String(row[key] ?? '') !== expected);
    if (op === 'is') output = output.filter((row) => expected === 'null' ? row[key] == null : row[key] != null);
    if (op === 'in') {
      const values = expected.replace(/^\(|\)$/g, '').split(',').map((v) => v.replace(/^"|"$/g, ''));
      output = output.filter((row) => values.includes(String(row[key] ?? '')));
    }
  }
  const order = params.get('order');
  if (order) {
    const [field, dir] = order.split('.');
    output.sort((a, b) => String(a[field] ?? '').localeCompare(String(b[field] ?? ''), 'ka'));
    if (dir === 'desc') output.reverse();
  }
  const offset = Number(params.get('offset') || 0);
  const limit = params.get('limit') ? Number(params.get('limit')) : undefined;
  return output.slice(offset, limit ? offset + limit : undefined);
};

const readBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try { resolve(body ? JSON.parse(body) : null); } catch { resolve(null); }
  });
});

const proxyCloudFunction = async (functionName, req, res) => {
  const session = readCloudSession();
  if (!session?.access_token) return json(res, 401, { error: 'Cloud ავტორიზაცია საჭიროა', requiresCloudLogin: true });
  const body = await readBody(req);
  const target = `${CLOUD_URL}/functions/v1/${functionName}`;
  const cloudRes = await fetch(target, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}` },
    body: req.method === 'GET' ? undefined : JSON.stringify(body || {}),
  });
  const text = await cloudRes.text();
  res.writeHead(cloudRes.status, { 'Content-Type': cloudRes.headers.get('content-type') || 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS' });
  res.end(text);
};

const syncQueueToCloud = async () => {
  const session = readCloudSession();
  const queue = readSyncQueue();
  if (!session?.access_token || queue.length === 0) return { synced: 0, remaining: queue.length };
  const remaining = [];
  let synced = 0;
  for (const item of queue) {
    try {
      const target = `${CLOUD_URL}/rest/v1/${encodeURIComponent(item.table)}${item.query || ''}`;
      const response = await fetch(target, { method: item.method, headers: { 'Content-Type': 'application/json', apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}`, Prefer: 'return=representation' }, body: item.body ? JSON.stringify(item.body) : undefined });
      if (response.ok) synced += 1; else remaining.push(item);
    } catch { remaining.push(item); }
  }
  writeSyncQueue(remaining);
  return { synced, remaining: remaining.length };
};

const pullCloudToLocal = async () => {
  const session = readCloudSession();
  if (!session?.access_token) return { pulled: 0, tables: 0, requiresCloudLogin: true };
  const data = readData();
  data.tables = data.tables || {};
  const tables = Object.keys(data.tables);
  let pulled = 0;
  let syncedTables = 0;

  for (const table of tables) {
    try {
      const response = await fetch(`${CLOUD_URL}/rest/v1/${encodeURIComponent(table)}?select=*&limit=${SYNC_PAGE_SIZE}`, {
        headers: cloudHeaders(session, { Prefer: 'return=representation' }),
      });
      if (!response.ok) continue;
      const cloudRows = await response.json().catch(() => []);
      if (!Array.isArray(cloudRows)) continue;
      const localRows = tableRows(data, table);
      const byId = new Map(localRows.map((row) => [String(row.id), row]));
      for (const row of cloudRows) {
        const id = String(row.id || crypto.randomUUID());
        const current = byId.get(id);
        if (!current || isNewer(row, current)) {
          byId.set(id, { ...current, ...row, id });
          pulled += 1;
        }
      }
      data.tables[table] = Array.from(byId.values());
      syncedTables += 1;
    } catch {}
  }

  writeData(data);
  return { pulled, tables: syncedTables };
};

const syncAllWithCloud = async () => {
  const push = await syncQueueToCloud();
  const pull = await pullCloudToLocal();
  const result = { ok: !pull.requiresCloudLogin, push, pull };
  writeSyncState(result);
  return result;
};

const serveFile = (req, res, pathname) => {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(APP_DIR, safePath));
  if (!filePath.startsWith(APP_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return serveFile(req, res, '/index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, {});
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/auth/v1/signup')) {
    const body = await readBody(req);
    const salt = crypto.randomUUID();
    const admin = { id: 'offline-admin', email: String(body?.email || '').toLowerCase(), fullName: body?.data?.full_name || 'Offline Admin', passwordHash: hash(String(body?.password || ''), salt), salt, role: 'admin' };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ADMIN_PATH, JSON.stringify(admin, null, 2));
    return json(res, 200, { user: { id: admin.id, email: admin.email, user_metadata: { full_name: admin.fullName } }, session: { access_token: 'offline-token', token_type: 'bearer', user: { id: admin.id, email: admin.email } } });
  }

  if (pathname.startsWith('/auth/v1/token')) {
    const body = await readBody(req);
    if (url.searchParams.get('cloud') === 'true') {
      const cloudRes = await fetch(`${CLOUD_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CLOUD_KEY }, body: JSON.stringify({ email: body?.email, password: body?.password }) });
      const cloudBody = await cloudRes.json().catch(() => ({}));
      if (!cloudRes.ok) return json(res, cloudRes.status, cloudBody);
      writeCloudSession(cloudBody);
      return json(res, 200, { ...cloudBody, hybrid: true });
    }
    const admin = readAdmin();
    if (!admin || admin.email !== String(body?.email || '').toLowerCase() || admin.passwordHash !== hash(String(body?.password || ''), admin.salt)) {
      return json(res, 400, { error: 'invalid_grant', msg: 'Invalid login credentials' });
    }
    return json(res, 200, { access_token: 'offline-token', token_type: 'bearer', expires_in: 31536000, refresh_token: 'offline-refresh', user: { id: admin.id, email: admin.email, user_metadata: { full_name: admin.fullName } } });
  }

  if (pathname.startsWith('/offline/v1/cloud-login')) {
    const body = await readBody(req);
    const cloudRes = await fetch(`${CLOUD_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CLOUD_KEY }, body: JSON.stringify({ email: body?.email, password: body?.password }) });
    const cloudBody = await cloudRes.json().catch(() => ({}));
    if (!cloudRes.ok) return json(res, cloudRes.status, cloudBody);
    writeCloudSession(cloudBody);
    const sync = await syncAllWithCloud();
    return json(res, 200, { ok: true, user: cloudBody.user, expires_in: cloudBody.expires_in, sync });
  }

  if (pathname.startsWith('/offline/v1/sync')) return json(res, 200, await syncAllWithCloud());
  if (pathname.startsWith('/offline/v1/pull')) return json(res, 200, await pullCloudToLocal());

  if (pathname.startsWith('/auth/v1/user')) {
    const admin = readAdmin() || { id: 'offline-admin', email: 'admin@offline.local', fullName: 'Offline Admin' };
    return json(res, 200, { id: admin.id, email: admin.email, user_metadata: { full_name: admin.fullName } });
  }

  if (pathname.startsWith('/rest/v1/')) {
    const table = decodeURIComponent(pathname.replace('/rest/v1/', '').split('/')[0]);
    const data = readData();
    data.tables = data.tables || {};
    if (req.method === 'GET') return json(res, 200, applyFilters(tableRows(data, table), url.searchParams), { 'Content-Range': '0-0/*' });
    if (req.method === 'POST') {
      const body = await readBody(req);
      const rows = Array.isArray(body) ? body : [body || {}];
      const stamped = rows.map((row) => ({ id: row.id || crypto.randomUUID(), created_at: row.created_at || new Date().toISOString(), ...row }));
      data.tables[table] = [...tableRows(data, table), ...stamped];
      writeData(data);
      enqueueSync({ method: 'POST', table, body: stamped });
      syncAllWithCloud().catch(() => null);
      return json(res, 201, stamped);
    }
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = await readBody(req);
      const current = tableRows(data, table);
      const filteredIds = new Set(applyFilters(current, url.searchParams).map((row) => row.id));
      data.tables[table] = current.map((row) => filteredIds.has(row.id) ? { ...row, ...body, updated_at: new Date().toISOString() } : row);
      writeData(data);
      enqueueSync({ method: 'PATCH', table, query: url.search, body });
      syncAllWithCloud().catch(() => null);
      return json(res, 200, data.tables[table].filter((row) => filteredIds.has(row.id)));
    }
    if (req.method === 'DELETE') {
      const current = tableRows(data, table);
      const filteredIds = new Set(applyFilters(current, url.searchParams).map((row) => row.id));
      data.tables[table] = current.filter((row) => !filteredIds.has(row.id));
      writeData(data);
      enqueueSync({ method: 'DELETE', table, query: url.search });
      syncAllWithCloud().catch(() => null);
      return json(res, 200, []);
    }
  }

  if (pathname.startsWith('/functions/v1/')) {
    const functionName = decodeURIComponent(pathname.replace('/functions/v1/', '').split('/')[0]);
    if (CLOUD_FUNCTIONS.has(functionName)) return proxyCloudFunction(functionName, req, res);
    return json(res, 200, { success: true, offline: true });
  }
  if (pathname.startsWith('/storage/v1/object')) return json(res, 200, []);
  serveFile(req, res, pathname);
});

module.exports = {
  startOfflineServer: () => new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => {
    syncTimer = syncTimer || setInterval(() => syncAllWithCloud().catch(() => null), 60_000);
    resolve(`http://127.0.0.1:${PORT}`);
  })),
  stopOfflineServer: () => {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = null;
    server.close();
  },
};
