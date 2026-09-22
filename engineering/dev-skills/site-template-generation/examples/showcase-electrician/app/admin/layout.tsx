import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { readSession } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { unreadCount } from '@/lib/messages';
import { cssVariables, themeScript } from '@/lib/tokens';
import LogoutButton from '@/components/admin/LogoutButton';
import '../globals.css';
import './admin.css';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

const LINKS = [
  ['/admin', 'Tableau de bord'],
  ['/admin/content', 'Contenu'],
  ['/admin/media', 'Images'],
  ['/admin/theme', 'Couleurs'],
  ['/admin/messages', 'Messages'],
  ['/admin/history', 'Historique'],
  ['/admin/security', 'Sécurité'],
  ['/admin/aide', 'Aide'],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const content = getContent();
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const session = await readSession();
  const unread = session ? unreadCount() : 0;

  return (
    <html lang={content.site.locale} suppressHydrationWarning>
      <head>
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: cssVariables(content.theme) }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        {session ? <meta name="csrf-token" content={session.csrf} /> : null}
      </head>
      <body>
        {session ? (
          <div className="admin">
            <div>
              <div className="admin__bar">
                <p className="admin__title">{content.site.name}</p>
                <a className="admin-small" href="/" target="_blank" rel="noreferrer">
                  Voir le site
                </a>
                <LogoutButton csrf={session.csrf} />
              </div>
              <nav aria-label="Administration">
                <ul className="admin__nav">
                  {LINKS.map(([href, label]) => (
                    <li key={href}>
                      <a href={href}>
                        {label}
                        {href === '/admin/messages' && unread > 0 ? (
                          <> <span className="admin__badge">{unread}</span></>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <main className="admin__main">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
