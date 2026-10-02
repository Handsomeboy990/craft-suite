import type { Config } from './types';

// Formatted by the configured locale: currency, separators and dates. Money is
// held in minor units, as an integer, and only becomes a decimal here.

export function money(config: Config, minor: number): string {
  return new Intl.NumberFormat(config.site.locale, { style: 'currency', currency: config.site.currency }).format(
    minor / 100,
  );
}

export function number(config: Config, value: number, digits = 0): string {
  return new Intl.NumberFormat(config.site.locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function percent(config: Config, ratio: number): string {
  return new Intl.NumberFormat(config.site.locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
}

export function date(config: Config, value: string): string {
  return new Intl.DateTimeFormat(config.site.locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function dateTime(config: Config, iso: string): string {
  return new Intl.DateTimeFormat(config.site.locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.site.timeZone,
  }).format(new Date(iso));
}

export function time(config: Config, iso: string): string {
  return new Intl.DateTimeFormat(config.site.locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.site.timeZone,
  }).format(new Date(iso));
}
