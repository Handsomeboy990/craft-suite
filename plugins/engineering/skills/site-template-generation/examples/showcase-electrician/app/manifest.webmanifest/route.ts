// Shared handler: ../_shared/routes/manifest.ts, given this instance. Next reads the route and its segment config here.
import { manifestRoute } from 'site-template-shared/routes/manifest';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET } = manifestRoute(instance);
