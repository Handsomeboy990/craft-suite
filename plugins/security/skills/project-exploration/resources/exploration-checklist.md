# Exploration checklist

Ordered. Each line names the artefact that answers it. Stop at the depth the
task requires.

## Stack

- [ ] Package manifest read, dependencies and devDependencies listed.
- [ ] Lockfile identified, package manager derived from its name.
- [ ] Language version read from the manifest or the runtime config.
- [ ] Framework and major version confirmed by a real source file, not only
      by the manifest.
- [ ] Scripts section read: install, dev, build, test, lint, typecheck.
- [ ] Formatter and linter configuration located.
- [ ] Type checking present or absent, strictness level read.

## Shape

- [ ] Single application, monorepo or fragment, with the evidence.
- [ ] Workspace list when applicable.
- [ ] Top level source directories, one line of purpose each.
- [ ] Generated and vendored directories identified and excluded from reads.

## Routes

- [ ] Routing mechanism identified: file system, decorators, explicit router.
- [ ] Backend routes enumerated with method, path, handler file.
- [ ] Frontend routes enumerated with path and page file.
- [ ] Public versus authenticated status recorded per route.
- [ ] Middleware or proxy layer located and its ordering understood.

## Data

- [ ] Database engine identified from config or connection string shape.
- [ ] ORM, query builder or raw driver identified.
- [ ] Schema file or model definitions read.
- [ ] Migrations directory located, latest migration noted.
- [ ] Entities relevant to the task listed with their relations.
- [ ] Indexes on the columns the task will filter or join on, checked.

## Authentication and authorization

- [ ] Identity mechanism: session cookie, JWT, provider SDK, API key.
- [ ] Where credentials are verified on an incoming request.
- [ ] Where the current user is attached to the request context.
- [ ] Where authorization decisions are made: middleware, handler, service,
      data layer.
- [ ] Role or permission model and its storage location.
- [ ] Object level ownership checks, present or absent.

## Boundaries

- [ ] HTTP handlers accepting a body.
- [ ] Query and route parameters consumed.
- [ ] Form actions and server actions.
- [ ] Webhook receivers and their signature verification.
- [ ] Queue and job consumers.
- [ ] File upload endpoints.
- [ ] CLI entry points and scheduled tasks.

## Integrations

- [ ] External services called, one line each.
- [ ] Client library per service.
- [ ] Credential source per service.
- [ ] Timeout, retry and failure behaviour per service.

## Tests

- [ ] Test frameworks present.
- [ ] Directory layout and naming convention.
- [ ] Command to run the whole suite.
- [ ] Command to run a single file or test.
- [ ] End to end tooling present or absent.
- [ ] Areas visibly untested that the task touches.

## Delivery

- [ ] CI workflow files read, jobs and gates listed.
- [ ] Deployment target identified.
- [ ] Environment variable inventory from example files and config reads.
- [ ] Build output location and artefact shape.

## Conventions

- [ ] File naming pattern, two occurrences minimum.
- [ ] Placement rule for new files of the kind being added.
- [ ] Error handling pattern.
- [ ] Logging pattern and logger instance.
- [ ] Validation library and the layer where it is applied.
- [ ] Data fetching and state patterns on the client.
- [ ] Styling approach and design tokens.
- [ ] Commit message style, taken from git log.

## Closing

- [ ] Every claim has evidence.
- [ ] Every gap is listed as an explicit unknown.
- [ ] The map is short enough to be read before the work starts.
