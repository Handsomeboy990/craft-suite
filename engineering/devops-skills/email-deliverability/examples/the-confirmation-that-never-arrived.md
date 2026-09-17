# Example: the confirmation email that never arrived

Users complained that the signup confirmation never came. The application logs
showed every message sent successfully to the mail provider, with no error. The
code was not the problem.

## What was actually happening

```
authentication   SPF was published, but the app sent through a new
                 transactional provider whose servers were not in it, and DKIM
                 was not set up for that provider. DMARC, at p=reject, saw a
                 message from the domain that passed neither aligned check, and
                 receivers rejected it outright.
reputation       the confirmation mail shared a sending domain with a marketing
                 blast that had drawn spam complaints, so even messages that
                 passed were filed as spam.
```

The mail was sent, and refused or filed, for reasons entirely outside the
application.

## What this skill would have done

```
align       add the transactional provider's servers to SPF and publish its
            DKIM key on the sending subdomain, so the confirmation authenticates
            and aligns to the From domain
roll out    DMARC would have started at monitor, and the reports would have
            shown the transactional provider failing before anything was
            rejected, rather than after users complained
separate    the transactional confirmation would send from its own stream, not
            the one the marketing complaints poisoned
suppress    the bounces and complaints from the marketing blast would be
            suppressed, so the domain's reputation recovers
```

The fix is DNS and reputation, not a line of application code. The reason a
confirmation email never arrives is almost always here.
