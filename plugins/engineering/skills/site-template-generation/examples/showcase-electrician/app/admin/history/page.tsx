import { requirePage } from '@/lib/guard';
import { list } from '@/lib/history';
import HistoryList from '@/components/admin/HistoryList';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const { csrf } = await requirePage('/admin/history');
  return (
    <>
      <h1>Historique</h1>
      <p className="admin-field__hint">
        Chaque enregistrement conserve la version qu’il remplace. Si une modification ne vous
        convient pas, revenez à la version précédente : la restauration est elle-même annulable,
        puisqu’elle conserve à son tour l’état qu’elle remplace. Les trente dernières versions sont
        gardées.
      </p>
      <HistoryList versions={list()} csrf={csrf} />
    </>
  );
}
