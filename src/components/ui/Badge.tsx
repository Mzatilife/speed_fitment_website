import { ReactNode } from 'react';

type Color = 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'purple';

const colors: Record<Color, string> = {
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function Badge({ color = 'gray', children, className = '' }: { color?: Color; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: Color; label: string }> = {
    pending: { color: 'amber', label: 'Pending' },
    confirmed: { color: 'blue', label: 'Confirmed' },
    in_progress: { color: 'blue', label: 'In Progress' },
    completed: { color: 'green', label: 'Completed' },
    cancelled: { color: 'red', label: 'Cancelled' },
    paid: { color: 'green', label: 'Paid' },
    fulfilled: { color: 'green', label: 'Fulfilled' },
    new: { color: 'amber', label: 'New' },
    read: { color: 'blue', label: 'Read' },
    replied: { color: 'green', label: 'Replied' },
    archived: { color: 'gray', label: 'Archived' },
    refunded: { color: 'red', label: 'Refunded' },
  };
  const s = map[status] || { color: 'gray' as Color, label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}
