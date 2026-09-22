// The editable surface, declared once. The back office form is generated from
// it, and the server uses the same declaration as its allow list: a path that
// is not here cannot be written, whatever a request contains. Adding a field to
// the contract adds it to the back office without new admin code.

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

const PALETTE_KEYS = [
  ['surface', 'Fond'],
  ['surfaceAlt', 'Fond secondaire'],
  ['foreground', 'Texte'],
  ['muted', 'Texte discret'],
  ['accent', 'Accent'],
  ['accentHover', 'Accent survolé'],
  ['accentForeground', 'Texte sur accent'],
  ['border', 'Bordure décorative'],
  ['borderStrong', 'Bordure de champ'],
  ['success', 'Succès'],
  ['danger', 'Erreur'],
] as const;

function palette(theme: 'light' | 'dark', label: string): FieldDef[] {
  return PALETTE_KEYS.map(([key, name]) => ({
    path: `theme.palettes.${theme}.${key}`,
    label: `${name} (${label})`,
    kind: 'color' as const,
    changes: `la couleur ${name.toLowerCase()} du thème ${label.toLowerCase()}`,
  }));
}

export const GROUPS: Group[] = [
  {
    id: 'identity',
    label: 'Identité et référencement',
    fields: [
      {
        path: 'site.baseUrl',
        label: 'Adresse de votre site',
        kind: 'text',
        pattern: 'siteUrl',
        hint: "L'adresse que l'on tape pour venir chez vous, par exemple https://votre-entreprise.fr. Sans barre oblique à la fin.",
        changes: 'les liens partagés, le référencement et le plan du site',
      },
      { path: 'site.name', label: 'Nom affiché', kind: 'text', changes: 'en-tête, pied de page, titres' },
      { path: 'site.shortName', label: 'Nom court (application installée)', kind: 'text', changes: "le nom sous l'icône une fois le site installé" },
      { path: 'site.tagline', label: 'Accroche', kind: 'text', changes: "la ligne sous le nom dans l'en-tête" },
      { path: 'site.favicon', label: "Icône de l'onglet (favicon)", kind: 'image', changes: "l'icône affichée par le navigateur dans son onglet" },
      { path: 'seo.title', label: 'Titre pour les moteurs de recherche', kind: 'text', changes: "le titre de l'onglet et des résultats de recherche" },
      { path: 'seo.description', label: 'Description pour les moteurs de recherche', kind: 'textarea', changes: 'la description dans les résultats de recherche' },
      {
        path: 'seo.businessType',
        label: 'Type d’activité (pour les moteurs)',
        kind: 'select',
        options: [
          'LocalBusiness',
          'SportsActivityLocation',
          'HealthAndBeautyBusiness',
          'Electrician',
          'Plumber',
          'HomeAndConstructionBusiness',
          'ProfessionalService',
        ],
        hint: "Ce que Google comprend de votre métier. Choisissez le plus proche : il apparaît dans les résultats locaux.",
        changes: 'la fiche que les moteurs de recherche affichent',
      },
    ],
  },
  {
    id: 'hero',
    label: 'Première section',
    fields: [
      { path: 'hero.title', label: 'Titre principal', kind: 'text', changes: 'le titre de la première section' },
      { path: 'hero.subtitle', label: 'Sous-titre', kind: 'textarea', changes: 'la ligne sous le titre' },
      { path: 'hero.image', label: 'Image de fond', kind: 'image', changes: "l'image de la première section" },
      {
        path: 'hero.actions',
        label: 'Boutons',
        kind: 'collection',
        changes: 'les boutons de la première section',
        item: [
          { key: 'label', label: 'Texte', kind: 'text' },
          { key: 'href', label: 'Lien', kind: 'text' },
          { key: 'variant', label: 'Style', kind: 'select', options: ['primary', 'ghost'] },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'Profil',
    fields: [
      { path: 'about.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre du profil' },
      { path: 'about.body', label: 'Paragraphes', kind: 'paragraphs', hint: 'Une ligne vide sépare deux paragraphes.', changes: 'le texte du profil' },
      { path: 'about.portrait', label: 'Portrait', kind: 'image', changes: 'la photo du profil' },
      {
        path: 'about.facts',
        label: 'Chiffres clés',
        kind: 'collection',
        changes: 'la rangée de chiffres sous le profil',
        item: [
          { key: 'label', label: 'Intitulé', kind: 'text' },
          { key: 'value', label: 'Valeur', kind: 'text' },
        ],
      },
    ],
  },
  {
    id: 'offers',
    label: 'Offres et tarifs',
    fields: [
      { path: 'offers.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre de la section des offres' },
      {
        path: 'offers.items',
        label: 'Offres',
        kind: 'collection',
        changes: 'les cartes des accompagnements, dans cet ordre',
        item: [
          { key: 'title', label: 'Titre', kind: 'text' },
          { key: 'description', label: 'Description', kind: 'textarea' },
          { key: 'price', label: 'Tarif', kind: 'text' },
          { key: 'duration', label: 'Durée', kind: 'text' },
          { key: 'highlight', label: 'Mettre en avant', kind: 'boolean' },
        ],
      },
    ],
  },
  {
    id: 'results',
    label: 'Chiffres',
    fields: [
      { path: 'results.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre des chiffres' },
      {
        path: 'results.items',
        label: 'Chiffres',
        kind: 'collection',
        changes: 'les chiffres affichés',
        item: [
          { key: 'metric', label: 'Chiffre', kind: 'text' },
          { key: 'label', label: 'Intitulé', kind: 'text' },
          { key: 'detail', label: 'Précision', kind: 'text' },
        ],
      },
    ],
  },
  {
    id: 'gallery',
    label: 'Galerie',
    fields: [
      { path: 'gallery.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre de la galerie' },
      {
        path: 'gallery.items',
        label: 'Images',
        kind: 'collection',
        changes: 'les images de la galerie, dans cet ordre',
        item: [
          { key: 'src', label: 'Image', kind: 'imageSrc' },
          { key: 'alt', label: 'Texte alternatif', kind: 'text' },
          { key: 'caption', label: 'Légende', kind: 'text' },
        ],
      },
    ],
  },
  {
    id: 'testimonials',
    label: 'Témoignages',
    fields: [
      { path: 'testimonials.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre des témoignages' },
      {
        path: 'testimonials.items',
        label: 'Témoignages',
        kind: 'collection',
        changes: 'les témoignages affichés',
        item: [
          { key: 'quote', label: 'Citation', kind: 'textarea' },
          { key: 'author', label: 'Auteur', kind: 'text' },
          { key: 'context', label: 'Contexte', kind: 'text' },
        ],
      },
    ],
  },
  {
    id: 'contactSection',
    label: 'Formulaire de contact',
    fields: [
      { path: 'contactSection.heading', label: 'Titre de la section', kind: 'text', changes: 'le titre du bloc contact' },
      { path: 'contactSection.body', label: 'Texte au-dessus du formulaire', kind: 'textarea', changes: 'le paragraphe au-dessus du formulaire' },
      {
        path: 'contactSection.fields',
        label: 'Champs du formulaire',
        kind: 'collection',
        changes: 'les champs que le visiteur remplit',
        item: [
          { key: 'name', label: 'Identifiant technique', kind: 'text' },
          { key: 'label', label: 'Libellé affiché', kind: 'text' },
          { key: 'type', label: 'Type', kind: 'select', options: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox'] },
          { key: 'required', label: 'Obligatoire', kind: 'boolean' },
          { key: 'placeholder', label: 'Aide de saisie', kind: 'text' },
          { key: 'options', label: 'Choix (un par ligne)', kind: 'lines' },
        ],
      },
      { path: 'forms.successMessage', label: 'Message de succès', kind: 'textarea', changes: 'ce que voit le visiteur après envoi' },
      { path: 'forms.errorMessage', label: "Message d'échec", kind: 'textarea', changes: "ce que voit le visiteur si l'envoi échoue" },
      {
        path: 'forms.notifyEmail',
        label: 'Recevoir une copie par e-mail',
        kind: 'text',
        hint: "Laissez vide pour ne rien recevoir : les messages restent consultables dans Messages.",
        changes: "l'adresse qui reçoit une copie de chaque message",
      },
    ],
  },
  {
    id: 'contact',
    label: 'Coordonnées et horaires',
    fields: [
      { path: 'contact.email', label: 'Adresse e-mail', kind: 'text', changes: 'le lien e-mail du site' },
      { path: 'contact.phone', label: 'Téléphone', kind: 'text', changes: 'le numéro affiché' },
      { path: 'contact.address.street', label: 'Rue', kind: 'text', changes: "l'adresse affichée" },
      { path: 'contact.address.postalCode', label: 'Code postal', kind: 'text', changes: "l'adresse affichée" },
      { path: 'contact.address.city', label: 'Ville', kind: 'text', changes: "l'adresse affichée" },
      { path: 'contact.address.country', label: 'Pays', kind: 'text', changes: "l'adresse affichée" },
      {
        path: 'contact.hours',
        label: "Horaires d'ouverture",
        kind: 'collection',
        changes: 'les horaires affichés',
        item: [
          { key: 'days', label: 'Jours', kind: 'text' },
          { key: 'opens', label: 'Ouverture', kind: 'text' },
          { key: 'closes', label: 'Fermeture', kind: 'text' },
        ],
      },
      {
        path: 'contact.social',
        label: 'Réseaux',
        kind: 'collection',
        changes: 'les liens du pied de page',
        item: [
          { key: 'platform', label: 'Nom', kind: 'text' },
          { key: 'url', label: 'Lien', kind: 'text' },
        ],
      },
    ],
  },
  {
    id: 'ui',
    label: 'Textes de l’interface',
    fields: [
      { path: 'ui.notFound.title', label: 'Page introuvable, titre', kind: 'text', changes: 'la page 404' },
      { path: 'ui.notFound.body', label: 'Page introuvable, texte', kind: 'textarea', changes: 'la page 404' },
      { path: 'ui.notFound.action', label: 'Page introuvable, bouton', kind: 'text', changes: 'la page 404' },
      { path: 'ui.offline.title', label: 'Hors ligne, titre', kind: 'text', changes: 'la page hors ligne' },
      { path: 'ui.offline.body', label: 'Hors ligne, texte', kind: 'textarea', changes: 'la page hors ligne' },
      { path: 'ui.offline.action', label: 'Hors ligne, bouton', kind: 'text', changes: 'la page hors ligne' },
      { path: 'ui.contactHeading', label: 'Titre du bloc coordonnées', kind: 'text', changes: 'le bloc coordonnées' },
      { path: 'ui.hoursHeading', label: 'Titre des horaires', kind: 'text', changes: 'le bloc horaires' },
      { path: 'ui.menuOpen', label: 'Bouton menu, ouvrir', kind: 'text', changes: "le menu sur mobile" },
      { path: 'ui.menuClose', label: 'Bouton menu, fermer', kind: 'text', changes: "le menu sur mobile" },
      { path: 'ui.form.submitLabel', label: 'Bouton envoyer', kind: 'text', changes: 'le formulaire' },
      { path: 'ui.form.sendingLabel', label: 'Bouton pendant envoi', kind: 'text', changes: 'le formulaire' },
      { path: 'ui.form.requiredMessage', label: 'Message champ obligatoire', kind: 'text', changes: 'le refus affiché quand un champ obligatoire est vide' },
      { path: 'ui.form.invalidMessage', label: 'Message valeur invalide', kind: 'text', changes: 'le refus affiché quand une valeur est mal formée' },
      { path: 'ui.legalPendingNotice', label: 'Avertissement mentions incomplètes', kind: 'textarea', changes: 'les pages légales incomplètes' },
    ],
  },
  {
    id: 'theme',
    label: 'Couleurs et animation',
    fields: [
      ...palette('light', 'Clair'),
      ...palette('dark', 'Sombre'),
      {
        path: 'theme.motion.signature',
        label: 'Style d’animation (métier)',
        kind: 'select',
        options: ['energetic', 'creative', 'crafted', 'technical', 'clinical'],
        hint: "Décide quels effets existent : entrée, révélation, cascade, compteurs, parallaxe, relief. Un métier technique en garde deux, un métier énergique les garde tous.",
        changes: 'la nature des mouvements sur tout le site',
      },
      {
        path: 'theme.motion.intensity',
        label: "Intensité de l'animation",
        kind: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        hint: '0 immobilise entièrement le site. Les visiteurs qui demandent moins de mouvement sont servis à 0 quoi qu’il arrive.',
        changes: 'la vitesse et l’ampleur de tous les mouvements',
      },
      {
        path: 'theme.density',
        label: 'Densité',
        kind: 'select',
        options: ['compact', 'regular', 'airy'],
        changes: 'les espacements de toutes les sections',
      },
      {
        path: 'theme.spacing.pageWidth',
        label: 'Largeur de page',
        kind: 'text',
        pattern: 'length',
        hint: 'Une longueur CSS, par exemple 1600px ou 90rem.',
        changes: 'la largeur des sections larges',
      },
      {
        path: 'theme.spacing.proseWidth',
        label: 'Largeur du texte long',
        kind: 'text',
        pattern: 'length',
        hint: 'Une longueur CSS, par exemple 68ch.',
        changes: 'la largeur des paragraphes et des pages légales',
      },
    ],
  },
  {
    id: 'legal',
    label: 'Informations légales',
    fields: [
      { path: 'legal.identity.legalName', label: 'Dénomination', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.legalForm', label: 'Forme juridique', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.shareCapital', label: 'Capital social', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.registrationNumber', label: "Numéro d'immatriculation", kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.vatNumber', label: 'Numéro de TVA', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.publicationDirector', label: 'Directeur de publication', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.identity.professionalBody', label: 'Organisme professionnel', kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.host.name', label: "Nom de l'hébergeur", kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.host.address', label: "Adresse de l'hébergeur", kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.host.phone', label: "Téléphone de l'hébergeur", kind: 'text', changes: 'les mentions légales' },
      { path: 'legal.privacy.controller', label: 'Responsable du traitement', kind: 'text', changes: 'la politique de confidentialité' },
      { path: 'legal.privacy.controllerContact', label: 'Contact du responsable', kind: 'text', changes: 'la politique de confidentialité' },
      { path: 'legal.privacy.supervisoryAuthority', label: 'Autorité de contrôle', kind: 'text', changes: 'la politique de confidentialité' },
    ],
  },
  {
    id: 'pwa',
    label: 'Application installable',
    fields: [
      { path: 'pwa.enabled', label: 'Activer l’installation et le mode hors ligne', kind: 'boolean', changes: 'le manifeste et le service worker' },
      {
        path: 'pwa.icons',
        label: 'Icônes',
        kind: 'collection',
        changes: "l'icône de l'application installée",
        item: [
          { key: 'src', label: 'Image', kind: 'imageSrc' },
          { key: 'sizes', label: 'Taille', kind: 'select', options: ['192x192', '512x512'] },
          { key: 'purpose', label: 'Usage', kind: 'select', options: ['any', 'maskable'] },
        ],
      },
    ],
  },
];

export const FIELDS: Map<string, FieldDef> = new Map(
  GROUPS.flatMap((group) => group.fields.map((field) => [field.path, field] as const)),
);

export class PatchError extends Error {}

const COLOR = /^#[0-9a-fA-F]{3,8}$/;

// What a value is allowed to look like when it will be interpolated into CSS.
// Anything that could close a declaration, a block or the style element itself
// is outside every one of them.
const PATTERNS = {
  length: /^-?[0-9]*\.?[0-9]+(px|rem|em|ch|ex|vw|vh|svh|dvh|vmin|vmax|%)$/,
  fontFamily: /^[A-Za-z0-9 ,'"_-]+$/,
  easing: /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\([0-9.,\s-]+\)|steps\([0-9,\sa-z-]+\))$/,
  // An absolute address, no path, no trailing slash. It is written into
  // robots.txt, the sitemap, the structured data and every share preview, so a
  // value that is not a real origin breaks all four at once.
  siteUrl: /^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(:[0-9]+)?$/i,
} as const;

function coerceScalar(
  kind: ItemField['kind'],
  value: unknown,
  field: { label: string; options?: string[]; min?: number; max?: number; pattern?: keyof typeof PATTERNS },
): unknown {
  switch (kind) {
    case 'text':
    case 'textarea':
    case 'imageSrc': {
      // Emptying a field is how a client says "not provided": a legal fact they
      // entered by mistake, an insurance they no longer hold, a tagline they
      // dropped. Refusing it made every entry irreversible from the back
      // office. Empty and absent are the same thing and are stored as absent;
      // a required field emptied this way is then refused by name by the
      // contract, which is the message the client should see.
      if (value === null || value === '') return null;
      if (typeof value !== 'string') throw new PatchError(`${field.label}: texte attendu`);
      if (field.pattern && !PATTERNS[field.pattern].test(value)) {
        throw new PatchError(`${field.label}: valeur invalide pour ce champ`);
      }
      if (kind === 'imageSrc' && !value.startsWith('/')) {
        throw new PatchError(`${field.label}: chemin d'image invalide`);
      }
      return value;
    }
    case 'paragraphs':
    case 'lines': {
      if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
        throw new PatchError(`${field.label}: liste de textes attendue`);
      }
      return value;
    }
    case 'image': {
      // An optional image can be removed the same way.
      if (value === null) return null;
      if (typeof value !== 'object') throw new PatchError(`${field.label}: image attendue`);
      const image = value as Record<string, unknown>;
      if (typeof image.src !== 'string' || !image.src.startsWith('/')) {
        throw new PatchError(`${field.label}: chemin d'image invalide`);
      }
      if (typeof image.alt !== 'string' || image.alt.trim() === '') {
        throw new PatchError(`${field.label}: le texte alternatif est obligatoire`);
      }
      return { src: image.src, alt: image.alt };
    }
    case 'color': {
      if (typeof value !== 'string' || !COLOR.test(value)) {
        throw new PatchError(`${field.label}: couleur hexadécimale attendue`);
      }
      return value;
    }
    case 'range': {
      const number = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(number)) throw new PatchError(`${field.label}: nombre attendu`);
      if (number < (field.min ?? 0) || number > (field.max ?? 1)) {
        throw new PatchError(`${field.label}: valeur hors bornes`);
      }
      return number;
    }
    case 'select': {
      if (typeof value !== 'string' || !(field.options ?? []).includes(value)) {
        throw new PatchError(`${field.label}: choix inconnu`);
      }
      return value;
    }
    case 'boolean': {
      if (typeof value !== 'boolean') throw new PatchError(`${field.label}: oui ou non attendu`);
      return value;
    }
    default:
      throw new PatchError(`${field.label}: type non pris en charge`);
  }
}

function coerce(field: FieldDef, value: unknown): unknown {
  if (field.kind !== 'collection') return coerceScalar(field.kind, value, field);

  if (!Array.isArray(value)) throw new PatchError(`${field.label}: liste attendue`);
  const item = field.item ?? [];
  return value.map((entry, index) => {
    if (entry === null || typeof entry !== 'object') {
      throw new PatchError(`${field.label} #${index + 1}: objet attendu`);
    }
    const source = entry as Record<string, unknown>;
    const built: Record<string, unknown> = {};
    for (const definition of item) {
      if (!(definition.key in source)) continue;
      if (source[definition.key] === undefined) continue;
      built[definition.key] = coerceScalar(definition.kind, source[definition.key], definition);
    }
    return built;
  });
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let node: Record<string, unknown> = target;
  for (const key of keys.slice(0, -1)) {
    const next = node[key];
    if (next === null || typeof next !== 'object' || Array.isArray(next)) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys.at(-1)!] = value;
}

// The allow list in action: a path absent from the schema is refused, whatever
// the request contains, and the whole document is validated afterwards.
export function applyPatch(
  content: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next = structuredClone(content);
  for (const [path, value] of Object.entries(patch)) {
    const field = FIELDS.get(path);
    if (!field) throw new PatchError(`champ inconnu: ${path}`);
    setPath(next, path, coerce(field, value));
  }
  return next;
}

export function getPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, source);
}
