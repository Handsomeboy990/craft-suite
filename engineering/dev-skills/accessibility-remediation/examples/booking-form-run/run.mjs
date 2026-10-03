// Proves the checks, then measures each remediation through the verify loop.
//
//   npm install
//   node run.mjs                 prove the checks, then measure every variant
//   node run.mjs prove           prove the checks only
//
// CHROMIUM_PATH points at a Chromium binary when the one Playwright downloads
// is not available. The run is Chromium only; that is a stated limit.
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { FINDINGS, BARRIER, UNIVERSAL, PRESERVATION } from './checks.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');
const AXE_VERSION = require('axe-core/package.json').version;
const json = (p) => JSON.parse(readFileSync(path.join(here, p), 'utf8'));
const ANSWERS = json('records/answers.json');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.env.CHROMIUM_PATH ? ['--no-sandbox'] : [],
});

const url = (variant) => pathToFileURL(path.join(here, 'surface', `${variant}.html`)).href;

// A fresh context and page per check: the re-mount of the verify loop.
async function fresh(variant) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  await page.goto(url(variant));
  return { page, close: () => context.close() };
}

async function barrier(variant, id, answers) {
  const { page, close } = await fresh(variant);
  try { return await BARRIER[id](page, answers); } finally { await close(); }
}

// Universal failures attributed to the finding whose scope holds the element.
async function universal(variant) {
  const byFinding = {};
  const surface = [];
  for (const [name, check] of Object.entries(UNIVERSAL)) {
    const { page, close } = await fresh(variant);
    try {
      const failing = await check(page);
      for (const where of failing) {
        const owners = await page.evaluate(({ where, findings }) => {
          let el = null;
          try { el = document.querySelector(where); } catch { el = null; }
          if (!el) return [];
          return findings.filter((f) => f.scope.some((s) => el.matches(s) || el.closest(s))).map((f) => f.id);
        }, { where, findings: FINDINGS });
        if (owners.length === 0) surface.push(`${name}: ${where}`);
        for (const id of owners) (byFinding[id] ??= []).push(`${name}: ${where}`);
      }
    } finally { await close(); }
  }
  return { byFinding, surface };
}

async function preservation(variant) {
  const byFinding = {};
  const results = [];
  for (const p of PRESERVATION) {
    const { page, close } = await fresh(variant);
    let ok = false;
    try { ok = await p.run(page); } catch { ok = false; } finally { await close(); }
    results.push({ name: p.name, ok });
    if (!ok) for (const id of p.findings) (byFinding[id] ??= []).push(`preservation: ${p.name}`);
  }
  return { byFinding, results };
}

// The scanner, last. A finding is scanner-clean when no violation lands on an
// element inside its scope. Violations outside every scope are listed apart.
async function scan(variant) {
  const { page, close } = await fresh(variant);
  try {
    await page.addScriptTag({ path: AXE });
    const result = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    }));
    const flagged = new Set();
    const elsewhere = [];
    for (const v of result.violations) {
      for (const node of v.nodes) {
        const owners = await page.evaluate(({ target, findings }) => {
          const el = document.querySelector(target);
          if (!el) return [];
          return findings.filter((f) => f.scope.some((s) => el.matches(s) || el.closest(s))).map((f) => f.id);
        }, { target: node.target[0], findings: FINDINGS });
        if (owners.length === 0) elsewhere.push(`${v.id} ${node.target[0]}`);
        owners.forEach((id) => flagged.add(`${id}:${v.id}`));
      }
    }
    return { flagged, elsewhere, total: result.violations.reduce((n, v) => n + v.nodes.length, 0) };
  } finally { await close(); }
}

const flaggedIds = (flagged) => new Set([...flagged].map((k) => k.split(':')[0]));
const pct = (n, d) => `${n}/${d} (${Math.round((100 * n) / d)} percent)`;

// --------------------------------------------------------------------------
// Proof that the checks can fail, and can pass, before they grade anything.
// --------------------------------------------------------------------------
async function prove() {
  console.log('PROOF OF THE CHECKS');
  let proven = true;
  const expect = (cond, label) => {
    console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!cond) proven = false;
  };

  console.log(' floor: before.html, no change made');
  for (const f of FINDINGS) {
    const r = await barrier('before', f.id, ANSWERS.round1);
    expect(!r.ok, `${f.id} barrier check fails on the floor :: ${r.detail}`);
  }
  const floorKeep = await preservation('before');
  for (const r of floorKeep.results) expect(r.ok, `preservation passes on the floor: ${r.name}`);

  console.log(' ceiling: reference.html, written with the checks, round 2 answers');
  for (const f of FINDINGS) {
    const r = await barrier('reference', f.id, ANSWERS.round2);
    expect(r.ok, `${f.id} barrier check passes on the reference :: ${r.detail}`);
  }
  const refU = await universal('reference');
  expect(Object.keys(refU.byFinding).length === 0 && refU.surface.length === 0,
    `universal layer passes on the reference ${JSON.stringify(refU)}`);
  const refP = await preservation('reference');
  for (const r of refP.results) expect(r.ok, `preservation passes on the reference: ${r.name}`);

  console.log(' gaming: gaming.html, one known gaming fix per finding, round 1 answers');
  const gamingKnownToPass = ['A11Y-09'];
  for (const f of FINDINGS) {
    const r = await barrier('gaming', f.id, ANSWERS.round1);
    if (gamingKnownToPass.includes(f.id)) {
      console.log(`  note  ${f.id} passes on its gaming fix (a forked colour); the check cannot see it :: ${r.detail}`);
    } else {
      expect(!r.ok, `${f.id} barrier check fails on its gaming fix :: ${r.detail}`);
    }
  }
  const gScan = await scan('gaming');
  console.log(`  note  scanner on the gaming variant: ${gScan.total} violations, flagged findings ${[...flaggedIds(gScan.flagged)].join(', ') || 'none'}`);

  console.log(proven ? 'CHECKS PROVEN' : 'CHECKS NOT PROVEN');
  return proven;
}

// --------------------------------------------------------------------------
// One remediation through the loop: barrier, universal, preservation, scanner.
// --------------------------------------------------------------------------
async function measure(variant) {
  const record = json(`records/${variant}.json`);
  const answers = ANSWERS[`round${record.round}`];
  const uni = await universal(variant);
  const keep = await preservation(variant);
  const sc = await scan(variant);
  const flagged = flaggedIds(sc.flagged);

  console.log(`\nVARIANT ${variant} (round ${record.round}): ${record.summary}`);
  const tally = { fixed: 0, 'scanner gamed': 0, regression: 0, 'not fixed': 0, escalated: 0 };
  let clean = 0;
  for (const f of FINDINGS) {
    const isClean = !flagged.has(f.id);
    if (isClean) clean += 1;
    let outcome;
    let detail;
    if (record.escalated.includes(f.id)) {
      outcome = 'escalated';
      detail = record.questions[f.id];
    } else {
      const b = await barrier(variant, f.id, answers);
      const broken = [...(uni.byFinding[f.id] ?? []), ...(keep.byFinding[f.id] ?? [])];
      const changed = record.changed.includes(f.id);
      if (b.ok && broken.length === 0) outcome = 'fixed';
      else if (b.ok) outcome = 'regression';
      else if (isClean && changed) outcome = 'scanner gamed';
      else outcome = 'not fixed';
      detail = b.detail + (broken.length ? ` | broken: ${broken.join('; ')}` : '');
    }
    tally[outcome] += 1;
    console.log(`  ${f.id}  ${(isClean ? 'scan clean' : 'scan flags').padEnd(10)}  ${outcome.padEnd(13)}  ${detail}`);
  }
  if (uni.surface.length) console.log(`  surface-level universal failures: ${uni.surface.join('; ')}`);
  if (sc.elsewhere.length) console.log(`  violations outside every finding: ${sc.elsewhere.join('; ')}`);
  const n = FINDINGS.length;
  console.log(`  scanner-clean ${pct(clean, n)}   fixed ${pct(tally.fixed, n)}   ` +
    `gamed ${tally['scanner gamed']}, regression ${tally.regression}, not fixed ${tally['not fixed']}, escalated ${tally.escalated}`);
  return { variant, clean, ...tally };
}

const hash = createHash('sha256').update(readFileSync(path.join(here, 'checks.mjs'))).digest('hex');
console.log(`checks.mjs sha256 ${hash}`);
console.log(`engine ${browser.version()} (Chromium only), axe-core ${AXE_VERSION}, no screen reader\n`);

const proven = await prove();
if (process.argv[2] !== 'prove') {
  if (!proven) {
    console.log('\nThe checks are not proven; nothing is measured.');
  } else {
    const rows = [];
    for (const v of ['before', 'scanner-driven', 'rules-round1', 'rules-round2']) rows.push(await measure(v));
    console.log('\nSUMMARY');
    for (const r of rows) {
      console.log(`  ${r.variant.padEnd(15)} scanner-clean ${pct(r.clean, FINDINGS.length).padEnd(18)} fixed ${pct(r.fixed, FINDINGS.length)}`);
    }
  }
}
await browser.close();
