import { existsSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { MODULE_KEYS, ROLE_KEYS } from './matrix';
import { FILES, ensureDataDir } from './paths';
import { PALETTE_KEYS, type Config } from './types';

// The configuration is read from the data directory at request time, never
// imported into the bundle, because the settings module writes it while the
// dashboard runs. It is parsed once and re-read when its modification time
// changes. A missing required field stops the load with the field named.

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

export function at(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, source);
}

const KPI_KEYS = [
  'occupancyTonight',
  'arrivalsPending',
  'departuresPending',
  'roomsToClean',
  'revenueMonth',
  'overdueFolios',
  'itemsBelowThreshold',
  'averageRate',
];

function requiredPaths(): string[] {
  const paths = [
    'site.name',
    'site.shortName',
    'site.locale',
    'site.timeZone',
    'site.currency',
    'theme.type.textFamily',
    'theme.motion.intensity',
    'nav.label',
    'privacy.title',
    'privacy.retention.guestMonths',
    'privacy.retention.auditMonths',
    'privacy.retention.sessionHours',
    'charts.trend.title',
    'charts.distribution.title',
  ];
  for (const theme of ['light', 'dark']) {
    for (const key of PALETTE_KEYS) paths.push(`theme.palettes.${theme}.${key}`);
    paths.push(`theme.palettes.${theme}.chartSeries`);
  }
  for (const role of ROLE_KEYS) paths.push(`roles.${role}`);
  for (const module of MODULE_KEYS) {
    for (const key of ['label', 'title', 'intro', 'caption', 'denied', 'empty', 'error', 'count']) {
      paths.push(`modules.${module}.${key}`);
    }
  }
  for (const kpi of KPI_KEYS) {
    for (const key of ['label', 'question', 'period', 'detail', 'visible']) paths.push(`kpis.${kpi}.${key}`);
  }
  return paths;
}

export function validateConfig(candidate: unknown): Config {
  for (const path of requiredPaths()) {
    const value = at(candidate, path);
    if (value === undefined || value === null || value === '') {
      throw new ConfigError(`required field missing: ${path}`, path);
    }
  }
  for (const path of collectLeaves(candidate)) {
    const problem = checkValue(path.path, path.value);
    if (problem) throw new ConfigError(`${path.path}: ${problem}`, path.path);
  }
  return candidate as Config;
}

let cached: { mtime: number; config: Config } | null = null;

export function getConfig(): Config {
  const mtime = statSync(FILES.content).mtimeMs;
  if (cached && cached.mtime === mtime) return cached.config;
  const parsed = JSON.parse(readFileSync(FILES.content, 'utf8')) as unknown;
  const config = validateConfig(parsed);
  cached = { mtime, config };
  return config;
}

// ---------------------------------------------------------------------------
// The field map, generated from the configuration itself: every leaf the
// settings module may change, with its kind. A path not produced here cannot
// be written, whatever a request says.

export type Field = {
  path: string;
  label: string;
  kind: 'text' | 'longtext' | 'colour' | 'number' | 'boolean' | 'length' | 'fontFamily' | 'easing';
  changes: string;
  min?: number;
  max?: number;
  step?: number;
};

type Leaf = { path: string; value: unknown };

function collectLeaves(node: unknown, prefix = ''): Leaf[] {
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectLeaves(item, prefix ? `${prefix}.${index}` : String(index)));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
      collectLeaves(value, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [{ path: prefix, value: node }];
}

// Structure is not a setting: which modules sit under which heading, the
// motion signature of the kind, and the base URL the instance answers on.
const FROZEN = [/^nav\.domains\.\d+\.(modules|key)/, /^theme\.motion\.signature$/, /^site\.baseUrl$/];

function kindOf(path: string, value: unknown): Field['kind'] {
  if (/^theme\.palettes\./.test(path)) return 'colour';
  if (/^theme\.(radius|spacing)\./.test(path)) return 'length';
  if (/Family$/.test(path)) return 'fontFamily';
  if (path === 'theme.motion.easing') return 'easing';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string' && value.length > 90) return 'longtext';
  return 'text';
}

const LENGTH = /^-?[0-9]*\.?[0-9]+(px|rem|em|ch|ex|vw|vh|svh|dvh|vmin|vmax|%)$/;
const FONT = /^[A-Za-z0-9 ,'"_-]+$/;
const COLOUR = /^#[0-9a-fA-F]{3,8}$/;
const EASING = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\(\s*-?[0-9.]+\s*,\s*-?[0-9.]+\s*,\s*-?[0-9.]+\s*,\s*-?[0-9.]+\s*\)|steps\(\s*\d+\s*(,\s*(start|end|jump-start|jump-end|jump-none|jump-both))?\s*\))$/;

function checkValue(path: string, value: unknown): string | null {
  const kind = kindOf(path, value);
  if (kind === 'colour' && !(typeof value === 'string' && COLOUR.test(value))) return 'not a colour';
  if (kind === 'length' && !(typeof value === 'string' && LENGTH.test(value))) return 'not a length';
  if (kind === 'fontFamily' && !(typeof value === 'string' && FONT.test(value))) return 'not a font family';
  if (kind === 'easing' && !(typeof value === 'string' && EASING.test(value))) return 'not an easing';
  if (path === 'theme.motion.intensity' && !(typeof value === 'number' && value >= 0 && value <= 1)) {
    return 'between 0 and 1';
  }
  if (/^kpis\.[^.]+\.thresholds\./.test(path) && !(typeof value === 'number' && value >= 0)) {
    return 'a number, zero or more';
  }
  if (/^privacy\.retention\./.test(path) && !(typeof value === 'number' && Number.isInteger(value) && value > 0)) {
    return 'a whole number above zero';
  }
  if (path === 'site.currency' && !(typeof value === 'string' && /^[A-Z]{3}$/.test(value))) return 'a currency code';
  if (path === 'site.timeZone') {
    try {
      new Intl.DateTimeFormat('en', { timeZone: String(value) });
    } catch {
      return 'not a time zone';
    }
  }
  if (path === 'site.locale') {
    try {
      new Intl.NumberFormat(String(value));
    } catch {
      return 'not a locale';
    }
  }
  if (typeof value === 'string' && value.length > 600) return 'too long';
  return null;
}

export function fields(config: Config): Field[] {
  const labels = config.ui.settings ?? {};
  return collectLeaves(config)
    .filter((leaf) => !FROZEN.some((pattern) => pattern.test(leaf.path)))
    .map((leaf) => {
      const kind = kindOf(leaf.path, leaf.value);
      const section = leaf.path.split('.')[0]!;
      const field: Field = {
        path: leaf.path,
        label: leaf.path,
        kind,
        changes: labels[`changes_${section}`] ?? section,
      };
      if (leaf.path === 'theme.motion.intensity') Object.assign(field, { min: 0, max: 1, step: 0.05 });
      if (kind === 'number' && leaf.path !== 'theme.motion.intensity') field.min = 0;
      return field;
    });
}

export class PatchError extends Error {
  constructor(
    message: string,
    readonly field: string,
  ) {
    super(message);
  }
}

// Every write is checked against the field map and the value rules before it
// touches the file, then the whole result is validated again. A rejected write
// names the field and changes nothing.
export function applyPatch(config: Config, patch: Record<string, unknown>): Config {
  const allowed = new Map(fields(config).map((field) => [field.path, field]));
  const next = structuredClone(config) as unknown as Record<string, unknown>;
  for (const [path, value] of Object.entries(patch)) {
    const field = allowed.get(path);
    if (!field) throw new PatchError('unknown field', path);
    const current = at(config, path);
    if (typeof current !== typeof value) throw new PatchError('wrong type', path);
    if (typeof value === 'string' && value.trim() === '') throw new PatchError('required', path);
    const problem = checkValue(path, value);
    if (problem) throw new PatchError(problem, path);
    const keys = path.split('.');
    let node: Record<string, unknown> = next;
    for (const key of keys.slice(0, -1)) node = node[key] as Record<string, unknown>;
    node[keys[keys.length - 1]!] = value;
  }
  try {
    return validateConfig(next);
  } catch (error) {
    if (error instanceof ConfigError) throw new PatchError(error.message, error.field ?? '');
    throw error;
  }
}

function writeAtomically(file: string, text: string): void {
  ensureDataDir();
  const temporary = join(FILES.history, `.${randomBytes(6).toString('hex')}.tmp`);
  writeFileSync(temporary, text, { mode: 0o600 });
  renameSync(temporary, file);
}

// The present file is snapshotted before it is replaced, so any write can be
// undone in one action from the settings module.
export function saveConfig(next: Config): void {
  ensureDataDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (existsSync(FILES.content)) {
    writeAtomically(join(FILES.history, `${stamp}.json`), readFileSync(FILES.content, 'utf8'));
  }
  writeAtomically(FILES.content, `${JSON.stringify(next, null, 2)}\n`);
  cached = null;
}

export function snapshots(): string[] {
  ensureDataDir();
  return readdirSync(FILES.history)
    .filter((name) => /^[0-9TZ-]+\.json$/.test(name))
    .sort()
    .reverse()
    .slice(0, 20);
}

export function restoreSnapshot(name: string): void {
  if (!snapshots().includes(name)) throw new PatchError('unknown snapshot', 'snapshot');
  const restored = validateConfig(JSON.parse(readFileSync(join(FILES.history, name), 'utf8')));
  saveConfig(restored);
}

// A template filled from a record: "{guest}, room {room}".
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
