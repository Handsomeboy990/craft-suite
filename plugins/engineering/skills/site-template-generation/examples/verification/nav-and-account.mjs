import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'mot-de-passe-de-verification-1234';
const browser = await chromium.launch();
const results = [];
const record = (n, ok, d) => { results.push({ n, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); };

// The navigation at 360px: a menu, operable by keyboard.
{
  const context = await browser.newContext({ viewport: { width: 360, height: 780 } });
  const page = await context.newPage();
  await page.goto(BASE);

  const toggle = page.locator('.nav-toggle');
  record('the menu button exists at 360px', await toggle.isVisible());
  record('it says what it controls', (await toggle.getAttribute('aria-controls')) === 'site-nav');
  record('and whether it is open', (await toggle.getAttribute('aria-expanded')) === 'false');
  record('the panel is closed to start with', !(await page.locator('#site-nav').isVisible()));

  await toggle.click();
  record('clicking opens it', await page.locator('#site-nav').isVisible());
  record('and the button says so', (await toggle.getAttribute('aria-expanded')) === 'true');

  const target = await page.evaluate(() => {
    const links = [...document.querySelectorAll('#site-nav a')];
    return links.length > 0 ? links[0].getBoundingClientRect().height : 0;
  });
  record('its links are at least 44px tall', target >= 44, `${Math.round(target)}px`);

  await page.keyboard.press('Escape');
  record('Escape closes it', !(await page.locator('#site-nav').isVisible()));
  const focused = await page.evaluate(() => document.activeElement?.className ?? '');
  record('and focus returns to the button', focused.includes('nav-toggle'), focused);

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('the header causes no sideways scroll', overflow <= 0, `${overflow}px`);
  await context.close();
}

// Above the breakpoint the menu button is gone and the list is a row.
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(BASE);
  record('the menu button is absent on a wide screen', !(await page.locator('.nav-toggle').isVisible()));
  record('the navigation is visible without opening anything', await page.locator('#site-nav').isVisible());
  await context.close();
}

// The favicon comes from the content file.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE);
  const href = await page.getAttribute('link[rel="icon"]', 'href');
  record('the tab icon points at the uploaded media', (href ?? '').startsWith('/media/'), href ?? '(none)');
  const response = await page.request.get(`${BASE}${href}`);
  record('and that file is served', response.status() === 200, `${response.status()} ${response.headers()['content-type']}`);
  await context.close();
}

// Changing the password from the back office.
{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/admin/security`);
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

  await page.fill('#current', 'le-mauvais-mot-de-passe');
  await page.fill('#next', 'un-nouveau-mot-de-passe-solide');
  await page.fill('#confirm', 'un-nouveau-mot-de-passe-solide');
  await page.getByRole('button', { name: /Changer le mot de passe/ }).click();
  await page.waitForTimeout(1500);
  record('a wrong current password is refused',
    ((await page.locator('.form__status').textContent()) ?? '').includes('incorrect'));

  await page.fill('#current', PASSWORD);
  await page.fill('#next', 'court');
  await page.fill('#confirm', 'court');
  await page.getByRole('button', { name: /Changer le mot de passe/ }).click();
  await page.waitForTimeout(1200);
  const short = await page.evaluate(() => document.querySelector('#next').validationMessage);
  record('a short password is refused before it is sent', short !== '', short);

  await page.fill('#current', PASSWORD);
  await page.fill('#next', 'un-nouveau-mot-de-passe-solide');
  await page.fill('#confirm', 'un-nouveau-mot-de-passe-solide');
  await page.getByRole('button', { name: /Changer le mot de passe/ }).click();
  await page.waitForTimeout(1500);
  record('the change is accepted',
    ((await page.locator('.form__status').textContent()) ?? '').includes('Toutes les sessions'));

  await page.waitForTimeout(2500);
  record('and the session is over', page.url().includes('/admin/login'), page.url().replace(BASE, ''));

  await page.fill('#password', 'un-nouveau-mot-de-passe-solide');
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  record('the new password works', !page.url().includes('login'), page.url().replace(BASE, ''));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
if (failed) process.exitCode = 1;
