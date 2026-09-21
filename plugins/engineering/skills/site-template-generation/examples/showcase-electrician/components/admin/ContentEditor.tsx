'use client';

import { useState, type CSSProperties } from 'react';
import { getPath, type FieldDef, type Group, type ItemField } from '@/lib/schema';

// One editor for every group of the contract. The form is generated from the
// schema, so a field added to the contract appears here without new admin code,
// and the server refuses any path the schema does not declare.

type Values = Record<string, unknown>;

function defaultFor(field: ItemField): unknown {
  switch (field.kind) {
    case 'boolean':
      return false;
    case 'lines':
    case 'paragraphs':
      return [];
    case 'select':
      return field.options?.[0] ?? '';
    case 'image':
      return { src: '', alt: '' };
    default:
      return '';
  }
}

async function upload(file: File, csrf: string): Promise<string> {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'x-csrf-token': csrf },
    body,
  });
  const result = (await response.json()) as { ok: boolean; src?: string; error?: string };
  if (!response.ok || !result.ok || !result.src) throw new Error(result.error ?? 'envoi refusé');
  return result.src;
}

function ImageField({
  value,
  csrf,
  onChange,
  onError,
}: {
  value: string;
  csrf: string;
  onChange: (src: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <span style={{ display: 'grid', gap: '4px' }}>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            onChange(await upload(file, csrf));
          } catch (error) {
            onError(error instanceof Error ? error.message : 'envoi refusé');
          } finally {
            event.target.value = '';
          }
        }}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ maxWidth: '160px', borderRadius: '4px' }} />
      ) : null}
    </span>
  );
}

function ScalarInput({
  kind,
  field,
  value,
  csrf,
  onChange,
  onError,
}: {
  kind: ItemField['kind'];
  field: { label: string; options?: string[]; min?: number; max?: number; step?: number };
  value: unknown;
  csrf: string;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  switch (kind) {
    case 'textarea':
      return (
        <textarea rows={4} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />
      );
    case 'paragraphs':
      return (
        <textarea
          rows={8}
          value={(Array.isArray(value) ? value : []).join('\n\n')}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(/\n\s*\n/)
                .map((entry) => entry.trim())
                .filter(Boolean),
            )
          }
        />
      );
    case 'lines':
      return (
        <textarea
          rows={4}
          value={(Array.isArray(value) ? value : []).join('\n')}
          onChange={(event) =>
            onChange(
              event.target.value
                .split('\n')
                .map((entry) => entry.trim())
                .filter(Boolean),
            )
          }
        />
      );
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          style={{ width: '24px', minHeight: '24px' }}
          onChange={(event) => onChange(event.target.checked)}
        />
      );
    case 'select':
      return (
        <select value={String(value ?? '')} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    case 'color':
      return (
        <input
          type="color"
          value={String(value ?? '#000000').slice(0, 7)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'range':
      return (
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.05}
            value={Number(value ?? 0)}
            onChange={(event) => onChange(Number(event.target.value))}
            style={{ minHeight: 'auto' }}
          />
          <output>{Number(value ?? 0).toFixed(2)}</output>
        </span>
      );
    case 'imageSrc':
      return (
        <ImageField value={String(value ?? '')} csrf={csrf} onChange={onChange} onError={onError} />
      );
    case 'image': {
      const image = (value ?? { src: '', alt: '' }) as { src?: string; alt?: string };
      return (
        <span style={{ display: 'grid', gap: '6px' }}>
          <ImageField
            value={String(image.src ?? '')}
            csrf={csrf}
            onChange={(src) => onChange({ ...image, src })}
            onError={onError}
          />
          <input
            type="text"
            placeholder="Texte alternatif (obligatoire)"
            value={String(image.alt ?? '')}
            onChange={(event) => onChange({ ...image, alt: event.target.value })}
          />
        </span>
      );
    }
    default:
      return <input type="text" value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} />;
  }
}

function CollectionField({
  field,
  value,
  csrf,
  onChange,
  onError,
}: {
  field: FieldDef;
  value: unknown;
  csrf: string;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[];
  const definitions = field.item ?? [];

  function replace(next: Record<string, unknown>[]) {
    onChange(next);
  }

  return (
    <span style={{ display: 'grid' }}>
      {items.map((item, index) => (
        <span key={index} className="admin-item">
          {definitions.map((definition) => (
            <span key={definition.key} className="admin-field">
              <span className="admin-field__label">{definition.label}</span>
              <ScalarInput
                kind={definition.kind}
                field={definition}
                value={item[definition.key]}
                csrf={csrf}
                onError={onError}
                onChange={(next) => {
                  const copy = [...items];
                  copy[index] = { ...item, [definition.key]: next };
                  replace(copy);
                }}
              />
            </span>
          ))}
          <span className="admin-item__bar">
            <button
              type="button"
              className="admin-small"
              disabled={index === 0}
              onClick={() => {
                const copy = [...items];
                [copy[index - 1], copy[index]] = [copy[index]!, copy[index - 1]!];
                replace(copy);
              }}
            >
              Monter
            </button>
            <button
              type="button"
              className="admin-small"
              disabled={index === items.length - 1}
              onClick={() => {
                const copy = [...items];
                [copy[index + 1], copy[index]] = [copy[index]!, copy[index + 1]!];
                replace(copy);
              }}
            >
              Descendre
            </button>
            <button
              type="button"
              className="admin-small"
              onClick={() => replace(items.filter((_, position) => position !== index))}
            >
              Supprimer
            </button>
          </span>
        </span>
      ))}
      <span>
        <button
          type="button"
          className="admin-small"
          onClick={() =>
            replace([
              ...items,
              Object.fromEntries(definitions.map((definition) => [definition.key, defaultFor(definition)])),
            ])
          }
        >
          Ajouter
        </button>
      </span>
    </span>
  );
}

export default function ContentEditor({
  groups,
  content,
  csrf,
}: {
  groups: Group[];
  content: Record<string, unknown>;
  csrf: string;
}) {
  const initial: Values = {};
  for (const group of groups) {
    for (const field of group.fields) initial[field.path] = getPath(content, field.path);
  }

  const [values, setValues] = useState<Values>(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const changed = Object.keys(values).filter(
    (path) => JSON.stringify(values[path]) !== JSON.stringify(initial[path]),
  );

  async function save() {
    setStatus('saving');
    const patch: Record<string, unknown> = {};
    for (const path of changed) patch[path] = values[path];

    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify({ patch }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };

    if (response.ok && body.ok) {
      setStatus('saved');
      setMessage('Enregistré. Rechargez le site pour voir le résultat.');
      window.setTimeout(() => window.location.reload(), 600);
    } else {
      setStatus('error');
      setMessage(body.error ?? 'refusé');
    }
  }

  return (
    <div>
      {groups.map((group) => (
        <details key={group.id} className="admin-group" open={groups.length === 1}>
          <summary>{group.label}</summary>
          {group.fields.map((field) => (
            <label
              key={field.path}
              className={field.kind === 'color' ? 'admin-field admin-field--color' : 'admin-field'}
              style={{ '--i': 0 } as CSSProperties}
            >
              <span className="admin-field__label">{field.label}</span>
              {field.kind === 'collection' ? (
                <CollectionField
                  field={field}
                  value={values[field.path]}
                  csrf={csrf}
                  onError={(text) => {
                    setStatus('error');
                    setMessage(text);
                  }}
                  onChange={(next) => setValues({ ...values, [field.path]: next })}
                />
              ) : (
                <ScalarInput
                  kind={field.kind}
                  field={field}
                  value={values[field.path]}
                  csrf={csrf}
                  onError={(text) => {
                    setStatus('error');
                    setMessage(text);
                  }}
                  onChange={(next) => setValues({ ...values, [field.path]: next })}
                />
              )}
              {field.hint ? <p className="admin-field__hint">{field.hint}</p> : null}
              <p className="admin-field__changes">Modifie : {field.changes}</p>
            </label>
          ))}
        </details>
      ))}

      <div className="admin-actions">
        <button
          type="button"
          className="button button--primary"
          disabled={changed.length === 0 || status === 'saving'}
          onClick={save}
        >
          {status === 'saving' ? 'Enregistrement' : `Enregistrer (${changed.length})`}
        </button>
        <p
          className={status === 'error' ? 'form__status form__status--error' : 'form__status'}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </div>
    </div>
  );
}
