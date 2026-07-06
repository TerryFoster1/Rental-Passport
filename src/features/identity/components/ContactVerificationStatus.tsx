import { MailCheck, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge, VerifiedBadge } from '@/components/ui/Badge';

export function ContactVerificationStatus({ emailVerified, phoneStatus }: { emailVerified: boolean; phoneStatus: string }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black">Contact Verification</h2>
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-semibold"><MailCheck className="h-5 w-5 text-blue-700" />Email</span>
          {emailVerified ? <VerifiedBadge label="Email Verified" /> : <StatusBadge status="Needs Verification" />}
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-semibold"><Phone className="h-5 w-5 text-blue-700" />Phone</span>
          <StatusBadge status={phoneStatus === 'manually_confirmed' ? 'Manually Confirmed' : 'Manual Placeholder'} />
        </div>
      </div>
    </Card>
  );
}
