import { redirect } from 'next/navigation';
import { readSession } from './auth';

// Every admin page checks the session on the server. The middleware only looks
// at whether a cookie exists, which is a convenience, not access control.
export async function requirePage(next: string): Promise<{ csrf: string }> {
  const session = await readSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return { csrf: session.csrf };
}
