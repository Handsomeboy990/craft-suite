# tls-certificates

Owns the TLS certificate over its whole life, not just the day it is installed:
obtaining it, installing it on the layer that terminates TLS, enforcing HTTPS
with a redirect and HSTS, renewing it automatically before it expires,
monitoring for the expiry that takes a site down anyway, and keeping the private
key out of the repository and the logs.

- Inputs: the served hostnames, where TLS terminates, and the environment.
- Outputs: the certificate plan, the TLS configuration, the renewal
  automation, the expiry monitoring.
- Depends on: engineering-core, devops-core.

A certificate that expired is as down as a site that crashed, with a browser
warning that scares every visitor away, so renewal is automated with margin and
proven to have run once, and expiry is watched from outside on every hostname
as a backstop. HTTPS is enforced, not just available: plain HTTP redirects, HSTS
is set, cookies are Secure. Development uses a locally trusted certificate,
never a production key. The private key never reaches the repository, a log, a
screenshot or a container image layer; if it ever leaks, the certificate is
reissued and the old key revoked, because deleting the key does not undo the
exposure.
