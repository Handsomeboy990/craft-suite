import { readFileSync } from 'node:fs';
import { FILES } from '@/lib/paths';
import { GROUPS } from '@/lib/schema';
import { requirePage } from '@/lib/guard';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

export default async function ThemePage() {
  const { csrf } = await requirePage('/admin/theme');
  const content = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  const groups = GROUPS.filter((group) => group.id === 'theme');

  return (
    <>
      <h1>Couleurs et animation</h1>
      <p className="admin-field__hint">
        Les deux thèmes sont livrés et modifiables séparément : le thème sombre n’est pas déduit du
        clair. Vérifiez le contraste après un changement de couleur, le texte doit rester lisible
        dans les deux thèmes.
      </p>
      <ContentEditor groups={groups} content={content} csrf={csrf} />
    </>
  );
}
