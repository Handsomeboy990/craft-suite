import Link from 'next/link';
import { headers } from 'next/headers';
import { moduleForPath } from '@/lib/authz';
import { getConfig } from '@/lib/config';
import { StatePanel, deniedText } from '@/components/parts';

// The denied state: the access is not granted, and who grants it. Rendered by
// forbidden(), so the answer carries HTTP 403 rather than a redirect that
// hides the refusal.
export default async function Forbidden() {
  const config = getConfig();
  const url = (await headers()).get('x-url') ?? '/';
  const module = moduleForPath(url);
  const name = module ? config.modules[module].denied : config.ui.states!.deniedFallback!;
  return (
    <section aria-labelledby="denied-title" className="denied" data-state="denied">
      <h1 id="denied-title">{config.ui.states!.deniedTitle}</h1>
      <StatePanel tone="warning" title={deniedText(config, name)}>
        <p>
          <Link className="button" href="/">
            {config.ui.notFound!.action}
          </Link>
        </p>
      </StatePanel>
    </section>
  );
}
