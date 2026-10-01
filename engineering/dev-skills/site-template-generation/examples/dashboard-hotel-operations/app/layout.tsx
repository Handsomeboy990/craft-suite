import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { currentSession } from '@/lib/auth';
import { fill, getConfig } from '@/lib/config';
import { get, isDemonstration } from '@/lib/db';
import { time } from '@/lib/format';
import { MODULES, can } from '@/lib/matrix';
import { cssVariables, themeScript } from '@/lib/tokens';
import { NavDrawer, SignOutButton, ThemeToggle } from '@/components/client/shell';
import { NavLinks, type NavGroup } from '@/components/client/nav';
import { OfflineBanner, ServiceWorker, Toaster, UiProvider } from '@/components/client/ui';
import './globals.css';

// Records are read at request time behind a session; nothing is prerendered.
export const dynamic = 'force-dynamic';

const PLAIN = ['/login', '/setup', '/offline', '/privacy'];

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: { default: config.site.name, template: `%s | ${config.site.shortName}` },
    manifest: '/manifest.webmanifest',
    icons: { icon: '/brand-icon' },
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = getConfig();
  const list = await headers();
  const nonce = list.get('x-nonce') ?? undefined;
  const path = (list.get('x-url') ?? '/').split('?')[0]!;
  const plain = PLAIN.includes(path);
  const { session } = plain ? { session: null } : await currentSession();
  const demo = isDemonstration();
  const loadedAt = time(config, new Date().toISOString());

  let groups: NavGroup[] = [];
  if (session) {
    const role = session.account.role;
    const counters: Record<string, { count: number; label: string }> = {};
    if (can(role, 'items', 'view')) {
      const count = Number(get('SELECT COUNT(*) AS c FROM items WHERE quantity <= threshold')?.c ?? 0);
      counters.items = { count, label: fill(config.modules.items.counter ?? '', { n: count }) };
    }
    if (can(role, 'folios', 'view')) {
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.site.timeZone }).format(new Date());
      const count = Number(
        get('SELECT COUNT(*) AS c FROM folios WHERE voided = 0 AND paid < total AND due_date < ?', [today])?.c ?? 0,
      );
      counters.folios = { count, label: fill(config.modules.folios.counter ?? '', { n: count }) };
    }
    groups = [{ label: null, links: [{ href: '/', label: config.modules.overview.label }] }];
    for (const domain of config.nav.domains) {
      const links = domain.modules
        .filter((module) => can(role, module, 'view'))
        .map((module) => ({
          href: MODULES[module].route,
          label: config.modules[module].label,
          count: counters[module]?.count,
          countLabel: counters[module]?.label,
        }));
      if (links.length) groups.push({ label: domain.label, links });
    }
  }

  return (
    <html lang={config.site.locale} suppressHydrationWarning>
      <head>
        <meta name="csrf-token" content={session?.csrf ?? ''} />
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: cssVariables(config.theme) }} />
        {/* Applied before first paint: the page never flashes the wrong theme. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <UiProvider ui={config.ui} csrf={session?.csrf ?? ''} loadedAt={loadedAt}>
          <a className="skip-link" href="#main">
            {config.ui.shell!.skipLink}
          </a>
          {demo ? (
            <p className="banner banner--info demo-banner" data-demo="true">
              {config.ui.shell!.demo}
            </p>
          ) : null}
          <OfflineBanner />
          {session ? (
            <div className="shell">
              <NavDrawer>
                <p className="rail__brand">{config.site.name}</p>
                <NavLinks groups={groups} label={config.ui.shell!.navLabel!} />
              </NavDrawer>
              <header className="topbar">
                <p className="topbar__brand">{config.site.shortName}</p>
                <div className="topbar__tools">
                  <ThemeToggle />
                  <p className="account">
                    {fill(config.ui.shell!.account!, { name: session.account.name, role: config.roles[session.account.role] })}
                  </p>
                  <SignOutButton />
                </div>
              </header>
              <main id="main" className="work" tabIndex={-1}>
                {children}
              </main>
            </div>
          ) : (
            <main id="main" className="plain" tabIndex={-1}>
              <p className="plain__brand">{config.site.name}</p>
              {children}
            </main>
          )}
          <Toaster />
          <ServiceWorker />
        </UiProvider>
      </body>
    </html>
  );
}
