import { existsSync, readFileSync } from 'node:fs';
import { isDemonstration } from './db';
import { FILES } from './paths';

// Fault injection, for forcing the designed states rather than hoping to see
// them: { "overview.trend": true } makes the trend fail, { "list.stays": true }
// makes the stays list fail, { "delay.stays": 3000 } holds it for three
// seconds so its loading state can be looked at. Honoured only on a
// demonstration database, so it can never touch a live instance.

function faults(): Record<string, unknown> {
  if (!existsSync(FILES.faults) || !isDemonstration()) return {};
  try {
    return JSON.parse(readFileSync(FILES.faults, 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export class InjectedFault extends Error {}

export function failIf(key: string): void {
  if (faults()[key] === true) throw new InjectedFault(key);
}

export async function delayIf(key: string): Promise<void> {
  const value = faults()[key];
  if (typeof value === 'number' && value > 0 && value <= 15000) {
    await new Promise((resolve) => setTimeout(resolve, value));
  }
}
