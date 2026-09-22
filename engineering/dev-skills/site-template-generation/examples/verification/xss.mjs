// The policy, checked in the browser that has to enforce it: no injected
// script runs, the theme still works, and nothing legitimate is refused.
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const browser = await chromium.launch();
const page = await browser.newPage();
const violations = [];
page.on('console', (m) => {
  if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text().slice(0, 130));
});
await page.goto(BASE, { waitUntil: 'networkidle' });
console.log('window.__OWNED is', await page.evaluate(() => typeof window.__OWNED));
console.log('page width token:', await page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--page-width').trim()));
console.log('the theme toggle is interactive:', await page.locator('.theme-toggle').count());
console.log('policy violations:', violations.length ? violations : 'none');
await browser.close();
