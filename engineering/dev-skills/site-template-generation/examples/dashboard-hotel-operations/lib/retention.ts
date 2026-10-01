import { run, tx } from './db';
import type { Config } from './types';
import { addDays, today } from './time';

// The retention periods the privacy notice states, enforced by the software
// rather than promised: expired sessions are deleted, guests with no stay for
// the stated months are anonymised, audit events older than the stated months
// are deleted. Runs at most every six hours, on a request.

type Global = typeof globalThis & { __hotelRetention?: number };

export function enforceRetention(config: Config, force = false): { sessions: number; guests: number; audit: number } | null {
  const g = globalThis as Global;
  const now = Date.now();
  if (!force && g.__hotelRetention && now - g.__hotelRetention < 6 * 60 * 60_000) return null;
  g.__hotelRetention = now;
  const day = today(config.site.timeZone);
  const { guestMonths, auditMonths } = config.privacy.retention;
  const guestCutoff = addDays(day, -Math.round(guestMonths * 30.44));
  const auditCutoff = new Date(now - auditMonths * 30.44 * 86_400_000).toISOString();
  return tx(() => {
    const sessions = run('DELETE FROM sessions WHERE expires_at <= ?', [now]).changes;
    const guests = run(
      `UPDATE guests SET name = 'anonymised-' || id, email = NULL, phone = NULL, notes = NULL
       WHERE last_stay_at IS NOT NULL AND last_stay_at < ? AND name NOT LIKE 'anonymised-%'
       AND NOT EXISTS (SELECT 1 FROM stays s WHERE s.guest_id = guests.id AND s.status IN ('provisional','confirmed','inHouse'))`,
      [guestCutoff],
    ).changes;
    run("INSERT OR REPLACE INTO meta (key, value) VALUES ('retention_running', '1')");
    const audit = run('DELETE FROM audit WHERE at < ?', [auditCutoff]).changes;
    run("DELETE FROM meta WHERE key = 'retention_running'");
    return { sessions, guests, audit };
  });
}
