import type { ReactNode } from 'react';
import { requirePage } from '@/lib/authz';

export const dynamic = 'force-dynamic';

// The grant is checked here, above the loading boundary of the list, so a
// denied page answers 403 before anything streams. The pages check again.
export default async function Layout({ children }: { children: ReactNode }) {
  await requirePage('guests');
  return children;
}
