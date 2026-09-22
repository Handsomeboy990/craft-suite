// The content contract of the portfolio kind, as types. Every visitor facing
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
  /** `signature` names which effects exist at all, after the trade;
   *  `intensity` between 0 and 1 says how far they go. 0 disables motion, and
   *  prefers-reduced-motion forces 0 whatever this says. */
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
  menuOpen: string;
  menuClose: string;
  form: {
    submitLabel: string;
    sendingLabel: string;
    optionalHint: string;
    selectPlaceholder: string;
    requiredMessage: string;
    invalidMessage: string;
    /** Shown when the page loads without JavaScript, instead of a silent failure. */
    noScript: string;
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
  clauses: { liability: string | null; governingLaw: string | null; mediation: string | null };
  pages: { slug: string; kind: 'legalNotice' | 'privacy'; label: string }[];
};

export type PortfolioContent = {
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
  nav: { label: string; href: string }[];
  ui: UiStrings;
  hero: {
    title: string;
    subtitle?: string;
    image: ImageRef;
    actions?: { label: string; href: string; variant: 'primary' | 'ghost' }[];
  };
  about: {
    heading: string;
    body: string[];
    portrait?: ImageRef;
    facts?: { label: string; value: string }[];
  };
  offers?: Section<{
    title: string;
    description: string;
    price: string;
    duration: string;
    highlight: boolean;
  }>;
  gallery?: Section<ImageRef & { caption?: string }>;
  results?: Section<{ metric: string; label: string; detail: string }>;
  testimonials?: Section<{ quote: string; author: string; context?: string }>;
  contactSection: { heading: string; body?: string; fields: FormField[] };
  contact: {
    email: string;
    phone?: string;
    address?: Address;
    hours?: { days: string; opens: string; closes: string }[];
    social?: { platform: string; url: string }[];
  };
  forms: { successMessage: string; errorMessage: string; notifyEmail?: string };
  seo: {
    title: string;
    description: string;
    ogImage?: ImageRef;
    /** What the business is, in the vocabulary a search engine reads. */
    businessType: string;
  };
  pwa: { enabled: boolean; icons?: { src: string; sizes: string; purpose?: string }[] };
  legal: LegalBlock;
};
