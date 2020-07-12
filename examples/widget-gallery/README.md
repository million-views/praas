# Widgets Gallery

## Examples

- Classical HTML form
- HTML form with ajax request

## Prerequesites

- Setup an active conduit using `conduit-server`
- Run the `proxy-server` under PORT `80`
- Update the example forms with the `curi`
- Add `curi` to `/etc/host` to map the loop back address.

### Issues faced

- In `dev` mode `proxy-server` runs in port `5000` by default but curi is missing the port. Hence when submitting the `proxy-server` is unable to identify the `curi` since the `Host` would be `http://curi:<PORT>`
