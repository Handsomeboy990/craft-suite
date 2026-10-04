// Shared handler: ../_shared/routes/robots.ts, given this instance. Next reads the route and its segment config here.
import { robotsRoute } from 'site-template-shared/routes/robots';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET } = robotsRoute(instance);
