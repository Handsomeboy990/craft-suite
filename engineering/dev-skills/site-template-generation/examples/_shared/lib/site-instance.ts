import type { Group } from './fields';
import type { TokenTheme } from './tokens';

// What the shared routes and back office pages need from one instance, handed
// over once. Each example builds this object in its own `lib/instance.ts` from
// its content model, and its route files pass it to the shared handlers. The
// shared code declares only the part of the content it reads, so an instance
// whose model stops satisfying it fails its typecheck at that hand over.

// The fields of the content file the shared code reads, and nothing more.
export type InstanceContent = {
  site: {
    name: string;
    shortName?: string;
    locale: string;
    baseUrl: string;
    favicon?: { src: string };
  };
  theme: TokenTheme;
  contact: { email: string };
  forms: { successMessage: string; errorMessage: string; notifyEmail?: string };
  seo: { description: string };
  pwa: { enabled: boolean; icons?: { src: string; sizes: string; purpose?: string }[] };
  legal: { privacy: { retentionMonths: number | null } };
  ui: { form: { requiredMessage: string; invalidMessage: string } };
};

// One field of the public form, as the content file declares it.
export type FormFieldDefinition = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

export type SiteInstance<C extends InstanceContent = InstanceContent> = {
  // The loader and the writer of `lib/content.ts`.
  getContent: () => C;
  saveContent: (next: Record<string, unknown>, label?: string) => unknown;
  // The allow list of `lib/schema.ts`: a path it does not declare is refused.
  applyPatch: (current: Record<string, unknown>, patch: Record<string, unknown>) => Record<string, unknown>;
  // A refusal by the loader or by the allow list answers 422, naming the field.
  isContentError: (error: unknown) => error is Error;
  isPatchError: (error: unknown) => error is Error;
  // The field groups the back office is generated from.
  groups: Group[];
  // The legal pages as `lib/legal.ts` builds them, for the markers still open.
  legalPages: (content: C) => { markers: string[] }[];
  // The public form: which fields it declares, the inbox label a submission is
  // stored under, and the title of the push notification that announces it.
  form: {
    fields: (content: C) => FormFieldDefinition[];
    source: string;
    notificationTitle: string;
  };
};
