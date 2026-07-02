import { Card } from '@/components/ui/Card';

export function ProgressCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-black">{label}</h2>
        <span className="text-2xl font-black text-blue-700">{value}%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-700">{description}</p>
    </Card>
  );
}
