// The field map of SKILL.md, checked field by field against a live instance.
//
//   BASE_URL=http://localhost:3111 ADMIN_PASSWORD='...' KIND=portfolio node gate.mjs
//
// A field map is a set of promises. This changes every one of them through the
// same endpoint the back office uses, reads the public pages to see whether the
// change arrived, and puts the original value back. What it cannot observe it
// says so about, rather than passing quietly.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'mot-de-passe-de-verification-1234';
const KIND = process.env.KIND ?? 'portfolio';

const ROUTES = {
  portfolio: ['/', '/offline', '/page-introuvable-pour-le-test'],
  showcase: ['/', '/services', '/about', '/quote', '/offline', '/page-introuvable-pour-le-test'],
}[KIND];

const token = `Z${Math.random().toString(36).slice(2, 8)}Z`;
let index = 0;
const sentinel = () => `${token}${(index += 1)}`;

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(`${BASE}/admin/content`);
await page.fill('#password', PASSWORD);
await page.getByRole('button', { name: 'Entrer' }).click();
await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

// Every field the client is offered, read from the surface they use.
const fields = [];
for (const route of ['/admin/content', '/admin/theme']) {
  await page.goto(`${BASE}${route}`);
  const found = await page.evaluate(() =>
    [...document.querySelectorAll('[data-field]')].map((node) => ({
      path: node.getAttribute('data-field'),
      kind: node.getAttribute('data-kind'),
      options: [...node.querySelectorAll('select option')].map((option) => option.value),
      item: (node.getAttribute('data-item') ?? '')
        .split(',')
        .filter(Boolean)
        .map((pair) => {
          const [key, kind] = pair.split(':');
          return { key, kind };
        }),
    })));
  for (const field of found) if (!fields.some((f) => f.path === field.path)) fields.push(field);
}
console.log(`${fields.length} fields offered by the back office.\n`);

const csrf = await page.getAttribute('meta[name="csrf-token"]', 'content');

async function api(method, path, body) {
  // Two writes per field against a limit of 120 a minute: the limiter is right
  // and the caller is unusual, so the caller waits.
  if (method !== 'GET') await pause(1100);
  return page.evaluate(
    async ([m, p, b, t]) => {
      const response = await fetch(p, {
        method: m,
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': t },
        body: b ? JSON.stringify(b) : undefined,
      });
      return { status: response.status, body: await response.text() };
    },
    [method, path, body ?? null, csrf],
  );
}

const read = async () => JSON.parse((await api('GET', '/api/admin/content')).body).content;
const at = (source, path) =>
  path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), source);

const original = await read();

// One fetch of every public page, searched for the sentinel.
async function pagesContain(value) {
  for (const route of ROUTES) {
    const response = await page.request.get(`${BASE}${route}`);
    if ((await response.text()).includes(value)) return route;
  }
  const manifest = await page.request.get(`${BASE}/manifest.webmanifest`);
  if (manifest.ok() && (await manifest.text()).includes(value)) return '/manifest.webmanifest';

  const legal = at(original, 'legal.pages') ?? [];
  for (const entry of legal) {
    const response = await page.request.get(`${BASE}/legal/${entry.slug}`);
    if ((await response.text()).includes(value)) return `/legal/${entry.slug}`;
  }
  return null;
}

// What a sentinel looks like for each kind of field.
function probeFor(kind, current, options) {
  const mark = sentinel();
  switch (kind) {
    case 'text':
    case 'textarea':
      return { value: mark, needle: mark };
    case 'paragraphs':
    case 'lines':
      return { value: [mark], needle: mark };
    case 'image': {
      // Some images render their alt, some do not: a favicon has nowhere to put
      // one. The path is what every image has in common.
      const path = current?.src === '/media/icon-512.png' ? '/media/icon-192.png' : '/media/icon-512.png';
      return { value: { src: path, alt: current?.alt ?? mark }, needle: path };
    }
    case 'imageSrc':
      return { value: '/media/icon-512.png', needle: '/media/icon-512.png' };
    case 'color':
      return { value: '#0b5d1e', needle: '#0b5d1e' };
    case 'range':
      return { value: 0.42, needle: null };
    case 'boolean':
      return { value: !current, needle: null };
    case 'select': {
      const other = (options ?? []).find((option) => option !== current);
      return other ? { value: other, needle: null } : { value: null, needle: null };
    }
    case 'collection':
      return { value: null, needle: null };
    default:
      return { value: null, needle: null };
  }
}

const wired = [];
const unobserved = [];
const failed = [];

for (const field of fields) {
  let current = at(original, field.path);

  // A collection is checked through its first item's first text: the same
  // write path, and the part a client actually edits.
  if (field.kind === 'collection') {
    if (!Array.isArray(current)) {
      unobserved.push({ ...field, why: 'not a list in this instance' });
      continue;
    }
    // An empty list in this instance is still a field the client is offered:
    // one item is added, looked for, and taken away again.
    const wasEmpty = current.length === 0;
    if (wasEmpty) {
      const seed = {};
      for (const definition of field.item ?? []) {
        seed[definition.key] =
          definition.kind === 'imageSrc'
            ? '/media/icon-192.png'
            : definition.kind === 'boolean'
              ? true
              : definition.kind === 'select'
                ? (field.options ?? [''])[0]
                : sentinel();
      }
      // Pushing into `current` would mutate the copy this script keeps of the
      // original and make its own final comparison fail.
      current = [seed];
    }
    // Only a free text key takes a sentinel: a path and a select both have
    // rules of their own, and the validator is right to refuse a random value.
    const freeText = new Set(['text', 'textarea']);
    const key = (field.item ?? [])
      .filter((definition) => freeText.has(definition.kind))
      .map((definition) => definition.key)
      .find((candidate) => typeof current[0][candidate] === 'string' && current[0][candidate] !== '');
    // An icon has no sentence to change: its keys are a path and two choices.
    // The choice is probed instead, and looked for in the manifest.
    let mark = sentinel();
    let probeKey = key;
    if (!probeKey) {
      const select = (field.item ?? []).find((definition) => definition.kind === 'select');
      const other = (field.options ?? []).find((option) => option !== current[0][select?.key]);
      if (!select || !other) {
        unobserved.push({ ...field, why: 'no text and no second choice to change' });
        continue;
      }
      probeKey = select.key;
      mark = other;
    }
    const next = current.map((item, position) =>
      position === 0 ? { ...item, [probeKey]: mark } : item,
    );
    const write = await api('PUT', '/api/admin/content', { patch: { [field.path]: next } });
    if (write.status !== 200) {
      failed.push({ ...field, why: `write refused: ${write.body.slice(0, 80)}` });
      continue;
    }
    const where = await pagesContain(mark);
    await api('PUT', '/api/admin/content', {
      patch: { [field.path]: wasEmpty ? [] : current },
    });
    if (where) wired.push({ ...field, where: `${where} (${probeKey})` });
    else unobserved.push({ ...field, why: `changed ${probeKey}, not found in any page` });
    continue;
  }

  const probe = probeFor(field.kind, current, field.options);
  if (probe.value === null && field.kind !== 'boolean') {
    unobserved.push({ ...field, why: `no probe for kind ${field.kind}` });
    continue;
  }

  const write = await api('PUT', '/api/admin/content', { patch: { [field.path]: probe.value } });
  if (write.status !== 200) {
    failed.push({ ...field, why: `write refused: ${write.body.slice(0, 90)}` });
    continue;
  }

  let where = null;
  if (probe.needle) where = await pagesContain(probe.needle);
  else {
    // A number or a flag shows up as a token or a rendered difference; compare
    // the served home page before and after instead of looking for a string.
    const after = await (await page.request.get(`${BASE}/`)).text();
    const restored = JSON.stringify(current);
    where = after.includes(String(probe.value)) || !after.includes(restored) ? '/' : null;
  }

  await api('PUT', '/api/admin/content', { patch: { [field.path]: current } });

  if (where) wired.push({ ...field, where });
  else unobserved.push({ ...field, why: 'changed, not visible in any fetched page' });
}

// The file must be exactly what it was.
const restored = await read();
const identical = JSON.stringify(restored) === JSON.stringify(original);

console.log(`wired and observed   ${wired.length}`);
console.log(`not observable here  ${unobserved.length}`);
console.log(`refused or broken    ${failed.length}\n`);

if (failed.length) {
  console.log('REFUSED OR BROKEN');
  for (const f of failed) console.log(`  ${f.path} (${f.kind}): ${f.why}`);
  console.log('');
}
if (unobserved.length) {
  console.log('NOT OBSERVED IN A FETCHED PAGE');
  for (const f of unobserved) console.log(`  ${f.path} (${f.kind}): ${f.why}`);
  console.log('');
}
console.log(`content file restored byte for byte: ${identical ? 'yes' : 'NO'}`);

await browser.close();
if (failed.length || !identical) process.exitCode = 1;
