# Installable shell and notifications

What makes a client site installable and able to reach its owner, and what each
piece must degrade to when the browser or the visitor refuses it.

## The manifest

Generated from the content file, never hand written per instance.

```
name              site.name
short_name        site.shortName, or site.name truncated at 12 characters
description       seo.description
start_url         "/"
scope             "/"
display           "standalone"
theme_color       the light palette surface, since the browser chrome adopts it
background_color  the light palette surface
icons             192 and 512, maskable and any, from the media the client
                  uploaded through the back office
```

An instance whose client has not uploaded an icon serves the manifest without
icons rather than serving a placeholder logo that belongs to nobody.

## The service worker

```
precache      the shell: the home page, the offline page, the stylesheet and
              the fonts that are self hosted
runtime       uploaded media, cache first, since a replaced image gets a new
              generated name and never a stale one
navigation    network first, falling back to the cached page, then to the
              offline page
never cached  every admin route, every API response, and anything behind the
              session cookie. A cached back office is a signed in page left on
              a shared machine
versioned     the cache name carries a version; activating a new worker deletes
              the old caches
scope         registered at the root, and unregistering it leaves a site that
              still works entirely
```

The offline page is designed: the site's own tokens, both themes, its words in
the content file, and the one action that makes sense, which is to try again.

## The install prompt

```
offered     the beforeinstallprompt event is captured and offered as a button
            the visitor can ignore
never       no modal on arrival, no second prompt after a refusal
absent      a browser that does not fire the event shows no button, and the
            site is identical
```

## Push notifications

```
keys        a VAPID pair held as server configuration. The public key reaches
            the browser, the private key never leaves the server
subscribe   from the back office, by the signed in client, after an explicit
            action. Never on page load, and never from a public page
store       one record per browser, with its endpoint and its keys, deleted on
            unsubscribe and deleted automatically when the push service reports
            it gone
send        on a new message, with the sender's name and the first line, and a
            link that opens the inbox
fail        a failed send never fails the message: the message is already
            stored, and the failure is logged
refused     a client who refuses notifications keeps the inbox and the unread
            count, which is the part that matters
```

## Verification

```
manifest        served, valid JSON, and its icons resolve
worker          registers, and the site works after unregistering it
offline         the offline page appears with the network disabled, in both
                themes
admin offline   the back office is not served from cache
install         the prompt is offered once and refusing it changes nothing
push            a subscription is created, a message triggers a notification,
                unsubscribing deletes the record, and refusing permission
                leaves the site working
```
