import { getConfig } from '@/lib/config';
import { SetupForm } from '@/components/client/forms';

export const dynamic = 'force-dynamic';

export default async function SetupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const config = getConfig();
  const { token } = await searchParams;
  return (
    <section className="panel panel--narrow" aria-labelledby="setup-title">
      <h1 id="setup-title">{config.ui.setup!.title}</h1>
      <p className="muted">{config.ui.setup!.intro}</p>
      <SetupForm token={typeof token === 'string' ? token : ''} />
    </section>
  );
}
