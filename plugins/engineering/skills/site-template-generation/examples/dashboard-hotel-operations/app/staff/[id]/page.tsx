// Generated shape, one per module: the page checks the session and the grant
// on the server, then hands the module's declaration to the shared view.
import { requirePage } from '@/lib/authz';
import { definition } from '@/lib/modules';
import { DetailView } from '@/components/DetailView';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const ctx = await requirePage('staff');
  const { id } = await params;
  const { back } = await searchParams;
  return <DetailView def={definition('staff')!} ctx={ctx} id={id} back={back} />;
}
