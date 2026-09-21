// The content contract, as types. Every visitor-facing value in the site is
// declared here and lives in content/content.json. A component that needs a
// value the contract does not have extends the contract; it does not hardcode.

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
  // The boundary of an interactive control, which must reach 3:1 against the
  // surface behind it. The decorative border does not, and does not need to.
  borderStrong: string;
  success: string;
  danger: string;
};

export type Theme = {
  profile: string;
  palette: Palette;
  type: {
    displayFamily: string;
    textFamily: string;
    scaleRatio: number;
    displayWeight: number;
    textWeight: number;
  };
  radius: { sm: string; md: string; lg: string; pill: string };
  spacing: { unit: string; sectionY: string };
  // intensity between 0 and 1 multiplies every duration and travel distance.
  // 0 disables motion. prefers-reduced-motion forces 0 whatever this says.
  motion: { intensity: number; baseDuration: number; easing: string };
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
  clauses: {
    liability: string | null;
    governingLaw: string | null;
    mediation: string | null;
  };
  pages: { slug: string; kind: 'legalNotice' | 'privacy' | 'terms' | 'cookies'; label: string }[];
};

// An optional section carries its own heading, because a heading is a string
// the visitor reads and therefore content, never a literal in a component.
export type Section<T> = { heading: string; items: T[] };

// Interface chrome the visitor reads: labels, hints and notices. In the content
// file for the same reason as everything else, and because a template that
// serves another language cannot carry them in its components.
export type UiStrings = {
  skipToContent: string;
  primaryNavLabel: string;
  footerNavLabel: string;
  contactHeading: string;
  hoursHeading: string;
  form: {
    submitLabel: string;
    sendingLabel: string;
    optionalHint: string;
    selectPlaceholder: string;
    invalidMessage: string;
  };
  legalPendingNotice: string;
};

export type PortfolioContent = {
  site: { name: string; locale: string; baseUrl: string; tagline?: string };
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
  forms: { endpoint?: string; successMessage: string; errorMessage: string };
  seo: { title: string; description: string; ogImage?: ImageRef };
  legal: LegalBlock;
};
