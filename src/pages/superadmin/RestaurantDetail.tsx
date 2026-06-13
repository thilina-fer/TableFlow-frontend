import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import PageHeader from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { theme } from "@/lib/theme"
import { formatDate } from "@/lib/utils"
import { SuperAdminService } from "@/services/superadmin.service"
import type { Restaurant } from "@/types"
import { ArrowLeft, Store, Mail, Phone, MapPin, Key, Ban, CheckCircle2, Trash2, Loader2, Info } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showReactivate, setShowReactivate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  
  // Suspend dialog
  const [showSuspend, setShowSuspend] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchRestaurant = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await SuperAdminService.getRestaurantById(id)
      setRestaurant((res as any).data?.data || (res as any).data || res)
    } catch (err: any) {
      toast.error(err.message || "Failed to load restaurant details")
      navigate("/superadmin/restaurants")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurant()
  }, [id])

  const handleResetPassword = async () => {
    if (!id) return
    try {
      await SuperAdminService.resetRestaurantPassword(id)
      toast.success("Admin password has been reset successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setShowResetPassword(false)
    }
  }

  const handleReactivate = async () => {
    if (!id) return
    try {
      await SuperAdminService.reactivateRegistration(id)
      toast.success("Restaurant reactivated successfully")
      fetchRestaurant()
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate restaurant")
    } finally {
      setShowReactivate(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await SuperAdminService.deleteRestaurant(id)
      toast.success("Restaurant deleted successfully")
      navigate("/superadmin/restaurants")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete restaurant")
    } finally {
      setShowDelete(false)
    }
  }

  const handleSuspend = async () => {
    if (!id || !suspendReason.trim()) return
    setIsProcessing(true)
    try {
      await SuperAdminService.suspendRegistration(id, suspendReason.trim())
      toast.success("Restaurant suspended successfully")
      setShowSuspend(false)
      setSuspendReason("")
      fetchRestaurant()
    } catch (err: any) {
      toast.error(err.message || "Failed to suspend restaurant")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button 
        onClick={() => navigate("/superadmin/restaurants")}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} className="mr-1.5" /> Back to Restaurants
      </button>

      <PageHeader 
        title={restaurant.name} 
        subtitle="Manage restaurant details and platform access" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${theme.card} p-6 sm:p-8`}>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center border border-brand-100 shrink-0">
                <Store size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{restaurant.name}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-slate-500 font-medium">{restaurant.restaurantType}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                  <StatusBadge status={restaurant.status} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info size={16} className="text-slate-400" /> Owner Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="font-medium text-slate-900">{restaurant.ownerName}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email Address</p>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Mail size={14} className="text-slate-400" />
                      {restaurant.ownerEmail}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Phone Number</p>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      <Phone size={14} className="text-slate-400" />
                      {restaurant.ownerPhone}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
                  <MapPin size={16} className="text-slate-400" /> Location Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Address</p>
                    <p className="font-medium text-slate-900">{restaurant.address}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">City</p>
                    <p className="font-medium text-slate-900">{restaurant.city}</p>
                  </div>
                </div>
              </div>

              {restaurant.description && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
                    <Store size={16} className="text-slate-400" /> Description
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-700 leading-relaxed text-sm">{restaurant.description}</p>
                  </div>
                </div>
              )}

              {restaurant.status === "suspended" && restaurant.suspensionReason && (
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Ban size={16} className="text-amber-600" /> Suspension Reason
                  </h3>
                  <p className="text-amber-800 font-medium text-sm">{restaurant.suspensionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className={`${theme.card} p-6`}>
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Platform Actions</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-11 text-slate-700 bg-white hover:bg-slate-50"
                onClick={() => setShowResetPassword(true)}
              >
                <Key size={18} className="mr-3 text-slate-400" /> Reset Admin Password
              </Button>

              {restaurant.status === "approved" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300"
                  onClick={() => setShowSuspend(true)}
                >
                  <Ban size={18} className="mr-3 text-amber-500" /> Suspend Restaurant
                </Button>
              )}

              {restaurant.status === "suspended" && (
                <Button 
                  className="w-full justify-start h-11 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => setShowReactivate(true)}
                >
                  <CheckCircle2 size={18} className="mr-3" /> Reactivate Restaurant
                </Button>
              )}

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 text-red-600 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 size={18} className="mr-3 text-red-500" /> Delete Restaurant
                </Button>
              </div>
            </div>
          </div>

          <div className={`${theme.card} p-6 bg-slate-50/50`}>
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">Timeline</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registered On</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(restaurant.createdAt)}</p>
              </div>
              {restaurant.approvedAt && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Approved On</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(restaurant.approvedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showResetPassword}
        onOpenChange={setShowResetPassword}
        onConfirm={handleResetPassword}
        title="Reset Admin Password"
        description="Are you sure you want to reset the admin password for this restaurant? The new password will be sent to their email."
        confirmLabel="Reset Password"
      />

      <ConfirmDialog
        open={showReactivate}
        onOpenChange={setShowReactivate}
        onConfirm={handleReactivate}
        title="Reactivate Restaurant"
        description="Are you sure you want to reactivate this restaurant? They will regain access to their dashboard."
        confirmLabel="Reactivate"
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        description="Are you sure you want to permanently delete this restaurant? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Suspend Dialog */}
      <Dialog open={showSuspend} onOpenChange={(open) => !open && setShowSuspend(false)}>
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
              <Button type="button" variant="outline" onClick={() => setShowSuspend(false)} className="h-11 rounded-xl">
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || isProcessing}
                className="h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Suspend Restaurant
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
