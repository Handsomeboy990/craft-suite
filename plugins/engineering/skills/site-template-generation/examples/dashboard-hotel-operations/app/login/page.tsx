import Link from 'next/link';
import { getConfig } from '@/lib/config';
import { LoginForm } from '@/components/client/forms';

export const dynamic = 'force-dynamic';

// The way back is a path on this site and nothing else: never another origin.
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  return value.slice(0, 1000);
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const config = getConfig();
  const search = await searchParams;
  return (
    <section className="panel panel--narrow" aria-labelledby="login-title">
      <h1 id="login-title">{config.ui.login!.title}</h1>
      <p className="muted">{config.ui.login!.intro}</p>
      <LoginForm next={safeNext(search.next)} expired={search.expired === '1'} />
      <p>
        <Link href="/privacy">{config.privacy.title}</Link>
      </p>
    </section>
  );
}
