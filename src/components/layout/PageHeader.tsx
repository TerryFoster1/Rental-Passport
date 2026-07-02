export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="text-sm font-black uppercase tracking-wide text-blue-700">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-slate-700">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
