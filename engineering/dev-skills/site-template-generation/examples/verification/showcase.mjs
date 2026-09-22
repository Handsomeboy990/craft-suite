import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3112';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'mot-de-passe-de-verification-1234';
const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await chromium.launch();

// Themes on a technical palette.
{
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto(BASE);
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.getByRole('button', { name: /Thème/ }).click();
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  record('dark theme follows the system preference', dark === 'rgb(13, 18, 24)', dark);
  record('the toggle switches to light', light === 'rgb(255, 255, 255)', light);
  await context.close();
}

// Layout at both ends, on every route.
{
  const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  for (const route of ['/', '/services', '/about', '/quote', '/legal/conditions-generales-de-vente']) {
    await page.goto(BASE + route);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    record(`no horizontal scroll at 360px on ${route}`, overflow <= 0, `${overflow}px`);
  }
  await context.close();
}

// Motion, at the low intensity a technical trade carries.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  const revealed = await page.locator('.motion-on.is-visible').count();
  const duration = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--motion-duration').trim());
  record('the reveal runs at low intensity too', revealed > 0, `${revealed} revealed, duration ${duration}`);
  await context.close();
}

// Service worker and offline.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  const active = await page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).active));
  record('the service worker registers and activates', active);
  await page.waitForTimeout(1200);
  await context.setOffline(true);
  await page.goto(`${BASE}/jamais-visitee`).catch(() => null);
  const body = await page.textContent('body').catch(() => '');
  record('offline falls back to the offline page', body.includes('Vous êtes hors ligne'));
  await context.setOffline(false);
  await context.close();
}

// The quotation form, filled as a visitor would, and read in the back office.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/quote`);
  await page.getByLabel('Nom', { exact: true }).fill('Visiteur Navigateur');
  await page.getByLabel('Adresse e-mail').fill('visiteur@example.com');
  await page.getByLabel('Téléphone').fill('+33 5 00 00 00 00');
  await page.getByLabel('Code postal du chantier').fill('00000');
  await page.getByLabel('Nature des travaux').selectOption('Dépannage');
  await page.getByLabel('Description du chantier').fill('Le tableau disjoncte depuis hier soir.');
  await page.getByLabel(/J'accepte/).check();
  await page.getByRole('button', { name: /Envoyer la demande/ }).click();
  await page.waitForTimeout(1500);
  const status = await page.locator('.form__status').textContent();
  record('the visitor sees the success state',
    (status ?? '').includes('Demande envoyée'), (status ?? '').trim().slice(0, 60));

  await page.goto(`${BASE}/admin/messages`);
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  const inbox = await page.textContent('body');
  record('the request is in the inbox, unread',
    inbox.includes('Visiteur Navigateur') && inbox.includes('Non lu'));
  record('the unread count is in the navigation', /Messages\s*\d/.test(inbox.replace(/\s+/g, ' ')));
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
