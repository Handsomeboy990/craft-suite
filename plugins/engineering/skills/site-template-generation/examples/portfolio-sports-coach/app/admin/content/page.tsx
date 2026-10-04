// Shared page: ../_shared/admin/ContentPage.tsx, given this instance. Next reads the route and its segment config here.
import ContentPage from 'site-template-shared/admin/ContentPage';
import { instance } from '@/lib/instance';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ContentPage instance={instance} />;
}
