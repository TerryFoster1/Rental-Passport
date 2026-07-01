# Decision Log

| Date | Decision | Context | Status |
| --- | --- | --- | --- |
| 2026-06-25 | Rental Passport is API-first | The React app is the first client; business logic, workflows, validation, permissions, verification, and data access must live behind secure backend APIs. | Accepted |
| 2026-06-25 | Rental Passport is platform-agnostic | Rental District is one application built on top of Rental Passport; Rental Passport itself must support third-party rental platforms and integrations. | Accepted |
| 2026-06-25 | Pre-lease scope boundary | Rental Passport exists before lease signing. Property management and post-acceptance workflows belong in Rental District or integrated platforms. | Accepted |
| 2026-07-01 | No tenant or applicant scoring | Rental Passport verifies facts and must not rank people, recommend approval, or determine whether someone deserves housing. Passport Completeness replaces scoring concepts. | Accepted |
| 2026-07-01 | Verification applies to passport versions | Section verification status applies to the current passport version, not permanently to the user account. | Accepted |
| 2026-07-01 | Filtering must be jurisdiction-aware | Filtering is allowed only where legal. The platform must suppress prohibited questions and filters by jurisdiction. | Accepted |
| 2026-07-01 | AI fraud output is document integrity | Rental Passport AI may assess evidence integrity, but it must not produce a tenant score or desirability ranking. | Accepted |
| 2026-07-01 | Escrow requires legal review | Verified Deposit is a future roadmap concept and must not be implemented before jurisdiction-specific legal review. | Accepted |
| 2026-07-01 | Manual-first MVP verification | MVP verification should rely on manual and semi-manual review first, avoiding paid OCR, paid ID verification, open banking, and direct bureau APIs as launch dependencies. | Accepted |
| 2026-07-01 | Confidence means authenticity | Verification confidence describes authenticity and evidence quality, not applicant quality. | Accepted |
| 2026-07-01 | Secure sharing is recipient-specific | Rental Passports must not be public links; secure sharing requires intended recipient, expiry, revocation, access logging, and authentication or magic link access. | Accepted |
| 2026-07-01 | Main passport is a trusted summary | The landlord-facing passport cover page should be minimal and readable in about 15 seconds, with detailed evidence behind clickable sections. | Accepted |
| 2026-07-01 | Landlord access is security language | Landlord onboarding should use protective language such as Create Secure Access rather than generic sign-up language. | Accepted |
