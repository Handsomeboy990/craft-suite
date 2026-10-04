import { readFileSync } from 'node:fs';
import { FILES } from '../lib/paths';
import { requirePage } from '../lib/guard';
import ContentEditor from '../components/admin/ContentEditor';
import type { InstanceContent, SiteInstance } from '../lib/site-instance';

const THEME_GROUPS = new Set(['theme']);

export default async function ContentPage<C extends InstanceContent>({
  instance,
}: {
  instance: SiteInstance<C>;
}) {
  const { csrf } = await requirePage('/admin/content');
  const content = JSON.parse(readFileSync(FILES.content, 'utf8')) as Record<string, unknown>;
  const groups = instance.groups.filter((group) => !THEME_GROUPS.has(group.id));

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
