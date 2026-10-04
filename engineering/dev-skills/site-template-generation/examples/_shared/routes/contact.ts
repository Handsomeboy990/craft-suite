import { refuseOversizedBody } from '../lib/auth';
import { addMessage } from '../lib/messages';
import { send } from '../lib/mail';
import { notify } from '../lib/push';
import { callerAddress, consume } from '../lib/rate-limit';
import type { InstanceContent, SiteInstance } from '../lib/instance';

// POST /api/contact, the public form of the instance: its declared fields, the
// inbox label a submission is stored under and the notification title.
export function contactRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  // The public form endpoint. Rate limited, because an unlimited one turns the
  // inbox into a spam folder on the first crawl.
  //
  // The refusal is visible rather than shaped like a success. Hiding it would
  // keep a crawler from learning that a limit exists, at the price of a real
  // customer believing their message was sent when it was dropped. For a business
  // site that trade is the wrong way round, so the visitor is told, and given the
  // direct address that the failure message carries.
  async function POST(request: Request) {
    const oversized = refuseOversizedBody(request);
    if (oversized) return oversized;

    const content = instance.getContent();
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

    const definitions = instance.form.fields(content);
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

    const message = addMessage(instance.form.source, fields);

    // The message is stored before anything is announced, so a failing
    // notification never loses it.
    // Both announcements happen after the message is stored, and neither can
    // lose it. forms.notifyEmail was in the contract and sent nothing until now.
    if (content.forms.notifyEmail) {
      void send(
        content.forms.notifyEmail,
        `Nouveau message depuis ${content.site.name}`,
        [
          `Reçu le ${new Date(message.receivedAt).toLocaleString(content.site.locale)}.`,
          '',
          ...fields.map((field) => `${field.label} : ${field.value}`),
          '',
          `À lire et à répondre depuis ${content.site.baseUrl.replace(/\/$/, '')}/admin/messages`,
        ].join('\n'),
      ).catch((error) => console.error('notification mail failed for message', message.id, error));
    }

    const first = fields[0]?.value ?? '';
    void notify(instance.form.notificationTitle, first.slice(0, 120), '/admin/messages').catch((error) => {
      console.error('notification failed for message', message.id, error);
    });

    return Response.json({ ok: true, message: content.forms.successMessage });
  }

  return { POST };
}
