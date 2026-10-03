# Deployment runbook template

Written once, executable by someone who did not write it.

````markdown
# Deploying <project> to <environment>

## Prerequisites

- Access: <what, and how to obtain it>
- Tools: <name and version>
- The change is merged and its pipeline is green.

## 1. Verify the target

```bash
<command that prints which environment you are pointed at>
```

Expected: <the environment name>. Stop if it is anything else.

## 2. Verify configuration

```bash
<command listing the variables present in the target>
```

Required variables, from the inventory: <list>
All must be present. A missing one stops the deployment here rather than
after the artefact has replaced the running version.

## 3. Migrations, additive part

```bash
<migration command>
```

Applies the committed migration files; never a schema push or sync command.
Runs before the code deploy. Expected output: <what>.
Applies: <which migrations, additive only>.
Lock behaviour on the largest affected table: <known, and acceptable because>.

## 4. Deploy

```bash
<deploy command or trigger>
```

Expected: the platform reports the new version starting.

## 5. Health

```bash
<health check command>
```

Expected: <200, the version endpoint reporting the deployed commit>.
If health does not pass within <duration>, the platform rolls back
automatically. Confirm this happened before investigating.

## 6. Smoke check

One real user path, exercised by hand or by script:

```bash
<command>
```

Expected: <the observable result>.

## 7. Watch

For <duration> after traffic shifts, watch:

| Signal | Where | Threshold that means roll back |
|---|---|---|
| error rate | | |
| latency | | |
| a domain metric | | |

## 8. Migrations, destructive part

Only after the deployment has been stable for <duration>, and only if this
release includes a contract step.

```bash
<command>
```

## Rollback

```bash
<command>
```

Duration: <measured>
Restores: <the previous application version>
Does not restore:
- rows created since the deployment
- emails sent
- webhooks delivered
- payments captured
- any dropped column from step 8

After rolling back:
```bash
<cache invalidation command>
```

Verify the rollback:
```bash
<command>
```
Expected: <the version endpoint reporting the previous commit>

## Troubleshooting

| Symptom | Likely cause | Action |
|---|---|---|
| the process exits immediately | a required variable is missing | read the startup log, it names the variable |
| health never passes | the database is unreachable | check the connection and the network rules |
| health passes, requests fail | a downstream service or its credential | check the provider status and the key |
| the migration hangs | a lock on a large table | check for long transactions, do not kill blindly |
| the old version is still serving | traffic never shifted | check the platform's routing state |
````

## Rules

**Step 1 exists because of the most common serious incident.** Deploying the
right thing to the wrong environment. One read only command prevents it.

**Step 2 before step 4.** Checking the configuration after the artefact has
replaced the running version turns a preventable stop into an outage.

**Steps 3 and 8 are separate.** The additive part runs before the code, the
destructive part runs after the code has been stable. Merging them is the
defect that makes rollbacks impossible.

**The `Does not restore` list is the most valuable content.** It is what makes
someone decide, before deploying, whether this release is one they can undo.

**The troubleshooting table grows.** Every failure met once is added, so the
second occurrence is a lookup rather than an investigation.
