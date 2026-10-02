# Migration safety table

Read the row before writing the statement. Sizes assume a table large enough
that a full scan is measured in minutes.

## Adding

| Statement | Lock | Safe live | Alternative |
|---|---|---|---|
| add a nullable column | brief metadata | yes | |
| add a column with a constant default | brief on current engines, rewrite on old ones | check the engine | add nullable, backfill, set default |
| add a column with a volatile default | rewrite | no | add nullable, backfill in batches |
| add NOT NULL directly | full scan under lock | no | add nullable, backfill, add a validated constraint |
| add a check constraint | full scan under lock | no | add NOT VALID, then VALIDATE |
| add a foreign key | locks both tables | no | add NOT VALID, then VALIDATE |
| add an index | writes blocked for the duration | no | create concurrently |
| add a unique index | writes blocked, and fails on existing duplicates | no | create concurrently, after cleaning duplicates |
| add a table | none on existing tables | yes | |

## Changing

| Statement | Lock | Safe live | Alternative |
|---|---|---|---|
| rename a column | brief, but breaks the running code | never | expand and contract, four releases |
| rename a table | same | never | a view during the transition, or expand and contract |
| change a column type, compatible widening | sometimes free | check the engine | |
| change a column type, otherwise | rewrite | no | new column, backfill, switch, drop |
| set a default | brief metadata | yes | |
| drop a default | brief metadata | yes | |
| drop NOT NULL | brief | yes | |

## Removing

| Statement | Lock | Recoverable | Requirement |
|---|---|---|---|
| drop an index | brief | yes, recreate it | check nothing depends on it for a unique constraint |
| drop a column | brief metadata | no, the data is gone | approval, verified backup, nothing reads it |
| drop a table | brief | no | approval, verified backup |
| truncate | exclusive | no | approval, verified backup, and a reason |

## Data statements

| Statement | Lock | Safe live | Alternative |
|---|---|---|---|
| update with a narrow WHERE, few rows | row locks | yes | |
| update, unbounded | every affected row locked | no | batch it |
| delete, unbounded | same, plus bloat | no | batch it |
| insert from select, large | locks the source read | depends | batch it |

## The count first rule

Before any `update` or `delete` in an environment above local:

```sql
-- 1. write the statement you intend
update orders set status = 'archived' where created_at < '2024-01-01';

-- 2. run its count form first, same WHERE
select count(*) from orders where created_at < '2024-01-01';
-- 41,208

-- 3. is 41,208 the number you expected?
--    yes -> proceed, batched
--    no  -> the WHERE clause is wrong, and you just avoided a restore
```

## The transaction wrapper

Where the engine supports transactional DDL and DML, run the statement inside
a transaction and inspect before committing.

```sql
begin;

update orders set status = 'archived' where created_at < '2024-01-01';
-- UPDATE 41208          <- matches the count, good

select status, count(*) from orders group by status;
-- inspect the result

commit;   -- or rollback, at no cost
```

This is the strongest safeguard available and it costs one extra line. The
`rollback` option is what makes a mistake free.

## Index creation on a live table

```sql
-- blocks writes for the whole duration
create index orders_buyer_idx on orders (buyer_name);

-- allows writes, takes longer, can fail and leave an invalid index
create index concurrently orders_buyer_idx on orders (buyer_name);
```

The concurrent form cannot run inside a transaction, which means most
migration tools need it marked specially. When it fails it leaves an invalid
index that must be dropped before retrying, so the migration checks for that
state rather than assuming a clean start.

## Constraint validation in two steps

```sql
-- step 1, no scan, no lock on existing rows
alter table orders add constraint orders_total_positive
  check (total_minor >= 0) not valid;

-- step 2, scans without blocking writes
alter table orders validate constraint orders_total_positive;
```

New rows are checked from step 1. Step 2 confirms the existing ones. Doing it
in one statement scans the whole table under a lock.

## Before running any of these

```
Table size          rows and bytes, measured, not assumed
Engine and version  the safe operations differ between versions
Rehearsal           run it against a copy of realistic data
Duration            measured on the copy, so the window is known
Rollback            what the reverse statement is, or that there is none
Backup              taken, and its timestamp known
Path                a committed migration, never a schema push or sync command
```
