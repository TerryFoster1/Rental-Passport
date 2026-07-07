# MVP Launch Checklist

## Infrastructure

- Confirm Vercel production project and domain.
- Confirm Supabase project, migrations, backups, and point-in-time recovery.
- Confirm private storage buckets and signed URL policies.
- Confirm environment variables are present in Vercel and Supabase.

## Security

- Verify CSP, HSTS, frame, content-type, referrer, and permissions headers.
- Confirm RLS policies with tenant, landlord, reviewer, and developer accounts.
- Confirm no service-role secrets are exposed to the frontend.
- Complete external penetration test before broad public launch.

## Compliance

- Confirm PIPEDA and CASL review.
- Confirm GDPR readiness for export and deletion requests.
- Confirm identity, credit, employment, and reference authorization language.
- Confirm regional housing compliance review.

## Support

- Prepare support inbox and escalation paths.
- Prepare manual verification operating procedure.
- Prepare incident response contacts.

## Monitoring

- Enable production error tracking.
- Enable auth failure monitoring.
- Enable API and webhook monitoring when live handlers are added.
- Review audit logs weekly during controlled MVP.

## Backups

- Confirm database backups.
- Confirm storage backup/recovery policy.
- Test restore procedure before launch.

## Incident Response

- Define severity levels.
- Define breach response procedure.
- Define user notification workflow.
- Define rollback owner and approval path.

## Production Deployment

- Run `npm.cmd run typecheck`.
- Run `npm.cmd run lint`.
- Run `npm.cmd run build`.
- Smoke test `/`, `/dashboard`, `/passport`, `/passport/share`, `/landlord/applications`, `/admin`, and `/developers`.

## Rollback Strategy

- Keep previous Vercel production deployment available.
- Roll back frontend through Vercel deployment history.
- Database migrations require explicit rollback scripts before launch.

## Known Limitations

- Manual verification remains the MVP operating model.
- Phone, employer, landlord, reference, and credit provider workflows are manual.
- OCR, automated fraud detection, provider integrations, escrow, and billing are future work.

## Post-Launch Priorities

1. Production monitoring and incident response drill.
2. Controlled real-user verification pilot.
3. Secure document viewer with watermarking.
