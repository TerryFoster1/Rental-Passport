# Vercel Deployment Notes

Rental Passport is currently a frontend-only Vite application.

## Vercel Project Settings

- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`
- Development Command: `npm run dev`
- Production Domain: `https://rentalpassport.io`

## SPA Routing

This project uses client-side routing/state for the MVP interface. `vercel.json` rewrites all routes to `index.html` so refreshes and direct links resolve correctly.

## Deployment Commands

From the project root:

```bash
npm install
npm run lint
npm run build
```

Production deploy with Vercel CLI:

```bash
vercel login
vercel link
vercel --prod
```

If deploying from Git, connect the repository in Vercel and use the project settings above.

## Domains

Add both domains in the Vercel project dashboard:

- `rentalpassport.io`
- `www.rentalpassport.io`

Set the canonical domain in Vercel after both verify. Recommended: make `rentalpassport.io` primary and redirect `www.rentalpassport.io` to it.

## Cloudflare DNS

Cloudflare should be DNS only for initial verification. Disable the proxy until Vercel verifies the domain and SSL is active.

| Type | Name | Value | Proxy Status |
| --- | --- | --- | --- |
| CNAME | `@` | `cname.vercel-dns.com` | DNS only |
| CNAME | `www` | `89bfa0695b8ecbfd.vercel-dns-016.com` | DNS only |

These values came from `vercel domains verify` for the `rental-passport` project. Vercel also lists fallback A-record options, but the recommended Cloudflare records for this project are the CNAME records above.

Remove any conflicting `A`, `AAAA`, or `CNAME` records for `@` and `www` before adding these.

## Verification Checklist

- `npm run build` passes locally.
- `vercel.json` exists and includes the SPA rewrite.
- `VITE_APP_URL` is set to `https://rentalpassport.io` for production.
- Both `rentalpassport.io` and `www.rentalpassport.io` are added to the Vercel project.
- Cloudflare records are DNS only during verification.
- Vercel domain status shows valid configuration.
- SSL certificate is active.
- Refreshing a nested route resolves to the app instead of a 404.
