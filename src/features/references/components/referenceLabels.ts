import type { ReferenceCategory, ReferenceContactMethod, ReferenceRelationship, ReferenceVerificationRequestStatus } from '@/types/references';

export function referenceCategoryLabel(category: ReferenceCategory) {
  const labels: Record<ReferenceCategory, string> = {
    previous_landlord: 'Previous Landlord',
    professional: 'Professional',
    personal: 'Personal',
    property_manager: 'Property Manager',
    character_reference: 'Character Reference',
    other: 'Other',
  };
  return labels[category];
}

export function referenceRelationshipLabel(relationship: ReferenceRelationship) {
  const labels: Record<ReferenceRelationship, string> = {
    employer: 'Employer',
    manager: 'Manager',
    coworker: 'Co-worker',
    previous_landlord: 'Previous Landlord',
    property_manager: 'Property Manager',
    friend: 'Friend',
    family: 'Family',
    teacher: 'Teacher',
    client: 'Client',
    other: 'Other',
  };
  return labels[relationship];
}

export function contactMethodLabel(method: ReferenceContactMethod) {
  const labels: Record<ReferenceContactMethod, string> = {
    email: 'Email',
    phone: 'Phone',
    either: 'Either',
  };
  return labels[method];
}

export function referenceStatusLabel(status: ReferenceVerificationRequestStatus) {
  const labels: Record<ReferenceVerificationRequestStatus, string> = {
    draft: 'In Progress',
    ready_for_review: 'Ready for Review',
    under_review: 'Under Review',
    verified: 'Verified',
    needs_more_information: 'Needs More Information',
    needs_reverification: 'Needs Reverification',
    expired: 'Expired',
  };
  return labels[status];
}
