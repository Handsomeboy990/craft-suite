'use client';

import { t, useUi } from '@/components/client/ui';

// What failed, in the user's words, a retry, and the rest of the dashboard
// still reachable from the navigation. Never a raw message.
export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  const { ui } = useUi();
  return (
    <section className="state state--danger" role="alert" data-state="error">
      <p className="state__title">{t(ui, 'states.errorGeneric')}</p>
      <button type="button" className="button" onClick={() => reset()}>
        {t(ui, 'states.retry')}
      </button>
    </section>
  );
}
