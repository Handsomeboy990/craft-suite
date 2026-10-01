import { PALETTE_KEYS, type Palette, type Theme } from './types';

// The single place where the configuration becomes CSS. Components and the
// stylesheet read var(--...) and never a literal, so a token changed in the
// settings module changes the rendered dashboard. Names follow the shared
// shape: --color-<token> kebab-cased, --font-*, --size-*, --space-*,
// --radius-*, --motion-*.

const kebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

// Nothing interpolated into the style element may end a declaration or the
// element. The writer validates these values; this is the second lock, for a
// file edited by hand or restored from a backup.
function css(value: string | number): string {
  return String(value).replace(/[<>{};]/g, '');
}

function paletteVariables(palette: Palette): string {
  const entries = PALETTE_KEYS.map((key) => `--color-${kebab(key)}:${css(palette[key])}`);
  palette.chartSeries.forEach((colour, index) => entries.push(`--color-chart-${index + 1}:${css(colour)}`));
  return entries.join(';');
}

export function cssVariables(theme: Theme): string {
  const { type, radius, spacing, motion } = theme;
  // The operational signature: only feedback moves, a drawer, a dialog, a
  // toast. prefers-reduced-motion removes even that, in the stylesheet.
  const intensity = Math.min(Math.max(motion.intensity, 0), 1);
  const duration = Math.round(motion.baseDuration * intensity);
  const step = (power: number) => `${Math.pow(type.scaleRatio, power).toFixed(3)}rem`;
  const row = theme.density === 'compact' ? 2.75 : theme.density === 'airy' ? 3.5 : 3;

  const shared = [
    `--font-display:${css(type.displayFamily)}`,
    `--font-text:${css(type.textFamily)}`,
    `--weight-display:${css(type.displayWeight)}`,
    `--weight-text:${css(type.textWeight)}`,
    `--size-xs:${step(-1)}`,
    `--size-md:${step(0)}`,
    `--size-lg:${step(1)}`,
    `--size-xl:${step(2)}`,
    `--size-2xl:${step(3)}`,
    `--radius-sm:${css(radius.sm)}`,
    `--radius-md:${css(radius.md)}`,
    `--radius-lg:${css(radius.lg)}`,
    `--radius-pill:${css(radius.pill)}`,
    `--space-unit:${css(spacing.unit)}`,
    `--space-row:calc(${css(spacing.unit)} * ${row})`,
    `--page-width:${css(spacing.pageWidth)}`,
    `--rail-width:${css(spacing.railWidth)}`,
    `--motion-duration:${duration}ms`,
    `--motion-easing:${css(motion.easing)}`,
    `--motion-intensity:${intensity}`,
  ].join(';');

  return [
    `:root{${shared};${paletteVariables(theme.palettes.light)};color-scheme:light}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${paletteVariables(theme.palettes.dark)};color-scheme:dark}}`,
    `:root[data-theme="dark"]{${paletteVariables(theme.palettes.dark)};color-scheme:dark}`,
    `:root[data-theme="light"]{${paletteVariables(theme.palettes.light)};color-scheme:light}`,
  ].join('');
}

// Applied before first paint, so the page never flashes the wrong theme.
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
