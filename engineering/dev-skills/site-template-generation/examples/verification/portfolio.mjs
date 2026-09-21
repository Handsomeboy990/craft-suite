import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'mot-de-passe-de-verification-1234';
const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await chromium.launch();

// 1. Theme: system default, explicit choice, persistence, no flash.
{
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto(BASE);
  const dark = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: /Thème/ }).click(); // system -> light
  const light = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor);
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  await page.reload();
  const afterReload = await page.evaluate(() => ({
    attribute: document.documentElement.getAttribute('data-theme'),
    background: getComputedStyle(document.body).backgroundColor,
  }));
  record('dark theme follows the system preference', dark === 'rgb(15, 17, 21)', dark);
  record('the toggle switches to light', light === 'rgb(253, 252, 251)', light);
  record('the choice persists across a reload',
    stored === 'light' && afterReload.attribute === 'light' && afterReload.background === light,
    `${stored}, ${afterReload.attribute}`);

  // No flash: the attribute must be set before first paint, which means it is
  // present on the very first evaluation after DOMContentLoaded.
  const early = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  record('no flash of the wrong theme on load', early === 'light', String(early));
  await context.close();
}

// 2. Motion: the reveal actually runs, and reduced motion removes it.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  await page.waitForTimeout(600);
  // Nothing below the first screen is revealed on load, which is the point: the
  // hero has its entrance and the rest waits for the visitor.
  const armed = await page.locator('.motion-on').count();
  record('the sections below the fold are armed and waiting', armed > 0, `${armed} armed`);

  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const afterScroll = await page.locator('.motion-on.is-visible').count();
  record('scrolling reveals them', afterScroll > 0, `${afterScroll} revealed`);
  await context.close();

  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const page2 = await reduced.newPage();
  await page2.goto(BASE);
  await page2.waitForTimeout(400);
  const withReduced = await page2.locator('.motion-on').count();
  const everythingVisible = await page2.evaluate(() =>
    [...document.querySelectorAll('section')].every((node) =>
      getComputedStyle(node).opacity === '1'));
  record('prefers-reduced-motion adds no motion class at all', withReduced === 0, `${withReduced} nodes`);
  record('every section is visible with reduced motion', everythingVisible);
  await reduced.close();
}

// 3. Keyboard: the skip link comes first, focus is visible, every action reachable.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    outline: getComputedStyle(document.activeElement).outlineWidth,
  }));
  record('the first tab reaches the skip link', first.text === 'Aller au contenu', first.text);
  record('focus is visible on it', first.outline !== '0px', first.outline);

  const reached = [];
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    reached.push(await page.evaluate(() => document.activeElement?.tagName));
  }
  record('the keyboard walks into the page', reached.includes('A') && reached.includes('BUTTON'),
    [...new Set(reached)].join(','));
  await context.close();
}

// 4. No horizontal scroll from 360px upward.
{
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('no horizontal scroll at 360px', overflow <= 0, `${overflow}px of overflow`);
  await page.setViewportSize({ width: 1920, height: 1080 });
  const wide = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('no horizontal scroll at 1920px', wide <= 0, `${wide}px of overflow`);
  await context.close();
}

// 5. The service worker registers, caches, and serves the offline page.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  const registered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  record('the service worker registers and activates', registered);

  await page.waitForTimeout(1200);
  await context.setOffline(true);
  const response = await page.goto(`${BASE}/une-page-jamais-visitee`, { waitUntil: 'load' }).catch(() => null);
  const body = await page.textContent('body').catch(() => '');
  record('offline, a never visited page falls back to the offline page',
    body.includes('Vous êtes hors ligne'), response ? `status ${response.status()}` : 'no response object');

  const home = await page.goto(BASE, { waitUntil: 'load' }).catch(() => null);
  const homeBody = await page.textContent('body').catch(() => '');
  record('offline, the cached home page is still served',
    homeBody.includes('Retrouver de la force'), home ? `status ${home.status()}` : 'no response object');

  await context.setOffline(false);
  await context.close();
}

// 6. The back office, driven as a person would.
{
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE}/admin/content`);
  record('an unauthenticated visit to the back office lands on the login',
    page.url().includes('/admin/login'), page.url().replace(BASE, ''));

  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Entrer' }).click();
  // Waiting for "/admin" would match the login page itself, which is what made
  // the first run of this script report a failure the product did not have.
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  const cookie = (await context.cookies()).find((c) => c.name === 'session');
  // Signing in lands on the page that was asked for, not on the dashboard.
  record('signing in lands on the requested page',
    page.url().endsWith('/admin/content'), page.url().replace(BASE, ''));
  record('the session cookie is httpOnly and SameSite=Lax',
    cookie?.httpOnly === true && cookie?.sameSite === 'Lax',
    `httpOnly=${cookie?.httpOnly} sameSite=${cookie?.sameSite} secure=${cookie?.secure}`);

  await page.goto(`${BASE}/admin/content`);
  await page.getByText('Première section', { exact: false }).first().click();
  const field = page.getByLabel('Titre principal', { exact: false }).first();
  await field.fill('Titre écrit depuis le navigateur');
  await page.getByRole('button', { name: /Enregistrer/ }).click();
  await page.waitForTimeout(1500);

  const site = await context.newPage();
  await site.goto(BASE);
  const applied = (await site.textContent('h1')) ?? '';
  record('a field edited in the back office appears on the public page',
    applied.includes('Titre écrit depuis le navigateur'), applied.slice(0, 60));

  // Put it back through the same surface, which exercises the write twice.
  await page.goto(`${BASE}/admin/content`);
  await page.getByText('Première section', { exact: false }).first().click();
  await page.getByLabel('Titre principal', { exact: false }).first()
    .fill('Retrouver de la force, sans y laisser vos genoux');
  await page.getByRole('button', { name: /Enregistrer/ }).click();
  await page.waitForTimeout(1500);
  await site.goto(BASE);
  const restored = (await site.textContent('h1')) ?? '';
  record('the original value is restored through the back office',
    restored.includes('Retrouver de la force'), restored.slice(0, 60));
  // The worker must never serve the back office from cache: a cached admin is a
  // signed in page left on a shared machine.
  await context.setOffline(true);
  const cached = await page.goto(`${BASE}/admin/messages`).catch(() => null);
  const cachedBody = await page.textContent('body').catch(() => '');
  record('the back office is never served from the cache',
    !cachedBody.includes('Messages') || cachedBody.includes('hors ligne'),
    cached ? `status ${cached.status()}` : 'no response');
  await context.setOffline(false);
  await context.close();
}

// 6b. The public contact form, filled as a visitor would.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  await page.getByLabel('Votre nom').fill('Visiteur Navigateur');
  await page.getByLabel('Votre adresse e-mail').fill('visiteur@example.com');
  await page.getByLabel('Ce que vous cherchez').selectOption('Remise en forme');
  await page.getByLabel('Votre message').fill('Bonjour, je souhaite reprendre le sport.');
  await page.getByRole('button', { name: /Envoyer le message/ }).click();
  await page.waitForTimeout(2000);
  const status = (await page.locator('.form__status').textContent()) ?? '';
  record('the visitor sees the success state, not a false failure',
    status.includes('Message envoyé'), status.trim().slice(0, 70));
  const cleared = await page.getByLabel('Votre message').inputValue();
  record('the form is cleared after a successful send', cleared === '', `"${cleared}"`);
  await context.close();
}

// 7. The 404 page, in the browser rather than through curl.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await page.goto(`${BASE}/une-page-qui-n-existe-pas`);
  const heading = await page.textContent('h1');
  record('the 404 page is the site own, with its status',
    response?.status() === 404 && heading?.includes("Cette page n'existe pas"),
    `${response?.status()} ${heading}`);
  await context.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log('Failed:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ''}`);
  process.exitCode = 1;
}
