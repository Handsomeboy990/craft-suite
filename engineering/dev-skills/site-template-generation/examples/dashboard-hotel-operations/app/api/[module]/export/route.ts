import { exportCsv } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ module: string }> };

export async function GET(request: Request, { params }: Params) {
  return exportCsv(request, (await params).module);
}
