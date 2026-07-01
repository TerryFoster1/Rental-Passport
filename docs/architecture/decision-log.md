# Decision Log

| Date | Decision | Context | Status |
| --- | --- | --- | --- |
| 2026-06-25 | Rental Passport is API-first | The React app is the first client; business logic, workflows, validation, permissions, verification, and data access must live behind secure backend APIs. | Accepted |
| 2026-06-25 | Rental Passport is platform-agnostic | Rental District is one application built on top of Rental Passport; Rental Passport itself must support third-party rental platforms and integrations. | Accepted |
| 2026-06-25 | Pre-lease scope boundary | Rental Passport exists before lease signing. Property management and post-acceptance workflows belong in Rental District or integrated platforms. | Accepted |