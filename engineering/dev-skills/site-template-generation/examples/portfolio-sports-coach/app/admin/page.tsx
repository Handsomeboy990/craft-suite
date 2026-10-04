// Shared page: ../_shared/admin/HomePage.tsx, given this instance. Next reads the route and its segment config here.
import HomePage from 'site-template-shared/admin/HomePage';
import { instance } from '@/lib/instance';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <HomePage instance={instance} />;
}
