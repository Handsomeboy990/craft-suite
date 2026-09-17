# admin-console

Builds the privileged back-office of an application so that its power is bounded
and every use of it is on record: role-based access with least privilege, an
audit log of who did what to whom, actions that are still authorized on the
server, no secret shown in the interface, and the operational controls an
operator needs.

- Inputs: the operator tasks the console must serve, and the data and actions
  it touches.
- Outputs: the admin architecture, the role model, the audit-log design, the
  operator controls.
- Depends on: engineering-core.

The admin console is where a few people hold power over everyone else's data,
which makes it the highest-value target in the system. It is not one god role
handed to everyone; it is a set of least-privilege roles, with the dangerous
actions held by fewer of them. Authorization is decided on the server for every
action at the object level, never in the client that rendered the screen, so a
crafted request cannot act as an admin. Every privileged action lands in an
append-only audit log the console cannot edit, so a compromised account leaves
a trace. The interface renders no secret and only the data the role and task
need, and it is hardened, strong authentication, a second factor for the powers
it holds, short revocable sessions, rate-limited sensitive actions, like the
front door it is.
