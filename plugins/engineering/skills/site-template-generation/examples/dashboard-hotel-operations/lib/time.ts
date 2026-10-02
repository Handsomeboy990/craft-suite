// Dates of stays are calendar dates in the hotel's time zone, held as
// YYYY-MM-DD; every other time is stored in UTC. "Today" is always resolved on
// the server, in the configured zone, never by the browser.

export function today(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function monthStart(date: string): string {
  return `${date.slice(0, 8)}01`;
}

export function nightsBetween(arrival: string, departure: string): number {
  return Math.round((Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86_400_000);
}

export function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// Monday of the ISO week a date falls in.
export function weekStart(date: string): string {
  const value = new Date(`${date}T00:00:00Z`);
  const day = (value.getUTCDay() + 6) % 7;
  return addDays(date, -day);
}
