# Triage plan, escalation and remediation record

The three documents this skill produces. They are short on purpose: the
verifier reads them to map each change to the finding it claims to remove.

## 1. Inputs confirmed

Written before the first change. A missing line stops the work.

```
report        <path or link>, <n> findings, from accessibility-testing
target        WCAG 2.2 AA, or the project's stated target
checks        <path>, proven against the floor, a reference and a gaming fix
              by <verifier>, fingerprint <hash or commit>
intent        <specification, content brief, design file>
verifier      <agent or person who runs the verify loop>
```

## 2. Triage plan

One row per finding, in the order the work will run.

```
order  finding  family              layer       rule                      blocked by
1      A11Y-06  forms               component   error tied, invalid, focus
2      A11Y-04  roles and keyboard  component   native button
3      A11Y-07  custom widgets      component   native select              escalation
4      A11Y-09  contrast            token       --text-muted
...
```

`layer` is instance, component or token. A token or shared component row names
`design-system`.

## 3. Escalation

One block per question, all sent together in one batch.

```
finding        A11Y-07, room chooser, /book
question       May the custom room chooser become a native select?
options        native select: keyboard, role, name and value from the platform;
                 the look of the open list follows the operating system
               keep the custom widget: the full listbox keyboard pattern built
                 and kept by hand, every key covered by a check
recommendation native select
meanwhile      the widget stays as it is; no ARIA is added over it
asked of       <owner or designer>, <date>
```

An answer is recorded with who gave it and when, and becomes an ordinary
finding for section 4 of the skill. A question still open at the end is
reported as escalated.

## 4. Remediation record

What is handed to the verifier. No row says fixed.

```
finding  state                    change                                   commit
A11Y-01  ready for verification   access fact as visible caption; alt      a1b2c3d
                                  names the map
A11Y-02  escalated                question sent <date>                     none
A11Y-04  ready for verification   div replaced by button type=button       d4e5f6a
A11Y-07  escalated                question sent <date>                     none
A11Y-11  not attempted            depends on A11Y-07                       none
```

New defects noticed during the work are listed apart, as findings for the
verifier, with their location and evidence.

## 5. What comes back

The verifier returns one outcome class per finding: fixed, scanner gamed,
regression, not fixed or escalated, with the failing step for any that are not
fixed. The fixer reworks from that, never from its own reading of the checks.
