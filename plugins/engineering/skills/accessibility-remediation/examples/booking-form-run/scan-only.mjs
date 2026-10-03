// The scanner report alone, as a team without the skill would receive it.
//
//   node scan-only.mjs before
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const variant = process.argv[2] ?? 'before';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.env.CHROMIUM_PATH ? ['--no-sandbox'] : [],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(here, 'surface', `${variant}.html`)).href);
await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
const result = await page.evaluate(async () => window.axe.run(document, {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
}));
for (const v of result.violations) {
  for (const node of v.nodes) console.log(`${v.impact.padEnd(9)} ${v.id.padEnd(16)} ${node.target.join(' ')}`);
}
console.log(`${result.violations.reduce((n, v) => n + v.nodes.length, 0)} violations`);
await browser.close();
