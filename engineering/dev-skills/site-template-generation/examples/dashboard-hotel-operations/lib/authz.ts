import { forbidden, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { audit } from './audit';
import { MAX_BODY_BYTES, csrfMatches, currentSession, type Account } from './auth';
import { getConfig } from './config';
import { constraintOf } from './db';
import { MODULES, can, type ModuleKey, type Role } from './matrix';
import { callerAddress, consume } from './rate-limit';
import { enforceRetention } from './retention';
import { today } from './time';
import type { Config } from './types';

// Every endpoint and every page goes through here, in the same order: the
// session, then the grant for the module and the action, then (in the module's
// own query) the record's scope. Nothing is read before the first two pass.

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly field?: string,
  ) {
    super(code);
  }
}

export type Ctx = {
  account: Account;
  role: Role;
  csrf: string;
  address: string;
  config: Config;
  today: string;
};

export async function authorizeApi(request: Request, module: ModuleKey, action: string): Promise<Ctx> {
  const address = callerAddress(request.headers);
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, 'tooLarge');

  const { session } = await currentSession();
  if (!session) throw new HttpError(401, 'session');
  const { account } = session;

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    if (!csrfMatches(request.headers.get('x-csrf-token'), session.csrf)) {
      audit({ accountId: account.id, role: account.role, action: `${module}.${action}`, module, outcome: 'refused', status: 403, address });
      throw new HttpError(403, 'csrf');
    }
  }

  if (!can(account.role, module, action)) {
    audit({ accountId: account.id, role: account.role, action: `${module}.${action}`, module, outcome: 'refused', status: 403, address });
    throw new HttpError(403, 'forbidden');
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const limit = consume(action === 'export' ? 'export' : 'write', `account:${account.id}`);
    if (!limit.allowed) throw new HttpError(429, 'tooMany');
  } else if (action === 'export') {
    const limit = consume('export', `account:${account.id}`);
    if (!limit.allowed) throw new HttpError(429, 'tooMany');
  }

  const config = getConfig();
  return { account, role: account.role, csrf: session.csrf, address, config, today: today(config.site.timeZone) };
}

// The answer of a refused call names neither the record nor whether it
// exists. A 409 names the rule, a 422 names the field.
export function failure(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { ok: false, error: error.code, ...(error.field ? { field: error.field } : {}) },
      { status: error.status },
    );
  }
  const constraint = constraintOf(error);
  if (constraint) return Response.json({ ok: false, error: constraint }, { status: 409 });
  console.error(error);
  return Response.json({ ok: false, error: 'server' }, { status: 500 });
}

export function moduleForPath(path: string): ModuleKey | null {
  const pathname = path.split('?')[0]!;
  let best: ModuleKey | null = null;
  let length = -1;
  for (const [key, definition] of Object.entries(MODULES) as [ModuleKey, { route: string }][]) {
    const route = definition.route;
    const matches = route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`);
    if (matches && route.length > length) {
      best = key;
      length = route.length;
    }
  }
  return best;
}

// A page checks the same two things on the server. A missing session goes to
// the sign in with the full URL to come back to; a missing grant renders the
// denied page with HTTP 403, never a redirect that hides the refusal.
export async function requirePage(module: ModuleKey, action = 'view'): Promise<Ctx> {
  const list = await headers();
  const url = list.get('x-url') ?? '/';
  const address = callerAddress(list);
  const { session, sent } = await currentSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(url)}${sent ? '&expired=1' : ''}`);
  if (!can(session.account.role, module, action)) {
    audit({
      accountId: session.account.id,
      role: session.account.role,
      action: `${module}.${action}`,
      module,
      outcome: 'refused',
      status: 403,
      address,
    });
    forbidden();
  }
  const config = getConfig();
  try {
    enforceRetention(config);
  } catch (error) {
    console.error('retention failed', error instanceof Error ? error.message : error);
  }
  return {
    account: session.account,
    role: session.account.role,
    csrf: session.csrf,
    address,
    config,
    today: today(config.site.timeZone),
  };
}
