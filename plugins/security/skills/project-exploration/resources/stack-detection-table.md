# Stack detection table

What to read, and what it proves. Never the reverse.

## Package manager

| Lockfile | Manager | Run command prefix |
|---|---|---|
| `package-lock.json` | npm | `npm run` |
| `pnpm-lock.yaml` | pnpm | `pnpm` |
| `yarn.lock` | yarn | `yarn` |
| `bun.lockb` or `bun.lock` | bun | `bun run` |
| `poetry.lock` | poetry | `poetry run` |
| `uv.lock` | uv | `uv run` |
| `Pipfile.lock` | pipenv | `pipenv run` |
| `Gemfile.lock` | bundler | `bundle exec` |
| `go.sum` | go modules | `go` |
| `Cargo.lock` | cargo | `cargo` |
| `composer.lock` | composer | `composer` |

Two lockfiles present means a migration in progress or a stale file. Check
modification dates and the CI workflow to see which one the pipeline uses.

## Framework, confirmed by structure not by name

| Evidence | Conclusion |
|---|---|
| `next` dependency plus `app/` with `layout.tsx` | Next.js App Router |
| `next` dependency plus `pages/` only | Next.js Pages Router |
| both `app/` and `pages/` | hybrid, check which holds the touched route |
| `nuxt` plus `nuxt.config.ts` | Nuxt |
| `@remix-run/*` or `react-router` v7 with `routes.ts` | Remix or React Router framework mode |
| `@sveltejs/kit` plus `src/routes/` | SvelteKit |
| `@angular/core` plus `angular.json` | Angular |
| `vite` plus `src/main.tsx` and no meta framework | Vite SPA |
| `express` plus an app factory | Express |
| `fastify` plus a plugin tree | Fastify |
| `@nestjs/core` plus `*.module.ts` | NestJS |
| `hono` plus route chaining | Hono |
| `fastapi` plus `APIRouter` | FastAPI |
| `django` plus `settings.py` and `urls.py` | Django |
| `flask` plus `app.route` decorators | Flask |
| `rails` plus `config/routes.rb` | Rails |
| `laravel/framework` plus `routes/web.php` | Laravel |
| `spring-boot-starter-web` | Spring Boot |

## Data layer

| Evidence | Conclusion |
|---|---|
| `prisma/schema.prisma` | Prisma, engine read from the datasource block |
| `drizzle.config.ts` plus `schema.ts` exporting tables | Drizzle |
| `*.entity.ts` with decorators plus `typeorm` | TypeORM |
| `models.py` with `models.Model` | Django ORM |
| `alembic/versions/` | SQLAlchemy with Alembic |
| `db/migrate/*.rb` | Active Record |
| `mongoose` plus `new Schema` | MongoDB via Mongoose |
| raw SQL template literals plus `pg` or `postgres` | direct driver |
| `supabase` client | Supabase, check row level security policies |

The engine is read from the connection string shape or the datasource
declaration, never from the ORM name alone.

## Authentication

| Evidence | Conclusion |
|---|---|
| `next-auth` or `@auth/core` plus a config file | Auth.js |
| `@clerk/*` plus middleware matcher | Clerk |
| `lucia` plus a session table | Lucia |
| `passport` plus strategies | Passport |
| `jsonwebtoken` sign and verify calls | hand rolled JWT, audit carefully |
| a `sessions` table plus an opaque cookie token | server side sessions |
| `supabase.auth` | Supabase auth, check RLS as the real control |

Hand rolled auth is not a defect by itself. It raises the audit depth.

## Validation

| Evidence | Conclusion |
|---|---|
| `zod` | Zod schemas, check where `parse` is actually called |
| `yup`, `joi`, `valibot`, `arktype` | equivalent, same question |
| `class-validator` plus DTO decorators | NestJS style pipes |
| `pydantic` | FastAPI or standalone models |
| framework form request classes | Laravel, Django forms |
| none found | boundaries are unvalidated until proven otherwise |

Presence of a validation library proves nothing. What matters is whether the
schema is applied at the boundary the task touches.

## Test tooling

| Evidence | Conclusion |
|---|---|
| `vitest.config.*` | Vitest |
| `jest.config.*` or a `jest` manifest key | Jest |
| `playwright.config.*` | Playwright end to end |
| `cypress.config.*` | Cypress |
| `@testing-library/*` | component tests |
| `pytest.ini`, `tox.ini`, `conftest.py` | pytest |
| `*_test.go` | go test |
| `spec/` plus `rspec` | RSpec |
| none | no automated tests, state it plainly |
