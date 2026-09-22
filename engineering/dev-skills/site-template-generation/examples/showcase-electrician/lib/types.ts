// The content contract of the showcase kind, as types. Every visitor facing
// value lives in the content file, which the back office writes.

export type ImageRef = { src: string; alt: string };

export type Palette = {
  surface: string;
  surfaceAlt: string;
  foreground: string;
  muted: string;
  accent: string;
  accentHover: string;
  accentForeground: string;
  border: string;
  /** The boundary of an interactive control. Measured at 3:1 against the
   *  surface behind it; the decorative border is not, and does not need to be. */
  borderStrong: string;
  success: string;
  danger: string;
};

export type Theme = {
  profile: string;
  /** Both themes are authored, never derived from one another. */
  palettes: { light: Palette; dark: Palette };
  type: {
    displayFamily: string;
    textFamily: string;
    scaleRatio: number;
    displayWeight: number;
    textWeight: number;
  };
  radius: { sm: string; md: string; lg: string; pill: string };
  spacing: { unit: string; section: string; pageWidth: string; proseWidth: string };
  /** intensity between 0 and 1 scales every duration and travel distance.
   *  0 disables motion; prefers-reduced-motion forces 0 whatever this says. */
  /** `signature` names which effects exist at all, after the trade;
   *  `intensity` between 0 and 1 says how far they go. */
  motion: { signature: string; intensity: number; baseDuration: number; easing: string };
  density: 'compact' | 'regular' | 'airy';
};

export type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type Address = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type Section<T> = { heading: string; items: T[] };

export type UiStrings = {
  skipToContent: string;
  primaryNavLabel: string;
  footerNavLabel: string;
  themeToggleLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  contactHeading: string;
  hoursHeading: string;
  serviceAreaHeading: string;
  menuOpen: string;
  menuClose: string;
  form: {
    submitLabel: string;
    sendingLabel: string;
    optionalHint: string;
    selectPlaceholder: string;
    requiredMessage: string;
    invalidMessage: string;
  };
  notFound: { title: string; body: string; action: string };
  offline: { title: string; body: string; action: string };
  install?: { label: string; dismiss: string };
  legalPendingNotice: string;
};

export type LegalIdentity = {
  legalName: string;
  legalForm: string;
  shareCapital: string | null;
  address: Address | null;
  registrationNumber: string | null;
  vatNumber: string | null;
  publicationDirector: string | null;
  professionalBody: string | null;
  insurance: { insurer: string; policy: string; coverage: string } | null;
};

// A clause that binds is the company's own text or null. Null becomes a visible
// marker: the template never drafts an obligation.
export type LegalClauses = {
  scope: string | null;
  prices: string | null;
  paymentTerms: string | null;
  executionTerms: string | null;
  withdrawal: string | null;
  warranty: string | null;
  liability: string | null;
  governingLaw: string | null;
  mediation: string | null;
};

export type LegalBlock = {
  identity: LegalIdentity;
  host: { name: string | null; address: string | null; phone: string | null };
  privacy: {
    controller: string | null;
    controllerContact: string | null;
    retentionMonths: number | null;
    processors: string[];
    transfersOutsideEu: boolean;
    supervisoryAuthority: string | null;
  };
  cookies: { name: string; purpose: string; lifetime: string; owner: string }[];
  clauses: LegalClauses;
  pages: {
    slug: string;
    kind: 'legalNotice' | 'terms' | 'privacy' | 'cookies';
    label: string;
  }[];
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  image?: ImageRef;
  bullets?: string[];
};

export type ShowcaseContent = {
  site: {
    name: string;
    shortName?: string;
    locale: string;
    baseUrl: string;
    tagline?: string;
    /** What the browser tab shows. Uploaded by the client like any other image. */
    favicon?: ImageRef;
  };
  theme: Theme;
  // One fact, one field. The name a visitor reads is `site.name`; the
  // registered entity the legal pages state is `legal.identity.legalName`.
  // A third copy here was editable, promised to change the legal pages, and
  // changed nothing.
  company: {
    activity: string;
    serviceArea?: string[];
  };
  pages: { href: string; label: string; inNav: boolean }[];
  ui: UiStrings;
  home: {
    hero: {
      title: string;
      subtitle?: string;
      image: ImageRef;
      actions?: { label: string; href: string; variant: 'primary' | 'ghost' }[];
    };
    highlights?: Section<{ title: string; body: string }>;
    proof?: Section<{ label: string; value: string }>;
  };
  services: { heading: string; intro?: string; items: Service[] };
  about: {
    heading: string;
    body: string[];
    image?: ImageRef;
    teamHeading?: string;
    team?: { name: string; role: string; portrait?: ImageRef }[];
    credentialsHeading?: string;
    credentials?: { label: string; value: string; issuedBy?: string }[];
  };
  quote: { heading: string; body?: string; fields: FormField[] };
  contact: {
    email: string;
    phone?: string;
    address?: Address;
    hours?: { days: string; opens: string; closes: string }[];
    social?: { platform: string; url: string }[];
  };
  forms: { successMessage: string; errorMessage: string; notifyEmail?: string };
  seo: { title: string; description: string; ogImage?: ImageRef; businessType: string };
  pwa: { enabled: boolean; icons?: { src: string; sizes: string; purpose?: string }[] };
  legal: LegalBlock;
};
