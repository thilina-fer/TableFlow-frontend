import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "@/components/shared/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { theme } from "@/lib/theme"
import { formatDate } from "@/lib/utils"
import { SuperAdminService } from "@/services/superadmin.service"
import type { Restaurant } from "@/types"
import { MoreVertical, Eye, Key, Ban, CheckCircle2, Trash2, Loader2, Store } from "lucide-react"
import { toast } from "sonner"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Need Suspend dialog which takes a reason
// import { suspendRegistration } from "@/api/superadmin.api"

export default function Restaurants() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [resetId, setResetId] = useState<string | null>(null)
  const [reactivateId, setReactivateId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Suspend dialog
  const [suspendId, setSuspendId] = useState<string | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [isSuspending, setIsSuspending] = useState(false)

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await SuperAdminService.getRestaurants({
        status: statusFilter === "all" ? undefined : statusFilter,
        page
      } as any)
      setRestaurants((res as any).data || res.data || [])
      setTotalPages((res as any).pagination?.pages || 1)
    } catch (err: any) {
      toast.error(err.message || "Failed to load restaurants")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [statusFilter, page])

  const handleResetPassword = async () => {
    if (!resetId) return
    try {
      await SuperAdminService.resetRestaurantPassword(resetId)
      toast.success("Admin password has been reset successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setResetId(null)
    }
  }

  const handleReactivate = async () => {
    if (!reactivateId) return
    try {
      await SuperAdminService.reactivateRegistration(reactivateId)
      toast.success("Restaurant reactivated successfully")
      fetchRestaurants()
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate restaurant")
    } finally {
      setReactivateId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await SuperAdminService.deleteRestaurant(deleteId)
      toast.success("Restaurant deleted successfully")
      fetchRestaurants()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete restaurant")
    } finally {
      setDeleteId(null)
    }
  }

  const handleSuspend = async () => {
    if (!suspendId || !suspendReason.trim()) return
    setIsSuspending(true)
    try {
      await SuperAdminService.suspendRegistration(suspendId, suspendReason.trim())
      toast.success("Restaurant suspended successfully")
      setSuspendId(null)
      setSuspendReason("")
      fetchRestaurants()
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend restaurant")
    } finally {
      setIsSuspending(false)
    }
  }

  const columns = [
    { header: "Name", accessor: "name" as keyof Restaurant, render: (_val: any, row: Restaurant) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { header: "City", accessor: "city" as keyof Restaurant },
    { header: "Type", accessor: "restaurantType" as keyof Restaurant },
    { header: "Status", accessor: "status" as keyof Restaurant, render: (val: string) => <StatusBadge status={val} /> },
    { header: "Approved Date", accessor: "approvedAt" as keyof Restaurant, render: (val: any) => val ? formatDate(val) : "—" },
    {
      header: "Actions",
      accessor: "_id" as keyof Restaurant,
      render: (id: string, row: Restaurant) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical size={16} className="text-slate-500" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-in fade-in zoom-in-95"
                align="end"
              >
                <DropdownMenu.Item 
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer outline-none"
                  onClick={() => navigate(`/superadmin/restaurants/${id}`)}
                >
                  <Eye size={16} className="mr-2" /> View Details
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer outline-none"
                  onClick={() => setResetId(id)}
                >
                  <Key size={16} className="mr-2" /> Reset Password
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                
                {row.status === "approved" && (
                  <DropdownMenu.Item 
                    className="flex items-center px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer outline-none"
                    onClick={() => setSuspendId(id)}
                  >
                    <Ban size={16} className="mr-2" /> Suspend
                  </DropdownMenu.Item>
                )}
                
                {row.status === "suspended" && (
                  <DropdownMenu.Item 
                    className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer outline-none"
                    onClick={() => setReactivateId(id)}
                  >
                    <CheckCircle2 size={16} className="mr-2" /> Reactivate
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item 
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer outline-none"
                  onClick={() => setDeleteId(id)}
                >
                  <Trash2 size={16} className="mr-2" /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader 
        title="Restaurants" 
        subtitle="Manage all active and suspended restaurants on the platform" 
      />

      <div className={`${theme.card} p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Restaurant Directory</h3>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <DataTable 
            data={restaurants} 
            columns={columns} 
            onRowClick={(item: any) => navigate(`/superadmin/restaurants/${item._id}`)}
            pagination={{
              page,
              pages: totalPages,
              total: restaurants.length,
              onPageChange: setPage
            }}
          />
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!resetId}
        onOpenChange={() => setResetId(null)}
        onConfirm={handleResetPassword}
        title="Reset Admin Password"
        description="Are you sure you want to reset the admin password for this restaurant? The new password will be sent to their email."
        confirmLabel="Reset Password"
      />

      <ConfirmDialog
        open={!!reactivateId}
        onOpenChange={() => setReactivateId(null)}
        onConfirm={handleReactivate}
        title="Reactivate Restaurant"
        description="Are you sure you want to reactivate this restaurant? They will regain access to their dashboard."
        confirmLabel="Reactivate"
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        description="Are you sure you want to permanently delete this restaurant? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Suspend Dialog */}
      <Dialog open={!!suspendId} onOpenChange={(open) => !open && setSuspendId(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-0">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">Suspend Restaurant</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Please provide a reason for suspending this restaurant. They will be notified via email.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter suspension reason..."
                className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>
            <DialogFooter className="mt-6 gap-3 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setSuspendId(null)} className="h-11 rounded-xl">
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || isSuspending}
                className="h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSuspending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Suspend Restaurant
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
