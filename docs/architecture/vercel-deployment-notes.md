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
| A | `@` | `216.198.79.193` | DNS only |
| CNAME | `www` | Copy the unique CNAME value shown by Vercel for `www.rentalpassport.io` | DNS only |

Vercel may show a project-specific CNAME target similar to `d1d4fc829fe7bc7c.vercel-dns-017.com`. Use the exact value shown in the Vercel Domains screen for this project.

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
