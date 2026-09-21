import raw from '../content/content.json';
import type { ShowcaseContent } from './types';

// Validation runs at build time and refuses the first missing required field by
// name. A company site that renders with an invented address because a field
// was silently defaulted is worse than a build that stops.

class ContentError extends Error {
  constructor(message: string) {
    super(`content/content.json: ${message}`);
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
  'theme.palette',
  'theme.type',
  'theme.motion',
  'company.legalName',
  'company.activity',
  'pages',
  'ui.skipToContent',
  'ui.primaryNavLabel',
  'ui.footerNavLabel',
  'ui.contactHeading',
  'ui.hoursHeading',
  'ui.serviceAreaHeading',
  'ui.form.submitLabel',
  'ui.form.sendingLabel',
  'ui.form.optionalHint',
  'ui.form.selectPlaceholder',
  'ui.form.invalidMessage',
  'ui.legalPendingNotice',
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
  'legal.identity.legalName',
  'legal.identity.legalForm',
  'legal.pages',
];

const REQUIRED_TOKENS = [
  'palette.surface',
  'palette.surfaceAlt',
  'palette.foreground',
  'palette.muted',
  'palette.accent',
  'palette.accentHover',
  'palette.accentForeground',
  'palette.border',
  'palette.borderStrong',
  'palette.success',
  'palette.danger',
  'type.displayFamily',
  'type.textFamily',
  'type.scaleRatio',
  'radius.sm',
  'radius.md',
  'radius.lg',
  'radius.pill',
  'spacing.unit',
  'spacing.sectionY',
  'motion.intensity',
  'motion.baseDuration',
  'motion.easing',
];

function images(source: Record<string, unknown>): { path: string; value: Record<string, unknown> }[] {
  const found: { path: string; value: Record<string, unknown> }[] = [];
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (typeof record.src === 'string') found.push({ path, value: record });
    for (const [key, value] of Object.entries(record)) walk(value, path ? `${path}.${key}` : key);
  };
  walk(source, '');
  return found;
}

export function validate(source: Record<string, unknown>): ShowcaseContent {
  for (const path of REQUIRED) {
    const value = at(source, path);
    if (value === undefined || value === null || value === '') {
      throw new ContentError(`required field missing: ${path}`);
    }
  }

  for (const token of REQUIRED_TOKENS) {
    if (at(source, `theme.${token}`) === undefined) {
      throw new ContentError(`required theme token missing: theme.${token}`);
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

  const endpoint = at(source, 'forms.endpoint');
  if (endpoint !== undefined && endpoint !== '' && !String(endpoint).startsWith('https://')) {
    throw new ContentError('forms.endpoint must be empty or an absolute https URL');
  }

  // An optional block that renders a heading must carry it: a heading is a
  // string the visitor reads, so it is content.
  for (const pair of [
    ['about.team', 'about.teamHeading'],
    ['about.credentials', 'about.credentialsHeading'],
  ]) {
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

  // Every legal page the showcase kind requires must be declared. A company
  // site missing its terms or its privacy page is not a delivery.
  const declared = new Set(
    (at(source, 'legal.pages') as { kind: string }[]).map((page) => page.kind),
  );
  for (const kind of ['legalNotice', 'terms', 'privacy', 'cookies']) {
    if (!declared.has(kind)) {
      throw new ContentError(`legal page missing for a showcase site: ${kind}`);
    }
  }

  return source as unknown as ShowcaseContent;
}

export const content: ShowcaseContent = validate(raw as unknown as Record<string, unknown>);
