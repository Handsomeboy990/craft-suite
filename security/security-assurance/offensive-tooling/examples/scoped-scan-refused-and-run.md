# Example: one refused invocation, one run

Authorization on record names `app.example.com` in scope; `api.partner.com` is
not named.

## Refused

A request to run an injection tester against `api.partner.com` is refused: the
target is out of scope. It is recorded as refused, with the reason. It is not
reworded, narrowed or re-pointed until it runs.

## Run

A web scanner runs against `app.example.com`, rate limited and identified,
non-destructive flags only. The invocation is logged: tool, exact flags,
target, time, authorizer.

It surfaces a reflected parameter. The evidence captured is the single request
and response that shows it, nothing more; a session cookie seen in passing is
not retained.

## Hand off

The reflected-parameter finding goes to authorized-pentesting to be driven to a
bounded proof, and to the fixer. No severity was assigned here and no
destructive flag was used.
