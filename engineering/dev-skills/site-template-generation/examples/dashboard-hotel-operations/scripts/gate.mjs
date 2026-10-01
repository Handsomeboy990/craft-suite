// The dashboard gate of resources/dashboard-contract.md, D1 to D26, run
// against a fresh, seeded instance of this application.
//
//   npm run build
//   npm run gate                 every line
//   npm run gate -- D5 D11 D24   only those lines
//
// The runner builds its own instance so that nothing it writes touches
// data/: a scratch data directory under .gate/, seeded from the fixed seed
// and anchored on today, a random session secret, a random password for the
// seeded accounts, and `next start` on a free port. Every line prints PASS or
// FAIL with what was observed. A line that cannot be proved in this
// environment says so and counts as NOT VERIFIED; it is never reported as a
// pass. The browser lines use a real headless Chromium (see scripts/gate/lib).
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeBrowser, openDb } from './gate/lib.mjs';
import { CHECKS as API_CHECKS } from './gate/checks-server.mjs';
import { CHECKS as BROWSER_CHECKS } from './gate/checks-browser.mjs';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 3390;
const wanted = args.filter((arg) => /^D\d+$/i.test(arg)).map((arg) => arg.toUpperCase());

if (!existsSync(join(appDir, '.next', 'BUILD_ID'))) {
  console.error('No production build found. Run `npm run build` first.');
  process.exit(2);
}

const gateDir = join(appDir, '.gate');
const dataDir = join(gateDir, 'data');
rmSync(gateDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });
copyFileSync(join(appDir, 'data', 'content.json'), join(dataDir, 'content.json'));

const password = `gate-${randomBytes(12).toString('hex')}`;
const secret = randomBytes(32).toString('hex');
const seeded = spawnSync(process.execPath, ['--no-warnings', join(appDir, 'scripts', 'seed.mjs')], {
  cwd: appDir,
  env: { ...process.env, DATA_DIR: dataDir, SEED_PASSWORD: password },
  encoding: 'utf8',
});
if (seeded.status !== 0) {
  console.error(seeded.stderr || seeded.stdout);
  process.exit(2);
}
console.log(seeded.stdout.split('\n').slice(0, 11).join('\n'));

const db = openDb(join(dataDir, 'hotel.db'));
const accounts = {};
for (const row of db.prepare('SELECT email, role FROM accounts WHERE active = 1').all()) accounts[row.role] = row.email;

const env = {
  ...process.env,
  DATA_DIR: dataDir,
  SESSION_SECRET: secret,
  QUERY_PLAN_LOG: '1',
  NODE_ENV: 'production',
  NODE_OPTIONS: '--no-warnings',
};
const next = join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');

export function startServer(directory, serverPort) {
  const child = spawn(process.execPath, [next, 'start', '-p', String(serverPort)], {
    cwd: appDir,
    env: { ...env, DATA_DIR: directory },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (chunk) => (log += chunk));
  child.stderr.on('data', (chunk) => (log += chunk));
  child.on('exit', (code, signal) => {
    if (!child.expectedExit) console.error(`server on ${serverPort} exited (${code ?? signal}):\n${log.slice(-3000)}`);
  });
  const ready = (async () => {
    for (let attempt = 0; attempt < 120; attempt++) {
      try {
        const response = await fetch(`http://localhost:${serverPort}/login`);
        if (response.status === 200) return;
      } catch {
        // Not listening yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`server on ${serverPort} did not start:\n${log}`);
  })();
  return { child, ready, log: () => log };
}

const server = startServer(dataDir, port);
await server.ready;

const gate = {
  appDir,
  gateDir,
  dataDir,
  base: `http://localhost:${port}`,
  port,
  password,
  accounts,
  db,
  startServer,
  // Values that must never reach the audit log, collected as checks see them.
  secrets: new Set([password]),
};

const ORDER = ['D1', 'D2', 'D3', 'D11', 'D12', 'D14', 'D21', 'D13', 'D25', 'D16', 'D15', 'D19', 'D20', 'D22', 'D23', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D24', 'D17', 'D18', 'D10', 'D26'];
const checks = new Map([...API_CHECKS, ...BROWSER_CHECKS].map((check) => [check.id, check]));
const selected = ORDER.filter((id) => wanted.length === 0 || wanted.includes(id));
const results = [];

for (const id of selected) {
  const check = checks.get(id);
  const started = Date.now();
  let outcome;
  try {
    // A line that hangs is a failure with a reason, not a stuck run.
    outcome = await Promise.race([
      check.run(gate),
      new Promise((_, reject) => setTimeout(() => reject(new Error('no answer within 300 seconds')), 300_000)),
    ]);
  } catch (error) {
    outcome = { status: 'fail', details: [`threw: ${error instanceof Error ? error.stack ?? error.message : String(error)}`] };
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  results.push({ id, title: check.title, ...outcome, seconds });
  const label = outcome.status === 'pass' ? 'PASS' : outcome.status === 'fail' ? 'FAIL' : 'NOT VERIFIED';
  console.log(`\n${id.padEnd(4)} ${label}  ${check.title} (${seconds}s)`);
  for (const line of outcome.details) console.log(`       ${line}`);
}

await closeBrowser();
server.child.expectedExit = true;
server.child.kill('SIGTERM');
db.close();

results.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
writeFileSync(join(gateDir, 'report.json'), `${JSON.stringify(results, null, 2)}\n`);
const count = (status) => results.filter((item) => item.status === status).length;
console.log('\nSummary');
for (const item of results) {
  console.log(`  ${item.id.padEnd(4)} ${item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'NOT VERIFIED'}`);
}
console.log(`\n${count('pass')} passed, ${count('fail')} failed, ${count('manual')} not verified, of ${results.length}. Report: .gate/report.json`);
process.exit(count('fail') > 0 ? 1 : 0);
