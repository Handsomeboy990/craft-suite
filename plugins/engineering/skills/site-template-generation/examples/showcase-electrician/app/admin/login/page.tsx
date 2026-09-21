import { isConfigured, readSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await readSession()) redirect('/admin');
  const { next } = await searchParams;
  const target = next && next.startsWith('/admin') ? next : '/admin';

  return (
    <div className="admin-login">
      <div style={{ width: '100%', maxWidth: '24rem' }}>
        <h1>Administration</h1>
        {isConfigured() ? null : (
          <p className="form__status form__status--error">
            Aucun mot de passe n’est défini sur cette instance. Exécutez
            <code> npm run set-password -- &apos;votre mot de passe&apos; </code>
            sur le serveur.
          </p>
        )}
        <LoginForm next={target} />
      </div>
    </div>
  );
}
