import raw from '../content/content.json';
import type { PortfolioContent } from './types';

// Validation runs at build time and refuses the first missing required field
// by name. Nothing is silently defaulted: a site that looks finished because a
// missing field was replaced by a plausible value is the defect this prevents.

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
  'nav',
  'ui.skipToContent',
  'ui.primaryNavLabel',
  'ui.footerNavLabel',
  'ui.contactHeading',
  'ui.hoursHeading',
  'ui.form.submitLabel',
  'ui.form.sendingLabel',
  'ui.form.optionalHint',
  'ui.form.selectPlaceholder',
  'ui.form.invalidMessage',
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

// Every image in the content file, wherever it sits, so alt text can be
// enforced as content rather than left to a component.
function images(source: Record<string, unknown>): { path: string; value: unknown }[] {
  const found: { path: string; value: unknown }[] = [];
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

export function validate(source: Record<string, unknown>): PortfolioContent {
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
    const value = image.value as Record<string, unknown>;
    if (typeof value.alt !== 'string' || value.alt.trim() === '') {
      throw new ContentError(`image without alt text: ${image.path}`);
    }
  }

  const endpoint = at(source, 'forms.endpoint');
  if (endpoint !== undefined && endpoint !== '' && !String(endpoint).startsWith('https://')) {
    throw new ContentError('forms.endpoint must be empty or an absolute https URL');
  }

  // A navigation entry pointing at a section the content does not carry would
  // render as a link to nowhere once the optional section disappeared.
  const anchors = new Set<string>(['#about', '#contact']);
  for (const section of ['offers', 'gallery', 'results', 'testimonials']) {
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
      throw new ContentError(`nav entry "${entry.label}" points at a section the content does not have: ${entry.href}`);
    }
  }

  return source as unknown as PortfolioContent;
}

export const content: PortfolioContent = validate(raw as unknown as Record<string, unknown>);
