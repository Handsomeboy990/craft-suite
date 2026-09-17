# The authentication records, and the alignment trap

The three records a receiver checks, what each proves, and the alignment
mistake that makes all three look present while DMARC still fails.

## SPF

A TXT record on the domain listing the servers and services allowed to send
for it. The receiver checks the sending server against the list.

```
watch   SPF has a lookup limit; chaining many includes (one per third-party
        sender) can exceed it and break silently. Keep the record within the
        limit.
```

## DKIM

A cryptographic signature added to each message, verified by the receiver
against a public key published in DNS. It proves the message was not altered in
transit and genuinely came from the domain.

```
watch   each sending service signs with its own selector and key; publish the
        key for every service that sends, or its mail is unsigned.
```

## DMARC

A policy record that ties SPF and DKIM to the visible From address, tells
receivers what to do on failure, and requests reports.

```
policy   p=none (monitor), p=quarantine (spam folder), p=reject (refused)
reports  rua for aggregate reports; read them to see every sender using your
         domain, legitimate and spoofed
```

## The alignment trap

DMARC passes only when the domain that SPF or DKIM authenticated is aligned
with the domain in the visible From address.

```
fails   a message sent through a third party that passes SPF for the third
        party's domain, but shows your domain in From, is authenticated for the
        wrong domain and fails DMARC alignment
fix     configure the sender so SPF or DKIM authenticates your From domain,
        commonly by sending from a subdomain you delegate to the provider and
        publishing the provider's DKIM key on it
```

A domain can have all three records present and still fail DMARC because
nothing is aligned to the From address. Alignment, not mere presence, is what
DMARC checks.
