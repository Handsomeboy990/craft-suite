import { requirePage } from '@/lib/authz';
import { at, fields, snapshots } from '@/lib/config';
import { can } from '@/lib/matrix';
import { RestoreButton, SettingsForm } from '@/components/client/forms';
import { PageHeader } from '@/components/parts';

export const dynamic = 'force-dynamic';

// The configuration the manager may change, generated from the field map that
// /api/admin/fields publishes, and every previous version one action away.
export default async function SettingsPage() {
  const ctx = await requirePage('settings');
  const { config } = ctx;
  const strings = config.modules.settings;
  const editable = can(ctx.role, 'settings', 'update');
  const list = fields(config).map((field) => ({
    path: field.path,
    label: field.path,
    kind: field.kind,
    value: String(at(config, field.path)),
    section: field.changes,
  }));
  const history = snapshots();
  return (
    <>
      <PageHeader title={strings.title} intro={strings.intro} />
      <section className="panel" aria-labelledby="history-title">
        <h2 id="history-title">{config.ui.settings!.history}</h2>
        {history.length === 0 ? (
          <p className="muted">{config.ui.settings!.noHistory}</p>
        ) : (
          <ul className="history">
            {history.map((name) => (
              <li key={name}>
                <span>{name.replace(/\.json$/, '')}</span>
                {editable ? <RestoreButton snapshot={name} label={`${config.ui.settings!.restore} ${name.replace(/\.json$/, '')}`} /> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      {editable ? <SettingsForm fields={list} /> : null}
    </>
  );
}
