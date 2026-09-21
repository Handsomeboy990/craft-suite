import { requirePage } from '@/lib/guard';
import PasswordForm from '@/components/admin/PasswordForm';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const { csrf } = await requirePage('/admin/security');
  return (
    <>
      <h1>Sécurité</h1>
      <p className="admin-field__hint">
        Le premier mot de passe a été posé sur le serveur à l’installation. Tous les suivants se
        changent ici. Le changement ferme immédiatement toutes les sessions ouvertes, y compris
        celle-ci : vous serez invité à vous reconnecter.
      </p>
      <PasswordForm csrf={csrf} />
    </>
  );
}
