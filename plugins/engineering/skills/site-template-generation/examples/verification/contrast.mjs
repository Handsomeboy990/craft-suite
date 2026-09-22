// Contrast, measured on the rendered page, in both themes.
//
//   BASE_URL=http://localhost:3111 node contrast.mjs
//
// This exists because a palette shipped in which the light theme painted white
// text on a near white button: reading the JSON never showed it, and no other
// check measured it. Every pair below is one the stylesheet actually uses.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3111';
const PATHS = (process.env.PATHS ?? '/').split(',');

const browser = await chromium.launch();
const results = [];
const record = (n, ok, d) => { results.push({ n, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); };

const measure = async (page) => page.evaluate(() => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (value) => (value.match(/\d+(\.\d+)?/g) ?? [0, 0, 0]).slice(0, 3).map(Number);
  // A token may be written as a hex value or already resolved to rgb(). A value
  // that parses to nothing returns null, and null is reported rather than
  // quietly compared: NaN is smaller than no threshold, so an unreadable token
  // used to make this script pass by measuring nothing.
  const colour = (value) => {
    const v = (value ?? '').trim();
    if (v === '') return null;
    if (v.startsWith('#')) {
      const digits = v.slice(1);
      const full = digits.length === 3 ? digits.split('').map((c) => c + c).join('') : digits;
      if (!/^[0-9a-f]{6}$/i.test(full)) return null;
      return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    }
    const numbers = v.match(/\d+(\.\d+)?/g);
    return numbers && numbers.length >= 3 ? numbers.slice(0, 3).map(Number) : null;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
  };
  const root = getComputedStyle(document.documentElement);
  // The skill does not name the custom properties, so two templates spell the
  // same token differently. Ask for the meaning and try the spellings.
  const prefixes = (window.__tokenPrefixes ?? ['--color-', '--c-', '--']).slice();
  const token = (name) => {
    for (const prefix of prefixes) {
      const parsed = colour(root.getPropertyValue(prefix + name));
      if (parsed) return { value: parsed, as: prefix + name };
    }
    return { value: null, as: prefixes.map((prefix) => prefix + name).join(' or ') };
  };

  // The pairs the stylesheet puts together. Text needs 4.5:1; a border or a
  // focus ring is a user interface component and needs 3:1.
  const pairs = [
    ['body text on the page', 'foreground', 'surface', 4.5],
    ['body text on the alternate band', 'foreground', 'surface-alt', 4.5],
    ['secondary text on the page', 'muted', 'surface', 4.5],
    ['secondary text on the alternate band', 'muted', 'surface-alt', 4.5],
    ['the label of the primary button', 'accent-foreground', 'accent', 4.5],
    ['the label of the primary button, hovered', 'accent-foreground', 'accent-hover', 4.5],
    ['a link on the page', 'accent', 'surface', 4.5],
    ['a link on the alternate band', 'accent', 'surface-alt', 4.5],
    ['a success message', 'success', 'surface', 4.5],
    ['a success message on the alternate band', 'success', 'surface-alt', 4.5],
    ['an error message', 'danger', 'surface', 4.5],
    ['an error message on the alternate band', 'danger', 'surface-alt', 4.5],
    ['a strong border against the page', 'border-strong', 'surface', 3],
    ['a strong border against the alternate band', 'border-strong', 'surface-alt', 3],
    ['the focus ring against the page', 'focus-ring', 'surface', 3],
    ['the focus ring against the alternate band', 'focus-ring', 'surface-alt', 3],
  ];

  return pairs.map(([what, fg, bg, need]) => {
    const front = token(fg);
    const back = token(bg);
    // A template that has no separate focus colour focuses with its accent,
    // which is a choice, not an omission.
    const resolvedFront = front.value ?? (fg === 'focus-ring' ? token('accent').value : null);
    if (!resolvedFront || !back.value) {
      return { what, value: null, need, missing: !resolvedFront ? front.as : back.as };
    }
    return { what, value: ratio(resolvedFront, back.value), need };
  });
});

for (const path of PATHS) {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme: theme });
    const page = await context.newPage();
    await page.goto(`${BASE}${path}`);
    await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
    const measured = await measure(page);
    const unreadable = measured.filter((m) => m.value === null);
    const weak = measured.filter((m) => m.value !== null && m.value < m.need);
    for (const m of unreadable) {
      record(`${theme}: ${m.what}`, false, `token not found: ${m.missing}`);
    }
    for (const m of weak) record(`${theme}: ${m.what}`, false, `${m.value}:1, needs ${m.need}:1`);
    const read = measured.filter((m) => m.value !== null).map((m) => m.value);
    record(
      `${theme} theme on ${path}: ${read.length} of ${measured.length} pairs measured`,
      weak.length === 0 && unreadable.length === 0,
      read.length > 0 ? `lowest ${Math.min(...read)}:1` : 'nothing could be read',
    );
    await context.close();
  }
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) process.exit(1);
