import { has } from './motion';
import type { Palette, Theme } from './types';

// The single place where the content file becomes CSS. Components read
// var(--...) and never a literal, so changing one token in the back office
// changes the rendered site.

function paletteVariables(palette: Palette): string {
  return [
    `--color-surface:${palette.surface}`,
    `--color-surface-alt:${palette.surfaceAlt}`,
    `--color-foreground:${palette.foreground}`,
    `--color-muted:${palette.muted}`,
    `--color-accent:${palette.accent}`,
    `--color-accent-hover:${palette.accentHover}`,
    `--color-accent-foreground:${palette.accentForeground}`,
    `--color-border:${palette.border}`,
    `--color-border-strong:${palette.borderStrong}`,
    `--color-success:${palette.success}`,
    `--color-danger:${palette.danger}`,
  ].join(';');
}

export function cssVariables(theme: Theme): string {
  const { type, radius, spacing, motion } = theme;
  const intensity = Math.min(Math.max(motion.intensity, 0), 1);
  const duration = Math.round(motion.baseDuration * intensity);
  const step = (power: number) => `${Math.pow(type.scaleRatio, power).toFixed(3)}rem`;
  const gutter = theme.density === 'compact' ? 3 : theme.density === 'airy' ? 5 : 4;

  const shared = [
    `--font-display:${type.displayFamily}`,
    `--font-text:${type.textFamily}`,
    `--weight-display:${type.displayWeight}`,
    `--weight-text:${type.textWeight}`,
    `--size-xs:${step(-1)}`,
    `--size-md:${step(0)}`,
    `--size-lg:${step(1)}`,
    `--size-xl:${step(2)}`,
    `--size-2xl:${step(3)}`,
    `--size-3xl:${step(4)}`,
    `--size-4xl:${step(5)}`,
    `--radius-sm:${radius.sm}`,
    `--radius-md:${radius.md}`,
    `--radius-lg:${radius.lg}`,
    `--radius-pill:${radius.pill}`,
    `--space-unit:${spacing.unit}`,
    `--space-gutter:calc(${spacing.unit} * ${gutter})`,
    `--space-section:${spacing.section}`,
    `--page-width:${spacing.pageWidth}`,
    `--prose-width:${spacing.proseWidth}`,
    `--motion-duration:${duration}ms`,
    `--motion-travel:${Math.round(32 * intensity)}px`,
    `--motion-stagger:${Math.round(70 * intensity)}ms`,
    `--motion-lift:${(has(theme.motion.signature, 'lift') ? intensity * 4 : 0).toFixed(2)}px`,
    `--motion-easing:${motion.easing}`,
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
