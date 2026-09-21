import type { FormField, LegalBlock, LegalClauses } from './types';

// Legal pages are assembled from the facts the owner provided. A fact that was
// not provided becomes a visible marker naming it. Nothing here writes a legal
// claim: the structural sentences carry no obligation, and every clause that
// binds comes from the owner's own text or stays marked.

export type LegalLine = { label: string; value: string; missing: boolean };

export type LegalSection = {
  heading: string;
  intro?: string;
  lines?: LegalLine[];
  list?: string[];
  paragraphs?: string[];
};

export type LegalPage = {
  slug: string;
  label: string;
  title: string;
  sections: LegalSection[];
  markers: string[];
};

export function marker(fact: string): string {
  return `[ à compléter : ${fact} ]`;
}

function fact(label: string, value: string | null | undefined): LegalLine {
  const provided = value !== null && value !== undefined && String(value).trim() !== '';
  return {
    label,
    value: provided ? String(value) : marker(label.toLowerCase()),
    missing: !provided,
  };
}

// A clause is the company's own text, or a marker naming the clause. There is
// no third branch: nothing here writes an obligation.
function clause(heading: string, text: string | null): LegalSection {
  return {
    heading,
    paragraphs: [text && text.trim() !== '' ? text : marker(`clause ${heading.toLowerCase()}`)],
  };
}

function formatAddress(address: LegalBlock['identity']['address']): string | null {
  if (!address) return null;
  return `${address.street}, ${address.postalCode} ${address.city}, ${address.country}`;
}

function collectMarkers(sections: LegalSection[]): string[] {
  const found: string[] = [];
  for (const section of sections) {
    for (const line of section.lines ?? []) if (line.missing) found.push(line.label);
    for (const paragraph of section.paragraphs ?? []) {
      if (paragraph.startsWith('[ à compléter')) found.push(paragraph);
    }
  }
  return found;
}

function legalNotice(legal: LegalBlock, siteName: string): LegalSection[] {
  const { identity, host } = legal;
  const isCompany =
    identity.legalForm.toLowerCase().includes('société') || Boolean(identity.shareCapital);
  return [
    {
      heading: 'Éditeur du site',
      intro: `Informations relatives à l'éditeur du site ${siteName}.`,
      lines: [
        fact('Dénomination sociale', identity.legalName),
        fact('Forme juridique', identity.legalForm),
        ...(isCompany ? [fact('Capital social', identity.shareCapital)] : []),
        fact('Siège social', formatAddress(identity.address)),
        fact("Numéro d'immatriculation", identity.registrationNumber),
        fact('Numéro de TVA intracommunautaire', identity.vatNumber),
        fact('Directeur de la publication', identity.publicationDirector),
        fact('Organisme professionnel', identity.professionalBody),
        fact(
          'Assurance professionnelle',
          identity.insurance
            ? `${identity.insurance.insurer}, police ${identity.insurance.policy}, ${identity.insurance.coverage}`
            : null,
        ),
      ],
    },
    {
      heading: 'Hébergement',
      lines: [
        fact("Nom de l'hébergeur", host.name),
        fact("Adresse de l'hébergeur", host.address),
        fact("Téléphone de l'hébergeur", host.phone),
      ],
    },
  ];
}

function privacy(legal: LegalBlock, formFields: FormField[]): LegalSection[] {
  const { privacy: block } = legal;
  return [
    {
      heading: 'Responsable du traitement',
      lines: [
        fact('Responsable du traitement', block.controller),
        fact('Contact', block.controllerContact),
      ],
    },
    {
      heading: 'Données collectées',
      intro:
        'Le site collecte uniquement les données saisies dans le formulaire de demande de devis, qui sont conservées sur le serveur du site et consultables par son propriétaire.',
      lines: formFields.map((field) => ({
        label: field.label,
        value: field.required ? 'obligatoire' : 'facultatif',
        missing: false,
      })),
    },
    {
      heading: 'Conservation',
      lines: [
        fact(
          'Durée de conservation',
          block.retentionMonths ? `${block.retentionMonths} mois` : null,
        ),
      ],
    },
    {
      heading: 'Destinataires',
      lines: [
        {
          label: 'Destinataires et sous-traitants',
          value:
            block.processors.length > 0
              ? block.processors.join(', ')
              : marker('destinataires des données'),
          missing: block.processors.length === 0,
        },
        {
          label: "Transferts hors de l'Union européenne",
          value: block.transfersOutsideEu
            ? marker('détail des transferts hors Union européenne')
            : 'Aucun',
          missing: block.transfersOutsideEu,
        },
      ],
    },
    {
      heading: 'Vos droits',
      paragraphs: [
        "Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation de leur traitement, ainsi que leur portabilité, et vous opposer à leur traitement.",
        block.controllerContact
          ? `Ces demandes se font auprès de ${block.controllerContact}.`
          : marker('adresse de contact pour exercer vos droits'),
      ],
      lines: [fact('Autorité de contrôle', block.supervisoryAuthority)],
    },
  ];
}

function terms(legal: LegalBlock, services: { title: string }[]): LegalSection[] {
  const { identity, clauses } = legal;
  const order: { heading: string; key: keyof LegalClauses }[] = [
    { heading: "Objet et champ d'application", key: 'scope' },
    { heading: 'Prix et validité du devis', key: 'prices' },
    { heading: 'Conditions de paiement', key: 'paymentTerms' },
    { heading: "Délais et exécution des travaux", key: 'executionTerms' },
    { heading: 'Droit de rétractation', key: 'withdrawal' },
    { heading: 'Garanties', key: 'warranty' },
    { heading: 'Responsabilité', key: 'liability' },
    { heading: 'Droit applicable', key: 'governingLaw' },
    { heading: 'Médiation et règlement des litiges', key: 'mediation' },
  ];

  return [
    {
      heading: 'Identification du prestataire',
      lines: [
        fact('Dénomination sociale', identity.legalName),
        fact('Siège social', formatAddress(identity.address)),
        fact("Numéro d'immatriculation", identity.registrationNumber),
      ],
    },
    {
      heading: 'Prestations concernées',
      intro: 'Les prestations proposées par le prestataire sont les suivantes.',
      list: services.map((service) => service.title),
    },
    ...order.map((entry) => clause(entry.heading, clauses[entry.key])),
  ];
}

function cookies(legal: LegalBlock): LegalSection[] {
  if (legal.cookies.length === 0) {
    return [
      {
        heading: 'Cookies déposés par ce site',
        paragraphs: [
          "Ce site ne dépose aucun cookie et n'utilise aucun traceur de mesure d'audience. Aucun consentement n'est donc demandé. Le choix de thème clair ou sombre est conservé dans le navigateur du visiteur, sur son appareil, et n'est jamais transmis.",
        ],
      },
    ];
  }

  return [
    {
      heading: 'Cookies déposés par ce site',
      lines: legal.cookies.map((cookie) => ({
        label: cookie.name,
        value: `${cookie.purpose}, ${cookie.lifetime}, déposé par ${cookie.owner}`,
        missing: false,
      })),
    },
    {
      heading: 'Consentement',
      paragraphs: [marker('modalités de recueil, de refus et de retrait du consentement')],
    },
  ];
}

export function buildLegalPages(
  legal: LegalBlock,
  siteName: string,
  formFields: FormField[],
  services: { title: string }[],
): LegalPage[] {
  return legal.pages.map((page) => {
    const sections =
      page.kind === 'legalNotice'
        ? legalNotice(legal, siteName)
        : page.kind === 'terms'
          ? terms(legal, services)
          : page.kind === 'privacy'
            ? privacy(legal, formFields)
            : cookies(legal);
    return {
      slug: page.slug,
      label: page.label,
      title: `${page.label} | ${siteName}`,
      sections,
      markers: collectMarkers(sections),
    };
  });
}
