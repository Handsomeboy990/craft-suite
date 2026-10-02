import { listMessages } from 'site-template-shared/lib/messages';
import { requirePage } from 'site-template-shared/lib/guard';
import MessageList from 'site-template-shared/components/admin/MessageList';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const { csrf } = await requirePage('/admin/messages');
  return (
    <>
      <h1>Messages</h1>
      <p className="admin-field__hint">
        Chaque envoi du formulaire de contact arrive ici. Le message est enregistré avant toute
        notification, donc une notification qui échoue ne perd jamais un message.
      </p>
      <MessageList initial={listMessages()} csrf={csrf} />
    </>
  );
}
