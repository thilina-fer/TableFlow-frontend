import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTableColumn<T> {
  /** Column header label */
  header: string
  /** Unique key for the column */
  id: string
  /** Either a key of T or a render function */
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  /** Optional class for the <th> / <td> */
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  /** Row key extractor */
  getRowId: (row: T) => string | number
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found.',
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide text-slate-500',
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-sm text-slate-500"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  Loading…
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-slate-100 text-sm',
                  onRowClick &&
                    'cursor-pointer hover:bg-slate-50 transition-colors',
                )}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey !== undefined
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
