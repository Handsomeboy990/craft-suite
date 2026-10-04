// The gate lines a request library and the source can prove. Each one states
// what it observed; nothing here is asserted without being run.
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Client, kebab, loadMatrixSource, openDb, result } from './lib.mjs';

const ROLES = ['manager', 'frontDesk', 'housekeeping', 'storekeeper', 'bookkeeper'];

async function as(gate, role) {
  const client = new Client(gate.base);
  await client.login(gate.accounts[role], gate.password);
  gate.secrets.add(client.cookie.replace('session=', ''));
  return client;
}

const todayOf = (gate) => {
  const config = JSON.parse(readFileSync(join(gate.dataDir, 'content.json'), 'utf8'));
  return new Intl.DateTimeFormat('en-CA', { timeZone: config.site.timeZone }).format(new Date());
};
const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------------------

const D1 = {
  id: 'D1',
  title: 'no string, colour or threshold literal in the template',
  run: async (gate) => {
    const config = JSON.parse(readFileSync(join(gate.appDir, 'data', 'content.json'), 'utf8'));
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(tsx?|css|mjs)$/.test(entry)) files.push(path);
      }
    };
    for (const dir of ['app', 'lib', 'components']) walk(join(gate.appDir, dir));
    files.push(join(gate.appDir, 'proxy.ts'));

    // Every sentence of the configuration a person reads.
    const sentences = new Set();
    const collect = (node, path = '') => {
      if (typeof node === 'string') {
        if (!path.startsWith('theme') && node.length >= 12 && node.trim().split(/\s+/).length >= 2) sentences.add(node);
      } else if (Array.isArray(node)) node.forEach((item, index) => collect(item, `${path}.${index}`));
      else if (node && typeof node === 'object') for (const [key, value] of Object.entries(node)) collect(value, path ? `${path}.${key}` : key);
    };
    collect(config);
    const names = [config.site.name, config.site.shortName, 'Maison Lanterne', 'Ville-Exemple'];
    const thresholds = new Set();
    for (const kpi of Object.values(config.kpis)) for (const value of Object.values(kpi.thresholds ?? {})) if (value > 1) thresholds.add(value);

    const problems = [];
    for (const file of files) {
      const where = relative(gate.appDir, file);
      const raw = readFileSync(file, 'utf8');
      // Comments explain the code and may quote the specification; they are
      // not rendered. Everything else is.
      const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
      for (const name of names) if (code.includes(name)) problems.push(`${where}: carries the instance name "${name}"`);
      for (const sentence of sentences) if (code.includes(sentence)) problems.push(`${where}: carries an interface sentence "${sentence.slice(0, 50)}"`);
      const colours = code.match(/#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(|\bhsla?\(|:\s*(white|black|red|green|blue|gr[ae]y|orange|yellow|purple)\b/g) ?? [];
      for (const colour of colours) problems.push(`${where}: colour literal ${colour}`);
      if (/\.tsx$/.test(file)) {
        const text = code.match(/>\s*[A-Za-z][A-Za-z ,.'!?-]{2,}\s*</g) ?? [];
        for (const fragment of text) problems.push(`${where}: text in markup ${fragment.trim()}`);
      }
      if (/kpis\.ts$|page\.tsx$/.test(file)) {
        for (const value of thresholds) {
          if (new RegExp(`[<>]=?\\s*${value}(?![\\d.])`).test(code)) problems.push(`${where}: compares against the threshold value ${value}`);
        }
      }
    }
    return problems.length
      ? result('fail', problems.slice(0, 40))
      : result('pass', [
          `${files.length} files of app/, lib/, components/ and the proxy read, comments set aside`,
          `${sentences.size} configuration sentences, the instance name, colour literals, markup text and ${thresholds.size} threshold values searched: none found`,
        ]);
  },
};

// ---------------------------------------------------------------------------

const D4 = {
  id: 'D4',
  title: 'the matrix is the only source: navigation, button and server follow it',
  run: async (gate) => {
    const { DEFAULT_MATRIX } = loadMatrixSource(gate.appDir);
    const details = [];
    const failures = [];
    const desk = await as(gate, 'frontDesk');
    const stayId = gate.db.prepare(`SELECT id FROM stays WHERE status = 'confirmed' AND arrival > ? ORDER BY arrival LIMIT 1`).get(todayOf(gate)).id;
    const before = await desk.get(`/api/stays/${stayId}`);
    if (!before.json?.item?.actions?.includes('cancel')) failures.push('with the default matrix the row does not offer cancel');
    const pageBefore = await desk.get('/stays?status=confirmed', { raw: true });
    const hadNav = /href="\/guests"/.test(pageBefore.text);

    const override = structuredClone(DEFAULT_MATRIX);
    override.frontDesk.stays = override.frontDesk.stays.filter((action) => action !== 'cancel');
    delete override.frontDesk.guests;
    const file = join(gate.dataDir, 'matrix.json');
    writeFileSync(file, JSON.stringify(override));
    try {
      const row = await desk.get(`/api/stays/${stayId}`);
      if (row.json?.item?.actions?.includes('cancel')) failures.push('the row still carries cancel');
      else details.push(`row actions without the grant: ${JSON.stringify(row.json?.item?.actions)}`);
      const page = await desk.get('/stays?status=confirmed', { raw: true });
      if (/Cancel, stay of/.test(page.text)) failures.push('the stays page still renders a cancel button');
      else details.push('the stays page renders no "Cancel, stay of" button');
      const call = await desk.post(`/api/stays/${stayId}/cancel`, {});
      details.push(`POST /api/stays/${stayId}/cancel answered ${call.status}`);
      if (call.status !== 403) failures.push(`cancel answered ${call.status}, not 403`);
      if (/href="\/guests"/.test(page.text)) failures.push('the guests module is still in the navigation');
      else details.push(`guests removed from frontDesk: link in navigation before ${hadNav}, after false`);
      const guests = await desk.get('/api/guests');
      const guestsPage = await desk.get('/guests', { raw: true });
      details.push(`GET /api/guests ${guests.status}, GET /guests ${guestsPage.status}`);
      if (guests.status !== 403 || guestsPage.status !== 403) failures.push('the removed module is still served');
    } finally {
      unlinkSync(file);
    }
    const after = await desk.get(`/api/stays/${stayId}`);
    details.push(`matrix override removed: cancel offered again ${after.json?.item?.actions?.includes('cancel')}`);
    const unchanged = gate.db.prepare('SELECT status FROM stays WHERE id = ?').get(stayId).status;
    if (unchanged !== 'confirmed') failures.push(`the stay changed to ${unchanged}`);
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

function endpointsOf(module, actions) {
  if (module === 'settings') {
    return [
      ['GET', '/api/admin/fields'],
      ['GET', '/api/admin/content'],
      ['PUT', '/api/admin/content', { patch: { 'site.shortName': 'X' } }],
      ['GET', '/api/admin/history'],
      ['POST', '/api/admin/history', { snapshot: 'x' }],
    ];
  }
  if (module === 'reports') {
    return [
      ['GET', '/api/reports'],
      ['GET', '/api/reports/rate?period=month'],
      ['GET', '/api/reports/export'],
    ];
  }
  const list = [
    ['GET', `/api/${module}`],
    ['GET', `/api/${module}/1`],
    ['POST', `/api/${module}`, {}],
    ['PATCH', `/api/${module}/1`, {}],
    ['GET', `/api/${module}/export`],
  ];
  for (const action of actions) {
    if (['view', 'create', 'update', 'export'].includes(action)) continue;
    list.push(['POST', `/api/${module}/1/${kebab(action === 'checkOutOverride' ? 'checkOut' : action)}`, {}]);
  }
  return list;
}

const D5 = {
  id: 'D5',
  title: 'every endpoint of every module a role does not hold answers 403, with no record',
  run: async (gate) => {
    const { MODULES, DEFAULT_MATRIX } = loadMatrixSource(gate.appDir);
    const failures = [];
    let calls = 0;
    const perRole = [];
    for (const role of ROLES) {
      const client = await as(gate, role);
      let refused = 0;
      for (const [module, definition] of Object.entries(MODULES)) {
        if (module === 'overview') continue;
        const held = DEFAULT_MATRIX[role][module] ?? [];
        if (held.includes('view')) continue;
        for (const [method, path, body] of endpointsOf(module, definition.actions)) {
          const answer = await client.request(method, path, {
            body,
            headers: method === 'POST' ? { 'idempotency-key': randomUUID() } : {},
          });
          calls++;
          const leaked = answer.json && ('item' in answer.json || 'items' in answer.json || 'content' in answer.json || 'fields' in answer.json);
          if (answer.status !== 403 || leaked) failures.push(`${role} ${method} ${path}: ${answer.status}${leaked ? ' with a record' : ''}`);
          else refused++;
        }
      }
      perRole.push(`${role}: ${refused} calls refused with 403`);
    }
    // The same calls without any session: 401 before anything is read.
    const anonymous = new Client(gate.base);
    let unauthenticated = 0;
    for (const [module, definition] of Object.entries(MODULES)) {
      for (const [method, path, body] of module === 'overview' ? [['GET', '/api/overview']] : endpointsOf(module, definition.actions)) {
        const answer = await anonymous.request(method, path, { body });
        calls++;
        if (answer.status !== 401) failures.push(`no session ${method} ${path}: ${answer.status}`);
        else unauthenticated++;
      }
    }
    return failures.length
      ? result('fail', failures.slice(0, 30))
      : result('pass', [...perRole, `${unauthenticated} calls without a session refused with 401`, `${calls} calls in all, none with a record in its body`]);
  },
};

// ---------------------------------------------------------------------------

const D6 = {
  id: 'D6',
  title: 'a record outside the scope answers 404, the same as a missing one',
  run: async (gate) => {
    const today = todayOf(gate);
    const failures = [];
    const details = [];
    const keeper = await as(gate, 'housekeeping');
    const me = gate.db.prepare("SELECT id FROM accounts WHERE email = ?").get(gate.accounts.housekeeping).id;
    const othersTask = gate.db.prepare('SELECT id FROM tasks WHERE assignee_id <> ? ORDER BY id DESC LIMIT 1').get(me).id;
    const oldOwnTask = gate.db.prepare('SELECT id FROM tasks WHERE assignee_id = ? AND date < ? LIMIT 1').get(me, today).id;
    const room = gate.db.prepare('SELECT id FROM rooms WHERE id NOT IN (SELECT room_id FROM tasks WHERE assignee_id = ? AND date = ?) LIMIT 1').get(me, today).id;
    const missing = await keeper.get('/api/tasks/987654321');
    const compare = async (label, path) => {
      const answer = await keeper.get(path);
      const same = answer.status === 404 && answer.text === missing.text;
      details.push(`${label}: ${answer.status} ${answer.text}`);
      if (!same) failures.push(`${label} did not answer like a missing record`);
    };
    details.push(`missing task: ${missing.status} ${missing.text}`);
    await compare(`housekeeping, task ${othersTask} of someone else`, `/api/tasks/${othersTask}`);
    await compare(`housekeeping, own task ${oldOwnTask} of another day`, `/api/tasks/${oldOwnTask}`);
    await compare(`housekeeping, room ${room} not in today's tasks`, `/api/rooms/${room}`);
    const start = await keeper.post(`/api/tasks/${othersTask}/start`, {});
    details.push(`housekeeping, start on that task: ${start.status}`);
    if (start.status !== 404) failures.push('an action on an out of scope task did not answer 404');

    const desk = await as(gate, 'frontDesk');
    const oldGuest = gate.db
      .prepare(`SELECT g.id FROM guests g WHERE g.created_by_role <> 'frontDesk' AND NOT EXISTS (SELECT 1 FROM stays s WHERE s.guest_id = g.id AND (s.status IN ('provisional','confirmed','inHouse') OR s.departure >= ?)) LIMIT 1`)
      .get(addDays(today, -30)).id;
    const guest = await desk.get(`/api/guests/${oldGuest}`);
    const missingGuest = await desk.get('/api/guests/987654321');
    details.push(`frontDesk, guest ${oldGuest} outside the desk's scope: ${guest.status}, missing guest: ${missingGuest.status}`);
    if (guest.status !== 404 || guest.text !== missingGuest.text) failures.push('an out of scope guest is not answered like a missing one');

    const books = await as(gate, 'bookkeeper');
    const noted = gate.db.prepare('SELECT id FROM guests WHERE notes IS NOT NULL LIMIT 1').get().id;
    const seen = await books.get(`/api/guests/${noted}`);
    details.push(`bookkeeper, guest ${noted} with notes: ${seen.status}, notes field present: ${'notes' in (seen.json?.item ?? {})}`);
    if (seen.status !== 200 || 'notes' in (seen.json?.item ?? {})) failures.push('the bookkeeper received the notes field');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

const D7 = {
  id: 'D7',
  title: 'an action on a record in a state that does not allow it is refused, nothing changed',
  run: async (gate) => {
    const today = todayOf(gate);
    const failures = [];
    const details = [];
    const snapshot = (table, id) => JSON.stringify(gate.db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
    const clients = {};
    for (const role of ROLES) clients[role] = await as(gate, role);
    const one = (sql, ...params) => gate.db.prepare(sql).get(...params)?.id;
    const me = one('SELECT id FROM accounts WHERE email = ?', gate.accounts.housekeeping);
    const settledFolio = one("SELECT id FROM folios WHERE voided = 0 AND paid >= total LIMIT 1");
    const cases = [
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'provisional' LIMIT 1"), 'check-out', [409]],
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'inHouse' LIMIT 1"), 'cancel', [409]],
      ['frontDesk', 'folios', settledFolio, 'void', [403]],
      ['manager', 'folios', settledFolio, 'void', [409]],
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'departed' LIMIT 1"), 'check-in', [409]],
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'confirmed' AND arrival > ? LIMIT 1", today), 'check-in', [409]],
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'confirmed' LIMIT 1"), 'confirm', [409]],
      ['frontDesk', 'stays', one("SELECT id FROM stays WHERE status = 'departed' LIMIT 1"), 'cancel', [409]],
      ['bookkeeper', 'folios', settledFolio, 'record-payment', [409]],
      ['housekeeping', 'tasks', one("SELECT id FROM tasks WHERE assignee_id = ? AND date = ? AND status = 'done' LIMIT 1", me, today) ?? one("SELECT id FROM tasks WHERE assignee_id = ? AND date = ? AND status = 'inProgress' LIMIT 1", me, today), 'start', [409]],
      ['housekeeping', 'tasks', one("SELECT id FROM tasks WHERE assignee_id = ? AND date = ? AND status = 'todo' LIMIT 1", me, today), 'finish', [409]],
      ['bookkeeper', 'ledger', one('SELECT id FROM ledger WHERE reverses_id IS NOT NULL LIMIT 1'), 'reverse', [409]],
      ['bookkeeper', 'ledger', one('SELECT reverses_id AS id FROM ledger WHERE reverses_id IS NOT NULL LIMIT 1'), 'reverse', [409]],
      ['manager', 'staff', one('SELECT id FROM accounts WHERE active = 0 LIMIT 1'), 'deactivate', [409]],
      ['manager', 'staff', one('SELECT id FROM accounts WHERE active = 1 AND role = ? LIMIT 1', 'bookkeeper'), 'reactivate', [409]],
      ['frontDesk', 'rooms', one("SELECT id FROM rooms WHERE status = 'occupied' LIMIT 1"), 'set-out-of-order', [409]],
      ['frontDesk', 'rooms', one("SELECT id FROM rooms WHERE status = 'available' LIMIT 1"), 'return-to-service', [409]],
    ];
    const tables = { stays: 'stays', folios: 'folios', tasks: 'tasks', ledger: 'ledger', staff: 'accounts', rooms: 'rooms' };
    for (const [role, module, id, action, expected] of cases) {
      if (!id) {
        failures.push(`no seeded record for ${role} ${module} ${action}`);
        continue;
      }
      const before = snapshot(tables[module], id);
      const answer = await clients[role].post(`/api/${module}/${id}/${action}`, action === 'set-out-of-order' ? { reason: 'test' } : action === 'record-payment' ? { amount: '1', method: 'card' } : {});
      const after = snapshot(tables[module], id);
      details.push(`${role} ${action} ${module}/${id}: ${answer.status} ${answer.json?.error ?? ''}, record unchanged: ${before === after}`);
      if (!expected.includes(answer.status) || before !== after) failures.push(`${role} ${action} ${module}/${id}`);
    }
    return failures.length ? result('fail', [...failures.map((item) => `refused wrongly or changed: ${item}`), ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

async function newAccount(gate, manager, role) {
  const email = `gate.${role.toLowerCase()}.${Date.now()}@example.test`;
  const created = await manager.post('/api/staff', { name: `Gate ${role}`, email, role }, { headers: { 'idempotency-key': randomUUID() } });
  if (created.status !== 201) throw new Error(`staff create answered ${created.status} ${created.text}`);
  const token = /token=([0-9a-f]{64})/.exec(created.json.setup)[1];
  const password = `gate-account-${randomUUID()}`;
  const setup = await new Client(gate.base).post('/api/setup', { token, password });
  if (setup.status !== 200) throw new Error(`setup answered ${setup.status}`);
  const reuse = await new Client(gate.base).post('/api/setup', { token, password: `${password}-again` });
  const client = new Client(gate.base);
  await client.login(email, password);
  gate.secrets.add(password);
  gate.secrets.add(token);
  return { id: created.json.item.id, client, reuse: reuse.status };
}

const D8 = {
  id: 'D8',
  title: 'a deactivation or a role change takes effect on the next request',
  run: async (gate) => {
    const details = [];
    const failures = [];
    const manager = await as(gate, 'manager');
    const keeper = await newAccount(gate, manager, 'storekeeper');
    details.push(`storekeeper created by the manager, password set through the single use link (second use answered ${keeper.reuse})`);
    const before = await keeper.client.get('/api/items');
    const off = await manager.post(`/api/staff/${keeper.id}/deactivate`, {});
    const after = await keeper.client.get('/api/items');
    details.push(`storekeeper GET /api/items ${before.status}; manager deactivates ${off.status}; same session, next request ${after.status}`);
    if (before.status !== 200 || off.status !== 200 || after.status !== 401) failures.push('deactivation did not end the session at once');
    if (keeper.reuse !== 400) failures.push('the setup link worked twice');

    const desk = await newAccount(gate, manager, 'frontDesk');
    const first = await desk.client.get('/api/stays');
    const change = await manager.post(`/api/staff/${desk.id}/change-role`, { role: 'housekeeping' });
    const second = await desk.client.get('/api/stays');
    const tasks = await desk.client.get('/api/tasks');
    details.push(`frontDesk GET /api/stays ${first.status}; role changed to housekeeping ${change.status}; same session, /api/stays ${second.status}, /api/tasks ${tasks.status}`);
    if (first.status !== 200 || change.status !== 200 || second.status !== 403 || tasks.status !== 200) failures.push('the role change did not apply on the next request');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

const D10 = {
  id: 'D10',
  title: 'privileged actions and refusals are audited, with no secret or free text',
  run: async (gate) => {
    const failures = [];
    const details = [];
    // Its own refusals and writes, so the line stands on its own.
    const desk = await as(gate, 'frontDesk');
    await desk.get('/api/ledger');
    await desk.get('/api/guests/987654321');
    const departed = gate.db.prepare("SELECT id FROM stays WHERE status = 'departed' LIMIT 1").get().id;
    await desk.post(`/api/stays/${departed}/check-in`, {});
    const guest = await desk.post('/api/guests', { name: 'Gate Audit', notes: 'gate-free-text-never-in-audit' }, { headers: { 'idempotency-key': randomUUID() } });
    gate.secrets.add('gate-free-text-never-in-audit');
    const rows = gate.db.prepare('SELECT * FROM audit').all();
    const has = (predicate, label) => {
      const count = rows.filter(predicate).length;
      details.push(`${label}: ${count}`);
      if (count === 0) failures.push(`no audit entry for ${label}`);
    };
    has((row) => row.outcome === 'refused' && row.status === 403, 'refusals 403 (grant)');
    has((row) => row.outcome === 'refused' && row.status === 404, 'refusals 404 (scope)');
    has((row) => row.outcome === 'refused' && row.status === 409, 'refusals 409 (state)');
    has((row) => row.action === 'signIn' && row.outcome === 'allowed', 'sign ins');
    has((row) => row.action === 'signIn' && row.outcome === 'refused', 'refused sign ins');
    has((row) => /\.(create|update|checkIn|checkOut|deactivate|changeRole|cancel)$/.test(row.action) && row.outcome === 'allowed', 'writes');
    if (guest.status !== 201) failures.push(`the guest write answered ${guest.status}`);
    const notes = gate.db.prepare('SELECT DISTINCT notes FROM guests WHERE notes IS NOT NULL').all().map((row) => row.notes);
    const forbidden = [...gate.secrets, ...notes].filter((value) => value && value.length >= 8);
    const text = JSON.stringify(rows);
    const leaks = forbidden.filter((value) => text.includes(value));
    details.push(`${rows.length} audit rows searched for ${forbidden.length} passwords, session tokens, setup tokens and guest notes: ${leaks.length} found`);
    const columns = Object.keys(rows[0] ?? {});
    details.push(`columns: ${columns.join(', ')}`);
    if (leaks.length) failures.push(`the audit log holds a secret or free text (${leaks.length})`);
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

const D11 = {
  id: 'D11',
  title: 'every KPI equals the count, sum or average of its drill down',
  run: async (gate) => {
    const failures = [];
    const details = [];
    for (const role of ['manager', 'housekeeping']) {
      const client = await as(gate, role);
      const overview = await client.get('/api/overview');
      for (const kpi of overview.json.kpis) {
        if (role === 'housekeeping' && kpi.key !== 'roomsToClean') continue;
        const list = await client.get(kpi.api);
        const observed = kpi.equals === 'total' ? list.json.total : kpi.equals === 'sum' ? list.json.sum : list.json.average;
        details.push(`${role} ${kpi.key}: card ${kpi.display} (${kpi.equals} ${kpi.expected}); ${kpi.drill} states ${observed}`);
        if (list.status !== 200 || observed !== kpi.expected) failures.push(`${role} ${kpi.key}: ${kpi.expected} against ${observed}`);
        if (kpi.key === 'overdueFolios') {
          const amount = list.json.sum;
          details.push(`  overdue amount listed ${amount}, card says "${kpi.detail}"`);
        }
      }
      if (role === 'manager' && overview.json.kpis.length !== 8) failures.push(`the manager sees ${overview.json.kpis.length} figures, not 8`);
    }
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D12 = {
  id: 'D12',
  title: 'every KPI shows its period, its status in words, and the time it was computed',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const client = await as(gate, 'manager');
    const first = await client.get('/api/overview');
    const second = await client.get('/api/overview');
    const page = await client.get('/', { raw: true });
    for (const kpi of first.json.kpis) {
      const card = new RegExp(`data-kpi="${kpi.key}"[\\s\\S]*?</article>`).exec(page.text)?.[0] ?? '';
      const hasPeriod = card.includes(`>${kpi.period}<`);
      const hasTime = /Computed at \d{2}:\d{2}/.test(card) && card.toLowerCase().includes(`datetime="${kpi.asOf.toLowerCase()}"`);
      if (!hasPeriod) failures.push(`${kpi.key} shows no period`);
      if (!hasTime) failures.push(`${kpi.key} shows no computation time`);
      if (kpi.status !== 'ok') {
        const worded = card.includes(`data-status="${kpi.status}"`) && card.includes(kpi.statusWord) && card.includes('<svg');
        details.push(`${kpi.key} is ${kpi.status}: stated "${kpi.statusWord}" with an icon: ${worded}`);
        if (!worded) failures.push(`${kpi.key} status not in words and icon`);
      }
    }
    const overdue = first.json.kpis.find((kpi) => kpi.key === 'overdueFolios');
    details.push(`overdueFolios ${overdue.value}, status ${overdue.status}, word "${overdue.statusWord}"`);
    if (!(overdue.value > 0 && overdue.status === 'danger' && overdue.statusWord === 'Overdue')) failures.push('overdueFolios above zero does not read as overdue');
    details.push(`second request cached: ${second.json.cached}, same asOf: ${second.json.kpis[0].asOf === first.json.kpis[0].asOf} (${first.json.kpis[0].asOf}); every card shows its period and "Computed at" time`);
    if (!second.json.cached || second.json.kpis[0].asOf !== first.json.kpis[0].asOf) failures.push('a cached figure does not keep its computation time');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D14 = {
  id: 'D14',
  title: 'paging is done by the server: one page of a seeded year, the right total',
  run: async (gate) => {
    const client = await as(gate, 'manager');
    const answer = await client.get('/api/stays?arrivalFrom=any');
    const total = gate.db.prepare('SELECT COUNT(*) AS c FROM stays').get().c;
    const page = await client.get('/stays?arrivalFrom=any', { raw: true });
    const body = /<table class="table">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/.exec(page.text)?.[1] ?? '';
    const rows = (body.match(/<tr>/g) ?? []).length;
    const stated = new RegExp(`>${total.toLocaleString('en-GB')} stays<`).test(page.text);
    const details = [
      `GET /api/stays?arrivalFrom=any: ${answer.json.items.length} rows transferred (${answer.text.length} bytes), total ${answer.json.total}; the database holds ${total}`,
      `the page renders ${rows} rows and states "${total.toLocaleString('en-GB')} stays": ${stated}`,
    ];
    const keys = Object.keys(answer.json.items[0]);
    details.push(`fields per row: ${keys.length} (${keys.join(', ')})`);
    const ok = answer.json.items.length === 25 && answer.json.total === total && rows === 25 && stated && total > 3000;
    return result(ok ? 'pass' : 'fail', details);
  },
};

const D16 = {
  id: 'D16',
  title: 'a failed widget on the overview leaves the others working',
  run: async (gate) => {
    const client = await as(gate, 'manager');
    const file = join(gate.dataDir, 'faults.json');
    writeFileSync(file, JSON.stringify({ 'overview.trend': true }));
    try {
      const api = await client.get('/api/overview');
      const page = await client.get('/', { raw: true });
      const cards = (page.text.match(/data-kpi="/g) ?? []).length;
      const distribution = page.text.includes('id="distribution-title"');
      const trend = page.text.includes('id="trend-title"');
      const error = page.text.includes('This panel could not be loaded');
      const details = [
        `with the trend forced to fail: API trend.ok ${api.json.charts.trend.ok}, distribution.ok ${api.json.charts.distribution.ok}, ${api.json.kpis?.length} figures`,
        `page: ${cards} figure cards, distribution shown ${distribution}, trend shown ${trend}, its own error with a retry ${error}`,
      ];
      const ok = api.status === 200 && api.json.charts.trend.ok === false && api.json.charts.distribution.ok === true && api.json.kpis.length === 8 && cards === 8 && distribution && !trend && error;
      return result(ok ? 'pass' : 'fail', details);
    } finally {
      unlinkSync(file);
    }
  },
};

const D21 = {
  id: 'D21',
  title: 'every chart has its text twin: a summary sentence and the data as a table',
  run: async (gate) => {
    const client = await as(gate, 'manager');
    const page = await client.get('/', { raw: true });
    const details = [];
    const failures = [];
    for (const [chart, rows] of [['trend', 12], ['distribution', 5]]) {
      const figure = new RegExp(`aria-labelledby="${chart}-title"[\\s\\S]*?</figure>`).exec(page.text)?.[0] ?? '';
      const summary = new RegExp(`id="${chart}-summary">([^<]+)<`).exec(figure)?.[1] ?? '';
      const table = /<details[\s\S]*?<table[\s\S]*?<\/table>/.exec(figure)?.[0] ?? '';
      const body = (/<tbody>([\s\S]*?)<\/tbody>/.exec(table)?.[1].match(/<tr>/g) ?? []).length;
      details.push(`${chart}: summary "${summary}"; data table with caption ${table.includes('<caption>')}, ${body} rows`);
      if (!summary || !table.includes('<caption>') || body !== rows) failures.push(`${chart} has no complete text twin`);
    }
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

const D24 = {
  id: 'D24',
  title: 'a double submitted create makes one record; two concurrent bookings, one 409',
  run: async (gate) => {
    const details = [];
    const failures = [];
    const today = todayOf(gate);
    const manager = await as(gate, 'manager');
    const desk = await as(gate, 'frontDesk');
    const room = gate.db.prepare("SELECT id FROM rooms WHERE number = '12'").get().id;
    const night = addDays(today, 70);
    const key = randomUUID();
    const body = { guestName: 'Gate Double', roomId: String(room), arrival: night, departure: addDays(night, 1), adults: '2' };
    const [a, b] = await Promise.all([manager.post('/api/stays', body, { headers: { 'idempotency-key': key } }), manager.post('/api/stays', body, { headers: { 'idempotency-key': key } })]);
    const c = await manager.post('/api/stays', body, { headers: { 'idempotency-key': key } });
    const made = gate.db.prepare('SELECT COUNT(*) AS c FROM stays WHERE idempotency_key = ?').get(key).c;
    details.push(`one key sent three times (two at once, one after): ${a.status}, ${b.status}, ${c.status}; stays with that key: ${made}`);
    if (made !== 1 || ![a, b, c].every((answer) => answer.status === 200 || answer.status === 201)) failures.push('the double submit did not produce exactly one stay');

    const other = addDays(night, 3);
    const booking = (client) => client.post('/api/stays', { guestName: 'Gate Race', roomId: String(room), arrival: other, departure: addDays(other, 1), adults: '1' }, { headers: { 'idempotency-key': randomUUID() } });
    const answers = await Promise.all([booking(manager), booking(desk)]);
    const statuses = answers.map((answer) => answer.status).sort();
    const booked = gate.db.prepare("SELECT COUNT(*) AS c FROM stays WHERE room_id = ? AND arrival = ? AND status IN ('provisional','confirmed','inHouse')").get(room, other).c;
    details.push(`room 12 for the night of ${other} from two sessions at once: ${statuses.join(' and ')} (${answers.map((answer) => answer.json?.error ?? 'created').join(', ')}); active stays that night: ${booked}`);
    if (statuses.join(',') !== '201,409' || booked !== 1) failures.push('the concurrent booking was not one success and one 409');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

// ---------------------------------------------------------------------------

const D26 = {
  id: 'D26',
  title: 'the handover states roles, KPIs, settings, personal data, backup, and a restore is performed',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const readme = readFileSync(join(gate.appDir, 'README.md'), 'utf8');
    const config = JSON.parse(readFileSync(join(gate.appDir, 'data', 'content.json'), 'utf8'));
    const required = [
      ...ROLES,
      ...Object.keys(config.kpis),
      'npm run backup',
      'npm run restore',
      '/api/admin/fields',
      'Personal data',
      'Retention',
      'Roles and grants',
    ];
    const missing = required.filter((term) => !readme.includes(term));
    details.push(`README names ${required.length - missing.length} of ${required.length} required handover items${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
    for (const kpi of Object.values(config.kpis)) if (!readme.includes(kpi.question)) missing.push(`question of ${kpi.label}`);
    if (missing.length) failures.push(`handover incomplete: ${missing.join(', ')}`);

    const backups = join(gate.gateDir, 'backups');
    const env = { ...process.env, DATA_DIR: gate.dataDir, NODE_OPTIONS: '--no-warnings' };
    const backup = spawnSync(process.execPath, ['scripts/backup.mjs', backups], { cwd: gate.appDir, env, encoding: 'utf8' });
    details.push(`npm run backup: exit ${backup.status}; ${backup.stdout.trim().split('\n')[0]}`);
    const taken = existsSync(backups) ? readdirSync(backups)[0] : null;
    if (backup.status !== 0 || !taken) return result('fail', [...details, backup.stderr]);
    const restored = join(gate.gateDir, 'restored');
    rmSync(restored, { recursive: true, force: true });
    mkdirSync(restored, { recursive: true });
    const restore = spawnSync(process.execPath, ['scripts/restore.mjs', join(backups, taken)], { cwd: gate.appDir, env: { ...env, DATA_DIR: restored }, encoding: 'utf8' });
    details.push(`npm run restore into a scratch directory: exit ${restore.status}`);
    const copy = openDb(join(restored, 'hotel.db'));
    const tables = ['accounts', 'rooms', 'guests', 'stays', 'folios', 'folio_lines', 'ledger', 'items', 'movements', 'tasks', 'suppliers', 'audit'];
    const differences = [];
    for (const table of tables) {
      const live = gate.db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
      const back = copy.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
      if (live !== back && table !== 'audit') differences.push(`${table} ${live} against ${back}`);
    }
    const sample = (database) => JSON.stringify(database.prepare('SELECT id, status, total FROM stays ORDER BY id LIMIT 50').all());
    const same = sample(gate.db) === sample(copy);
    copy.close();
    details.push(`restored database against the live one: ${tables.length} tables compared, differences: ${differences.length ? differences.join('; ') : 'none'}; first 50 stays identical: ${same}`);
    if (restore.status !== 0 || differences.length || !same) failures.push('the restore did not reproduce the database');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

export const CHECKS = [D1, D4, D5, D6, D7, D8, D10, D11, D12, D14, D16, D21, D24, D26];
