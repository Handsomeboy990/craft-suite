import { listMessages } from '@/lib/messages';
import { requirePage } from '@/lib/guard';
import MessageList from '@/components/admin/MessageList';

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
