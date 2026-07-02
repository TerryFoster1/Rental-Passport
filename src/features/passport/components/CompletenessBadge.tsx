import { Badge } from '@/components/ui/Badge';

export function CompletenessBadge({ value }: { value: number }) {
  const tone = value >= 80 ? 'green' : value > 0 ? 'blue' : 'slate';
  return <Badge tone={tone}>{value}% Complete</Badge>;
}
