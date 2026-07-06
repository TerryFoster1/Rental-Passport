import { UploadCloud } from 'lucide-react';

export function UploadBox({ label, description, optional = false, onFileSelected }: { label: string; description: string; optional?: boolean; onFileSelected: (file: File) => void }) {
  const inputId = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <strong>{label}</strong>
              {optional && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black uppercase text-slate-600">Optional</span>}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </div>
        <label htmlFor={inputId}>
          <input
            id={inputId}
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelected(file);
              event.currentTarget.value = '';
            }}
          />
          <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-black text-navy transition hover:border-blue-300 hover:bg-blue-50">Choose File</span>
        </label>
      </div>
    </div>
  );
}
