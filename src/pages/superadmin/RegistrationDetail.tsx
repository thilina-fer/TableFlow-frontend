import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { SuperAdminService } from "@/services/superadmin.service"
import type { Restaurant } from "@/types"
import { theme } from "@/lib/theme"

import { PageHeader, StatusBadge, LoadingSpinner, ConfirmDialog } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function RegistrationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false)
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  
  const [reason, setReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRegistration = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await SuperAdminService.getRegistrationById(id)
      setRestaurant(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch registration")
      navigate("/superadmin/registrations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistration()
  }, [id])

  const handleApprove = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await SuperAdminService.approveRegistration(id)
      toast.success("Restaurant approved successfully")
      setApproveConfirmOpen(false)
      fetchRegistration()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve restaurant")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      await SuperAdminService.reactivateRegistration(id)
      toast.success("Restaurant reactivated successfully")
      setReactivateConfirmOpen(false)
      fetchRegistration()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate restaurant")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectSubmit = async () => {
    if (!id) return
    if (reason.length < 10) {
      toast.error("Reason must be at least 10 characters")
      return
    }
    setActionLoading(true)
    try {
      await SuperAdminService.rejectRegistration(id, reason)
      toast.success("Registration rejected")
      setRejectDialogOpen(false)
      setReason("")
      fetchRegistration()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject registration")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendSubmit = async () => {
    if (!id) return
    if (reason.length < 10) {
      toast.error("Reason must be at least 10 characters")
      return
    }
    setActionLoading(true)
    try {
      await SuperAdminService.suspendRegistration(id, reason)
      toast.success("Restaurant suspended")
      setSuspendDialogOpen(false)
      setReason("")
      fetchRegistration()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to suspend restaurant")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !restaurant) {
    return <div className="py-20"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={restaurant.name} 
          subtitle="Registration Detail"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Details Card */}
        <div className={`md:col-span-2 ${theme.card} p-6`}>
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Restaurant Info</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="font-medium">{restaurant.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Type</span>
                  <span className="font-medium">{restaurant.restaurantType}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Description</span>
                  <span>{restaurant.description}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Owner Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="font-medium">{restaurant.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-medium">{restaurant.ownerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-medium">{restaurant.ownerPhone}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Location</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="col-span-2">
                  <span className="text-slate-500 block">Address</span>
                  <span className="font-medium">{restaurant.address}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">City</span>
                  <span className="font-medium">{restaurant.city}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={restaurant.status} />
                </div>
                <div>
                  <span className="text-slate-500 block">Applied On</span>
                  <span className="font-medium">{new Date(restaurant.createdAt).toLocaleString()}</span>
                </div>
                {restaurant.approvedAt && (
                  <div>
                    <span className="text-slate-500 block">Approved On</span>
                    <span className="font-medium">{new Date(restaurant.approvedAt).toLocaleString()}</span>
                  </div>
                )}
                {restaurant.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-red-700 font-medium block">Rejection Reason:</span>
                    <span className="text-red-600">{restaurant.rejectionReason}</span>
                  </div>
                )}
                {restaurant.suspensionReason && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <span className="text-amber-700 font-medium block">Suspension Reason:</span>
                    <span className="text-amber-600">{restaurant.suspensionReason}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Actions Card */}
        <div className={`md:col-span-1 h-fit ${theme.card} p-6`}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
          
          <div className="space-y-3">
            {restaurant.status === "pending" && (
              <>
                <Button 
                  className={`w-full ${theme.btn.brand}`} 
                  onClick={() => setApproveConfirmOpen(true)}
                >
                  Approve Registration
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => setRejectDialogOpen(true)}
                >
                  Reject
                </Button>
              </>
            )}

            {restaurant.status === "approved" && (
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20" 
                onClick={() => setSuspendDialogOpen(true)}
              >
                Suspend Restaurant
              </Button>
            )}

            {restaurant.status === "suspended" && (
              <Button 
                className={`w-full ${theme.btn.brand}`} 
                onClick={() => setReactivateConfirmOpen(true)}
              >
                Reactivate Restaurant
              </Button>
            )}

            {restaurant.status === "rejected" && (
              <div className="text-sm text-slate-500 text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                This registration has been rejected and cannot be modified.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={approveConfirmOpen}
        onOpenChange={(open) => !open && setApproveConfirmOpen(false)}
        onConfirm={handleApprove}
        title="Approve Registration"
        description="Are you sure you want to approve this restaurant? This will send an email with login credentials to the owner."
        confirmLabel="Approve"
        isLoading={actionLoading}
      />

      <ConfirmDialog
        open={reactivateConfirmOpen}
        onOpenChange={(open) => !open && setReactivateConfirmOpen(false)}
        onConfirm={handleReactivate}
        title="Reactivate Restaurant"
        description="Are you sure you want to reactivate this restaurant? They will regain access to their dashboard."
        confirmLabel="Reactivate"
        isLoading={actionLoading}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 mb-3">
              Please provide a reason for rejecting this registration. This will be sent to the owner.
            </p>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Minimum 10 characters..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={actionLoading}>
              Reject Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Restaurant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-500 mb-3">
              Please provide a reason for suspending this restaurant. They will immediately lose access to their dashboard.
            </p>
            <Textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Minimum 10 characters..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSuspendSubmit} disabled={actionLoading}>
              Suspend Restaurant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
