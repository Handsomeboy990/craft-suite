import { getContent } from '@/lib/content';
import { mailConfigured } from '@/lib/mail';
import { requirePage } from '@/lib/guard';

export const dynamic = 'force-dynamic';

// Written for the person who owns the site and has never administered one.
// No vocabulary that has to be looked up, and no instruction that leads
// anywhere this back office does not go.
export default async function AdminHelp() {
  await requirePage('/admin/aide');
  const content = getContent();
  const retention = content.legal.privacy.retentionMonths;

  return (
    <>
      <h1>Aide</h1>
      <p className="admin-field__hint">
        Cette page répond aux questions que l’on se pose la première semaine. Vous ne pouvez rien
        casser de définitif depuis cet espace : tout ce que vous modifiez peut être annulé.
      </p>

      <section className="admin-group">
        <h2>Comment ça marche</h2>
        <p>
          Vous modifiez un texte, une image ou une couleur, vous enregistrez, et votre site public
          est à jour dès qu’on le recharge. Il n’y a rien à publier, rien à valider, personne à
          prévenir. Le site que voient vos visiteurs et cet espace sont le même site.
        </p>
        <p>
          À chaque enregistrement, une copie de l’état précédent est conservée. C’est ce qui rend
          l’erreur sans conséquence.
        </p>
      </section>

      <section className="admin-group">
        <h2>À quoi sert chaque rubrique</h2>
        <dl className="help-list">
          <dt>Tableau de bord</dt>
          <dd>Ce qu’il vous reste à faire, et vos messages non lus.</dd>

          <dt>Contenu</dt>
          <dd>
            Tous les textes du site : titres, descriptions, coordonnées, horaires, et vos
            informations légales. C’est la rubrique que vous ouvrirez le plus souvent.
          </dd>

          <dt>Images</dt>
          <dd>
            Vos photos. Envoyez-les telles qu’elles sortent de votre téléphone : elles sont
            redimensionnées et allégées automatiquement, et les informations de lieu que contient
            une photo de téléphone sont retirées avant la mise en ligne.
          </dd>

          <dt>Couleurs</dt>
          <dd>
            L’apparence : couleurs, arrondis, largeur, et l’intensité des animations. Chaque
            couleur est vérifiée pour rester lisible ; si une combinaison est refusée, c’est
            qu’elle serait illisible pour une partie de vos visiteurs.
          </dd>

          <dt>Messages</dt>
          <dd>
            Les demandes envoyées par le formulaire de votre site.{' '}
            {retention === null ? (
              <>
                Aucune durée de conservation n’est encore annoncée sur votre page de
                confidentialité : renseignez-la dans Contenu, puis supprimez vous-même les messages
                dont vous n’avez plus besoin.
              </>
            ) : (
              <>
                Elles sont conservées {retention} mois, puis effacées, comme l’annonce votre page de
                confidentialité.
              </>
            )}
          </dd>

          <dt>Historique</dt>
          <dd>
            La liste de vos enregistrements précédents. Un clic sur l’un d’eux remet le site dans
            l’état exact où il était à ce moment-là.
          </dd>

          <dt>Sécurité</dt>
          <dd>Votre mot de passe, et la liste des dernières modifications faites sur le site.</dd>
        </dl>
      </section>

      <section className="admin-group">
        <h2>Je me suis trompé</h2>
        <p>
          Ouvrez <a href="/admin/history">Historique</a> et choisissez la version d’avant votre
          erreur. Le site revient exactement à cet état, textes et images compris. Ce retour en
          arrière est lui-même enregistré, donc il s’annule aussi.
        </p>
      </section>

      <section className="admin-group">
        <h2>Mes informations légales</h2>
        <p>
          Les mentions légales et la page de confidentialité sont obligatoires pour un site
          professionnel. Elles se remplissent avec vos informations réelles : numéro
          d’immatriculation, adresse, hébergeur, assurance. Tant qu’une information manque, elle
          s’affiche entre crochets sur le site, visible de tous.
        </p>
        <p>
          N’inventez jamais une de ces valeurs pour faire disparaître un crochet. Une information
          légale fausse est plus risquée qu’une information absente. Si vous ne l’avez pas,
          demandez-la à votre comptable, à votre assureur ou à la personne qui a installé votre
          site.
        </p>
      </section>

      <section className="admin-group">
        <h2>J’ai oublié mon mot de passe</h2>
        <p>
          {mailConfigured() ? (
            <>
              Sur la page de connexion, utilisez <em>Mot de passe oublié</em>. Un lien valable
              trente minutes vous est envoyé par e-mail. Il ne sert qu’une fois.
            </>
          ) : (
            <>
              L’envoi d’e-mail n’est pas configuré sur ce serveur : la réinitialisation par lien
              n’est pas disponible. Contactez la personne qui a installé votre site, elle peut le
              remettre à zéro. Vous pouvez éviter la situation en changeant votre mot de passe dans{' '}
              <a href="/admin/security">Sécurité</a> pour un mot de passe que vous retiendrez.
            </>
          )}
        </p>
      </section>

      <section className="admin-group">
        <h2>Ce qui ne se modifie pas ici</h2>
        <p>
          La disposition des pages, les règles qui vérifient les champs du formulaire, et les
          clauses des pages légales qui vous engagent juridiquement. Ce sont des choix de
          construction : les changer demande une intervention technique. Tout le reste vous
          appartient.
        </p>
      </section>
    </>
  );
}
