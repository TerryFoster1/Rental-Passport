import { FileText, LockKeyhole } from 'lucide-react';

export type DocumentListItem = {
  id: string;
  name: string;
  kind: string;
  uploadedAt: string;
};

export function DocumentList({ documents }: { documents: DocumentListItem[] }) {
  if (documents.length === 0) {
    return <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No employment documents uploaded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {documents.map((document) => (
        <li key={document.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-700" />
            <div>
              <strong className="block">{document.name}</strong>
              <span className="text-sm text-slate-600">{document.kind} · {new Date(document.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
            <LockKeyhole className="h-3 w-3" />
            Private
          </span>
        </li>
      ))}
    </ul>
  );
}
