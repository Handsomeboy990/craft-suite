import Link from 'next/link';
import { getConfig } from '@/lib/config';

// The dashboard's own 404, in the shell when signed in, with a way back. A
// record out of the user's scope lands here too: the same answer as a record
// that does not exist.
export default function NotFound() {
  const config = getConfig();
  return (
    <section aria-labelledby="not-found-title" data-state="not-found">
      <h1 id="not-found-title">{config.ui.notFound!.title}</h1>
      <p>{config.ui.notFound!.body}</p>
      <p>
        <Link className="button" href="/">
          {config.ui.notFound!.action}
        </Link>
      </p>
    </section>
  );
}
