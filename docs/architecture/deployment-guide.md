# Deployment Guide

Rental Passport is deployed as a frontend-only Vite application on Vercel today.

## Deployment Principles

- A successful frontend deployment does not mean the platform is ready to collect real renter data.
- Backend verification, permissions, RLS, audit logging, legal review, and provider integrations must be completed before real sensitive workflows go live.
- Deployment checks must verify that no tenant/applicant scoring language or behavior has been introduced.
- Public pages should reinforce verification, privacy, compliance, and renter control.

## Local Validation

Before deployment:

```bash
npm install
npm run lint
npm run build
```

## Vercel Settings

- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Domain: `https://rentalpassport.io`

## SPA Routing

`vercel.json` rewrites requests to `index.html` so direct links and refreshes resolve through the client route map.

## Release Checklist

- Build passes.
- Lint passes.
- Public routes return 200.
- `robots.txt` and `sitemap.xml` are available.
- Privacy and Terms pages are available.
- No raw document downloads are exposed.
- No Applicant Score, Tenant Score, approval recommendation, or desirability ranking appears.
