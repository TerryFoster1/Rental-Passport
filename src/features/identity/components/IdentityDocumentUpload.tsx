import { UploadBox } from '@/components/forms/UploadBox';
import type { IdentityUploadKind } from '@/types/identity';

const uploadCopy: Record<IdentityUploadKind, { label: string; description: string }> = {
  government_id_front: {
    label: 'Government ID front',
    description: 'Upload the front of your government-issued ID. PDF, JPG, or PNG. Maximum 10MB.',
  },
  government_id_back: {
    label: 'Government ID back',
    description: 'Upload the back of your government-issued ID where applicable. PDF, JPG, or PNG. Maximum 10MB.',
  },
  selfie: {
    label: 'Selfie',
    description: 'Upload a clear selfie for manual comparison. This is never used as your avatar.',
  },
};

export function IdentityDocumentUpload({ kind, onFileSelected }: { kind: IdentityUploadKind; onFileSelected: (kind: IdentityUploadKind, file: File) => void }) {
  const copy = uploadCopy[kind];
  return <UploadBox label={copy.label} description={copy.description} onFileSelected={(file) => onFileSelected(kind, file)} />;
}
