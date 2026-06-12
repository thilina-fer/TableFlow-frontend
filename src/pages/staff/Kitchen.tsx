import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, Check, X, Loader2 } from "lucide-react"

import { getKitchenOrders, approveOrder, rejectOrder, completeOrder } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import { useAppSelector } from "@/app/hooks"
import { selectAccessToken } from "@/features/auth/authSlice"
import type { Order } from "@/types"
import { timeAgo, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function Kitchen() {
  const token = useAppSelector(selectAccessToken)
  const { socket } = useSocket({ token: token || undefined })
  
  const [placedOrders, setPlacedOrders] = useState<Order[]>([])
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getKitchenOrders()
        if (res.data.success) {
          setPlacedOrders(res.data.data.filter((o: Order) => o.status === "placed"))
          setPreparingOrders(res.data.data.filter((o: Order) => o.status === "preparing"))
        }
      } catch (error) {
        toast.error("Failed to load kitchen orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("new_order", (order: Order) => {
      setPlacedOrders(prev => [order, ...prev])
      toast.info(`New order received! Table ${typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}`)
    })

    return () => {
      socket.off("new_order")
    }
  }, [socket])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await approveOrder(id)
      const order = placedOrders.find(o => o._id === id)
      if (order) {
        setPlacedOrders(prev => prev.filter(o => o._id !== id))
        setPreparingOrders(prev => [{ ...order, status: "preparing" }, ...prev])
      }
      toast.success("Order approved and moved to preparing")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve order")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget || rejectReason.length < 5) return
    setProcessingId(rejectTarget)
    try {
      await rejectOrder(rejectTarget, rejectReason)
      setPlacedOrders(prev => prev.filter(o => o._id !== rejectTarget))
      toast.info("Order rejected")
      setRejectTarget(null)
      setRejectReason("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject order")
    } finally {
      setProcessingId(null)
    }
  }

  const handleComplete = async (id: string) => {
    setProcessingId(id)
    try {
      await completeOrder(id)
      setPreparingOrders(prev => prev.filter(o => o._id !== id))
      toast.success("Order ready for delivery")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete order")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500 h-8 w-8" /></div>

  const OrderCard = ({ order, type }: { order: Order, type: "placed" | "preparing" }) => {
    const isProcessing = processingId === order._id
    
    return (
      <div className={`${theme.card} p-4 border-l-4 ${type === "placed" ? "border-l-blue-500" : "border-l-orange-500"} flex flex-col h-full bg-white`}>
        <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
          <h3 className="font-bold text-lg text-slate-800">
            Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
            <Clock size={14} />
            {timeAgo(order.createdAt)}
          </div>
        </div>

        <div className="space-y-1 mb-4 flex-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="font-medium text-slate-700">
                <span className="text-slate-400 mr-2">{item.quantity}x</span>
                {item.name} {item.variantName && <span className="text-slate-400 text-xs">({item.variantName})</span>}
              </span>
            </div>
          ))}
        </div>

        {order.specialNote && (
          <div className="bg-amber-50 text-amber-800 p-2 rounded text-xs font-medium italic mb-4">
            Note: {order.specialNote}
          </div>
        )}

        <div className="flex justify-between items-center mb-4 text-sm font-bold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          {type === "placed" ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 bg-white hover:bg-green-50 border-green-200 text-green-700 font-semibold"
                onClick={() => handleApprove(order._id)}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Check size={16} className="mr-1" /> Approve</>}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-white hover:bg-red-50 border-red-200 text-red-700 font-semibold"
                onClick={() => setRejectTarget(order._id)}
                disabled={isProcessing}
              >
                <X size={16} className="mr-1" /> Reject
              </Button>
            </>
          ) : (
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              onClick={() => handleComplete(order._id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Check size={16} className="mr-1" /> Mark Complete</>}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kitchen Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-red-500"} shadow-sm`} />
            <span className="text-sm text-slate-500 font-medium">
              {socket?.connected ? "System Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 pb-6">
        {/* Left Column - New Orders */}
        <div className="flex-1 flex flex-col bg-blue-50/30 rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-blue-50/80 border-b border-blue-100 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-blue-900">New Orders</h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{placedOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {placedOrders.map(order => <OrderCard key={order._id} order={order} type="placed" />)}
              {placedOrders.length === 0 && <div className="col-span-full text-center text-blue-400 py-12 font-medium">No new orders</div>}
            </div>
          </div>
        </div>

        {/* Right Column - Preparing */}
        <div className="flex-1 flex flex-col bg-orange-50/30 rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-orange-50/80 border-b border-orange-100 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-orange-900">Preparing</h2>
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{preparingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {preparingOrders.map(order => <OrderCard key={order._id} order={order} type="preparing" />)}
              {preparingOrders.length === 0 && <div className="col-span-full text-center text-orange-400 py-12 font-medium">No orders preparing</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (e.g. Out of stock)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectReason.trim().length < 5 || processingId === rejectTarget}
            >
              {processingId === rejectTarget ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
