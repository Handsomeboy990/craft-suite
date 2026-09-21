import { readFileSync } from 'node:fs';
import { FILES } from '@/lib/paths';
import { GROUPS } from '@/lib/schema';
import { requirePage } from '@/lib/guard';
import ContentEditor from '@/components/admin/ContentEditor';

export const dynamic = 'force-dynamic';

const THEME_GROUPS = new Set(['theme']);

export default async function ContentPage() {
  const { csrf } = await requirePage('/admin/content');
  const content = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  const groups = GROUPS.filter((group) => !THEME_GROUPS.has(group.id));

  return (
    <>
      <h1>Contenu</h1>
      <p className="admin-field__hint">
        Chaque champ indique ce qu’il modifie sur le site. Un champ obligatoire vidé est refusé, en
        nommant le champ, et rien n’est écrit.
      </p>
      <ContentEditor groups={groups} content={content} csrf={csrf} />
    </>
  );
}
