# Legal fact sheet

Which legal page needs which fact, and what the template does when a fact has
not been provided. The rule the whole file exists to enforce: a legal page is a
statement about a real company, so the template assembles facts and never
invents them.

## The three kinds of content on a legal page

```
fact          a company detail: name, form, address, registration, capital,
              publication director, host, insurer, certification. Rendered when
              provided, marked when not. Never invented.
structural    the headings and the connective sentences of a notice. Templated,
              because they carry no claim.
obligation    a clause that binds: warranty, withdrawal, liability, governing
              law, jurisdiction, mediation, retention period. Taken from the
              company's own document or left marked for its counsel. Never
              drafted from scratch by the template.
```

## The marker

A fact not provided renders as a visible marker in the page, carrying the name
of the fact:

```
[ to be completed: company registration number ]
```

Visible, not a comment. A missing legal fact hidden in the source is a missing
legal fact nobody ever fixes. The build reports every marker it emitted, and the
count of markers is part of the completion gate: a site with markers may be
staged and reviewed, and may not be announced as delivered.

## Facts per page

| Page | Facts it requires |
|---|---|
| legal notice | legal name, legal form, share capital where the form has one, registered address, registration number, VAT identifier where applicable, publication director, contact, host name and address, professional body and insurance where the trade requires them |
| terms | legal identity, the services sold, prices and how they are set, payment terms, delivery or execution terms, withdrawal rights where they apply, warranty, liability, governing law, dispute resolution and mediator |
| privacy | data controller identity and contact, the data collected and by which form, the purpose and legal basis of each, retention period, recipients and processors, transfers outside the jurisdiction, the rights of the person and how to exercise them, the supervisory authority |
| cookies | each cookie or equivalent actually set, its purpose, its lifetime, its owner, and how consent is given, refused and withdrawn |

## Rules the template enforces

1. A page whose required facts are entirely absent still renders, with its
   markers, so the gap is visible rather than the page missing.
2. A cookie page lists what the site actually sets. A site that sets no cookie
   says so; it does not carry a generic list of analytics cookies it does not
   use.
3. A privacy page names the forms that exist in the content file, and no others.
4. A trade with a mandatory professional insurance or registration has those
   fields required rather than optional, and the missing ones are marked.
5. No certification, membership, award, insurance or registration number appears
   anywhere on the site unless it is in the fact sheet.
6. The obligation clauses are either the client's own text, pasted as provided,
   or a marker naming the clause. The template never writes them.
