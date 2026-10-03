# Example: a small directory, its server boundary declared

A worked example of section 4's server function rule, written for this skill.
The code is original and framework neutral: `serverFunction` below is a small
helper defined here, not any framework's API, and the store is PostgreSQL
reached through a parameterised `sql` tag. Adapt the shapes to the project's
own framework; keep the three properties.

Feature: a directory of community workshops. An organiser creates a workshop as
a draft inside an organisation they belong to, and publishes it later. Anyone
can browse published workshops. Every detail page view is counted.

The three properties the example exists to show:

```
boundary     schema, authentication and authorization declared on the
             definition, the create path included
visibility   which rows a caller sees is decided on the server, from the
             session, never from a flag the page sends
counter      the view count is incremented by the store, never read and set
```

## 1. Schema, where the rules start

```sql
create table workshops (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references organisations(id) on delete cascade,
  title            text not null check (length(title) between 3 and 120),
  status           text not null default 'draft'
                   check (status in ('draft', 'published')),
  view_count       bigint not null default 0,
  created_by       uuid not null references users(id),
  created_at       timestamptz not null default now()
);

create index workshops_published_idx on workshops (created_at desc)
  where status = 'published';
create index workshops_org_idx on workshops (organisation_id, status);
```

The status check repeats the schema enum on purpose: the database does not
trust the application either.

## 2. The helper that makes the boundary readable

```ts
type Access<I> =
  | { kind: "public" }
  | { kind: "session"; authorize: (user: User, input: I) => Promise<boolean> }

export function serverFunction<I, O>(def: {
  input: z.ZodType<I>
  access: Access<I>
  handler: (ctx: { input: I; user: User | null }) => Promise<O>
}) {
  return async (raw: unknown, request: Request): Promise<O> => {
    const parsed = def.input.safeParse(raw)
    if (!parsed.success) throw httpError(400, "invalid_body", parsed.error.flatten())

    const user = await readSession(request)
    if (def.access.kind === "session") {
      if (!user) throw httpError(401, "unauthenticated")
      if (!(await def.access.authorize(user, parsed.data))) throw httpError(404, "not_found")
    }
    return def.handler({ input: parsed.data, user })
  }
}
```

Nothing reaches the handler unparsed, and a function cannot exist without
stating its access. `public` is a word a reviewer reads, not an absence. A
refused authorization answers 404, so a caller cannot learn that an
organisation exists by probing it.

## 3. Create, authorized like an update

```ts
const CreateWorkshop = z.object({
  organisationId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
})

export const createWorkshop = serverFunction({
  input: CreateWorkshop,
  access: {
    kind: "session",
    authorize: (user, input) => isOrganiser(user.id, input.organisationId),
  },
  handler: async ({ input, user }) => {
    const [row] = await sql`
      insert into workshops (organisation_id, title, created_by)
      values (${input.organisationId}, ${input.title}, ${user!.id})
      returning id, title, status`
    return row
  },
})
```

Three things the schema does not accept, on purpose: `status`, `createdBy` and
`viewCount`. A new workshop is a draft because the server says so, its author
is the session, and its count starts at zero. The membership check is the same
one the update and publish functions use; a create path that skips it lets any
signed-in user write into any organisation.

The form imports `CreateWorkshop` for its own field errors. The schema is pure
(types, lengths, formats), so running it on the server adds no side effect.

## 4. List, visibility decided on the server

```ts
const ListWorkshops = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(20),
})

export const listWorkshops = serverFunction({
  input: ListWorkshops,
  access: { kind: "public" },
  handler: async ({ input, user }) => sql`
    select w.id, w.title, w.status, w.created_at
    from workshops w
    where (
      w.status = 'published'
      or (
        ${user?.id ?? null}::uuid is not null
        and w.organisation_id in (
          select organisation_id from memberships
          where user_id = ${user?.id ?? null} and role = 'organiser'
        )
      )
    )
    and (${input.cursor ?? null}::timestamptz is null
         or w.created_at < ${input.cursor ?? null})
    order by w.created_at desc
    limit ${input.limit}`,
})
```

The input has no `includeDrafts`, no `status`, no `organisationId` filter that
widens the result. An anonymous caller sees published rows. An organiser sees
published rows plus the drafts of their own organisations, because the
session says so. A caller who adds `status: "draft"` to the payload gets it
stripped by the schema and sees exactly what they saw before.

## 5. The view counter, atomic in the store

```ts
const RecordView = z.object({ id: z.string().uuid() })

export const recordView = serverFunction({
  input: RecordView,
  access: { kind: "public" },
  handler: async ({ input }) => {
    const rows = await sql`
      update workshops
      set view_count = view_count + 1
      where id = ${input.id} and status = 'published'
      returning view_count`
    if (rows.length === 0) throw httpError(404, "not_found")
    return { views: rows[0].view_count }
  },
})
```

The increment happens inside the statement, so two concurrent views produce
two increments. The tempting version reads the row, adds one in the
application and writes the result back; two views that read the same value
both write the same value, and one is lost. The `status = 'published'` clause
also keeps a draft's id from being confirmed by counting it.

`recordView` is anonymous and writes, so it sits behind a per-source limit
whose check and count are themselves atomic, per `rate-limiting` section 4.
Where the framework offers a hook that runs after the response, the call goes
there, so the page does not wait on the write.

## 6. Contract tests, before any UI

```
createWorkshop, organiser of the organisation      201, status draft
createWorkshop, signed in, not a member            404 not_found
createWorkshop, anonymous                          401 unauthenticated
createWorkshop, payload with status "published"    201, status draft
listWorkshops, anonymous                           published rows only
listWorkshops, anonymous, payload status "draft"   published rows only
listWorkshops, organiser                           published plus own drafts
listWorkshops, organiser of another organisation   no draft of this one
recordView, 200 concurrent calls on one workshop   view_count rises by 200
recordView, draft id                               404 not_found
```

The concurrency line is the one a read-then-write version fails, and the only
one that proves the counter. It runs against the real database, not a mock.

## 7. Against the checklist

`resources/server-boundary-checklist.md`, every server function above:

| Line | Holds |
|---|---|
| schema declared at the definition | yes, `input` on all three |
| authentication declared at the definition | yes, `access` on all three |
| authorization on the object and its parent | yes, organisation membership |
| create path checked like the update path | yes, the same `isOrganiser` |
| identity from the session | yes, `created_by` is `user.id` |
| visibility from the session | yes, no visibility parameter exists |
| ownership in the query | yes, the membership subquery |
| counters incremented by the store | yes, `view_count = view_count + 1` |
| anonymous writes rate limited | yes, `recordView` |
| shared schema pure | yes, no fetch, no query |
