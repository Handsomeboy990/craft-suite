// The routes an instance actually serves, asked of the instance.
//
// These scripts used to carry a table of two named templates, which meant they
// could verify the two sites that already existed and nothing that was
// generated afterwards. A harness that only works on the examples it was
// written against proves very little.
//
// Every instance serves a sitemap listing exactly the pages it serves, legal
// slugs included, so that is the source. An instance without one fails the
// gate on being found anyway, and saying so here is better than guessing.

export async function routesOf(base, { extra = [] } = {}) {
  const response = await fetch(`${base}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(
      `${base}/sitemap.xml answered ${response.status}. An instance that serves no sitemap ` +
        'cannot say which pages it has, and fails gate point 13 before this one.',
    );
  }
  const xml = await response.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => {
      try {
        return new URL(match[1]).pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map((path) => (path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path));

  if (paths.length === 0) {
    throw new Error(`${base}/sitemap.xml lists no page.`);
  }
  return [...new Set([...paths, ...extra])];
}

// A path no instance serves, so the site's own 404 is what answers.
export const MISSING_ROUTE = '/page-introuvable-pour-le-test';
