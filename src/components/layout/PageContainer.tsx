import { cn } from '@/lib/utils';

export function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <main className={cn('mx-auto w-full max-w-7xl px-5 py-8 lg:px-8', className)}>{children}</main>;
}
