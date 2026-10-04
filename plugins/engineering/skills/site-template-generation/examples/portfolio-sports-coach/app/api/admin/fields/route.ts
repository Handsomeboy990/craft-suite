// Shared handler: ../_shared/routes/admin/fields.ts, given this instance. Next reads the route and its segment config here.
import { fieldsRoute } from 'site-template-shared/routes/admin/fields';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { GET } = fieldsRoute(instance);
