# Rental Passport Rental District Demo Flow

Status: ready for local demo.

## Identifiers

- Partner ID: `rental_district`
- Partner application ID: `rd_app_2026_0712_001`
- Rental Passport request ID: `rp_ver_req_rd_001`
- Completed application ID: `demo-rp-app-001`
- Property reference: `rd_listing_123-maple-unit-1204`

## Applicant Demo

Open:

```text
/verification-request/demo-rd-applicant-pays
```

The flow shows a traditional Rental District application moving into Rental Passport for verification after submission.

## Completed Viewer

When verification reaches the final demo state, open:

```text
/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

Rental District should store only the safe summary and status events. Rental Passport displays the authoritative application.

