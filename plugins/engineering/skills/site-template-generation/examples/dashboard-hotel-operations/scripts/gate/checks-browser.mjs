// The gate lines only a browser can prove: rendered contrast, the theme before
// first paint, a URL that survives reload and back, the keyboard path, what
// the accessibility tree announces, the drawer at 360px, the offline state and
// the service worker. They run in a real headless Chromium.
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { Client, browser, result, signedInPage } from './lib.mjs';

const todayOf = (gate) => {
  const config = JSON.parse(readFileSync(join(gate.dataDir, 'content.json'), 'utf8'));
  return new Intl.DateTimeFormat('en-CA', { timeZone: config.site.timeZone }).format(new Date());
};
const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

function screens(gate, id) {
  const dir = join(gate.gateDir, 'screens', id);
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Contrast measured in the page, on the colours the browser resolved.
const MEASURE = () => {
  const probe = document.createElement('span');
  document.body.appendChild(probe);
  const rgb = (token) => {
    probe.style.color = `var(--color-${token})`;
    return getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).map(Number);
  };
  const luminance = ([r, g, b]) => {
    const channel = (value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const pairs = [
    ['foreground', 'surface', 4.5],
    ['foreground', 'surface-alt', 4.5],
    ['muted', 'surface', 4.5],
    ['muted', 'surface-alt', 4.5],
    ['accent', 'surface', 4.5],
    ['accent', 'surface-alt', 4.5],
    ['accent-foreground', 'accent', 4.5],
    ['accent-foreground', 'accent-hover', 4.5],
    ['border-strong', 'surface', 3],
    ['border-strong', 'surface-alt', 3],
    ['focus-ring', 'surface', 3],
    ['focus-ring', 'surface-alt', 3],
    ['chart-1', 'surface', 3],
    ['chart-2', 'surface', 3],
  ];
  for (const tone of ['success', 'warning', 'danger', 'info', 'neutral']) {
    pairs.push([tone, `${tone}-surface`, 4.5], [tone, 'surface', 4.5], [tone, 'surface-alt', 3]);
  }
  const tokens = pairs.map(([fg, bg, min]) => ({ pair: `${fg} on ${bg}`, ratio: Number(ratio(rgb(fg), rgb(bg)).toFixed(2)), min }));
  probe.remove();
  // Every status badge as rendered: its text colour on its own background.
  const badges = Array.from(document.querySelectorAll('.badge')).map((element) => {
    const style = getComputedStyle(element);
    const parse = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    return { text: element.textContent.trim(), ratio: Number(ratio(parse(style.color), parse(style.backgroundColor)).toFixed(2)) };
  });
  return { tokens, badges };
};

const D2 = {
  id: 'D2',
  title: 'both palettes measured in the browser, every token pair and every status badge',
  run: async (gate) => {
    const failures = [];
    const details = [];
    for (const scheme of ['light', 'dark']) {
      for (const [role, path, expectStatus] of [
        ['manager', '/', 200],
        ['manager', '/stays?status=confirmed', 200],
        ['manager', '/folios?status=overdue', 200],
        ['frontDesk', '/ledger', 403],
      ]) {
        const { context, page } = await signedInPage(gate, role, { colorScheme: scheme });
        const response = await page.goto(`${gate.base}${path}`);
        const measured = await page.evaluate(MEASURE);
        await context.close();
        const low = measured.tokens.filter((item) => item.ratio < item.min);
        const lowBadges = measured.badges.filter((item) => item.ratio < 4.5);
        if (response.status() !== expectStatus) failures.push(`${scheme} ${path} answered ${response.status()}`);
        for (const item of low) failures.push(`${scheme} ${path}: ${item.pair} ${item.ratio} under ${item.min}`);
        for (const item of lowBadges) failures.push(`${scheme} ${path}: badge "${item.text}" ${item.ratio}`);
        const lowest = measured.tokens.reduce((min, item) => (item.ratio / item.min < min.ratio / min.min ? item : min));
        const badgeMin = measured.badges.length ? Math.min(...measured.badges.map((item) => item.ratio)) : null;
        details.push(`${scheme} ${path} (${response.status()}): ${measured.tokens.length} token pairs, closest ${lowest.pair} ${lowest.ratio} (min ${lowest.min}); ${measured.badges.length} badges, lowest ${badgeMin ?? 'none on page'}`);
      }
    }
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D3 = {
  id: 'D3',
  title: 'the theme switch works, persists, follows the system and does not flash',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const instance = await browser();
    const content = JSON.parse(readFileSync(join(gate.dataDir, 'content.json'), 'utf8'));
    const hex = (value) => {
      const n = value.replace('#', '');
      return `rgb(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)})`;
    };
    const light = hex(content.theme.palettes.light.surface);
    const dark = hex(content.theme.palettes.dark.surface);
    const { context, page } = await signedInPage(gate, 'manager', { colorScheme: 'dark' });
    // The state at the first moment a script can look, before the page is
    // interactive: if the theme were applied late, this is where it shows.
    await context.addInitScript(() => {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'interactive' && !window.__firstTheme) {
          window.__firstTheme = { attribute: document.documentElement.getAttribute('data-theme'), background: getComputedStyle(document.body).backgroundColor };
        }
      });
    });
    await page.goto(`${gate.base}/`);
    const system = await page.evaluate(() => ({ attribute: document.documentElement.getAttribute('data-theme'), background: getComputedStyle(document.body).backgroundColor }));
    details.push(`system dark, no choice stored: data-theme ${system.attribute}, background ${system.background}`);
    if (system.attribute !== null || system.background !== dark) failures.push('the system preference is not followed');
    await page.click('[data-theme-toggle]');
    const chosen = await page.evaluate(() => ({ attribute: document.documentElement.getAttribute('data-theme'), stored: localStorage.getItem('theme'), background: getComputedStyle(document.body).backgroundColor }));
    details.push(`toggle to light: ${JSON.stringify(chosen)}`);
    await page.reload();
    const first = await page.evaluate(() => window.__firstTheme);
    details.push(`after reload, at the first readystatechange: ${JSON.stringify(first)}`);
    if (chosen.attribute !== 'light' || chosen.background !== light || first?.attribute !== 'light' || first?.background !== light) failures.push('the stored choice is not applied before first paint');
    await page.click('[data-theme-toggle]');
    await page.click('[data-theme-toggle]');
    const back = await page.evaluate(() => ({ attribute: document.documentElement.getAttribute('data-theme'), stored: localStorage.getItem('theme'), background: getComputedStyle(document.body).backgroundColor }));
    details.push(`toggled on to dark, then to system: ${JSON.stringify(back)}`);
    if (back.attribute !== null || back.stored !== null || back.background !== dark) failures.push('returning to the system theme does not follow it');
    await context.close();
    const html = await new Client(gate.base).get('/login', { raw: true });
    const order = html.text.indexOf('localStorage.getItem') < html.text.indexOf('<body');
    details.push(`the theme script sits in the head, before the body: ${order}`);
    if (!order) failures.push('the theme script is not in the head');
    void instance;
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D9 = {
  id: 'D9',
  title: 'httpOnly cookie, no token readable by script, sign out ends it on the server, sign in limited',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const { context, page } = await signedInPage(gate, 'bookkeeper');
    const cookies = await context.cookies();
    const session = cookies.find((cookie) => cookie.name === 'session');
    gate.secrets.add(session.value);
    const exposed = await page.evaluate((token) => {
      const all = [];
      for (const store of [localStorage, sessionStorage]) for (let i = 0; i < store.length; i++) all.push(store.getItem(store.key(i)));
      return { cookie: document.cookie.includes(token), storage: all.some((value) => value && value.includes(token)), entries: all.length };
    }, session.value);
    details.push(`cookie httpOnly ${session.httpOnly}, sameSite ${session.sameSite}; readable by script: document.cookie ${exposed.cookie}, storage ${exposed.storage} (${exposed.entries} entries)`);
    if (!session.httpOnly || session.sameSite !== 'Lax' || exposed.cookie || exposed.storage) failures.push('the session is readable by script or the cookie is not httpOnly and Lax');
    const account = gate.db.prepare('SELECT id FROM accounts WHERE email = ?').get(gate.accounts.bookkeeper).id;
    const before = gate.db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE account_id = ?').get(account).c;
    await Promise.all([page.waitForURL(/\/login/), page.getByRole('button', { name: 'Sign out' }).click()]);
    const after = gate.db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE account_id = ?').get(account).c;
    const stale = new Client(gate.base);
    stale.cookie = `session=${session.value}`;
    const reuse = await stale.get('/api/ledger');
    details.push(`server sessions of the account before sign out ${before}, after ${after}; the old cookie replayed: ${reuse.status}`);
    if (after !== before - 1 || reuse.status !== 401) failures.push('sign out did not end the session on the server');
    await context.close();

    const attacker = new Client(gate.base);
    const statuses = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      statuses.push((await attacker.post('/api/admin/login', { identifier: `nobody.${randomUUID()}@example.test`, password: 'wrong-password-123' })).status);
    }
    const blocked = await attacker.post('/api/admin/login', { identifier: gate.accounts.bookkeeper, password: gate.password });
    details.push(`six failed sign ins from one address: ${statuses.join(', ')}; the right password from that address during the lockout: ${blocked.status}`);
    const target = new Client(gate.base);
    const perAccount = [];
    for (let attempt = 0; attempt < 6; attempt++) {
      target.address = `10.9.${attempt}.${attempt + 1}`;
      perAccount.push((await target.post('/api/admin/login', { identifier: gate.accounts.storekeeper, password: `wrong-${attempt}-password` })).status);
    }
    details.push(`six failures on one account from six addresses: ${perAccount.join(', ')}`);
    if (statuses.slice(0, 5).some((status) => status !== 401) || statuses[5] !== 429 || blocked.status !== 429 || perAccount[5] !== 429) failures.push('the sign in is not limited');
    // Free the storekeeper again for the lines that follow.
    gate.db.prepare("DELETE FROM rate_limits WHERE key LIKE 'login:account:%'").run();
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

async function firstColumn(page) {
  return page.$$eval('table.table tbody tr', (rows) => rows.map((row) => row.querySelector('th')?.textContent.trim()));
}

const D13 = {
  id: 'D13',
  title: 'filters, sort and page survive a reload, a shared URL and the back button',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const today = todayOf(gate);
    const { context, page } = await signedInPage(gate, 'frontDesk');
    await page.goto(`${gate.base}/stays`);
    await page.selectOption('#filter-status', 'confirmed');
    await page.fill('#filter-arrivalFrom', today);
    await page.fill('#filter-arrivalTo', addDays(today, 40));
    await Promise.all([page.waitForURL(/status=confirmed/), page.getByRole('button', { name: 'Apply filters' }).click()]);
    await Promise.all([page.waitForURL(/sort=total/), page.getByRole('button', { name: /^Sort by Total/ }).click()]);
    await Promise.all([page.waitForURL(/page=2/), page.getByRole('link', { name: 'Next page' }).click()]);
    await page.waitForSelector('.pagination');
    const page2 = await firstColumn(page);
    await Promise.all([page.waitForURL(/page=3/), page.getByRole('link', { name: 'Next page' }).click()]);
    await page.waitForFunction(() => document.querySelector('.pagination p')?.textContent.startsWith('Page 3'));
    const url = page.url();
    const rows = await firstColumn(page);
    details.push(`URL after the filters, the sort and two pages: ${url.replace(gate.base, '')}`);
    details.push(`page 3 shows ${rows.length} rows, first "${rows[0]}"`);
    await page.reload();
    const reloaded = await firstColumn(page);
    const statusValue = await page.inputValue('#filter-status');
    details.push(`reload: same rows ${JSON.stringify(reloaded) === JSON.stringify(rows)}, status filter still "${statusValue}"`);
    if (JSON.stringify(reloaded) !== JSON.stringify(rows) || statusValue !== 'confirmed') failures.push('reload changed the list');
    const other = await signedInPage(gate, 'frontDesk');
    await other.page.goto(url);
    const shared = await firstColumn(other.page);
    details.push(`the URL opened in another browser signed in as frontDesk: same rows ${JSON.stringify(shared) === JSON.stringify(rows)}`);
    if (JSON.stringify(shared) !== JSON.stringify(rows)) failures.push('the shared URL shows another list');
    await other.context.close();
    await page.goBack();
    await page.waitForURL(/page=2/);
    await page.waitForFunction(() => document.querySelector('.pagination p')?.textContent.startsWith('Page 2'));
    const back = await firstColumn(page);
    details.push(`back: ${page.url().replace(gate.base, '')}, same rows as page 2 before ${JSON.stringify(back) === JSON.stringify(page2)}`);
    if (JSON.stringify(back) !== JSON.stringify(page2) || !/sort=total/.test(page.url())) failures.push('back did not restore the previous list');
    await context.close();
    if (rows.length === 0) failures.push('page 3 was empty, nothing proved');
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D15 = {
  id: 'D15',
  title: 'loading, first use, filtered empty, error and denied, forced on stays, stock and ledger, both themes',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const dir = screens(gate, 'D15');
    const modules = [
      ['stays', '/stays', 'No stays recorded yet', 'The stays could not be loaded', 'storekeeper'],
      ['items', '/stock', 'No items recorded yet', 'The stock could not be loaded', 'frontDesk'],
      ['ledger', '/ledger', 'No entries recorded yet', 'The ledger could not be loaded', 'frontDesk'],
    ];
    const faults = join(gate.dataDir, 'faults.json');

    // First use needs a module with no record at all: a second instance on an
    // empty database, with only the manager's account.
    const empty = join(gate.gateDir, 'empty-data');
    rmSync(empty, { recursive: true, force: true });
    mkdirSync(empty, { recursive: true });
    copyFileSync(join(gate.dataDir, 'content.json'), join(empty, 'content.json'));
    const created = spawnSync(process.execPath, ['scripts/create-admin.mjs', '--email', gate.accounts.manager, '--name', 'Gate Manager'], {
      cwd: gate.appDir,
      env: { ...process.env, DATA_DIR: empty, ADMIN_PASSWORD: gate.password, NODE_OPTIONS: '--no-warnings' },
      encoding: 'utf8',
    });
    if (created.status !== 0) return result('fail', [`create-admin failed: ${created.stderr}`]);
    const second = gate.startServer(empty, gate.port + 1);
    await second.ready;
    try {
      for (const scheme of ['light', 'dark']) {
        const shot = async (page, name) => page.screenshot({ path: join(dir, `${scheme}-${name}.png`), fullPage: true });
        // First use, on the empty instance.
        const fresh = await signedInPage({ ...gate, base: `http://localhost:${gate.port + 1}` }, 'manager', { colorScheme: scheme });
        for (const [key, path, firstUse] of modules) {
          await fresh.page.goto(`http://localhost:${gate.port + 1}${path}`);
          const text = await fresh.page.textContent('main');
          const ok = text.includes(firstUse);
          details.push(`${scheme} ${key} first use: "${firstUse}..." ${ok}`);
          if (!ok) failures.push(`${scheme} ${key} first use state missing`);
          await shot(fresh.page, `${key}-first-use`);
        }
        await fresh.context.close();

        const { context, page } = await signedInPage(gate, 'manager', { colorScheme: scheme });
        for (const [key, path, , errorText, deniedRole] of modules) {
          // Filtered empty.
          await page.goto(`${gate.base}${path}?${key === 'ledger' ? 'from=1990-01-01&to=1990-01-02' : 'q=zzzzzz'}`);
          const filtered = (await page.textContent('main')).includes('match these filters') && (await page.getByRole('link', { name: 'Clear filters' }).count()) > 0;
          await shot(page, `${key}-filtered-empty`);
          // Error, forced.
          writeFileSync(faults, JSON.stringify({ [`list.${key}`]: true }));
          await page.goto(`${gate.base}${path}`);
          const alert = await page.getByRole('alert').filter({ hasText: errorText }).count();
          const retry = await page.getByRole('button', { name: 'Try again' }).count();
          await shot(page, `${key}-error`);
          // Loading, held for three seconds and caught while it shows.
          writeFileSync(faults, JSON.stringify({ [`delay.${key}`]: 6000 }));
          // The server streams the loading boundary first and the list when
          // it is ready, so the skeleton is what a person sees in between.
          await page.goto(`${gate.base}${path}`, { waitUntil: 'commit' });
          const skeleton = await page.waitForSelector('[data-state="loading"][aria-busy="true"]', { timeout: 5000 }).then(() => true).catch(() => false);
          await shot(page, `${key}-loading`);
          await page.waitForSelector('#result-count', { timeout: 15000 });
          unlinkSync(faults);
          // Denied, for a role that does not hold the module.
          const denied = await signedInPage(gate, deniedRole, { colorScheme: scheme });
          const response = await denied.page.goto(`${gate.base}${path}`);
          const deniedText = (await denied.page.textContent('main')).includes('Your role does not include');
          await denied.page.screenshot({ path: join(dir, `${scheme}-${key}-denied.png`), fullPage: true });
          await denied.context.close();
          details.push(`${scheme} ${key}: filtered empty ${filtered}; error alert ${alert > 0} with retry ${retry > 0}; loading skeleton with aria-busy ${skeleton}; denied for ${deniedRole}: ${response.status()} "${deniedText ? 'Your role does not include ...' : ''}"`);
          if (!filtered || !alert || !retry || !skeleton || response.status() !== 403 || !deniedText) failures.push(`${scheme} ${key}: a state is missing`);
        }
        await context.close();
      }
    } finally {
      try {
        unlinkSync(faults);
      } catch {
        // Already removed.
      }
      second.child.expectedExit = true;
      second.child.kill('SIGTERM');
    }
    details.push(`${readdirSync(dir).length} screenshots in ${relative(gate.appDir, dir)}, for a person to look at`);
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D17 = {
  id: 'D17',
  title: 'an expired session signs in and returns to the same URL, filters intact',
  run: async (gate) => {
    const details = [];
    const { context, page } = await signedInPage(gate, 'frontDesk');
    const target = `/stays?status=confirmed&sort=total.desc&page=3&arrivalFrom=${todayOf(gate)}`;
    await page.goto(`${gate.base}${target}`);
    const before = await firstColumn(page);
    const account = gate.db.prepare('SELECT id FROM accounts WHERE email = ?').get(gate.accounts.frontDesk).id;
    gate.db.prepare('UPDATE sessions SET expires_at = 0 WHERE account_id = ?').run(account);
    await page.reload();
    await page.waitForURL(/\/login/);
    const loginUrl = page.url();
    const message = await page.getByRole('status').filter({ hasText: 'Your session ended' }).count();
    details.push(`session expired on page 3: sent to ${loginUrl.replace(gate.base, '')}, message shown ${message > 0}`);
    await page.fill('#identifier', gate.accounts.frontDesk);
    await page.fill('#password', gate.password);
    await Promise.all([page.waitForURL((url) => url.pathname === '/stays'), page.click('button[type=submit]')]);
    const landed = page.url().replace(gate.base, '');
    const after = await firstColumn(page);
    details.push(`signed in again: landed on ${landed}; same rows ${JSON.stringify(after) === JSON.stringify(before)}`);
    await context.close();
    const ok = message > 0 && landed === target && JSON.stringify(after) === JSON.stringify(before) && before.length > 0;
    return result(ok ? 'pass' : 'fail', details);
  },
};

const D18 = {
  id: 'D18',
  title: 'offline: banner with the age of the data, writes disabled with the reason, nothing served from cache',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const { context, page } = await signedInPage(gate, 'frontDesk');
    await page.goto(`${gate.base}/stays?status=confirmed`);
    const worker = await page.evaluate(async () => {
      const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), 8000))]);
      return registration ? registration.active?.state ?? 'none' : 'timeout';
    });
    await page.reload();
    const stamp = await page.getAttribute('[data-loaded-at]', 'data-loaded-at');
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    const banner = await page.locator('#offline-reason').textContent().catch(() => '');
    const button = page.getByRole('button', { name: /^Cancel, stay of/ }).first();
    const disabled = await button.isDisabled();
    const reason = await button.getAttribute('aria-describedby');
    details.push(`service worker: ${worker}; offline banner "${banner}"`);
    details.push(`a row action while offline: disabled ${disabled}, described by #${reason}`);
    if (!banner.includes('You are offline') || !banner.includes(stamp) || !disabled || reason !== 'offline-reason') failures.push('the offline state is incomplete');
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    // Sign out, cut the network, reload: no record may come back.
    const guest = (await firstColumn(page))[0];
    await Promise.all([page.waitForURL(/\/login/), page.getByRole('button', { name: 'Sign out' }).click()]);
    await context.setOffline(true);
    const response = await page.goto(`${gate.base}/stays?status=confirmed`).catch(() => null);
    const body = await page.textContent('body').catch(() => '');
    const cached = await page.evaluate(async () => {
      const urls = [];
      for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) urls.push(new URL(request.url).pathname);
      return urls;
    });
    const recordUrls = cached.filter((path) => path !== '/offline' && !path.startsWith('/_next/static/'));
    details.push(`signed out, network cut, list reloaded: status ${response?.status() ?? 'none'}, offline page shown ${body.includes('You are offline')}, guest "${guest}" present ${body.includes(guest)}`);
    details.push(`cache holds ${cached.length} entries; any page or API entry: ${recordUrls.length ? recordUrls.join(', ') : 'none'}`);
    if (!body.includes('You are offline') || body.includes(guest) || recordUrls.length) failures.push('a record was served or cached while signed out');
    if (worker !== 'activated') failures.push(`the service worker is ${worker}`);
    await context.close();
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D19 = {
  id: 'D19',
  title: 'keyboard alone, from the skip link to the last row action, visible focus in both themes',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const source = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path);
        else if (entry.endsWith('.tsx')) source.push([path, readFileSync(path, 'utf8')]);
      }
    };
    walk(join(gate.appDir, 'app'));
    walk(join(gate.appDir, 'components'));
    const handlers = source.filter(([, text]) => /<(tr|td|th)\b[^>]*onClick/.test(text)).map(([path]) => relative(gate.appDir, path));
    details.push(`click handlers on a row or a cell in ${source.length} components: ${handlers.length ? handlers.join(', ') : 'none'}`);
    if (handlers.length) failures.push('a row or a cell carries a click handler');
    const tomorrow = addDays(todayOf(gate), 1);
    for (const scheme of ['light', 'dark']) {
      const { context, page } = await signedInPage(gate, 'frontDesk', { colorScheme: scheme });
      await page.goto(`${gate.base}/stays?status=confirmed&arrivalFrom=${tomorrow}`);
      const last = await page.$$eval('table.table tbody tr', (rows) => rows[rows.length - 1].querySelector('button[aria-label^="Cancel"]')?.getAttribute('aria-label'));
      await page.keyboard.press('Tab');
      const first = await page.evaluate(() => document.activeElement?.className);
      await page.keyboard.press('Enter');
      const main = await page.evaluate(() => document.activeElement?.id);
      let presses = 0;
      let reached = false;
      for (; presses < 400; presses++) {
        await page.keyboard.press('Tab');
        const name = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
        if (name === last) {
          reached = true;
          break;
        }
      }
      const outline = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement);
        return { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
      });
      await page.screenshot({ path: join(screens(gate, 'D19'), `${scheme}-last-cancel-focused.png`) });
      await page.keyboard.press('Enter');
      const dialog = await page.evaluate(() => ({ open: Boolean(document.querySelector('dialog[open]')), focused: document.activeElement?.textContent }));
      await page.keyboard.press('Escape');
      const closed = await page.evaluate(() => ({ open: Boolean(document.querySelector('dialog[open]')), focused: document.activeElement?.getAttribute('aria-label') }));
      details.push(`${scheme}: first Tab on "${first}", Enter moves focus to #${main}; "${last}" reached after ${presses + 1} more Tabs; outline ${outline.style} ${outline.width}; Enter opens the dialog with focus on "${dialog.focused}"; Escape closes it, focus back on "${closed.focused}"`);
      if (first !== 'skip-link' || main !== 'main' || !reached || outline.style === 'none' || parseFloat(outline.width) < 2 || !dialog.open || dialog.focused !== 'Keep the stay' || closed.open || closed.focused !== last) {
        failures.push(`${scheme}: the keyboard path is broken`);
      }
      await context.close();
    }
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const LISTS = ['/rooms', '/stays', '/guests', '/folios', '/housekeeping', '/stock', '/stock/movements', '/suppliers', '/ledger', '/staff', '/audit'];

const D20 = {
  id: 'D20',
  title: 'every table is named, headers have scope, the sorted column has aria-sort, actions are named',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const { context, page } = await signedInPage(gate, 'manager');
    for (const path of LISTS) {
      await page.goto(`${gate.base}${path}?arrivalFrom=any`);
      const facts = await page.evaluate(() => {
        const table = document.querySelector('table.table');
        if (!table) return null;
        const headers = Array.from(table.querySelectorAll('thead th'));
        return {
          caption: table.querySelector('caption')?.textContent ?? '',
          scoped: headers.every((th) => th.getAttribute('scope') === 'col'),
          sorted: headers.filter((th) => ['ascending', 'descending'].includes(th.getAttribute('aria-sort') ?? '')).length,
          rowHeaders: Array.from(table.querySelectorAll('tbody th')).every((th) => th.getAttribute('scope') === 'row'),
          sortButtons: table.querySelectorAll('thead th button.sort').length,
        };
      });
      if (!facts || !facts.caption || !facts.scoped || facts.sorted !== 1 || !facts.rowHeaders) failures.push(`${path}: ${JSON.stringify(facts)}`);
      else details.push(`${path}: caption "${facts.caption}", ${facts.sortButtons} sort buttons, one column with aria-sort`);
    }
    await context.close();
    const desk = await signedInPage(gate, 'frontDesk');
    const client = new Client(gate.base);
    await client.login(gate.accounts.frontDesk, gate.password);
    const arrivals = await client.get('/api/stays?arrival=today&status=confirmed');
    const row = arrivals.json.items.find((item) => item.actions.includes('checkIn'));
    await desk.page.goto(`${gate.base}/stays?arrival=today&status=confirmed`);
    const name = `Check in, stay of ${row.guest}, room ${row.room}`;
    const found = await desk.page.getByRole('button', { name, exact: true }).count();
    const link = await desk.page.getByRole('link', { name: `Stay of ${row.guest}, room ${row.room}`, exact: true }).count();
    details.push(`accessibility tree: button "${name}" found ${found}; link "Stay of ${row.guest}, room ${row.room}" found ${link}`);
    if (!found || !link) failures.push('the row action or the record link is not named with its record');
    await desk.context.close();
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D22 = {
  id: 'D22',
  title: 'the result count, the toasts and a refused field are announced',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const { context, page } = await signedInPage(gate, 'frontDesk');
    await page.goto(`${gate.base}/stays`);
    const count = page.locator('#result-count');
    const role = await count.getAttribute('role');
    const before = await count.textContent();
    await page.fill('#list-search', 'B');
    await page.waitForFunction((text) => document.querySelector('#result-count')?.textContent !== text, before, { timeout: 8000 });
    const after = await count.textContent();
    const sameNode = await page.evaluate(() => document.querySelectorAll('#result-count').length === 1);
    details.push(`result count in role=${role}: "${before}" became "${after}" in place (${sameNode})`);
    if (role !== 'status' || before === after) failures.push('the result count is not announced on change');

    await page.goto(`${gate.base}/stays?arrival=today&status=confirmed`);
    const button = page.getByRole('button', { name: /^Check in, stay of/ }).first();
    const name = await button.getAttribute('aria-label');
    await button.click();
    const toast = page.locator('[data-toasts="polite"] .toast');
    await toast.first().waitFor({ timeout: 8000 }).catch(() => {});
    const toastText = await toast.first().textContent().catch(() => '');
    const region = await page.locator('[data-toasts="polite"]').getAttribute('role');
    details.push(`"${name}" pressed: toast "${toastText}" in a region with role=${region}`);
    if (!toastText || region !== 'status') failures.push('the toast after a check in is not announced');
    if (/arrival=today/.test(page.url()) === false) failures.push('the page left the list');

    const today = todayOf(gate);
    await page.goto(`${gate.base}/stays/new`);
    await page.fill('#field-guestName', 'Gate Refused');
    await page.selectOption('#field-roomId', { index: 3 });
    await page.fill('#field-arrival', addDays(today, 80));
    await page.fill('#field-departure', addDays(today, 79));
    await page.fill('#field-adults', '2');
    await page.getByRole('button', { name: 'New stay' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'departure' });
    await alert.first().waitFor({ timeout: 8000 }).catch(() => {});
    const alertText = await alert.first().textContent().catch(() => '');
    const invalid = await page.getAttribute('#field-departure', 'aria-invalid');
    const described = await page.getAttribute('#field-departure', 'aria-describedby');
    details.push(`departure before arrival submitted: alert "${alertText}"; the field aria-invalid=${invalid}, described by #${described}`);
    if (!alertText || invalid !== 'true' || !described?.includes('form-error-message')) failures.push('the refused field is not announced and tied to its field');
    await context.close();
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D23 = {
  id: 'D23',
  title: 'at 360px: the drawer, Escape, focus returning, 44px targets, no sideways scroll',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const { context, page } = await signedInPage(gate, 'manager', { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
    await page.goto(`${gate.base}/stays?arrivalFrom=any`);
    const button = page.locator('.drawer-button');
    const closed = { expanded: await button.getAttribute('aria-expanded'), controls: await button.getAttribute('aria-controls'), name: await button.textContent() };
    await button.click();
    const opened = await page.evaluate(() => {
      const rail = document.getElementById('navigation-rail');
      return { role: rail.getAttribute('role'), label: rail.getAttribute('aria-label'), modal: rail.getAttribute('aria-modal'), focusInside: rail.contains(document.activeElement) };
    });
    let trapped = true;
    for (let index = 0; index < 30; index++) {
      await page.keyboard.press('Tab');
      if (!(await page.evaluate(() => document.getElementById('navigation-rail').contains(document.activeElement)))) trapped = false;
    }
    await page.keyboard.press('Escape');
    const after = await page.evaluate(() => ({ focused: document.activeElement?.classList.contains('drawer-button'), expanded: document.querySelector('.drawer-button').getAttribute('aria-expanded'), open: document.getElementById('navigation-rail').getAttribute('role') }));
    details.push(`drawer button "${closed.name}" aria-expanded=${closed.expanded} aria-controls=${closed.controls}; open: role=${opened.role}, named "${opened.label}", modal ${opened.modal}, focus inside ${opened.focusInside}, 30 Tabs stayed inside ${trapped}; Escape: closed ${after.open === null}, focus back on the button ${after.focused}`);
    if (closed.expanded !== 'false' || !closed.controls || opened.role !== 'dialog' || !opened.label || !opened.focusInside || !trapped || !after.focused || after.open !== null) failures.push('the drawer does not behave as a dialog');
    const dir = screens(gate, 'D23');
    for (const path of ['/', '/stays?arrivalFrom=any', '/stock', '/ledger', '/stays/new', '/folios?status=overdue']) {
      await page.goto(`${gate.base}${path}`);
      const facts = await page.evaluate(() => {
        const small = [];
        for (const element of document.querySelectorAll('a, button, input, select, textarea, summary')) {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || element.closest('[aria-hidden="true"], dialog:not([open])')) continue;
          if (element.classList.contains('skip-link') && rect.bottom < 0) continue;
          // A checkbox is tapped through its label, which is the target.
          const box = element.type === 'checkbox' && element.closest('label') ? element.closest('label').getBoundingClientRect() : rect;
          if (box.height < 44 || box.width < 44) small.push(`${element.tagName.toLowerCase()} "${(element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 30)}" ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        }
        const wrap = document.querySelector('.table-wrap');
        const first = document.querySelector('.table tbody tr > :first-child');
        return {
          page: document.documentElement.scrollWidth,
          small,
          tableScrolls: wrap ? wrap.scrollWidth > wrap.clientWidth : null,
          sticky: first ? getComputedStyle(first).position : null,
        };
      });
      await page.screenshot({ path: join(dir, `${path.replace(/[^a-z]+/gi, '_')}.png`), fullPage: true });
      details.push(`${path}: page width ${facts.page}px, targets under 44px ${facts.small.length}${facts.small.length ? ` (${facts.small.slice(0, 4).join('; ')})` : ''}${facts.tableScrolls === null ? '' : `, table scrolls in its container ${facts.tableScrolls}, first column ${facts.sticky}`}`);
      if (facts.page > 360 || facts.small.length || (facts.tableScrolls !== null && (!facts.tableScrolls || facts.sticky !== 'sticky'))) failures.push(`${path} fails at 360px`);
    }
    await context.close();
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

const D25 = {
  id: 'D25',
  title: 'list queries use an index on the seeded volume; the overview is interactive in under two seconds',
  run: async (gate) => {
    const failures = [];
    const details = [];
    const client = new Client(gate.base);
    await client.login(gate.accounts.manager, gate.password);
    const log = join(gate.dataDir, 'query-plans.log');
    writeFileSync(log, '');
    const lists = [
      '/api/stays',
      '/api/stays?arrivalFrom=any',
      '/api/stays?status=confirmed&arrivalFrom=any',
      '/api/stays?night=today',
      '/api/movements',
      '/api/movements?kind=out',
      '/api/ledger',
      '/api/ledger?kind=income&period=month',
    ];
    for (const path of lists) await client.get(path);
    const plans = readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
    let wholeCounts = 0;
    for (const { label, sql, plan } of plans) {
      const alias = { stays: 's', movements: 'm', ledger: 'l' }[label.split(':')[0]];
      // Counting every row of a table, with no filter at all, reads every row
      // whatever the index: that is the cost of a total, and it is stated
      // rather than hidden. Any filtered count and every page query must use
      // an index.
      if (label.endsWith(':count') && !/\bWHERE\b/.test(sql)) {
        wholeCounts++;
        details.push(`${label} without a filter: ${plan[0]} (a total of the whole table)`);
        continue;
      }
      const scans = plan.filter((step) => new RegExp(`^SCAN ${alias}$`).test(step));
      const indexes = plan.filter((step) => new RegExp(`^(SEARCH|SCAN) ${alias} USING`).test(step));
      if (scans.length || !indexes.length) failures.push(`${label}: ${plan.join(' | ')}`);
      else details.push(`${label}: ${indexes[0]}`);
    }
    details.push(`${plans.length} plans logged (${wholeCounts} of them unfiltered totals) for ${lists.length} list requests on ${gate.db.prepare('SELECT COUNT(*) AS c FROM stays').get().c} stays, ${gate.db.prepare('SELECT COUNT(*) AS c FROM movements').get().c} movements, ${gate.db.prepare('SELECT COUNT(*) AS c FROM ledger').get().c} ledger entries`);
    const timings = [];
    for (let run = 0; run < 3; run++) {
      const { context, page } = await signedInPage(gate, 'manager');
      await page.goto(`${gate.base}/`);
      timings.push(
        await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return Math.round(navigation.domInteractive);
        }),
      );
      await context.close();
    }
    const median = timings.sort((a, b) => a - b)[1];
    details.push(`overview, signed in as the manager, time to interactive over three loads: ${timings.join(', ')} ms, median ${median} ms (local server, no network latency)`);
    if (median >= 2000) failures.push(`the overview took ${median} ms`);
    return failures.length ? result('fail', [...failures, ...details]) : result('pass', details);
  },
};

export const CHECKS = [D2, D3, D9, D13, D15, D17, D18, D19, D20, D22, D23, D25];
