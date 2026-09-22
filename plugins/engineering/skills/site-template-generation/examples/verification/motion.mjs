import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const browser = await chromium.launch();
const results = [];
const record = (n, ok, d) => { results.push({n, ok}); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); };

// Motion, seen rather than assumed.
{
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  await page.goto(BASE);

  const entrance = await page
    .locator('.hero__body.entrance.is-running')
    .waitFor({ state: 'attached', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  record('the hero entrance class is applied on load', entrance);

  const heroOpacity = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.hero__title')).opacity);
  await page.waitForTimeout(1500);
  const heroAfter = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.hero__title')).opacity);
  record('the hero title animates in and ends visible', heroAfter === '1', `start ${heroOpacity} -> ${heroAfter}`);

  // The staggered list: items must be hidden before they enter, and arrive in
  // sequence, which means different delays.
  const delays = await page.evaluate(() =>
    [...document.querySelectorAll('#offers .reveal-item')].map((n) => getComputedStyle(n).transitionDelay));
  record('each staggered item carries its own delay', new Set(delays).size === delays.length && delays.length > 1, delays.join(', '));

  const before = await page.evaluate(() =>
    [...document.querySelectorAll('#offers .reveal-item')].map((n) => getComputedStyle(n).opacity));
  await page.locator('#offers').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const after = await page.evaluate(() =>
    [...document.querySelectorAll('#offers .reveal-item')].map((n) => getComputedStyle(n).opacity));
  record('the items are hidden before they enter', before.every((o) => Number(o) < 1), before.join(','));
  record('and visible after they enter', after.every((o) => o === '1'), after.join(','));

  // Counters, which the energetic signature carries.
  await page.locator('#results').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const metric = await page.locator('#results .metric').first().textContent();
  record('the counter reached its value', metric?.trim() === '24', metric?.trim());

  // Parallax writes one custom property.
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const parallax = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--parallax'));
  record('parallax moves the hero image', parallax !== '' && parallax !== '0px', parallax || '(unset)');
  await page.context().close();
}

// The same page with reduced motion: no class, nothing hidden.
{
  const page = await (await browser.newContext({ reducedMotion: 'reduce' })).newPage();
  await page.goto(BASE);
  await page.waitForTimeout(500);
  const onCount = await page.locator('.motion-on').count();
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal-item')].filter((n) => getComputedStyle(n).opacity !== '1').length);
  record('reduced motion adds no motion class', onCount === 0, `${onCount} nodes`);
  record('and hides nothing', hidden === 0, `${hidden} hidden`);
  await page.context().close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} motion checks passed.`);
if (failed) process.exitCode = 1;
