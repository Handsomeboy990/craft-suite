import { HttpError, requireSession } from '../../lib/auth';
import type { InstanceContent, SiteInstance } from '../../lib/site-instance';

// GET /api/admin/fields: the field map, as data. Two readers need it and
// neither should have to crawl the back office to get it: the handover document
// that lists what the client can change, and any verification that has to
// change every field and see the change arrive. Reading it out of the rendered
// admin pages meant knowing their routes and their markup, so a site built to
// the same contract but laid out differently could not be checked at all.
export function fieldsRoute<C extends InstanceContent>(instance: SiteInstance<C>) {
  async function GET(request: Request) {
    try {
      await requireSession(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json({ ok: false, error: error.message }, { status: error.status });
      }
      throw error;
    }

    const fields = instance.groups.flatMap((group) =>
      group.fields.map((field) => ({
        path: field.path,
        label: field.label,
        kind: field.kind,
        group: group.id,
        changes: field.changes,
        ...(field.hint ? { hint: field.hint } : {}),
        ...(field.pattern ? { pattern: field.pattern } : {}),
        ...(field.options ? { options: field.options } : {}),
        ...(field.min === undefined ? {} : { min: field.min }),
        ...(field.max === undefined ? {} : { max: field.max }),
        ...(field.step === undefined ? {} : { step: field.step }),
        ...(field.item ? { item: field.item.map(({ key, kind, options }) => ({ key, kind, options })) } : {}),
      })),
    );

    return Response.json({ ok: true, fields });
  }

  return { GET };
}
