export function Avatar({ name, size = 'md' }: { name?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = (name ?? 'Rental Passport')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11',
    lg: 'h-14 w-14 text-lg',
  };

  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700 ${sizes[size]}`}>{initials || 'RP'}</span>;
}
