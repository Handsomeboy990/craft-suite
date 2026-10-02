import { create, list } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ module: string }> };

export async function GET(request: Request, { params }: Params) {
  return list(request, (await params).module);
}

export async function POST(request: Request, { params }: Params) {
  return create(request, (await params).module);
}
