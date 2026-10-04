import type { SiteInstance } from 'site-template-shared/lib/site-instance';
import { ContentError, getContent, saveContent } from './content';
import { buildLegalPages } from './legal';
import { GROUPS, PatchError, applyPatch } from './schema';
import type { PortfolioContent } from './types';

// This instance, as the shared routes and back office pages receive it. The
// route files under app/ pass it to the shared handlers; nothing in
// site-template-shared imports this content model directly.
export const instance: SiteInstance<PortfolioContent> = {
  getContent,
  saveContent,
  applyPatch,
  isContentError: (error): error is ContentError => error instanceof ContentError,
  isPatchError: (error): error is PatchError => error instanceof PatchError,
  groups: GROUPS,
  legalPages: (content) => buildLegalPages(content.legal, content.site.name, content.contactSection.fields),
  form: {
    fields: (content) => content.contactSection.fields,
    source: 'contact',
    notificationTitle: 'Nouveau message',
  },
};
