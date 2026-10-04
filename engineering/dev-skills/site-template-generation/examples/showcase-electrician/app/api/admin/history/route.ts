// Shared handler: ../_shared/routes/admin/history.ts, given this instance. Next reads the route and its segment config here.
import { historyRoute } from 'site-template-shared/routes/admin/history';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { POST } = historyRoute(instance);
