// Shared handler: ../_shared/routes/contact.ts, given this instance. Next reads the route and its segment config here.
import { contactRoute } from 'site-template-shared/routes/contact';
import { instance } from '@/lib/instance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const { POST } = contactRoute(instance);
