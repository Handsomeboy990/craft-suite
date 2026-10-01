import { detail, update } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ module: string; id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { module, id } = await params;
  return detail(request, module, id);
}

export async function PATCH(request: Request, { params }: Params) {
  const { module, id } = await params;
  return update(request, module, id);
}
