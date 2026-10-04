import type { SiteInstance } from 'site-template-shared/lib/site-instance';
import { ContentError, getContent, saveContent } from './content';
import { buildLegalPages } from './legal';
import { GROUPS, PatchError, applyPatch } from './schema';
import type { ShowcaseContent } from './types';

// This instance, as the shared routes and back office pages receive it. The
// route files under app/ pass it to the shared handlers; nothing in
// site-template-shared imports this content model directly.
export const instance: SiteInstance<ShowcaseContent> = {
  getContent,
  saveContent,
  applyPatch,
  isContentError: (error): error is ContentError => error instanceof ContentError,
  isPatchError: (error): error is PatchError => error instanceof PatchError,
  groups: GROUPS,
  legalPages: (content) =>
    buildLegalPages(content.legal, content.site.name, content.quote.fields, content.services.items),
  // The showcase's form is a quotation request, and the inbox says so.
  form: {
    fields: (content) => content.quote.fields,
    source: 'devis',
    notificationTitle: 'Nouvelle demande de devis',
  },
};
