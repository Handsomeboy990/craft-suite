import { mailConfigured } from './mail';
import { pushPublicKey } from './push';
import type { LegalPage } from './legal';
import type { ShowcaseContent } from './types';

// What is left to do, computed rather than remembered. A client who does not
// know the trade cannot be expected to notice that their site still shows a
// placeholder photograph or announces itself under an example address: the
// back office has to say so, in their words, with the place to go and fix it.

export type Task = {
  done: boolean;
  urgent: boolean;
  title: string;
  detail: string;
  where?: [string, string];
};

// Images live at many depths of the content tree, so they are collected by
// walking it rather than by listing the paths twice.
function collectImages(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.startsWith('/media/')) found.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectImages(item, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectImages(item, found));
  }
  return found;
}

export function buildChecklist(content: ShowcaseContent, legalPages: LegalPage[]): Task[] {
  const markers = legalPages.flatMap((page) => page.markers).length;
  const placeholders = new Set(
    collectImages(content).filter((src) => src.includes('placeholder')),
  ).size;
  const example = /example\.(com|org|net)/.test(content.site.baseUrl);
  const warned = Boolean(content.forms.notifyEmail) || Boolean(pushPublicKey());

  return [
    {
      done: markers === 0,
      urgent: true,
      title:
        markers === 0
          ? 'Vos informations légales sont complètes'
          : `${markers} information${markers > 1 ? 's' : ''} légale${markers > 1 ? 's' : ''} à compléter`,
      detail:
        markers === 0
          ? 'Vos pages Mentions légales et Confidentialité ne contiennent plus de passage manquant.'
          : 'Tant qu’elles manquent, elles s’affichent entre crochets sur votre site, visibles par tout le monde.',
      where: ['/admin/content', 'Compléter'],
    },
    {
      done: placeholders === 0,
      urgent: true,
      title:
        placeholders === 0
          ? 'Le site montre vos propres images'
          : `${placeholders} image${placeholders > 1 ? 's' : ''} de démonstration`,
      detail:
        placeholders === 0
          ? 'Plus aucune image livrée avec le modèle n’est visible sur le site.'
          : 'Ce sont les images fournies avec le modèle. Remplacez-les par les vôtres : envoyez-les telles qu’elles sortent du téléphone, elles sont redimensionnées pour vous.',
      where: ['/admin/media', 'Envoyer mes photos'],
    },
    {
      done: !example,
      urgent: true,
      title: example ? 'L’adresse de votre site n’est pas renseignée' : 'L’adresse de votre site est renseignée',
      detail: example
        ? 'Le site s’annonce encore sous une adresse d’exemple. C’est celle qu’utilisent Google et les aperçus de liens quand on partage votre site.'
        : 'Les aperçus de liens et les moteurs de recherche pointent vers la bonne adresse.',
      where: ['/admin/content', 'Corriger'],
    },
    {
      done: Boolean(content.site.favicon?.src),
      urgent: false,
      title: content.site.favicon?.src ? 'Votre icône d’onglet est en place' : 'Aucune icône d’onglet',
      detail:
        'La petite image qui apparaît dans l’onglet du navigateur, dans les favoris, et sur l’écran d’accueil du téléphone.',
      where: ['/admin/content', 'Choisir une icône'],
    },
    {
      done: warned,
      urgent: false,
      title: warned ? 'Vous êtes prévenu des nouveaux messages' : 'Rien ne vous signale un nouveau message',
      detail: warned
        ? 'Une demande envoyée par le formulaire vous parvient sans que vous ayez à ouvrir le site.'
        : 'Les demandes arrivent bien dans Messages, mais vous devez y penser. Indiquez une adresse e-mail de réception, ou activez les notifications ci-dessous.',
      where: ['/admin/content', 'Indiquer une adresse'],
    },
    {
      done: mailConfigured(),
      urgent: false,
      title: mailConfigured()
        ? 'Vous pouvez récupérer votre mot de passe seul'
        : 'La récupération de mot de passe est indisponible',
      detail: mailConfigured()
        ? 'Si vous l’oubliez, la page de connexion vous envoie un lien par e-mail.'
        : 'L’envoi d’e-mail n’est pas configuré sur le serveur. En cas d’oubli, il faudra passer par la personne qui a installé votre site.',
    },
  ];
}
