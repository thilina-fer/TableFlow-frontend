import { useState, useEffect } from "react"
import PageHeader from "@/components/shared/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import EmptyState from "@/components/shared/EmptyState"
import { theme } from "@/lib/theme"
import { formatDateTime } from "@/lib/utils"
import { SuperAdminService } from "@/services/superadmin.service"
import { Shield, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { AuditLog as AuditLogType } from "@/types"

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [loading, setLoading] = useState(true)
  
  const [actionFilter, setActionFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await SuperAdminService.getAuditLogs({
        action: actionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page
      } as any)
      setLogs((res as any).data || res.data)
      setTotalPages((res as any).pagination?.pages || 1)
    } catch (err: any) {
      toast.error(err.message || "Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [actionFilter, startDate, endDate, page])

  const handleClearFilters = () => {
    setActionFilter("")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200"
      case "SUSPENDED": return "bg-amber-100 text-amber-700 border-amber-200"
      case "REACTIVATED": return "bg-blue-100 text-blue-700 border-blue-200"
      case "DELETED": return "bg-red-100 text-red-700 border-red-200"
      case "PASSWORD_RESET": return "bg-slate-100 text-slate-700 border-slate-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const columns = [
    { 
      header: "Action", 
      accessor: "action" as keyof AuditLogType,
      render: (val: string) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(val)}`}>
          {val.replace("_", " ")}
        </span>
      )
    },
    { 
      header: "Restaurant", 
      accessor: "targetRestaurantName" as keyof AuditLogType,
      render: (val: string) => <span className="font-medium text-slate-900">{val || "Unknown"}</span>
    },
    { 
      header: "Reason / Note", 
      accessor: "reason" as keyof AuditLogType,
      render: (val: string) => <span className="text-slate-600 max-w-xs truncate block" title={val || ""}>{val || "—"}</span>
    },
    { 
      header: "Date & Time", 
      accessor: "createdAt" as keyof AuditLogType,
      render: (val: string) => <span className="text-slate-500 text-sm">{formatDateTime(val)}</span>
    }
  ]

  return (
    <div>
      <PageHeader 
        title="Audit Log" 
        subtitle="Immutable record of all super admin actions" 
      />

      <div className={`${theme.card} p-4 sm:p-6`}>
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">System Activity</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[150px]"
            >
              <option value="">All Actions</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REACTIVATED">Reactivated</option>
              <option value="DELETED">Deleted</option>
              <option value="PASSWORD_RESET">Password Reset</option>
            </select>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {(actionFilter || startDate || endDate) && (
              <button 
                onClick={handleClearFilters}
                className="h-10 px-3 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-lg"
              >
                <RefreshCw size={14} className="mr-2" /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState 
            icon={<Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />} 
            title="No audit records found" 
            description="There are no actions matching your current filters."
          />
        ) : (
          <DataTable 
            data={logs} 
            columns={columns}
            pagination={{
              page,
              pages: totalPages,
              total: logs.length,
              onPageChange: setPage
            }}
          />
        )}
      </div>
    </div>
  )
}
