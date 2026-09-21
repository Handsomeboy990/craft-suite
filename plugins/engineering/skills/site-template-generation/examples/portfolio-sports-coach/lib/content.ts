import { readFileSync, statSync } from 'node:fs';
import { FILES } from './paths';
import { writeJson } from './store';
import type { Palette, PortfolioContent } from './types';

// The content file is read from the data directory at request time, never
// imported into the bundle, because the back office writes it while the site
// runs. It is parsed once and re-read when its modification time changes.

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentError';
  }
}

function at(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, source);
}

const REQUIRED = [
  'site.name',
  'site.locale',
  'site.baseUrl',
  'theme.palettes.light',
  'theme.palettes.dark',
  'theme.type',
  'theme.radius',
  'theme.spacing.pageWidth',
  'theme.spacing.proseWidth',
  'theme.motion',
  'nav',
  'ui.skipToContent',
  'ui.primaryNavLabel',
  'ui.footerNavLabel',
  'ui.themeToggleLabel',
  'ui.themeLight',
  'ui.themeDark',
  'ui.themeSystem',
  'ui.contactHeading',
  'ui.hoursHeading',
  'ui.form.submitLabel',
  'ui.form.sendingLabel',
  'ui.form.optionalHint',
  'ui.form.selectPlaceholder',
  'ui.form.requiredMessage',
  'ui.form.invalidMessage',
  'ui.notFound.title',
  'ui.notFound.body',
  'ui.notFound.action',
  'ui.offline.title',
  'ui.offline.body',
  'ui.offline.action',
  'ui.legalPendingNotice',
  'hero.title',
  'hero.image',
  'about.heading',
  'about.body',
  'contactSection.heading',
  'contactSection.fields',
  'contact.email',
  'forms.successMessage',
  'forms.errorMessage',
  'seo.title',
  'seo.description',
  'pwa.enabled',
  'legal.identity.legalName',
  'legal.identity.legalForm',
  'legal.pages',
];

const PALETTE_KEYS: (keyof Palette)[] = [
  'surface',
  'surfaceAlt',
  'foreground',
  'muted',
  'accent',
  'accentHover',
  'accentForeground',
  'border',
  'borderStrong',
  'success',
  'danger',
];

const OPTIONAL_SECTIONS = ['offers', 'gallery', 'results', 'testimonials'] as const;

function images(source: Record<string, unknown>): { path: string; value: Record<string, unknown> }[] {
  const found: { path: string; value: Record<string, unknown> }[] = [];
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.src === 'string' && 'alt' in record) found.push({ path, value: record });
    for (const [key, value] of Object.entries(record)) walk(value, path ? `${path}.${key}` : key);
  };
  walk(source, '');
  return found;
}

// The same validation guards the first read and every back office write, so a
// rejected edit changes nothing on disk.
export function validate(source: Record<string, unknown>): PortfolioContent {
  for (const path of REQUIRED) {
    const value = at(source, path);
    if (value === undefined || value === null || value === '') {
      throw new ContentError(`required field missing: ${path}`);
    }
  }

  for (const theme of ['light', 'dark'] as const) {
    for (const key of PALETTE_KEYS) {
      if (typeof at(source, `theme.palettes.${theme}.${key}`) !== 'string') {
        throw new ContentError(`palette token missing: theme.palettes.${theme}.${key}`);
      }
    }
  }

  const intensity = at(source, 'theme.motion.intensity');
  if (typeof intensity !== 'number' || intensity < 0 || intensity > 1) {
    throw new ContentError('theme.motion.intensity must be a number between 0 and 1');
  }

  for (const image of images(source)) {
    if (typeof image.value.alt !== 'string' || image.value.alt.trim() === '') {
      throw new ContentError(`image without alt text: ${image.path}`);
    }
  }

  const anchors = new Set<string>(['#about', '#contact']);
  for (const section of OPTIONAL_SECTIONS) {
    const block = at(source, section);
    if (block === undefined) continue;
    if (typeof at(source, `${section}.heading`) !== 'string') {
      throw new ContentError(`optional section without a heading: ${section}.heading`);
    }
    if (!Array.isArray(at(source, `${section}.items`))) {
      throw new ContentError(`optional section without items: ${section}.items`);
    }
    anchors.add(`#${section}`);
  }

  for (const entry of at(source, 'nav') as { label: string; href: string }[]) {
    if (entry.href.startsWith('#') && !anchors.has(entry.href)) {
      throw new ContentError(
        `nav entry "${entry.label}" points at a section the content does not have: ${entry.href}`,
      );
    }
  }

  return source as unknown as PortfolioContent;
}

let cached: { mtimeMs: number; value: PortfolioContent } | null = null;

export function getContent(): PortfolioContent {
  const stat = statSync(FILES.content);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.value;
  const parsed = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  const value = validate(parsed);
  cached = { mtimeMs: stat.mtimeMs, value };
  return value;
}

export function saveContent(next: Record<string, unknown>): PortfolioContent {
  const value = validate(next);
  writeJson(FILES.content, next);
  cached = null;
  return value;
}
