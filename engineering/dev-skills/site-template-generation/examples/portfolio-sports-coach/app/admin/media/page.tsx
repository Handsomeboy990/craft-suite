import { requirePage } from '@/lib/guard';
import { listUploads } from '@/lib/uploads';
import MediaManager from '@/components/admin/MediaManager';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const { csrf } = await requirePage('/admin/media');
  return (
    <>
      <h1>Images</h1>
      <p className="admin-field__hint">
        Les images sont stockées dans le dossier de données du site, pas dans le code. Le texte
        alternatif se renseigne dans Contenu, au moment où l’image est choisie : c’est du contenu,
        pas de la décoration.
      </p>
      <MediaManager initial={listUploads()} csrf={csrf} />
    </>
  );
}
