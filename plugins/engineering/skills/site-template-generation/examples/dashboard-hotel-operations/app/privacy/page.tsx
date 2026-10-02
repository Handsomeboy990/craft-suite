import Link from 'next/link';
import { fill, getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

// The notice for the staff and for the guests whose records the dashboard
// holds, with the retention periods the software itself enforces.
export default function PrivacyPage() {
  const config = getConfig();
  const { retention } = config.privacy;
  return (
    <section className="panel prose" aria-labelledby="privacy-title">
      <h1 id="privacy-title">{config.privacy.title}</h1>
      {config.privacy.paragraphs.map((paragraph, index) => (
        <p key={index}>{fill(paragraph, { guestMonths: retention.guestMonths, auditMonths: retention.auditMonths, sessionHours: retention.sessionHours })}</p>
      ))}
      <p>
        <Link href="/">{config.ui.notFound!.action}</Link>
      </p>
    </section>
  );
}
