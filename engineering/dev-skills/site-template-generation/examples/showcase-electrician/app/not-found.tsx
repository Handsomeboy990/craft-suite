import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

// The site's own 404, in its tokens and both themes, with its words in the
// content file. A framework default here is an unfinished site.
export default function NotFound() {
  const { notFound } = getContent().ui;
  return (
    <div className="status-page">
      <div className="page">
        <h1 className="status-page__title">{notFound.title}</h1>
        <p className="status-page__body">{notFound.body}</p>
        <p>
          <a className="button button--primary" href="/">
            {notFound.action}
          </a>
        </p>
      </div>
    </div>
  );
}
