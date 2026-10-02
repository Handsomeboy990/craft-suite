'use client';

import { useEffect, useState } from 'react';

function toUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

// Subscribing is an explicit action by the signed in client, never something a
// page does on load. Refusing leaves the inbox and its unread count, which is
// the part that matters.
export default function PushToggle({ publicKey, csrf }: { publicKey: string | null; csrf: string }) {
  const [state, setState] = useState<'unknown' | 'off' | 'on' | 'unsupported'>('unknown');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!publicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setState(subscription ? 'on' : 'off'))
      .catch(() => setState('unsupported'));
  }, [publicKey]);

  if (!publicKey) {
    return (
      <p className="admin-field__hint">
        Les notifications ne sont pas activées sur ce serveur. Demandez-les à la personne qui a
        installé votre site. En attendant, vos messages arrivent normalement dans la boîte : c’est
        seulement l’alerte qui manque.
      </p>
    );
  }

  if (state === 'unsupported') {
    return <p className="admin-field__hint">Ce navigateur ne prend pas en charge les notifications.</p>;
  }

  // Every step here can refuse: the permission, the browser's push service, the
  // network. A failure that says nothing leaves the client clicking a button
  // that appears to do nothing, so each one is caught and shown.
  async function subscribe() {
    setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('Notifications refusées dans les réglages du navigateur.');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(publicKey!),
      });
      const response = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) {
        setMessage("L'abonnement n'a pas été enregistré par le serveur. Réessayez.");
        return;
      }
      setState('on');
      setMessage('Ce navigateur recevra une notification à chaque nouveau message.');
    } catch (error) {
      setMessage(
        `Ce navigateur n'a pas pu s'abonner : ${
          error instanceof Error ? error.message : 'raison inconnue'
        }. La boîte de réception continue de fonctionner.`,
      );
    }
  }

  async function unsubscribe() {
    setMessage('');
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch(`/api/admin/push?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
          headers: { 'x-csrf-token': csrf },
        });
        await subscription.unsubscribe();
      }
      setState('off');
      setMessage('Ce navigateur ne recevra plus de notification.');
    } catch (error) {
      setMessage(
        `Le désabonnement a échoué : ${error instanceof Error ? error.message : 'raison inconnue'}.`,
      );
    }
  }

  return (
    <div>
      <button
        type="button"
        className="button button--primary"
        onClick={() => (state === 'on' ? unsubscribe() : subscribe())}
      >
        {state === 'on' ? 'Désactiver les notifications' : 'Activer les notifications'}
      </button>
      <p className="form__status" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
