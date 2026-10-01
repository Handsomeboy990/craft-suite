// Generated shape, one per module: the page checks the session and the grant
// on the server, then hands the module's declaration to the shared view.
import { requirePage } from '@/lib/authz';
import { definition } from '@/lib/modules';
import { EditView } from '@/components/FormView';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePage('tasks', 'update');
  const { id } = await params;
  return <EditView def={definition('tasks')!} ctx={ctx} id={id} />;
}
