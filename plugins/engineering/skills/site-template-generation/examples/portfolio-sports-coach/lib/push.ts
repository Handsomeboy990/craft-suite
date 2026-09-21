import webpush from 'web-push';
import { FILES } from './paths';
import { readJson, writeJson } from './store';

// Push is optional at runtime. Without the keys, the back office says so and
// everything else keeps working: the inbox and the unread count are the part
// that matters.

type Subscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: string;
};

export function pushPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

function configured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configure(): void {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export function listSubscriptions(): Subscription[] {
  return readJson<Subscription[]>(FILES.subscriptions, []);
}

export function addSubscription(subscription: Omit<Subscription, 'createdAt'>): void {
  const existing = listSubscriptions().filter((item) => item.endpoint !== subscription.endpoint);
  writeJson(FILES.subscriptions, [
    ...existing,
    { ...subscription, createdAt: new Date().toISOString() },
  ]);
}

export function removeSubscription(endpoint: string): void {
  writeJson(
    FILES.subscriptions,
    listSubscriptions().filter((item) => item.endpoint !== endpoint),
  );
}

// A failed send never fails the message: the message is already stored, and the
// failure is logged. A subscription the push service reports as gone is
// deleted, which is the only way the store stays clean.
export async function notify(title: string, body: string, url: string): Promise<void> {
  if (!configured()) return;
  configure();

  const payload = JSON.stringify({ title, body, url });
  for (const subscription of listSubscriptions()) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: subscription.keys },
        payload,
      );
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        removeSubscription(subscription.endpoint);
      } else {
        console.error('push notification failed', { endpoint: subscription.endpoint, status });
      }
    }
  }
}
