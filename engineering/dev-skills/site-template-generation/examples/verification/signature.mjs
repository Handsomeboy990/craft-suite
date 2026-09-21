import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:3112';
const browser = await chromium.launch();
const results = [];
const record = (n, ok, d) => { results.push({ n, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); };

const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await page.goto(BASE);
await page.waitForTimeout(800);

// A technical signature carries reveal and lift, and nothing else. What must be
// absent matters as much as what must happen: that is what makes the signature
// a decision rather than a label.
record('no entrance on a technical trade', (await page.locator('.entrance.is-running').count()) === 0);
record('no stagger on a technical trade', (await page.locator('.motion-stagger').count()) === 0);
record('the reveal is still there', (await page.locator('.motion-on').count()) > 0,
  `${await page.locator('.motion-on').count()} sections`);

await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(400);
const parallax = await page.evaluate(() => document.documentElement.style.getPropertyValue('--parallax'));
record('no parallax on a technical trade', parallax === '', parallax || '(unset)');

await page.locator('.figure-tile').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
const metric = await page.locator('.figure-tile .metric').first().textContent();
record('the figure is printed, not counted up', metric?.trim() === '2004', metric?.trim());

const lift = await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--motion-lift').trim());
record('lift is on, scaled by the intensity', lift !== '0.00px' && lift !== '', lift);

// And the reveal still does its job on scroll.
const before = await page.evaluate(() => {
  const node = document.querySelector('.section:last-of-type .motion-on') ?? document.querySelector('.motion-on:not(.is-visible)');
  return node ? getComputedStyle(node).opacity : 'none';
});
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
const hidden = await page.locator('.motion-on:not(.is-visible)').count();
record('every section has been revealed after scrolling', hidden === 0, `${hidden} left, first was ${before}`);

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} signature checks passed.`);
if (failed) process.exitCode = 1;
