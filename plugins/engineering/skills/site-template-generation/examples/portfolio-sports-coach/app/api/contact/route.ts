import { getContent } from '@/lib/content';
import { addMessage } from '@/lib/messages';
import { notify } from '@/lib/push';
import { callerAddress, consume } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The public form endpoint. Rate limited, because an unlimited one turns the
// inbox into a spam folder on the first crawl.
//
// The refusal is visible rather than shaped like a success. Hiding it would
// keep a crawler from learning that a limit exists, at the price of a real
// customer believing their message was sent when it was dropped. For a business
// site that trade is the wrong way round, so the visitor is told, and given the
// direct address that the failure message carries.
export async function POST(request: Request) {
  const content = getContent();
  const address = callerAddress(request.headers);
  const limit = consume('contact', address);
  if (!limit.allowed) {
    return Response.json(
      { ok: false, error: content.forms.errorMessage },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: content.forms.errorMessage }, { status: 400 });
  }

  const definitions = content.contactSection.fields;
  const fields: { label: string; value: string }[] = [];

  for (const definition of definitions) {
    const raw = payload[definition.name];
    const value =
      definition.type === 'checkbox' ? (raw ? 'oui' : 'non') : typeof raw === 'string' ? raw.trim() : '';

    if (definition.required && (value === '' || value === 'non')) {
      return Response.json(
        { ok: false, error: `${definition.label}: ${content.ui.form.requiredMessage}` },
        { status: 422 },
      );
    }
    if (definition.type === 'email' && value !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      return Response.json(
        { ok: false, error: `${definition.label}: ${content.ui.form.invalidMessage}` },
        { status: 422 },
      );
    }
    if (definition.type === 'select' && value !== '' && !(definition.options ?? []).includes(value)) {
      return Response.json(
        { ok: false, error: `${definition.label}: ${content.ui.form.invalidMessage}` },
        { status: 422 },
      );
    }
    if (value.length > 4000) {
      return Response.json(
        { ok: false, error: `${definition.label}: ${content.ui.form.invalidMessage}` },
        { status: 422 },
      );
    }
    if (value !== '') fields.push({ label: definition.label, value });
  }

  const message = addMessage('contact', fields);

  // The message is stored before anything is announced, so a failing
  // notification never loses it.
  const first = fields[0]?.value ?? '';
  void notify('Nouveau message', first.slice(0, 120), '/admin/messages').catch((error) => {
    console.error('notification failed for message', message.id, error);
  });

  return Response.json({ ok: true, message: content.forms.successMessage });
}
