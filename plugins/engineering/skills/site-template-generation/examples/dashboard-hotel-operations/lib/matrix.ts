import { existsSync, readFileSync, statSync } from 'node:fs';
import { FILES } from './paths';

// The one source of who may do what. The navigation, the route guard, the row
// buttons and every endpoint read this matrix and nothing else. A grant that
// is not here is refused: a new module is reachable by nobody until a line
// below names it.

export const ROLE_KEYS = ['manager', 'frontDesk', 'housekeeping', 'storekeeper', 'bookkeeper'] as const;
export type Role = (typeof ROLE_KEYS)[number];

// Every module and the actions it declares. An action not declared here cannot
// be granted, even by the override file.
export const MODULES = {
  overview: { route: '/', actions: ['view'] },
  rooms: { route: '/rooms', actions: ['view', 'create', 'update', 'setOutOfOrder', 'markClean'] },
  stays: {
    route: '/stays',
    actions: ['view', 'create', 'update', 'export', 'confirm', 'checkIn', 'checkOut', 'checkOutOverride', 'cancel'],
  },
  guests: { route: '/guests', actions: ['view', 'create', 'update', 'export'] },
  folios: { route: '/folios', actions: ['view', 'create', 'update', 'export', 'recordPayment', 'void'] },
  tasks: { route: '/housekeeping', actions: ['view', 'create', 'update', 'start', 'finish'] },
  items: { route: '/stock', actions: ['view', 'create', 'update', 'export'] },
  movements: { route: '/stock/movements', actions: ['view', 'create', 'export'] },
  suppliers: { route: '/suppliers', actions: ['view', 'create', 'update'] },
  ledger: { route: '/ledger', actions: ['view', 'create', 'export', 'reverse'] },
  reports: { route: '/reports', actions: ['view', 'export'] },
  staff: { route: '/staff', actions: ['view', 'create', 'update', 'deactivate', 'reactivate', 'changeRole'] },
  audit: { route: '/audit', actions: ['view', 'export'] },
  settings: { route: '/settings', actions: ['view', 'update'] },
} as const;

export type ModuleKey = keyof typeof MODULES;
export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[];
export type Grants = Partial<Record<ModuleKey, string[]>>;
export type Matrix = Record<Role, Grants>;

// The matrix of the specification. Two additions are named actions the
// specification implies: `confirm` turns a provisional stay into a confirmed
// one (the only way to reach a state check in accepts), and `checkOutOverride`
// is "the manager overrides" an unsettled folio, held as a grant so that it is
// data rather than a role name tested in code. `reactivate` undoes a
// deactivation, since an account is never deleted.
export const DEFAULT_MATRIX: Matrix = {
  manager: {
    overview: ['view'],
    rooms: ['view', 'create', 'update'],
    stays: ['view', 'create', 'update', 'export', 'confirm', 'checkIn', 'checkOut', 'checkOutOverride', 'cancel'],
    guests: ['view', 'create', 'update', 'export'],
    folios: ['view', 'create', 'update', 'export', 'recordPayment', 'void'],
    tasks: ['view', 'create', 'update'],
    items: ['view', 'create', 'update', 'export'],
    movements: ['view', 'export'],
    suppliers: ['view', 'create', 'update'],
    ledger: ['view', 'export'],
    reports: ['view', 'export'],
    staff: ['view', 'create', 'update', 'deactivate', 'reactivate', 'changeRole'],
    audit: ['view', 'export'],
    settings: ['view', 'update'],
  },
  frontDesk: {
    overview: ['view'],
    rooms: ['view', 'setOutOfOrder'],
    stays: ['view', 'create', 'update', 'confirm', 'checkIn', 'checkOut', 'cancel'],
    guests: ['view', 'create', 'update'],
    folios: ['view', 'create', 'recordPayment'],
    tasks: ['view'],
  },
  housekeeping: {
    overview: ['view'],
    rooms: ['view', 'markClean'],
    tasks: ['view', 'start', 'finish'],
  },
  storekeeper: {
    overview: ['view'],
    items: ['view', 'create', 'update', 'export'],
    movements: ['view', 'create', 'export'],
    suppliers: ['view', 'create', 'update'],
  },
  bookkeeper: {
    overview: ['view'],
    stays: ['view'],
    guests: ['view'],
    folios: ['view', 'export', 'recordPayment', 'void'],
    items: ['view'],
    movements: ['view', 'export'],
    suppliers: ['view'],
    ledger: ['view', 'create', 'export', 'reverse'],
    reports: ['view', 'export'],
  },
};

let cached: { mtime: number; matrix: Matrix } | null = null;

function validate(candidate: unknown): Matrix {
  if (!candidate || typeof candidate !== 'object') throw new Error('matrix: not an object');
  const result = {} as Matrix;
  for (const role of ROLE_KEYS) {
    const grants = (candidate as Record<string, unknown>)[role];
    const clean: Grants = {};
    if (grants && typeof grants === 'object') {
      for (const [module, actions] of Object.entries(grants as Record<string, unknown>)) {
        if (!(module in MODULES)) throw new Error(`matrix: unknown module ${module}`);
        if (!Array.isArray(actions)) throw new Error(`matrix: ${role}.${module} is not a list`);
        const declared = MODULES[module as ModuleKey].actions as readonly string[];
        for (const action of actions) {
          if (!declared.includes(action)) throw new Error(`matrix: unknown action ${module}.${action}`);
        }
        clean[module as ModuleKey] = [...actions];
      }
    }
    result[role] = clean;
  }
  return result;
}

// The override file is read when its modification time changes. A file that
// does not validate is refused whole and the instance falls back to denying
// everything but the overview, rather than to a guess.
export function matrix(): Matrix {
  if (!existsSync(FILES.matrix)) {
    cached = null;
    return DEFAULT_MATRIX;
  }
  const mtime = statSync(FILES.matrix).mtimeMs;
  if (cached && cached.mtime === mtime) return cached.matrix;
  try {
    cached = { mtime, matrix: validate(JSON.parse(readFileSync(FILES.matrix, 'utf8'))) };
  } catch (error) {
    console.error('matrix override refused', error);
    const denied = Object.fromEntries(ROLE_KEYS.map((role) => [role, { overview: ['view'] }])) as Matrix;
    cached = { mtime, matrix: denied };
  }
  return cached.matrix;
}

export function grantsFor(role: Role): Grants {
  return matrix()[role] ?? {};
}

export function can(role: Role, module: ModuleKey, action: string): boolean {
  return (grantsFor(role)[module] ?? []).includes(action);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLE_KEYS as readonly string[]).includes(value);
}
