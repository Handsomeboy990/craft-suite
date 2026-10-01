import type { ModuleKey, Role } from './matrix';

// The configuration contract: data/content.json. Every string a member of
// staff reads, both palettes, the role names, the module labels and the KPI
// thresholds. Records never live here.

export const PALETTE_KEYS = [
  'surface',
  'surfaceAlt',
  'foreground',
  'muted',
  'accent',
  'accentHover',
  'accentForeground',
  'border',
  'borderStrong',
  'focusRing',
  'success',
  'danger',
  'warning',
  'info',
  'neutral',
  'successSurface',
  'warningSurface',
  'dangerSurface',
  'infoSurface',
  'neutralSurface',
] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];
export type Palette = Record<PaletteKey, string> & { chartSeries: string[] };

export type Theme = {
  palettes: { light: Palette; dark: Palette };
  type: { displayFamily: string; textFamily: string; scaleRatio: number; displayWeight: number; textWeight: number };
  radius: { sm: string; md: string; lg: string; pill: string };
  spacing: { unit: string; pageWidth: string; railWidth: string };
  density: 'compact' | 'regular' | 'airy';
  motion: { signature: 'operational'; intensity: number; baseDuration: number; easing: string };
};

export type ActionStrings = {
  label: string;
  // The accessible name of a row action, with the record's placeholders.
  named?: string;
  // Destructive actions ask once, name the record and the consequence, and
  // put the safe choice first.
  confirm?: string;
  keep?: string;
  done: string;
};

export type ModuleStrings = {
  label: string;
  title: string;
  intro: string;
  caption: string;
  // How the module is named in the denied message: "the ledger".
  denied: string;
  empty: string;
  error: string;
  count: string;
  counter?: string;
  create?: string;
  open?: string;
  columns: Record<string, string>;
  filters?: Record<string, string>;
  fields?: Record<string, string>;
  actions?: Record<string, ActionStrings>;
};

export type KpiStrings = {
  label: string;
  question: string;
  period: string;
  detail: string;
  thresholds: Record<string, number>;
  visible: boolean;
};

export type Config = {
  site: {
    name: string;
    shortName: string;
    locale: string;
    timeZone: string;
    currency: string;
    baseUrl: string;
  };
  theme: Theme;
  roles: Record<Role, string>;
  nav: { label: string; domains: { key: string; label: string; modules: ModuleKey[] }[] };
  modules: Record<ModuleKey, ModuleStrings>;
  statuses: Record<string, Record<string, string>>;
  options: Record<string, Record<string, string>>;
  kpis: Record<string, KpiStrings>;
  charts: Record<string, Record<string, string>>;
  ui: Record<string, Record<string, string>>;
  privacy: {
    title: string;
    paragraphs: string[];
    retention: { guestMonths: number; auditMonths: number; sessionHours: number };
  };
};
