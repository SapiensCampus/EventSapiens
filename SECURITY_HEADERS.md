# Browser security headers

GitHub Pages does not let a repository set custom HTTP response headers (a `public/_headers`
file only works on Cloudflare Pages or Netlify). The site is served through Cloudflare, so
these headers must be configured in the **Cloudflare dashboard** for `eventsapiens.tech`
(Rules → Transform Rules → Modify Response Header, or a small Worker). HSTS can be enabled
under SSL/TLS → Edge Certificates → HTTP Strict Transport Security.

Apply the rules to all responses for `eventsapiens.tech` and `www.eventsapiens.tech`.

## Recommended headers

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | see below |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-Frame-Options` | `DENY` (redundant with `frame-ancestors`, harmless to keep) |

### Content-Security-Policy

The app loads its own JS/CSS from `/assets`, Google Fonts from `fonts.googleapis.com` /
`fonts.gstatic.com`, the GitHub Contributors API, and the Cloudflare Insights beacon. A
policy that allows exactly those sources:

```
default-src 'self';
script-src 'self' https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://api.github.com https://static.cloudflareinsights.com;
frame-ancestors 'none';
base-uri 'none';
object-src 'none';
form-action 'self'
```

Notes:

- `'unsafe-inline'` in `style-src` is needed for React inline `style` attributes and Tailwind
  runtime styles. No inline `<script>` is used, so `script-src` stays strict.
- `frame-ancestors 'none'` blocks clickjacking; it supersedes `X-Frame-Options` in modern browsers.
- If the analytics beacon or fonts are removed, drop their origins from the policy.
- Deploy in `Content-Security-Policy-Report-Only` mode first, verify the browser console shows no
  violations, then switch to enforcing mode.

## Verify

```bash
curl -sI https://eventsapiens.tech | grep -iE 'content-security|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame'
```

Also check the browser DevTools console for CSP violations after deployment.
