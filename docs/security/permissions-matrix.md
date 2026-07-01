# Permissions Matrix

This matrix defines intended access boundaries. It does not implement roles or RLS policies yet.

| Capability | Guest | Tenant | Landlord | Property Manager | Verification Reviewer | Support | Compliance | Administrator | Enterprise API |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| View public pages | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Create passport | No | Yes | No | No | No | No | No | No | No |
| Edit own passport | No | Yes | No | No | No | No | No | No | No |
| Upload own documents | No | Yes | No | No | No | No | No | No | No |
| View own documents | No | Yes | No | No | No | Limited | Yes | Break-glass | No |
| Share passport | No | Yes | No | No | No | Assist only | Audit only | Break-glass | API-scoped |
| Revoke share | No | Yes | No | No | No | Assist only | Audit only | Break-glass | API-scoped |
| View shared passport summary | No | Invited only | Invited only | Invited only | Review only | Limited | Audit | Break-glass | Scoped |
| View supporting documents | No | Own only | Authorized view-only | Authorized view-only | Assigned cases | Limited | Audit | Break-glass | No by default |
| Download application package | No | Own | Authorized | Authorized | No | No | Audit | Break-glass | Scoped |
| Download raw documents | No | Own | No | No | Assigned review only | No | Legal/audit only | Break-glass | No |
| Review verification case | No | No | No | No | Assigned | No | Escalated | Admin | No |
| Add reviewer notes | No | No | No | No | Assigned | No | Escalated | Admin | No |
| Resolve fraud flag | No | No | No | No | Assigned/senior | No | Yes | Admin | No |
| Manage compliance rules | No | No | No | No | No | No | Yes | Admin | No |
| Manage users | No | Own account | Own account | Organization users | No | Limited | Audit | Yes | No |
| Access audit logs | No | Own activity | Own access | Organization activity | Case logs | Limited | Yes | Yes | Scoped |
| Use partner APIs | No | No | No | No | No | No | No | Admin setup | Yes |

## Break-Glass Access

Break-glass access requires explicit policy, senior approval, reason capture, time-limited access, and audit review.

## Least Privilege

Every role receives the narrowest access necessary. Reviewer access is case-scoped. Landlord access is invitation-scoped. Enterprise API access is scope-scoped.
