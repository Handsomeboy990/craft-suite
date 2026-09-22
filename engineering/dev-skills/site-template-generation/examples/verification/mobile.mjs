// Point 8 of the gate, at the width most visitors actually use.
//
//   BASE_URL=http://localhost:3111 KIND=un-nom-pour-les-captures node mobile.mjs
//
// Writes a screenshot per route into shots/ so the result can be looked at, not
// only counted.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { routesOf, MISSING_ROUTE } from './routes.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
// KIND only names the screenshot directory; the pages come from the instance.
const KIND = process.env.KIND ?? 'instance';
const ROUTES = await routesOf(BASE, { extra: ['/offline', MISSING_ROUTE] });

const results = [];
const record = (name, ok, detail) => {
  results.push({ ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

mkdirSync(`shots/${KIND}`, { recursive: true });
const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 360, height: 780 },
    colorScheme: theme,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' }).catch(() => null);
    const name = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
    await page.screenshot({ path: `shots/${KIND}/${theme}-${name}.png`, fullPage: false });

    const report = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - width;
      const small = [...document.querySelectorAll('a, button, input, select, textarea')]
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          if (rect.height >= 44) return false;
          // A checkbox is small on purpose; what the finger aims at is its
          // label, and the rule is met when that is big enough.
          if (node.type === 'checkbox') {
            const label = node.id ? document.querySelector(`label[for="${node.id}"]`) : node.closest('label');
            const row = node.closest('p, div, li') ?? label;
            if (row && row.getBoundingClientRect().height >= 44) return false;
          }
          return true;
        })
        .map((node) => {
          const name = (node.className || '').toString().slice(0, 24);
          return `${node.tagName.toLowerCase()}${name ? '.' + name : `[${(node.textContent ?? '').trim().slice(0, 18)}]`}`;
        });
      const clipped = [...document.querySelectorAll('h1, h2, h3, p, li, dd, dt')]
        // A visually hidden heading is clipped by design: that is what the
        // class does, and it is how a section keeps its accessible name.
        .filter((node) => !node.classList.contains('visually-hidden'))
        .filter((node) => node.scrollWidth > node.clientWidth + 1)
        .map((node) => node.tagName.toLowerCase());
      return { overflow, small: [...new Set(small)], clipped: [...new Set(clipped)] };
    });

    record(`${theme} ${route}: no sideways scroll`, report.overflow <= 0, `${report.overflow}px`);
    record(`${theme} ${route}: every target at least 44px`, report.small.length === 0, report.small.join(', '));
    record(`${theme} ${route}: no clipped text`, report.clipped.length === 0, report.clipped.join(', '));
  }
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} mobile checks passed. Screenshots in shots/${KIND}/.`);
if (failed) process.exitCode = 1;
