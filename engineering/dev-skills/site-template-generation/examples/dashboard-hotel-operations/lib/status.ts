// One map from the status of the domain to a status token. Every badge, card
// and chart reads it; no screen picks a colour for a state itself. The words
// come from the configuration (statuses.<set>.<value>), the tone from here.

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const STATUS_TONES: Record<string, Record<string, Tone>> = {
  rooms: { available: 'success', occupied: 'info', dirty: 'warning', cleaning: 'info', outOfOrder: 'danger' },
  stays: { provisional: 'neutral', confirmed: 'info', inHouse: 'success', departed: 'neutral', cancelled: 'danger' },
  folios: { settled: 'success', open: 'info', overdue: 'danger', voided: 'neutral' },
  tasks: { todo: 'warning', inProgress: 'info', done: 'success' },
  items: { low: 'warning', ok: 'success' },
  staff: { active: 'success', inactive: 'neutral' },
  ledger: { posted: 'neutral', reversed: 'warning', reversal: 'info' },
  audit: { allowed: 'success', refused: 'danger' },
  kpi: { ok: 'neutral', warning: 'warning', danger: 'danger' },
};

export function toneOf(set: string, value: string): Tone {
  return STATUS_TONES[set]?.[value] ?? 'neutral';
}

export const TONES: Tone[] = ['success', 'warning', 'danger', 'info', 'neutral'];
