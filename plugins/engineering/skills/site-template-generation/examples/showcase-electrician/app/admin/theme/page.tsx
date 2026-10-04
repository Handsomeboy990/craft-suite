// Shared page: ../_shared/admin/ThemePage.tsx, given this instance. Next reads the route and its segment config here.
import ThemePage from 'site-template-shared/admin/ThemePage';
import { instance } from '@/lib/instance';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ThemePage instance={instance} />;
}
