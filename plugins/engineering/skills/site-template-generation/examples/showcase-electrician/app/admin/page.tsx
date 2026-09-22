import { getContent } from '@/lib/content';
import { buildLegalPages } from '@/lib/legal';
import { buildChecklist } from '@/lib/checklist';
import { unreadCount } from '@/lib/messages';
import { pushPublicKey } from '@/lib/push';
import { requirePage } from '@/lib/guard';
import PushToggle from '@/components/admin/PushToggle';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const { csrf } = await requirePage('/admin');
  const content = getContent();
  const legalPages = buildLegalPages(
    content.legal,
    content.site.name,
    content.quote.fields,
    content.services.items,
  );
  const tasks = buildChecklist(content, legalPages);
  const left = tasks.filter((task) => !task.done);
  const urgent = left.filter((task) => task.urgent).length;
  const unread = unreadCount();

  return (
    <>
      <h1>Tableau de bord</h1>

      <section className="admin-group">
        <h2>Ce qu’il vous reste à faire</h2>
        <p className="admin-field__hint">
          {left.length === 0
            ? 'Rien. Votre site est complet : il ne reste plus qu’à le tenir à jour.'
            : urgent > 0
              ? `${urgent} point${urgent > 1 ? 's' : ''} ${urgent > 1 ? 'sont visibles' : 'est visible'} par vos visiteurs. Les autres peuvent attendre.`
              : 'Rien d’urgent. Les points ci-dessous améliorent votre site sans être visibles par vos visiteurs.'}
        </p>
        <ul className="checklist">
          {tasks.map((task) => (
            <li
              key={task.title}
              className={`checklist__item${task.done ? ' checklist__item--done' : ''}${
                !task.done && task.urgent ? ' checklist__item--urgent' : ''
              }`}
            >
              <span className="checklist__mark" aria-hidden="true">
                {task.done ? '✓' : task.urgent ? '!' : '·'}
              </span>
              <div className="checklist__body">
                <p className="checklist__title">
                  <span className="visually-hidden">{task.done ? 'Fait : ' : 'À faire : '}</span>
                  {task.title}
                </p>
                <p className="detail">{task.detail}</p>
              </div>
              {!task.done && task.where ? (
                <a className="button button--ghost checklist__action" href={task.where[0]}>
                  {task.where[1]}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-group">
        <h2>Vos messages</h2>
        <p className="admin-field__hint">
          {unread === 0
            ? 'Aucun message en attente de lecture.'
            : `${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}.`}{' '}
          <a href="/admin/messages">Ouvrir les messages</a>
        </p>
        <PushToggle publicKey={pushPublicKey()} csrf={csrf} />
      </section>

      <section className="admin-group">
        <h2>Une question sur cet espace</h2>
        <p className="admin-field__hint">
          La page <a href="/admin/aide">Aide</a> explique, sans vocabulaire technique, ce que fait
          chaque rubrique, ce qui se passe quand vous enregistrez, et comment revenir en arrière si
          vous vous trompez.
        </p>
      </section>
    </>
  );
}
