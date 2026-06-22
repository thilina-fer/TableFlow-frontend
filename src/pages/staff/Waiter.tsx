import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, Check, Hand, Loader2 } from "lucide-react"

import { getWaiterOrders, claimOrder, deliverOrder } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import { useAppSelector } from "@/app/hooks"
import { selectAccessToken, selectCurrentUser } from "@/features/auth/authSlice"
import type { Order } from "@/types"
import { timeAgo, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { Button } from "@/components/ui/button"

export default function Waiter() {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)
  const { socket } = useSocket({ token: token || undefined })
  
  const [unclaimedOrders, setUnclaimedOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [processingId, setProcessingId] = useState<string | null>(null)

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

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500 h-8 w-8" /></div>

  const OrderCard = ({ order, type }: { order: Order, type: "unclaimed" | "my" }) => {
    const isProcessing = processingId === order._id
    
    return (
      <div className={`${theme.card} p-4 border-l-4 ${type === "unclaimed" ? "border-l-purple-500" : "border-l-orange-500"} flex flex-col h-full bg-white`}>
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
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="font-medium text-slate-700 pr-2 flex-1">
                <span className="text-slate-400 mr-2">{item.quantity}x</span>
                {item.name}
              </span>
              <span className="font-medium text-slate-700 shrink-0">
                {formatPrice(item.subtotal || (item.price * item.quantity))}
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
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
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Waiter Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-red-500"} shadow-sm`} />
            <span className="text-sm text-slate-500 font-medium">
              {socket?.connected ? "System Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 pb-6">
        {/* Left Column - Ready to Deliver */}
        <div className="flex-1 flex flex-col bg-purple-50/30 rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-purple-50/80 border-b border-purple-100 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-purple-900">Ready to Deliver</h2>
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{unclaimedOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {unclaimedOrders.map(order => <OrderCard key={order._id} order={order} type="unclaimed" />)}
              {unclaimedOrders.length === 0 && <div className="col-span-full text-center text-purple-400 py-12 font-medium">No orders ready for delivery</div>}
            </div>
          </div>
        </div>

        {/* Right Column - My Orders */}
        <div className="flex-1 flex flex-col bg-orange-50/30 rounded-2xl border border-orange-100 overflow-hidden shadow-sm">
          <div className="p-4 bg-orange-50/80 border-b border-orange-100 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-orange-900">My Deliveries</h2>
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{myOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {myOrders.map(order => <OrderCard key={order._id} order={order} type="my" />)}
              {myOrders.length === 0 && <div className="col-span-full text-center text-orange-400 py-12 font-medium">No active deliveries</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
