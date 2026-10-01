// Generated shape, one per module: the page checks the session and the grant
// on the server, then hands the module's declaration to the shared view.
import { requirePage } from '@/lib/authz';
import { definition } from '@/lib/modules';
import { ListView } from '@/components/ListView';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const ctx = await requirePage('staff');
  return <ListView def={definition('staff')!} ctx={ctx} search={await searchParams} />;
}
