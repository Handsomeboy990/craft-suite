// Generated shape, one per module: the page checks the session and the grant
// on the server, then hands the module's declaration to the shared view.
import { requirePage } from '@/lib/authz';
import { definition } from '@/lib/modules';
import { CreateView } from '@/components/FormView';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const ctx = await requirePage('ledger', 'create');
  return <CreateView def={definition('ledger')!} ctx={ctx} search={await searchParams} />;
}
