import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { moduleForPath, requirePage } from '@/lib/authz';

export const dynamic = 'force-dynamic';

// The grant is checked here, above the loading boundary of the list, so a
// denied page answers 403 before anything streams. Two modules share this
// path, the items and their movements, so the module is read from the URL;
// the movements layout below checks its own grant again.
export default async function Layout({ children }: { children: ReactNode }) {
  const module = moduleForPath((await headers()).get('x-url') ?? '/stock');
  await requirePage(module === 'movements' ? 'movements' : 'items');
  return children;
}
