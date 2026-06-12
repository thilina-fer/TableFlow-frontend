import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, LogOut, Check, Hand, Loader2 } from "lucide-react"

import { getWaiterOrders, getWaiterHistory, claimOrder, deliverOrder } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { selectAccessToken, selectCurrentUser, clearCredentials as logout } from "@/features/auth/authSlice"
import type { Order } from "@/types"
import { timeAgo, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function Waiter() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  const { socket } = useSocket({ token: token || undefined })
  
  const [unclaimedOrders, setUnclaimedOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [currentTime, setCurrentTime] = useState(new Date())
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
        const res = await getWaiterOrders()
        if (res.data.success) {
          const allOrders = res.data.data
          setUnclaimedOrders(allOrders.filter((o: Order) => !o.assignedWaiterId))
          setMyOrders(allOrders.filter((o: Order) => o.assignedWaiterId === user?._id))
        }
      } catch (error) {
        toast.error("Failed to load waiter orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user?._id])

  useEffect(() => {
    if (!socket) return

    socket.on("order_completed", (order: Order) => {
      setUnclaimedOrders(prev => [order, ...prev])
      toast.info(`Order ready for Table ${typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}!`)
    })

    socket.on("order_claimed", (data: { orderId: string, waiterId: string }) => {
      if (data.waiterId !== user?._id) {
        setUnclaimedOrders(prev => prev.filter(o => o._id !== data.orderId))
      }
    })

    socket.on("payment_success", (data: { orderId: string }) => {
      setMyOrders(prev => prev.filter(o => o._id !== data.orderId))
    })

    return () => {
      socket.off("order_completed")
      socket.off("order_claimed")
      socket.off("payment_success")
    }
  }, [socket, user?._id])

  const handleClaim = async (id: string) => {
    setProcessingId(id)
    try {
      await claimOrder(id)
      const order = unclaimedOrders.find(o => o._id === id)
      if (order) {
        setUnclaimedOrders(prev => prev.filter(o => o._id !== id))
        setMyOrders(prev => [{ ...order, assignedWaiterId: user?._id }, ...prev])
      }
      toast.success("Order claimed")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to claim order")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeliver = async (id: string) => {
    setProcessingId(id)
    try {
      await deliverOrder(id)
      setMyOrders(prev => prev.filter(o => o._id !== id))
      toast.success("Order delivered to table!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to deliver order")
    } finally {
      setProcessingId(null)
    }
  }

  const fetchHistory = async () => {
    setLoadingHistory(true)
    setHistoryOpen(true)
    try {
      const res = await getWaiterHistory()
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

  const OrderCard = ({ order, type }: { order: Order, type: "unclaimed" | "my" }) => {
    const isProcessing = processingId === order._id
    
    return (
      <div className={`${theme.card} p-4 border-l-4 ${type === "unclaimed" ? "border-l-purple-500" : "border-l-brand"} flex flex-col`}>
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
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="font-medium text-slate-700">
                <span className="text-slate-400 mr-2">{item.quantity}x</span>
                {item.name}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-sm font-medium text-slate-400 mt-1 italic">
              + {order.items.length - 2} more items
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 text-sm font-bold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          {type === "unclaimed" ? (
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              onClick={() => handleClaim(order._id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Hand size={16} className="mr-2" /> Claim Order</>}
            </Button>
          ) : (
            <Button 
              className="w-full bg-brand hover:bg-orange-600 text-white font-semibold"
              onClick={() => handleDeliver(order._id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Check size={16} className="mr-2" /> Mark Delivered</>}
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
            <span className="text-orange-500 text-lg">🛎</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Waiter Portal</h1>
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
        
        {/* Left Column - Ready to Deliver */}
        <div className="flex-1 flex flex-col bg-purple-50/50 rounded-xl border border-purple-100 overflow-hidden">
          <div className="p-4 bg-purple-100 border-b border-purple-200 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-purple-900">Ready to Deliver</h2>
            <span className="bg-purple-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unclaimedOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unclaimedOrders.map(order => <OrderCard key={order._id} order={order} type="unclaimed" />)}
              {unclaimedOrders.length === 0 && <div className="col-span-full text-center text-purple-400 py-12 font-medium">No orders ready for delivery</div>}
            </div>
          </div>
        </div>

        {/* Right Column - My Orders */}
        <div className="flex-1 flex flex-col bg-orange-50/50 rounded-xl border border-orange-100 overflow-hidden">
          <div className="p-4 bg-orange-100 border-b border-orange-200 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-orange-900">My Deliveries</h2>
            <span className="bg-orange-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{myOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map(order => <OrderCard key={order._id} order={order} type="my" />)}
              {myOrders.length === 0 && <div className="col-span-full text-center text-orange-400 py-12 font-medium">No active deliveries</div>}
            </div>
          </div>
        </div>

      </div>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>My Deliveries History</DialogTitle>
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
                          order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
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
