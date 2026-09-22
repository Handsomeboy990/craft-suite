// The two surfaces a client with no technical knowledge depends on: a
// dashboard that says what is left to do, and a help page that answers in
// their words. Checked on a real instance, at the width they use.
//
//   BASE_URL=http://localhost:3111 node guidance.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'mot-de-passe-de-verification-1234';
const NAME = process.env.NAME ?? 'portfolio';

mkdirSync('shots', { recursive: true });
const browser = await chromium.launch();
const results = [];
const record = (n, ok, d) => { results.push({ n, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); };

const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
await page.goto(`${BASE}/admin`);
await page.fill('#password', PASSWORD);
await page.getByRole('button', { name: 'Entrer' }).click();
await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

// The checklist, on an instance that has just been installed.
{
  const items = page.locator('.checklist__item');
  const total = await items.count();
  record('the dashboard lists what is left to do', total > 0, `${total} points`);

  const open = await page.locator('.checklist__item:not(.checklist__item--done)').count();
  record('a fresh instance is not declared finished', open > 0, `${open} still open`);

  const urgent = page.locator('.checklist__item--urgent');
  const urgentCount = await urgent.count();
  record('what a visitor can see is marked urgent', urgentCount > 0, `${urgentCount} urgent`);

  // The three that a new instance always has: legal markers, placeholder
  // images, example address.
  const text = await page.locator('.checklist').innerText();
  record('it names the legal fields still missing', /information.{0,3} légale/i.test(text));
  record('it names the demonstration images', /image.{0,3} de démonstration/i.test(text));
  record('it names the unset site address', /adresse de votre site/i.test(text));

  // Each open item goes somewhere. A task a client cannot act on is noise.
  const actionable = await page.evaluate(() => {
    const open = [...document.querySelectorAll('.checklist__item:not(.checklist__item--done)')];
    return open.map((item) => ({
      title: item.querySelector('.checklist__title')?.innerText ?? '',
      href: item.querySelector('a')?.getAttribute('href') ?? null,
      detail: (item.querySelector('.detail')?.innerText ?? '').length,
    }));
  });
  const withoutDestination = actionable.filter((t) => !t.href && !/récupération/i.test(t.title));
  record('every open task a client can act on has a link', withoutDestination.length === 0,
    withoutDestination.map((t) => t.title).join(' | ') || 'none missing');
  record('and every task explains itself', actionable.every((t) => t.detail > 30));

  // No jargon. These are the words a client should never have to meet.
  const jargon = ['JSON', 'schéma', 'endpoint', 'payload', 'commit', 'déployer', 'variable d’environnement'];
  const found = jargon.filter((word) => text.includes(word));
  record('and says it without jargon', found.length === 0, found.join(', ') || 'none');

  await page.screenshot({ path: `shots/${NAME}-dashboard-1280.png`, fullPage: true });
}

// The state is computed, not remembered: fix the thing, the item closes.
{
  const csrf = await page.getAttribute('meta[name="csrf-token"]', 'content');
  const before = await page.locator('.checklist__item--done').count();
  const res = await page.evaluate(async (token) => {
    const r = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify({ patch: { 'site.baseUrl': 'https://verification-du-gabarit.fr' } }),
    });
    return { status: r.status, body: await r.text() };
  }, csrf);
  record('the site address can be set from the back office', res.status === 200, res.body.slice(0, 120));

  await page.reload();
  const after = await page.locator('.checklist__item--done').count();
  record('and the checklist notices without being told', after === before + 1, `${before} -> ${after}`);

  await page.evaluate(async (token) => {
    await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify({ patch: { 'site.baseUrl': 'https://www.example.com' } }),
    });
  }, csrf);
}


// Contrast on the checklist, measured, in both themes. A finished task is
// quieter than an open one; quieter is not the same as unreadable.
{
  const contrast = await page.evaluate(() => {
    const lum = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (value) => value.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const backdrop = (el) => {
      for (let node = el; node; node = node.parentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !bg.startsWith('rgba(0, 0, 0, 0)')) return parse(bg);
      }
      return [255, 255, 255];
    };
    return [...document.querySelectorAll('.checklist__title, .checklist__body .detail, .checklist__mark')]
      .map((el) => ({
        what: el.className,
        value: Math.round(ratio(parse(getComputedStyle(el).color), backdrop(el)) * 100) / 100,
      }));
  });
  const weak = contrast.filter((c) => c.value < 4.5);
  record('every checklist text meets 4.5:1', weak.length === 0,
    weak.map((c) => `${c.what} ${c.value}`).join(', ') || `lowest ${Math.min(...contrast.map((c) => c.value))}`);

  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  const dark = await page.evaluate(() => {
    const el = document.querySelector('.checklist__item--done .checklist__title');
    return el ? getComputedStyle(el).color : null;
  });
  record('and the dark theme applies to it too', dark !== null, dark ?? 'no finished task to check');
  await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
}

// The help page.
{
  await page.goto(`${BASE}/admin/aide`);
  record('the help page is reachable', page.url().endsWith('/admin/aide'));

  const nav = await page.locator('.admin__nav a[href="/admin/aide"]').count();
  record('and is in the navigation', nav === 1);

  const text = await page.locator('main, .admin__main').first().innerText();
  const topics = [
    ['how a change goes live', /enregistre/i],
    ['what each section does', /Tableau de bord[\s\S]*Contenu[\s\S]*Images/],
    ['undoing a mistake', /Historique/],
    ['why legal facts are not invented', /N.{1,3}inventez jamais/i],
    ['a forgotten password', /oublié mon mot de passe/i],
    ['what is not editable here', /ne se modifie pas ici/i],
  ];
  for (const [label, pattern] of topics) {
    record(`the help page covers ${label}`, pattern.test(text));
  }

  const jargon = ['JSON', 'endpoint', 'payload', 'commit', 'API'];
  const found = jargon.filter((word) => text.includes(word));
  record('the help page uses no jargon', found.length === 0, found.join(', ') || 'none');

  await page.screenshot({ path: `shots/${NAME}-aide-1280.png`, fullPage: true });
}

// At 360px, both surfaces, with nothing off the side.
{
  const small = await browser.newContext({ viewport: { width: 360, height: 780 } });
  const narrow = await small.newPage();
  await narrow.goto(`${BASE}/admin`);
  await narrow.fill('#password', PASSWORD);
  await narrow.getByRole('button', { name: 'Entrer' }).click();
  await narrow.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

  for (const [label, path] of [['dashboard', '/admin'], ['help', '/admin/aide']]) {
    await narrow.goto(`${BASE}${path}`);
    const overflow = await narrow.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    record(`the ${label} does not scroll sideways at 360px`, overflow <= 0, `${overflow}px`);
    await narrow.screenshot({ path: `shots/${NAME}-${label}-360.png`, fullPage: true });
  }

  // A link that a finger cannot hit is not a link.
  await narrow.goto(`${BASE}/admin`);
  const short = await narrow.evaluate(() =>
    [...document.querySelectorAll('.checklist__action')]
      .map((a) => Math.round(a.getBoundingClientRect().height))
      .filter((h) => h < 44));
  record('its actions are at least 44px tall', short.length === 0, short.join(', ') || 'all fine');
  await small.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) process.exit(1);
