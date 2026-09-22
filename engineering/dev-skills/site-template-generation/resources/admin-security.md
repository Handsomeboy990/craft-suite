# Admin surface security

The back office edits the site, holds the client's messages and accepts file
uploads. It is the highest value target on the deployment. This file is the
specific contract for it; `admin-console`, `authentication-security`,
`session-security` and `rate-limiting` hold the general rules.

## The account

```
one account       a client site has one operator. A second operator is a real
                  requirement with roles, not a shared password
hash              memory hard, with a per account salt and parameters recorded
                  next to the hash so they can be raised later
never stored      no password in the repository, in the content file, in the
                  bundle, in a log or in an environment variable in plain text
set out of band   a command sets the hash into the data directory, and the
                  handover names it
rotation          changing the password invalidates every existing session
```

## The session

```
token        random, at least 32 bytes from a cryptographic source
stored       hashed server side, with an issue time, an expiry and the address
             it was issued to
cookie       httpOnly, SameSite=Lax, Path=/, Secure outside development,
             expiring with the session
lifetime     short enough that a forgotten open tab is not a permanent door,
             renewed on use rather than extended forever
sign out     deletes the server record. A cookie cleared client side is not a
             sign out
```

## Rate limits

| Endpoint | Limit | On exceeding |
|---|---|---|
| admin login | a handful of attempts per address and per account, in a short window | refuse for a lockout window, same message, same timing |
| admin write endpoints | generous per session, enough to catch a runaway script | refuse with a retry hint |
| upload | a low number per minute per session | refuse |
| public contact form | a low number per hour per address | refuse visibly, with the direct address to write to |

The counter is shared by every process that serves the site. One process with a
counter in memory is a rate limit that disappears on restart and does not exist
at all behind two instances.

## Answers that leak nothing

```
wrong password      the same message and the same timing as an unknown account
locked out          says a limit was reached, not which account exists
expired session     redirects to the login, and says the session expired
upload rejected     says which rule was broken, since the uploader is signed in
contact rejected    the visitor is told, and given the direct address. Hiding
                    the limit would keep a crawler from learning it exists, at
                    the price of a real customer believing a dropped message
                    was sent. On a business site that trade runs the wrong way
```

## Cross site request forgery

Every state changing request carries a token bound to the session and checked on
the server. `SameSite=Lax` alone is a mitigation, not the control: it does not
cover every browser the client's customers use, and it does not cover a form
posted from a subdomain.

## Uploads

```
authenticated   only from a valid session
type            checked by extension and by the file's own leading bytes, and
                an allow list, never a deny list
no SVG          an SVG is a document that can carry script. If the client needs
                one, it is sanitised by a dedicated tool or it is not accepted
size            capped, and the cap is enforced before the file is read whole
name            generated, never taken from the upload. No path separator, no
                traversal, no leading dot
location        a data directory outside any path the server will execute, and
                served as a static file with a content type set by the server
alt text        required at upload time, because alt text is content and the
                moment the image arrives is the only moment anyone knows what
                it shows
```

## What the client types, and where it lands

A value a signed in client enters is not trusted because they are signed in. The
question is where it ends up.

```
into text       React escapes it. Nothing to do
into a style    validated where it is written and escaped where it is used. A
                colour matches a colour, a length matches a length, a font
                family is a list of names, an easing is a curve. Nothing may
                carry < > { } or ;
into an href    a scheme allow list, never javascript:
into the head   a manifest field is JSON encoded; a meta value is escaped
```

Without the first two, the back office is a stored cross-site scripting hole
pointed at every visitor: a value typed into a width field closes the style
element and opens a script one. Both reference implementations shipped exactly
that until it was tested for.

```
length      ^-?[0-9]*\.?[0-9]+(px|rem|em|ch|ex|vw|vh|svh|dvh|vmin|vmax|%)$
fontFamily  ^[A-Za-z0-9 ,'"_-]+$
easing      linear | ease | ease-in | ease-out | ease-in-out | step-start |
            step-end | cubic-bezier(...) | steps(...)
colour      ^#[0-9a-fA-F]{3,8}$
```

## What the browser is told

The server being perfect is not a plan. The policy is the second half.

```
script-src   'self' and a nonce issued per request, with strict-dynamic. A
             script that reaches the page some other way does not run
style-src    'self' and the same nonce. Stylesheets stay locked
style-src-attr 'unsafe-inline', because the template writes custom properties
             into style attributes, which carry values and execute nothing
default-src  'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'
connect-src  'self', plus the origin of a third party form endpoint if one is
             configured, and nothing else
headers      nosniff, strict-origin-when-cross-origin, frame protection, a
             permissions policy naming what the site does not use, and HSTS
cache        the back office and every endpoint are no-store
```

A nonce means the page cannot be cached whole, because every response differs.
That is the trade, and it is the right way round for a site whose traffic is
measured in hundreds a day: the uploaded media and the static assets carry long
lived caching, and the HTML is rendered from an in-memory copy of the content
file. An instance that outgrows this moves to hashed inline elements and a
cacheable page, and the handover says which of the two it is on.

## What the server checks, always

```
session      on every admin route and every admin endpoint, on the server. A
             hidden link is not access control
validation   every write validated against the content contract before it
             touches the file. A rejected write changes nothing
atomic       content written to a temporary file and renamed
path         any file path derived from a request is resolved and confirmed to
             sit inside the directory it belongs to
logging      an authentication failure, a lockout, a rejected upload and a
             rejected write are logged with a timestamp and an address, and
             without the credential
```

## Verification, before the surface ships

1. Call an admin endpoint with no cookie: refused.
2. Call it with a signed out session: refused.
3. Exceed the login limit: refused for the lockout window, same message.
4. Upload a file with a forbidden type, and one over the size cap: both
   refused, and nothing written.
5. Post a write with a missing required field: refused by name, file unchanged.
6. Post a state changing request without the CSRF token: refused.
7. Sign out, then reuse the old cookie: refused.
8. Type a value that closes a style tag into every free text field that reaches
   the stylesheet: refused by name, and inert even when written straight into
   the file.
9. Send a body larger than the limit: refused before it is parsed.
10. Read the audit log: the refusal, the sign in, the write and the upload are
    all in it, and no password, token or message body is.
