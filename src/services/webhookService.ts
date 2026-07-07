import type { WebhookEventName } from '@/types/apiPlatform';

export const webhookEvents: Array<{ name: WebhookEventName; description: string }> = [
  { name: 'passport.created', description: 'A tenant created a Rental Passport.' },
  { name: 'passport.updated', description: 'A passport or section changed.' },
  { name: 'passport.verified', description: 'A passport reached verified status.' },
  { name: 'passport.shared', description: 'A tenant shared a passport with an authorized recipient.' },
  { name: 'application.submitted', description: 'A passport-backed application was submitted.' },
  { name: 'application.viewed', description: 'An authorized recipient viewed an application.' },
  { name: 'application.accepted', description: 'A landlord accepted an application.' },
  { name: 'application.rejected', description: 'A landlord rejected or archived an application.' },
  { name: 'verification.requested', description: 'A verification request was created.' },
  { name: 'verification.completed', description: 'A verification request was completed.' },
  { name: 'verification.expired', description: 'A verification result expired.' },
  { name: 'document.uploaded', description: 'A tenant uploaded a supporting document.' },
  { name: 'document.deleted', description: 'A document was removed or revoked.' },
  { name: 'user.deleted', description: 'A user deletion workflow completed.' },
  { name: 'consent.updated', description: 'A consent record changed.' },
];

export function createWebhookEnvelope(eventName: WebhookEventName, resourceId: string) {
  return {
    id: crypto.randomUUID(),
    event: eventName,
    resourceId,
    createdAt: new Date().toISOString(),
    deliveryStatus: 'not_implemented' as const,
  };
}
