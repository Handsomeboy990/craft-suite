// The language a content contract is written in, shared by every instance. Each
// example declares its own editable surface in its lib/schema.ts with these
// types and hands it to the back office editor as a prop: the editor knows how
// to render a field of each kind, never which fields an instance has.

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'paragraphs'
  | 'lines'
  | 'image'
  | 'imageSrc'
  | 'color'
  | 'range'
  | 'select'
  | 'boolean'
  | 'collection';

export type ItemField = {
  key: string;
  label: string;
  kind: Exclude<FieldKind, 'collection'>;
  options?: string[];
};

export type FieldDef = {
  path: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  options?: string[];
  /** A value that ends up inside a style declaration is checked against this
   *  before it is written. Without it, a signed in client could close the style
   *  tag and put script on every visitor's page. */
  pattern?: 'length' | 'fontFamily' | 'easing' | 'siteUrl';
  min?: number;
  max?: number;
  step?: number;
  item?: ItemField[];
  /** What the visitor sees change. Printed in the handover field map. */
  changes: string;
};

export type Group = { id: string; label: string; fields: FieldDef[] };

// Reads a dotted path out of a content document. The editor fills each field
// with its current value through it.
export function getPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, source);
}
