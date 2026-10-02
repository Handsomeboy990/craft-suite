// Shared helpers of the dashboard gate: an HTTP client that signs in as a
// role and carries its cookie and CSRF token, read access to the gate's own
// database, and a real headless browser.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';

export class Client {
  constructor(base, address) {
    this.base = base;
    this.cookie = '';
    this.csrf = '';
    // Each client presents its own address, so the per address sign in limit
    // of one check does not spill into the next.
    this.address = address ?? `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  }

  async request(method, path, { body, headers = {}, raw = false } = {}) {
    const response = await fetch(`${this.base}${path}`, {
      method,
      redirect: 'manual',
      headers: {
        'x-forwarded-for': this.address,
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(this.csrf && method !== 'GET' ? { 'x-csrf-token': this.csrf } : {}),
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const match = /session=([^;]*)/.exec(setCookie);
      if (match) this.cookie = match[1] ? `session=${match[1]}` : '';
    }
    const text = await response.text();
    if (raw) return { status: response.status, text, headers: response.headers };
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return { status: response.status, json, text, headers: response.headers };
  }

  get(path, options) {
    return this.request('GET', path, options);
  }

  post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body: body ?? {} });
  }

  patch(path, body) {
    return this.request('PATCH', path, { body });
  }

  async login(identifier, password) {
    const answer = await this.post('/api/admin/login', { identifier, password });
    if (answer.status !== 200) throw new Error(`sign in as ${identifier} answered ${answer.status}`);
    const page = await this.get('/', { raw: true });
    const match = /<meta name="csrf-token" content="([0-9a-f]+)"/.exec(page.text);
    if (!match) throw new Error('no CSRF token on the overview page');
    this.csrf = match[1];
    return this;
  }
}

export function openDb(file) {
  return new DatabaseSync(file);
}

export const kebab = (key) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// A real Chromium. Playwright's own build when it is installed, otherwise the
// self-contained build of @sparticuz/chromium, which installs from the npm
// registry where the Playwright download host is unreachable.
let browserPromise = null;
export async function browser() {
  if (browserPromise) return browserPromise;
  browserPromise = (async () => {
    const require = createRequire(import.meta.url);
    const { chromium } = require('playwright-core');
    const explicit = process.env.CHROMIUM_PATH;
    if (explicit && existsSync(explicit)) return chromium.launch({ executablePath: explicit, headless: true });
    try {
      return await chromium.launch({ headless: true });
    } catch {
      const sparticuz = (await import('@sparticuz/chromium')).default;
      const executablePath = await sparticuz.executablePath();
      // Its default arguments are tuned for a serverless function: one process,
      // web security off. Neither belongs in a test of a real browser, and the
      // single process mode stalls on a second browser context. Only the
      // sandbox flag is kept, since the container has no user namespace.
      return chromium.launch({ executablePath, args: ['--no-sandbox'], headless: true });
    }
  })();
  return browserPromise;
}

export async function closeBrowser() {
  if (!browserPromise) return;
  const instance = await browserPromise;
  await instance.close();
  browserPromise = null;
}

// A browser context signed in as the given account.
export async function signedInPage(gate, role, options = {}) {
  const trace = (step) => process.env.GATE_TRACE && console.error(`[trace] ${role} ${step}`);
  trace('launch');
  const instance = await browser();
  trace('context');
  const context = await instance.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  trace('goto');
  await page.goto(`${gate.base}/login`);
  trace('hydrate');
  // The form is a client component: wait until it is hydrated before typing.
  await page.waitForFunction(() => document.querySelector('form')?.onsubmit !== undefined && Object.keys(document.querySelector('form') ?? {}).some((key) => key.startsWith('__react')), null, { timeout: 15000 });
  await page.fill('#identifier', gate.accounts[role]);
  await page.fill('#password', gate.password);
  try {
    await Promise.all([page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 }), page.click('button[type=submit]')]);
  } catch (error) {
    const alert = await page.locator('[role=alert]').textContent().catch(() => '');
    throw new Error(`sign in as ${role} did not leave the login page (${alert}; ${errors.join(' | ')}): ${error.message.split('\n')[0]}`);
  }
  return { context, page };
}

export function result(status, details) {
  return { status, details: Array.isArray(details) ? details : [details] };
}

export function expect(condition, message, failures) {
  if (!condition) failures.push(message);
  return condition;
}

// The matrix as the server holds it, read from lib/matrix.ts itself rather
// than copied here, so the gate cannot drift from the source it checks.
export function loadMatrixSource(appDir) {
  const source = readFileSync(join(appDir, 'lib/matrix.ts'), 'utf8');
  const block = (start, end) => {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from);
    return source.slice(from + start.length, to + end.indexOf('}') + 1);
  };
  const modules = block('export const MODULES = ', '} as const;');
  const matrix = block('export const DEFAULT_MATRIX: Matrix = ', '\n};');
  const evaluate = (text) => Function(`"use strict"; return (${text.replace(/ as const/g, '')});`)();
  return { MODULES: evaluate(modules), DEFAULT_MATRIX: evaluate(matrix) };
}
