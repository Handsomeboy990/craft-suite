import { getContent } from '@/lib/content';
import { buildLegalPages } from '@/lib/legal';
import { listMessages, unreadCount } from '@/lib/messages';
import { pushPublicKey } from '@/lib/push';
import { requirePage } from '@/lib/guard';
import PushToggle from '@/components/admin/PushToggle';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const { csrf } = await requirePage('/admin');
  const content = getContent();
  const messages = listMessages();
  const pending = buildLegalPages(content.legal, content.site.name, content.contactSection.fields)
    .flatMap((page) => page.markers)
    .length;

  return (
    <>
      <h1>Tableau de bord</h1>

      <div className="grid grid--tiles" style={{ marginBottom: 'var(--space-gutter)' }}>
        <div className="figure-tile">
          <span className="metric">{unreadCount()}</span>
          messages non lus
          <p className="detail">{messages.length} au total</p>
        </div>
        <div className="figure-tile">
          <span className="metric">{pending}</span>
          informations légales à compléter
          <p className="detail">
            {pending === 0
              ? 'Les pages légales sont complètes.'
              : 'Le site affiche un marqueur visible tant qu’elles manquent.'}
          </p>
        </div>
        <div className="figure-tile">
          <span className="metric">{content.theme.motion.intensity.toFixed(2)}</span>
          intensité d’animation
          <p className="detail">0 immobilise entièrement le site.</p>
        </div>
      </div>

      <section className="admin-group">
        <h2>Notifications</h2>
        <PushToggle publicKey={pushPublicKey()} csrf={csrf} />
      </section>

      <section className="admin-group">
        <h2>Ce que vous pouvez modifier seul</h2>
        <p className="admin-field__hint">
          Contenu, images, couleurs, horaires et informations légales se modifient ici et sont en
          ligne au rechargement du site, sans intervention technique. La structure des pages, les
          règles de validation et les clauses qui engagent juridiquement ne se modifient pas ici.
        </p>
      </section>
    </>
  );
}
