import { HttpError } from './authz';
import { isDate } from './time';

// The server is the authority on every field. A refused field is answered with
// 422 and its name, and nothing is written.

export type FieldKind = 'text' | 'longtext' | 'email' | 'phone' | 'date' | 'int' | 'money' | 'select' | 'boolean';

export type FieldDef = {
  key: string;
  kind: FieldKind;
  required?: boolean;
  max?: number;
  min?: number;
  // A fixed option set (its words come from config.options.<optionSet>), or a
  // source the server fills from the database.
  optionSet?: string;
  options?: readonly string[];
  source?: 'rooms' | 'housekeepers' | 'suppliers' | 'items' | 'roles' | 'stores';
};

export type Values = Record<string, string | number | boolean | null>;

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[A-Za-z]{2,}$/;
const PHONE = /^[+0-9 ().-]{6,24}$/;

export function parseBody(fields: FieldDef[], body: unknown, sourceValues: Record<string, string[]> = {}): Values {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'badRequest');
  const input = body as Record<string, unknown>;
  const out: Values = {};
  for (const field of fields) {
    const raw = input[field.key];
    const empty = raw === undefined || raw === null || raw === '';
    if (empty) {
      if (field.required) throw new HttpError(422, 'required', field.key);
      out[field.key] = field.kind === 'boolean' ? false : null;
      continue;
    }
    switch (field.kind) {
      case 'text':
      case 'longtext': {
        if (typeof raw !== 'string') throw new HttpError(422, 'invalid', field.key);
        const value = raw.trim();
        if (field.required && value === '') throw new HttpError(422, 'required', field.key);
        if (value.length > (field.max ?? (field.kind === 'text' ? 120 : 500))) throw new HttpError(422, 'tooLong', field.key);
        out[field.key] = value || null;
        break;
      }
      case 'email': {
        if (typeof raw !== 'string' || !EMAIL.test(raw.trim()) || raw.length > 160) throw new HttpError(422, 'invalid', field.key);
        out[field.key] = raw.trim().toLowerCase();
        break;
      }
      case 'phone': {
        if (typeof raw !== 'string' || !PHONE.test(raw.trim())) throw new HttpError(422, 'invalid', field.key);
        out[field.key] = raw.trim();
        break;
      }
      case 'date': {
        if (!isDate(raw)) throw new HttpError(422, 'invalid', field.key);
        out[field.key] = raw;
        break;
      }
      case 'int': {
        const value = typeof raw === 'number' ? raw : Number(String(raw).trim());
        if (!Number.isInteger(value)) throw new HttpError(422, 'invalid', field.key);
        if (field.min !== undefined && value < field.min) throw new HttpError(422, 'tooSmall', field.key);
        if (field.max !== undefined && value > field.max) throw new HttpError(422, 'tooLarge', field.key);
        out[field.key] = value;
        break;
      }
      case 'money': {
        const text = String(raw).trim().replace(',', '.');
        if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) throw new HttpError(422, 'invalid', field.key);
        const minor = Math.round(Number(text) * 100);
        if (field.min !== undefined && minor < field.min) throw new HttpError(422, 'tooSmall', field.key);
        out[field.key] = minor;
        break;
      }
      case 'select': {
        const allowed = field.options ?? sourceValues[field.key] ?? [];
        if (!allowed.includes(String(raw))) throw new HttpError(422, 'invalid', field.key);
        out[field.key] = String(raw);
        break;
      }
      case 'boolean': {
        out[field.key] = raw === true || raw === 'true' || raw === 'on';
        break;
      }
    }
  }
  return out;
}
