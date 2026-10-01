import { authorizeApi, failure } from '@/lib/authz';
import { fields } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The settings the manager may change, as data: the same shape as the back
// office of the site kinds, so a fleet tool that checks the configuration
// works here too.
export async function GET(request: Request) {
  try {
    const ctx = await authorizeApi(request, 'settings', 'view');
    return Response.json({ ok: true, fields: fields(ctx.config) });
  } catch (error) {
    return failure(error);
  }
}
