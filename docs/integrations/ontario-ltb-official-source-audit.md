# Ontario LTB Official Source Audit

Date: 2026-08-03  
Status: official source located; manual-review MVP recommended before automated ingestion.

## Official Source Located

- Dataset: LTB Order Catalogue
- Dataset URL: https://data.ontario.ca/dataset/ltb-order-catalogue
- CKAN package id: `ltb-order-catalogue`
- Publisher: Ontario Ministry of the Attorney General, through the Ontario Data Catalogue.
- Licence: Open Government Licence - Ontario (`OGL-ON-1.0` in catalogue metadata).
- Resource inspected: `LTB Orders: Jan 2026 - Dec 2026`
- Resource format: CSV
- Resource URL: https://data.ontario.ca/dataset/2110a7ca-e4ef-493e-b8f1-fbeb70384bc1/resource/86e75d11-1c2c-4cd9-9b0d-9fccec302b30/download/ltb_orders-january_2026-may_2026-cli_ordonnances-janvier_2026-mai_2026.csv
- Resource last modified in catalogue metadata: 2026-07-23.

## Publisher Description

The catalogue currently contains copies of final orders issued by the Landlord and Tenant Board between January 2026 and May 2026. Orders after May 2026 are expected to be published 2 to 3 months after issue. Historical orders dating back to 2021 are expected to be published in phases. Orders subject to confidentiality orders are excluded.

## Access Method

Current access is downloadable CSV plus linked PDF order files. The Ontario Data Catalogue also exposes metadata through CKAN API endpoints.

Observed current resource shape:

- CSV bulk download.
- Data visualizer/search page on Ontario Data Catalogue.
- PDF links embedded in the CSV as spreadsheet `HYPERLINK(...)` formulas.
- No dedicated Rental Passport API contract from the publisher was found during this audit.
- No official rate-limit statement was found in the dataset metadata inspected here.

## Available Fields

The current CSV header contains:

- `File Number/Numero de dossier`
- `Applications/Requetes`
- `Application Type/Type de requete`
- `Rental Unit Address//Adresse du logement locatif`
- `Complex Address/Adresse du complexe`
- `Rental Unit Address/Adresse du logement locatif`
- `Landlord Name/Nom du locateur`
- `Landlord Agent Name/Nom du representant du locateur`
- `Tenant Name/Nom du locataire`
- `Former Tenant Name/Nom de l'ancien locataire`
- `Sub-Tenant Name/Nom du sous-locataire`
- `Occupant Names/Nom de l'occupant`
- `Co-op Member Name/Nom du membre de la cooperative`
- `Co-op Name/Nom de la cooperative`
- `Document Type/Type de document`
- `Order Date/Date de l'ordonnance`
- `Document ID/Identifiant du document`
- `ContentDownload URL/URL de telechargement du contenu`

## Field Interpretation

Party names and rental addresses are structured in CSV fields, but the publisher warns that these fields are based on pre-adjudication data from applications filed with the LTB. Rental Passport must review the related decision PDF before treating a record as verified evidence.

The CSV does not provide a complete structured disposition model. Document type, application type, order date, file number, document ID, party names, address fields, and source PDF link are structured. Detailed disposition, amendments, stays, appeals, reviews, voiding, set-aside status, monetary awards, possession outcomes, and context may require PDF review or later official updates.

## Coverage and Cadence

- Current coverage inspected: January 2026 to May 2026 final orders.
- Future cadence stated in metadata: orders are published 2 to 3 months after issue.
- Historical coverage: orders dating back to 2021 will be published in phases.
- Confidential orders: excluded when subject to confidentiality order made by an LTB adjudicator.
- Missing specific orders: publisher directs users to contact `ltb@ontario.ca`.

## Stability for Production Use

The dataset is official and technically downloadable, but it is not yet sufficient for fully automated production screening because:

- Coverage is incomplete and phasing is in progress.
- CSV identity fields require PDF confirmation.
- Final order status can change after publication.
- Appeals, reviews, voiding, set-aside outcomes, and later replacement orders may not be captured in the current report.
- PDF content and context must be reviewed before release.

## Automation Constraints

The Open Government Licence - Ontario permits reuse subject to its terms, including attribution and compliance with licence conditions. Before automated indexing, Canadian counsel should confirm:

- Whether bulk local indexing is acceptable for this verification purpose.
- Required attribution wording.
- Retention/deletion requirements for locally stored copies and document hashes.
- Whether PDF download caching is allowed.
- Whether search terms and audit logs create additional privacy obligations.

## Implementation Decision

Use a founder/manual-review MVP first.

Rental Passport may accept a consented request, search the official catalogue, review CSV candidates and linked official PDFs, normalize facts, record match reasons, give the applicant a review/dispute path, and return a safe normalized result to Rental District.

Do not implement an unattended scraper or automated final decision engine yet.

