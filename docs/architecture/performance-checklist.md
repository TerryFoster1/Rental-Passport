# Performance Checklist

Performance matters because landlords should trust immediately and renters should be able to apply without friction.

## Frontend

- Fast public homepage load
- Fast passport review load
- Mobile-first responsiveness
- Optimized images and social assets
- Minimal JavaScript for public pages
- Clear loading states for future API-backed screens

## Backend, Future

- Low-latency passport summary APIs
- Efficient verification status aggregation
- Cached jurisdiction rules where appropriate
- Safe document delivery with signed URLs
- Rate-limited public and partner APIs
- Queue-based provider verification workflows

## Data Access, Future

- Indexed passport version and verification status queries
- Efficient landlord application lists sorted by Passport Completeness, verified status, and date applied
- No expensive ranking algorithms because applicant desirability ranking is out of scope

## Monitoring

- Public page uptime
- API latency
- Verification provider latency
- Document upload and scan latency
- Webhook delivery health
- Error rates for consent and permission checks
