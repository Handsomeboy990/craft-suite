import { readFileSync, statSync } from 'node:fs';
import { SIGNATURES } from './motion';
import { FILES } from './paths';
import { writeJson } from './store';
import type { Palette, ShowcaseContent } from './types';

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
  'theme.motion.signature',
  'ui.skipToContent',
  'ui.primaryNavLabel',
  'ui.footerNavLabel',
  'ui.themeToggleLabel',
  'ui.themeLight',
  'ui.themeDark',
  'ui.themeSystem',
  'ui.contactHeading',
  'ui.hoursHeading',
  'ui.serviceAreaHeading',
  'ui.menuOpen',
  'ui.menuClose',
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
  'company.activity',
  'pages',
  'home.hero.title',
  'home.hero.image',
  'services.heading',
  'services.items',
  'about.heading',
  'about.body',
  'quote.heading',
  'quote.fields',
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

const OPTIONAL_SECTIONS = ['home.highlights', 'home.proof'] as const;

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
export function validate(source: Record<string, unknown>): ShowcaseContent {
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

  const signature = at(source, 'theme.motion.signature');
  if (typeof signature !== 'string' || !(SIGNATURES as readonly string[]).includes(signature)) {
    throw new ContentError(`theme.motion.signature must be one of: ${SIGNATURES.join(', ')}`);
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

  for (const section of OPTIONAL_SECTIONS) {
    const block = at(source, section);
    if (block === undefined) continue;
    if (typeof at(source, `${section}.heading`) !== 'string') {
      throw new ContentError(`optional section without a heading: ${section}.heading`);
    }
    if (!Array.isArray(at(source, `${section}.items`))) {
      throw new ContentError(`optional section without items: ${section}.items`);
    }
  }

  for (const pair of [
    ['about.team', 'about.teamHeading'],
    ['about.credentials', 'about.credentialsHeading'],
  ] as const) {
    const block = at(source, pair[0]);
    if (Array.isArray(block) && block.length > 0 && typeof at(source, pair[1]) !== 'string') {
      throw new ContentError(`optional section without a heading: ${pair[1]}`);
    }
  }

  // A service without a unique slug would collide with another one on the
  // services page anchors.
  const slugs = new Set<string>();
  for (const service of at(source, 'services.items') as { slug: string; title: string }[]) {
    if (!service.slug) throw new ContentError(`service without a slug: ${service.title}`);
    if (slugs.has(service.slug)) throw new ContentError(`duplicate service slug: ${service.slug}`);
    slugs.add(service.slug);
  }

  // A company site missing its terms or its privacy page is not a delivery, so
  // the four pages the kind requires are checked here rather than hoped for.
  const declared = new Set((at(source, 'legal.pages') as { kind: string }[]).map((page) => page.kind));
  for (const kind of ['legalNotice', 'terms', 'privacy', 'cookies']) {
    if (!declared.has(kind)) {
      throw new ContentError(`legal page missing for a showcase site: ${kind}`);
    }
  }

  return source as unknown as ShowcaseContent;
}

let cached: { mtimeMs: number; value: ShowcaseContent } | null = null;

export function getContent(): ShowcaseContent {
  const stat = statSync(FILES.content);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.value;
  const parsed = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  const value = validate(parsed);
  cached = { mtimeMs: stat.mtimeMs, value };
  return value;
}

export function saveContent(next: Record<string, unknown>): ShowcaseContent {
  const value = validate(next);
  writeJson(FILES.content, next);
  cached = null;
  return value;
}
