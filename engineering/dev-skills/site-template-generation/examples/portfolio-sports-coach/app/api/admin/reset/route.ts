// Shared handler: ../_shared/routes/admin/reset.ts, given this instance. Next reads the route and its segment config here.
import { resetRoute } from 'site-template-shared/routes/admin/reset';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { POST, PUT } = resetRoute(instance);
