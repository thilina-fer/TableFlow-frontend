import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, LogOut, Check, X, Loader2 } from "lucide-react"

import { getKitchenOrders, getKitchenHistory, approveOrder, rejectOrder, completeOrder } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { selectAccessToken, clearCredentials as logout } from "@/features/auth/authSlice"
import type { Order } from "@/types"
import { timeAgo, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function Kitchen() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const { socket } = useSocket({ token: token || undefined })
  
  const [placedOrders, setPlacedOrders] = useState<Order[]>([])
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyOrders, setHistoryOrders] = useState<Order[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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

  const fetchHistory = async () => {
    setLoadingHistory(true)
    setHistoryOpen(true)
    try {
      const res = await getKitchenHistory()
      if (res.data.success) {
        setHistoryOrders(res.data.data)
      }
    } catch (error) {
      toast.error("Failed to load history")
    } finally {
      setLoadingHistory(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-brand h-8 w-8" /></div>

  const OrderCard = ({ order, type }: { order: Order, type: "placed" | "preparing" }) => {
    const isProcessing = processingId === order._id
    
    return (
      <div className={`${theme.card} p-4 border-l-4 ${type === "placed" ? "border-l-blue-500" : "border-l-orange-500"} flex flex-col`}>
        <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
          <h3 className="font-bold text-lg text-slate-900">
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
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Topbar */}
      <div className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <span className="text-orange-500 text-lg">🍳</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Kitchen Portal</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-slate-300 font-mono">
              {currentTime.toLocaleTimeString("en-US", { hour12: true })}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchHistory} className="text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700">
            <Clock size={16} className="mr-2" /> History
          </Button>
          <Button variant="ghost" size="sm" onClick={() => dispatch(logout())} className="text-slate-400 hover:text-white hover:bg-slate-800">
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-4 gap-4">
        
        {/* Left Column - New Orders */}
        <div className="flex-1 flex flex-col bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
          <div className="p-4 bg-blue-100 border-b border-blue-200 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-blue-900">New Orders</h2>
            <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{placedOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {placedOrders.map(order => <OrderCard key={order._id} order={order} type="placed" />)}
              {placedOrders.length === 0 && <div className="col-span-full text-center text-blue-400 py-12 font-medium">No new orders</div>}
            </div>
          </div>
        </div>

        {/* Right Column - Preparing */}
        <div className="flex-1 flex flex-col bg-orange-50/50 rounded-xl border border-orange-100 overflow-hidden">
          <div className="p-4 bg-orange-100 border-b border-orange-200 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-orange-900">Preparing</h2>
            <span className="bg-orange-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{preparingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 pr-2">
            {loadingHistory ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand" /></div>
            ) : historyOrders.length === 0 ? (
              <div className="text-center text-slate-500 py-10">No order history available</div>
            ) : (
              <div className="space-y-4">
                {historyOrders.map(order => (
                  <div key={order._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">
                        Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx}>{item.quantity}x {item.name}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
