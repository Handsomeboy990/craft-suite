import { action } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ module: string; id: string; action: string }> };

// A named state change: check-in, cancel, record-payment. Never a free status
// field the client sets to any value. The URL uses the kebab-case of the
// action's key.
export async function POST(request: Request, { params }: Params) {
  const { module, id, action: name } = await params;
  const key = name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return action(request, module, id, key);
}
