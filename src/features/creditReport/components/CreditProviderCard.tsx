import { Building2, UploadCloud } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { CreditReportWorkflow } from '@/types/creditReport';

export function CreditProviderCard({ workflow, selected, onSelect }: { workflow: CreditReportWorkflow; selected: boolean; onSelect: () => void }) {
  const isProvider = workflow === 'provider_request';
  return (
    <button className="block w-full text-left" onClick={onSelect}>
      <Card className={selected ? 'border-blue-300 bg-blue-50/50 p-5' : 'p-5'}>
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
            {isProvider ? <Building2 className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black">{isProvider ? 'Run my credit report through Rental Passport' : 'Upload a recent credit report'}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {isProvider
                ? "We'll securely obtain your credit report through one of our approved providers after receiving your consent."
                : 'If your report is recent, Rental Passport can review and verify it.'}
            </p>
          </div>
        </div>
      </Card>
    </button>
  );
}
