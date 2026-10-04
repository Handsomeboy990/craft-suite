# site-template-shared

The code the two site examples, `portfolio-sports-coach` and
`showcase-electrician`, have in common. It is the single source for these
files: neither example carries a copy.

```
components/site    the site shell: theme toggle, install prompt, reveal,
                   counter, parallax, legal document
components/admin   the back office components: content editor, login,
                   password, media, inbox, history, reset, push
admin/             the back office pages, its frame (AdminLayout) and admin.css
routes/            the route handlers: the admin API, the public form, the
                   media, the manifest, robots.txt and the service worker
lib/               sessions and CSRF, the request proxy and its content
                   security policy, rate limits, uploads, the file store,
                   history, messages, mail, push, motion, the token bridge, the
                   data paths, the field language, the checklist, and the
                   instance contract
config/            the Next configuration both apps spread
scripts/           set-password, push-keys and seed-media
```

## What stays in each example

The content model, the public pages, and what Next requires inside the app.

`lib/types.ts`, `lib/schema.ts`, `lib/legal.ts` and `lib/content.ts` belong to
the instance, and nothing here imports them. Each instance hands them over
once, in its own `lib/instance.ts`, as a `SiteInstance` declared in
`lib/site-instance.ts`: the loader and the writer, the allow list and its
error, the field groups, its legal pages, and its public form (the fields, the
inbox label a submission is stored under, the notification title). The shared
code declares only the part of the content it reads, `InstanceContent`, so an
instance whose model stops satisfying it fails its typecheck at that hand over.

| Shared module | Receives | Declared here as |
|---|---|---|
| `routes/admin/content.ts`, `fields.ts`, `history.ts`, `reset.ts` | the instance | `SiteInstance`, in `lib/site-instance.ts` |
| `routes/contact.ts`, `manifest.ts`, `robots.ts` | the instance | `SiteInstance` |
| `admin/AdminLayout.tsx`, `HomePage.tsx`, `HelpPage.tsx`, `ContentPage.tsx`, `ThemePage.tsx` | the instance, as `instance` | `SiteInstance` |
| `lib/checklist.ts` | the content and the instance's legal pages | `InstanceContent` |
| `components/site/ThemeToggle.tsx` | the instance's ui strings, as `ui` | `ThemeToggleStrings` |
| `components/site/AppShell.tsx` | the instance's ui strings, as `ui` | `AppShellStrings` |
| `components/site/LegalDocument.tsx` | one page built by the instance's `lib/legal.ts` | `LegalDocumentPage` |
| `components/admin/ContentEditor.tsx` | the instance's groups, as `groups` | `Group`, in `lib/fields.ts` |
| `lib/tokens.ts` | the instance's `content.theme`, in `cssVariables` | `TokenTheme`, `TokenPalette` |

Next finds a route only by a file under the app's `app/`, and reads a route's
segment config (`runtime`, `dynamic`), the proxy's `matcher` and the app's
configuration from the app itself: a re-exported config is ignored. So each
example keeps a thin file per shared route that re-exports the handler or
page, or passes its instance to a factory, and declares its segment config; a
`proxy.ts` that re-exports `lib/proxy.ts` and writes its matcher; and a
`next.config.mjs` that spreads `config/next-config.mjs` and adds
`transpilePackages`. `../app-local-files.txt` lists those files, and every
other file still identical in both examples, with the reason each stays.

The service worker is served by `routes/service-worker.ts` at `/sw.js`,
because `public/` is only read from the app's own directory. The URL, and so
the worker's scope, is unchanged.

## How an example consumes it

```
package.json      "site-template-shared": "file:../_shared"
                  npm scripts: node node_modules/site-template-shared/scripts/...
.npmrc            install-links=true
next.config.mjs   ...siteNextConfig, transpilePackages: ['site-template-shared']
proxy.ts          export { proxy } from 'site-template-shared/lib/proxy'
app/**/route.ts   export { POST } from 'site-template-shared/routes/admin/login'
                  export const { GET, PUT } = contentRoute(instance)
imports           site-template-shared/lib/auth, site-template-shared/components/site/Reveal
```

The package ships TypeScript source and Next compiles it with the app.
`install-links` makes npm copy it into the app's `node_modules` instead of
linking it: linked, the files sit outside the app's root and the build fails
on every shared import, and they would resolve `next`, `react`, `sharp` and the
rest from `_shared` itself, where none is installed. The
libraries are peer dependencies, so the app's own versions are the ones used,
and there is one React. A new top level directory here must be added to
`files` in `package.json`, or npm leaves it out of the copy.

Modules here import one another by relative path, never through an alias, so
the files work wherever they are placed.

## Changing it

Edit the files here, then in each example refresh the installed copy, which npm
does not notice by itself, and rebuild:

```bash
rm -rf node_modules/site-template-shared && npm install
npm run typecheck && npm run build
```

A change here changes both examples, so both are built before it is committed.
Code that only one instance needs belongs in that instance, not here. A file
added here is listed in `../shared-files.txt`; the CI guard refuses one that is
not.

## Taking an example out of the repository

Copy the example directory and this one. Keep them side by side, or change the
`file:` path in the example's `package.json`. Each example's README says how to
fold these files into the project instead, if a single standalone directory is
wanted.
