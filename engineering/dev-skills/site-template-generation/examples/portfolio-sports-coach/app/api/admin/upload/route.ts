import { HttpError, requireSession } from '@/lib/auth';
import { callerAddress, consume } from '@/lib/rate-limit';
import { record } from '@/lib/audit';
import { UploadError, deleteUpload, storeUpload } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  const limit = consume('upload', callerAddress(request.headers));
  if (!limit.allowed) {
    return Response.json({ ok: false, error: 'trop d’envois' }, { status: 429 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: 'aucun fichier' }, { status: 400 });
  }

  try {
    const stored = await storeUpload(file);
    record('upload', callerAddress(request.headers), `${stored.name}, ${stored.bytes} bytes`);
    return Response.json({ ok: true, ...stored });
  } catch (error) {
    if (error instanceof UploadError) {
      record('upload-refused', callerAddress(request.headers), error.message);
      return Response.json({ ok: false, error: error.message }, { status: 422 });
    }
    throw error;
  }
}

export async function DELETE(request: Request) {
  try {
    await requireSession(request);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ ok: false, error: error.message }, { status: error.status });
    }
    throw error;
  }

  const name = new URL(request.url).searchParams.get('name') ?? '';
  const removed = deleteUpload(name);
  if (removed) record('media-delete', callerAddress(request.headers), name);
  return Response.json({ ok: removed }, { status: removed ? 200 : 404 });
}
