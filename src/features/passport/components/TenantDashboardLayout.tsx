import type { ReactNode } from 'react';

export function TenantDashboardLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">{children}</div>
      {aside && <aside className="space-y-5">{aside}</aside>}
    </div>
  );
}
