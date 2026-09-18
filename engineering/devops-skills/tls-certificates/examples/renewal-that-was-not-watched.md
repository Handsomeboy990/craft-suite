# Example: the renewal that silently stopped

A site ran HTTPS for two years without a thought. The certificate renewed
itself every ninety days over ACME, until one renewal failed quietly, and
ninety days later the certificate expired. Every visitor met a full-page
browser warning, and the site was, for practical purposes, down.

## What was present

```
obtaining   ACME, automated
installing  on the reverse proxy
enforcing   redirect and HSTS in place
renewing    a cron that ran certbot
```

## What was missing

```
proof       nobody had confirmed the renewal actually ran; the cron had failed
            months earlier when a plugin updated and changed a path, and it
            failed silently every run after
monitoring  nothing watched the served certificate's expiry from outside, so
            the only signal was the outage itself
margin      the renewal ran close to expiry, so even a caught failure left
            little time
```

## What this skill would have done

The renewal is proven once, not assumed, so the silent failure surfaces the
day it starts, not ninety days later. The served expiry is watched from
outside on the hostname, so an alert fires with days to spare regardless of
whether the renewal cron is healthy. And the renewal runs with margin, so one
failed attempt is not the last chance. HSTS, ironically, made the outage worse:
browsers that had cached it refused to fall back to HTTP, so there was no
degraded mode, only the warning. The certificate is not a set-and-forget; it is
watched precisely because automation fails silently.
