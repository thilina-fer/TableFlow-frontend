import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusKey =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'placed'
  | 'preparing'
  | 'completed'
  | 'delivered'
  | 'paid'
  | 'failed'
  | 'available'
  | 'occupied'
  | 'awaiting_payment'
  | 'cancelled'
  | 'refunded'
  | 'reserved'

interface StatusConfig {
  label: string
  className: string
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  placed: {
    label: 'Placed',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  available: {
    label: 'Available',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  occupied: {
    label: 'Occupied',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  awaiting_payment: {
    label: 'Awaiting Payment',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  reserved: {
    label: 'Reserved',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
}

interface StatusBadgeProps {
  status: StatusKey | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusKey]

  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn('capitalize text-xs font-medium', className)}
      >
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium border',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  )
}
