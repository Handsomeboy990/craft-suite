# Example: the one god role, and what replaces it

A team ships an admin panel. Everyone on the team gets the `admin` role, and
`admin` can do everything: read any user, reset any password, change any role,
delete any record, issue any refund. It works, until a support contractor's
account is phished, and the attacker now owns the platform: every user, every
record, every role, with no trace of what they touched.

## What went wrong

```
one role        admin meant everything, so the weakest account held the
                strongest powers
client checks   the panel hid buttons the contractor should not use, but the
                requests behind them still worked
no audit        there was no record of what the compromised account did, so the
                cleanup was a guess
```

## What this skill builds instead

```
roles by task   support reads a user and resets a password and nothing else;
                finance issues a refund; only an owner changes a role or deletes
                data, and a role change may need a second owner to confirm
server checks   every action is authorized on the server, on the action and the
                record; the hidden button is also a refused request
audit           every privileged action is logged, who, what, whom, when, before
                and after, append-only, so the phished account's actions are a
                readable trail, not a guess
interface       the support view shows what support needs, masks the rest, and
                renders no secret an attacker could take
hardening       a second factor on the powers, short sessions, rate-limited
                login, so phishing one password is not the whole breach
```

The phished contractor account, under this design, could reset a password and
read the users it was scoped to, and every one of those actions is on record.
It could not change a role, delete data, or move money, and it held no secret
the interface handed it. The blast radius of one compromised account is the
role it held, not the platform.
