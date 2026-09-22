import { mailConfigured } from '@/lib/mail';
import ResetForm from '@/components/admin/ResetForm';

export const dynamic = 'force-dynamic';

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="admin-login">
      <div style={{ width: '100%', maxWidth: '26rem' }}>
        <h1>Mot de passe oublié</h1>
        {mailConfigured() ? null : (
          <p className="form__status form__status--error">
            L’envoi d’e-mail n’est pas configuré sur ce serveur : aucun lien ne peut vous être
            envoyé. Contactez la personne qui a installé votre site, elle peut vous redonner un
            accès en quelques minutes.
          </p>
        )}
        <ResetForm token={token ?? null} />
        <p className="admin-field__hint">
          <a href="/admin/login">Revenir à la connexion</a>
        </p>
      </div>
    </div>
  );
}
