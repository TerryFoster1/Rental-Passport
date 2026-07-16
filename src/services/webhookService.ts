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
  { name: 'verification_request.received', description: 'A partner post-application verification request was received.' },
  { name: 'applicant.invited', description: 'Rental Passport invited the applicant to continue verification.' },
  { name: 'applicant.viewed', description: 'The applicant opened the verification request.' },
  { name: 'applicant.accepted', description: 'The applicant accepted the verification request.' },
  { name: 'applicant.declined', description: 'The applicant declined the verification request.' },
  { name: 'payment.pending', description: 'A demo or production payment is pending.' },
  { name: 'payment.completed', description: 'Payment was completed, waived, or covered by a plan credit.' },
  { name: 'verification.started', description: 'Verification work started.' },
  { name: 'additional_information.requested', description: 'Additional applicant information was requested.' },
  { name: 'verification.needs_review', description: 'Verification completed with one or more items needing review.' },
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
