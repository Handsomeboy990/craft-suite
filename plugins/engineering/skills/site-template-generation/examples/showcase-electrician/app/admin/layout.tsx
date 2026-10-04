// Shared frame: ../_shared/admin/AdminLayout.tsx, given this instance. The two
// stylesheets are imported here, the app's own first, so their order is set
// where Next reads it.
import type { ReactNode } from 'react';
import AdminLayout from 'site-template-shared/admin/AdminLayout';
import { instance } from '@/lib/instance';
import '../globals.css';
import 'site-template-shared/admin/admin.css';

export const dynamic = 'force-dynamic';

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayout instance={instance}>{children}</AdminLayout>;
}
