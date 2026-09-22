import { has } from './motion';
import type { Palette, Theme } from './types';

// The single place where the content file becomes CSS. Components read
// var(--...) and never a literal, so changing one token in the back office
// changes the rendered site.

function paletteVariables(palette: Palette): string {
  return [
    `--color-surface:${css(palette.surface)}`,
    `--color-surface-alt:${css(palette.surfaceAlt)}`,
    `--color-foreground:${css(palette.foreground)}`,
    `--color-muted:${css(palette.muted)}`,
    `--color-accent:${css(palette.accent)}`,
    `--color-accent-hover:${css(palette.accentHover)}`,
    `--color-accent-foreground:${css(palette.accentForeground)}`,
    `--color-border:${css(palette.border)}`,
    `--color-border-strong:${css(palette.borderStrong)}`,
    `--color-focus-ring:${css(palette.focusRing)}`,
    `--color-success:${css(palette.success)}`,
    `--color-danger:${css(palette.danger)}`,
  ].join(';');
}

// Nothing interpolated into a style element may carry a character that could
// end a declaration or the element. The writer validates these values already;
// this is the second lock, for a file edited by hand or restored from a backup.
function css(value: string | number): string {
  return String(value).replace(/[<>{};]/g, '');
}

export function cssVariables(theme: Theme): string {
  const { type, radius, spacing, motion } = theme;
  const intensity = Math.min(Math.max(motion.intensity, 0), 1);
  const duration = Math.round(motion.baseDuration * intensity);
  const step = (power: number) => `${Math.pow(type.scaleRatio, power).toFixed(3)}rem`;
  const gutter = theme.density === 'compact' ? 3 : theme.density === 'airy' ? 5 : 4;

  const shared = [
    `--font-display:${css(type.displayFamily)}`,
    `--font-text:${css(type.textFamily)}`,
    `--weight-display:${type.displayWeight}`,
    `--weight-text:${type.textWeight}`,
    `--size-xs:${step(-1)}`,
    `--size-md:${step(0)}`,
    `--size-lg:${step(1)}`,
    `--size-xl:${step(2)}`,
    `--size-2xl:${step(3)}`,
    `--size-3xl:${step(4)}`,
    `--size-4xl:${step(5)}`,
    `--radius-sm:${css(radius.sm)}`,
    `--radius-md:${css(radius.md)}`,
    `--radius-lg:${css(radius.lg)}`,
    `--radius-pill:${css(radius.pill)}`,
    `--space-unit:${css(spacing.unit)}`,
    `--space-gutter:calc(${css(spacing.unit)} * ${gutter})`,
    `--space-section:${css(spacing.section)}`,
    `--page-width:${css(spacing.pageWidth)}`,
    `--prose-width:${css(spacing.proseWidth)}`,
    `--motion-duration:${duration}ms`,
    `--motion-travel:${Math.round(32 * intensity)}px`,
    `--motion-stagger:${Math.round(70 * intensity)}ms`,
    `--motion-lift:${(has(theme.motion.signature, 'lift') ? intensity * 4 : 0).toFixed(2)}px`,
    `--motion-easing:${css(motion.easing)}`,
  ].join(';');

  // Light is the base. Dark applies under the system preference unless the
  // visitor asked for light, and always under an explicit dark choice. Both
  // themes are authored; neither is derived from the other.
  return [
    `:root{${shared};${paletteVariables(theme.palettes.light)};color-scheme:light}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"])`,
    `{${paletteVariables(theme.palettes.dark)};color-scheme:dark}}`,
    `:root[data-theme="dark"]{${paletteVariables(theme.palettes.dark)};color-scheme:dark}`,
    `:root[data-theme="light"]{${paletteVariables(theme.palettes.light)};color-scheme:light}`,
  ].join('');
}

// Applied before first paint so the page never flashes the wrong theme.
export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
