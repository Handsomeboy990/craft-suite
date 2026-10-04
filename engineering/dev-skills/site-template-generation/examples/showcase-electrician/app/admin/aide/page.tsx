// Shared page: ../_shared/admin/HelpPage.tsx, given this instance. Next reads the route and its segment config here.
import HelpPage from 'site-template-shared/admin/HelpPage';
import { instance } from '@/lib/instance';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <HelpPage instance={instance} />;
}
