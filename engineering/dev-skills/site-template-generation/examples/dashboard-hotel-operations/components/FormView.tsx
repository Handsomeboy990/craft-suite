import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HttpError, type Ctx } from '@/lib/authz';
import { fill } from '@/lib/config';
import { findRecord, type ModuleDef } from '@/lib/list';
import { MODULES } from '@/lib/matrix';
import { OPTIONS, sourceOptions } from '@/lib/modules';
import type { FieldDef } from '@/lib/validate';
import { RecordForm, type FormField } from './client/forms';
import { PageHeader } from './parts';

const SETS: [readonly string[], string][] = [
  [OPTIONS.roomTypes, 'roomTypes'],
  [OPTIONS.taskKinds, 'taskKinds'],
  [OPTIONS.stores, 'stores'],
  [OPTIONS.movementKinds, 'movementKinds'],
  [OPTIONS.ledgerKinds, 'ledgerKinds'],
  [OPTIONS.categories, 'categories'],
  [OPTIONS.methods, 'methods'],
];

const snake = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function formFields(def: ModuleDef, ctx: Ctx, fields: FieldDef[], values: Record<string, string>): FormField[] {
  const { config } = ctx;
  const labels = config.modules[def.key].fields ?? {};
  const sources = sourceOptions(fields);
  return fields.map((field) => {
    let options: FormField['options'];
    if (field.source) options = sources[field.key];
    else if (field.options) {
      const set = field.options === OPTIONS.roles ? null : SETS.find(([list]) => list === field.options)?.[1];
      const words: Record<string, string> = set ? (config.options[set] ?? {}) : (config.roles as Record<string, string>);
      options = field.options.map((value) => ({ value, label: words[value] ?? value }));
    }
    return {
      key: field.key,
      label: labels[field.key] ?? field.key,
      kind: field.kind,
      required: field.required,
      options,
      value: values[field.key],
    };
  });
}

export function CreateView({ def, ctx, search }: { def: ModuleDef; ctx: Ctx; search: Record<string, string | string[] | undefined> }) {
  const strings = ctx.config.modules[def.key];
  const base = MODULES[def.key].route;
  if (!def.create) notFound();
  const prefill: Record<string, string> = {};
  for (const field of def.create.fields) {
    const value = search[field.key];
    if (typeof value === 'string') prefill[field.key] = value.slice(0, 120);
  }
  return (
    <>
      <nav aria-label={ctx.config.ui.shell!.breadcrumbLabel} className="breadcrumb">
        <ol>
          <li>
            <Link href={base}>{fill(ctx.config.ui.shell!.backToList!, { module: strings.label })}</Link>
          </li>
          <li aria-current="page">{strings.create}</li>
        </ol>
      </nav>
      <PageHeader title={strings.create ?? strings.title} />
      <section className="panel">
        <RecordForm
          url={`/api/${def.key}`}
          method="POST"
          fields={formFields(def, ctx, def.create.fields, prefill)}
          submitLabel={strings.create ?? ctx.config.ui.forms!.submit!}
          done={ctx.config.ui.forms!.created!}
          next={`${base}/{id}`}
        />
      </section>
    </>
  );
}

export function EditView({ def, ctx, id }: { def: ModuleDef; ctx: Ctx; id: string }) {
  const strings = ctx.config.modules[def.key];
  const base = MODULES[def.key].route;
  if (!def.update) notFound();
  let row;
  try {
    row = findRecord(def, ctx, id);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
  if (def.update.when && !def.update.when(row)) notFound();
  const values: Record<string, string> = {};
  for (const field of def.update.fields) {
    const raw = row[field.key] ?? row[snake(field.key)] ?? row[snake(field.key).replace(/_id$/, '_id')];
    if (raw === null || raw === undefined) continue;
    values[field.key] = field.kind === 'money' ? (Number(raw) / 100).toFixed(2) : String(raw);
  }
  if (def.key === 'rooms') values.nightlyRate = (Number(row.nightly_rate) / 100).toFixed(2);
  const labels = def.label(row);
  const title = strings.open ? fill(strings.open, labels) : String(row.id);
  return (
    <>
      <nav aria-label={ctx.config.ui.shell!.breadcrumbLabel} className="breadcrumb">
        <ol>
          <li>
            <Link href={`${base}/${id}`}>{title}</Link>
          </li>
          <li aria-current="page">{ctx.config.ui.detail!.edit}</li>
        </ol>
      </nav>
      <PageHeader title={`${ctx.config.ui.detail!.edit}: ${title}`} />
      <section className="panel">
        <RecordForm
          url={`/api/${def.key}/${id}`}
          method="PATCH"
          fields={formFields(def, ctx, def.update.fields, values)}
          submitLabel={ctx.config.ui.forms!.submit!}
          done={ctx.config.ui.forms!.saved!}
          next={`${base}/{id}`}
        />
      </section>
    </>
  );
}
