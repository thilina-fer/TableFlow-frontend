import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { theme } from "@/lib/theme"

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
  pagination?: {
    page: number
    pages: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyState?: React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  pagination,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={theme.tableHeader}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center p-0 align-middle">
                  {emptyState || <span className="text-slate-500">No data available.</span>}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`${theme.tableRow} ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor as keyof T] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-slate-500">
            Total: <span className="font-medium text-slate-900">{pagination.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <div className="text-sm text-slate-600 px-2 font-medium">
              Page {pagination.page} of {Math.max(1, pagination.pages)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
