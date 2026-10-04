// Shared handler: ../_shared/routes/admin/content.ts, given this instance. Next reads the route and its segment config here.
import { contentRoute } from 'site-template-shared/routes/admin/content';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET, PUT } = contentRoute(instance);
