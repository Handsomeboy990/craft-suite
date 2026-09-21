// The content contract of the showcase kind, as types. Every visitor-facing
// value lives in content/content.json. A component that needs a value the
// contract does not have extends the contract; it does not hardcode.

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
  // A trade that sells reliability keeps it low. 0 disables motion, and
  // prefers-reduced-motion forces 0 whatever this says.
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

export type UiStrings = {
  skipToContent: string;
  primaryNavLabel: string;
  footerNavLabel: string;
  contactHeading: string;
  hoursHeading: string;
  serviceAreaHeading: string;
  form: {
    submitLabel: string;
    sendingLabel: string;
    optionalHint: string;
    selectPlaceholder: string;
    invalidMessage: string;
  };
  legalPendingNotice: string;
};

// A clause that binds is the client's own text or null. Null becomes a visible
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
  identity: {
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
  site: { name: string; locale: string; baseUrl: string; tagline?: string };
  theme: Theme;
  company: {
    legalName: string;
    tradeName?: string;
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
    highlights?: { heading: string; items: { title: string; body: string }[] };
    proof?: { heading: string; items: { label: string; value: string }[] };
  };
  services: { heading: string; intro?: string; items: Service[] };
  about: {
    heading: string;
    body: string[];
    image?: ImageRef;
    teamHeading?: string;
    credentialsHeading?: string;
    team?: { name: string; role: string; portrait?: ImageRef }[];
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
  forms: { endpoint?: string; successMessage: string; errorMessage: string };
  seo: { title: string; description: string; ogImage?: ImageRef };
  legal: LegalBlock;
};
