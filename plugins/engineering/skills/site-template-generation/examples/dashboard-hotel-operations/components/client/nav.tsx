'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavGroup = {
  label: string | null;
  links: { href: string; label: string; count?: number; countLabel?: string }[];
};

// The current module is marked by more than colour: weight, a bar, and
// aria-current="page". A counter is announced with its meaning and absent
// when zero.
export function NavLinks({ groups, label }: { groups: NavGroup[]; label: string }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || (pathname.startsWith(`${href}/`) && !groups.some((group) => group.links.some((link) => link.href !== href && link.href.startsWith(`${href}/`) && pathname.startsWith(link.href))));
  return (
    <nav aria-label={label} className="nav">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="nav__group">
          {group.label ? <h2 className="nav__heading">{group.label}</h2> : null}
          <ul>
            {group.links.map((link) => {
              const current = active(link.href);
              return (
                <li key={link.href}>
                  <Link href={link.href} className={current ? 'nav__link nav__link--current' : 'nav__link'} aria-current={current ? 'page' : undefined}>
                    <span>{link.label}</span>
                    {link.count ? (
                      <span className="nav__count">
                        <span aria-hidden="true">{link.count}</span>
                        <span className="visually-hidden">{link.countLabel}</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
