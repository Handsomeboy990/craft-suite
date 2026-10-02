# site-template-shared

The code the two site examples, `portfolio-sports-coach` and
`showcase-electrician`, have in common: the site shell (theme toggle, install
prompt, reveal, counter, parallax, legal document), the back office components
(content editor, login, password, media, inbox, history, reset, push) and the
library behind them (sessions and CSRF, rate limits, uploads, the file store,
history, messages, mail, push, motion, the token bridge, the data paths). It is
the single source for those files: neither example carries a copy.

## What stays in each example

The content model. `lib/types.ts`, `lib/schema.ts`, `lib/legal.ts` and
`lib/content.ts` belong to the instance, and nothing here imports them. The
shared code declares the shape it reads and receives the value:

| Shared module | Receives | Declared here as |
|---|---|---|
| `components/site/ThemeToggle.tsx` | the instance's ui strings, as `ui` | `ThemeToggleStrings` |
| `components/site/AppShell.tsx` | the instance's ui strings, as `ui` | `AppShellStrings` |
| `components/site/LegalDocument.tsx` | one page built by the instance's `lib/legal.ts` | `LegalDocumentPage` |
| `components/admin/ContentEditor.tsx` | the instance's `GROUPS`, as `groups` | `Group`, in `lib/fields.ts` |
| `lib/tokens.ts` | the instance's `content.theme`, in `cssVariables` | `TokenTheme`, `TokenPalette` |

`lib/fields.ts` is the language a contract is written in (`FieldKind`,
`ItemField`, `FieldDef`, `Group`, `getPath`). Each instance's `lib/schema.ts`
imports it and declares its own fields with it. TypeScript checks every hand
over at the call site, so an instance whose content model stops satisfying a
shape fails its typecheck, naming the field.

## How an example consumes it

```
package.json      "site-template-shared": "file:../_shared"
.npmrc            install-links=true
next.config.mjs   transpilePackages: ['site-template-shared']
imports           site-template-shared/lib/auth, site-template-shared/components/site/Reveal
```

The package ships TypeScript source and Next compiles it with the app.
`install-links` makes npm copy it into the app's `node_modules` instead of
linking it: linked, the files sit outside the app's root and the build fails
on every shared import, and they would resolve `next`, `react`, `sharp` and the
rest from `_shared` itself, where none is installed. The
libraries are peer dependencies, so the app's own versions are the ones used,
and there is one React.

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
Code that only one instance needs belongs in that instance, not here.

## Taking an example out of the repository

Copy the example directory and this one. Keep them side by side, or change the
`file:` path in the example's `package.json`. Each example's README says how to
fold these files into the project instead, if a single standalone directory is
wanted.
