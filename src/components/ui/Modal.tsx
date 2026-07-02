import { X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <Card className="w-full max-w-lg p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">{title}</h2>
          <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </Card>
    </div>
  );
}
