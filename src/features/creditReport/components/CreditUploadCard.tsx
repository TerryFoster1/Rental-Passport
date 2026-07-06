import { DocumentList } from '@/components/forms/DocumentList';
import { UploadBox } from '@/components/forms/UploadBox';
import type { CreditReportDocument } from '@/types/creditReport';

export function CreditUploadCard({ documents, onFileSelected }: { documents: CreditReportDocument[]; onFileSelected: (file: File) => void }) {
  return (
    <div className="space-y-4">
      <UploadBox label="Credit report PDF" description="Upload a recent credit report as a PDF. Maximum 10MB." onFileSelected={onFileSelected} />
      <DocumentList documents={documents} />
    </div>
  );
}
