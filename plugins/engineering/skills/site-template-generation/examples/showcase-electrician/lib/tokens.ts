import type { Theme } from './types';

// The single place where the content file becomes CSS. Components read
// var(--...) and never a literal, so changing one token in content.json
// changes the rendered site.

export function cssVariables(theme: Theme): string {
  const { palette, type, radius, spacing, motion } = theme;
  const intensity = Math.min(Math.max(motion.intensity, 0), 1);
  const duration = Math.round(motion.baseDuration * intensity);
  const step = (power: number) => `${Math.pow(type.scaleRatio, power).toFixed(3)}rem`;
  const gutter = theme.density === 'compact' ? 3 : theme.density === 'airy' ? 5 : 4;

  return `:root{
  --color-surface:${palette.surface};
  --color-surface-alt:${palette.surfaceAlt};
  --color-foreground:${palette.foreground};
  --color-muted:${palette.muted};
  --color-accent:${palette.accent};
  --color-accent-hover:${palette.accentHover};
  --color-accent-foreground:${palette.accentForeground};
  --color-border:${palette.border};
  --color-border-strong:${palette.borderStrong};
  --color-success:${palette.success};
  --color-danger:${palette.danger};
  --font-display:${type.displayFamily};
  --font-text:${type.textFamily};
  --weight-display:${type.displayWeight};
  --weight-text:${type.textWeight};
  --size-xs:${step(-1)};
  --size-md:${step(0)};
  --size-lg:${step(1)};
  --size-xl:${step(2)};
  --size-2xl:${step(3)};
  --size-3xl:${step(4)};
  --radius-sm:${radius.sm};
  --radius-md:${radius.md};
  --radius-lg:${radius.lg};
  --radius-pill:${radius.pill};
  --space-unit:${spacing.unit};
  --space-gutter:calc(${spacing.unit} * ${gutter});
  --space-section:${spacing.sectionY};
  --motion-duration:${duration}ms;
  --motion-travel:${Math.round(28 * intensity)}px;
  --motion-easing:${motion.easing};
}`;
}
