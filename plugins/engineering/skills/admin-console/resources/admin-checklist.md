# Admin console checklist

## Roles

- [ ] Roles named by task, not one all-powerful admin.
- [ ] Each role holds the narrowest set of powers its job needs.
- [ ] The dangerous actions (grant a role, delete data, move money) are held by
  fewer roles, and the most dangerous may need a second person.

## Authorization

- [ ] Every admin action is checked on the server, on the action.
- [ ] The check is object level: authorized for this record and this action,
  not merely authenticated as an admin.
- [ ] The client decides only what to show, never what to allow.

## Audit

- [ ] Every privileged action writes an entry: who, what, whom, when, before
  and after where data changed.
- [ ] The log is append-only and not editable from the console it records.
- [ ] No secret appears in an audit entry.

## Interface

- [ ] No API key, token, password or full credential is rendered anywhere.
- [ ] Sensitive fields are masked unless the role and task need them.
- [ ] No stack trace, internal error or raw record dump in production.

## Operational controls

- [ ] User management, configuration, toggles and monitoring are present within
  the role's bounds.
- [ ] Each operational control is itself role-checked and audited.

## Hardening

- [ ] Strong authentication, a second factor for the powers held.
- [ ] Short, revocable sessions.
- [ ] Login and sensitive actions rate limited.
- [ ] The console is not casually reachable; restricted where the threat model
  needs it.
