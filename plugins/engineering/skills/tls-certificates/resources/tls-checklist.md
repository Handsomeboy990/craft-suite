# TLS checklist

Walked in order. Each line is verified by observation, not assumed.

## Termination and installation

- [ ] Where TLS terminates is known: proxy, load balancer, platform edge, or
  application.
- [ ] The certificate is installed on that layer.
- [ ] The certificate covers every served hostname, apex and subdomains as
  needed, verified against the live endpoint.

## Enforcement

- [ ] Plain HTTP redirects to HTTPS, permanently, on every host.
- [ ] HSTS is set with a sensible max-age; includeSubDomains once every
  subdomain is HTTPS; preload only when the domain will stay HTTPS.
- [ ] Session and sensitive cookies carry Secure.

## Renewal

- [ ] Renewal is automated over ACME or the platform, on a schedule with margin
  before expiry.
- [ ] The terminating layer reloads to serve the renewed certificate.
- [ ] The automation has been proven to renew once, not assumed.

## Monitoring

- [ ] The served certificate expiry is checked from outside, on every hostname.
- [ ] An alert fires with enough lead time for a human to act.
- [ ] Hostnames added later are included in the monitoring.

## Keys and environments

- [ ] The private key is not in the repository, a log, a screenshot or an image
  layer.
- [ ] The key is stored in the platform store or a secret manager.
- [ ] Development uses a locally trusted or knowingly self-signed certificate,
  never a production key.
- [ ] A leaked key means reissue and revoke, not just delete.
