import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, Check, Receipt, Loader2, Download } from "lucide-react"

import { getCashierOrders, markCashPayment, downloadBill } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import { useAppSelector } from "@/app/hooks"
import { selectAccessToken } from "@/features/auth/authSlice"
import type { Order } from "@/types"
import { timeAgo, formatPrice, downloadBlob } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared"

export default function Cashier() {
  const token = useAppSelector(selectAccessToken)
  const { socket } = useSocket({ token: token || undefined })
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getCashierOrders()
        if (res.data.success) {
          setOrders(res.data.data)
        }
      } catch (error) {
        toast.error("Failed to load cashier orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("payment_success", (data: { orderId: string }) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, paymentStatus: "paid" } : o))
      toast.success("Card payment received via Stripe!")
    })

    socket.on("order_delivered", (order: Order) => {
      setOrders(prev => [order, ...prev])
      toast.info(`Table ${typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber} order delivered and awaiting payment.`)
    })

    return () => {
      socket.off("payment_success")
      socket.off("order_delivered")
    }
  }, [socket])

  const handleMarkPaid = async (id: string) => {
    setProcessingId(id)
    try {
      await markCashPayment(id)
      setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus: "paid" } : o))
      toast.success("Payment marked as received")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDownloadBill = async (id: string) => {
    setDownloadingId(id)
    try {
      const res = await downloadBill(id)
      downloadBlob(new Blob([res.data]), `bill-${id.slice(-6)}.pdf`)
    } catch (error) {
      toast.error("Failed to download bill")
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500 h-8 w-8" /></div>

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cashier Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? "bg-green-500" : "bg-red-500"} shadow-sm`} />
            <span className="text-sm text-slate-500 font-medium">
              {socket?.connected ? "System Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-4">
          
          {orders.length === 0 ? (
            <div className="pt-12">
              <EmptyState 
                icon={<Receipt className="h-12 w-12 text-slate-300" />}
                title="No pending payments"
                description="Delivered orders awaiting payment will appear here"
              />
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className={`${theme.card} p-5 sm:p-6 shadow-sm border-l-4 ${order.paymentStatus === 'paid' ? 'border-l-emerald-500' : 'border-l-orange-500'} bg-white`}>
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                      Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}
                      <span className="text-sm font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                      <span className={`px-2 py-0.5 rounded font-bold ${order.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={14} /> {timeAgo(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 font-medium mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  
                  <div className="text-sm text-slate-600 font-medium">
                    {order.items.length} items ordered
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadBill(order._id)}
                      disabled={downloadingId === order._id}
                      className="flex-1 sm:flex-none border-slate-200"
                    >
                      {downloadingId === order._id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download size={16} className="mr-2" />}
                      Bill
                    </Button>

                    {order.paymentStatus === 'paid' ? (
                      <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-lg font-bold flex items-center justify-center flex-1 sm:flex-none">
                        <Check size={18} className="mr-2" /> Paid
                      </div>
                    ) : order.paymentMethod === 'card' ? (
                      <div className="bg-orange-50 text-orange-600 px-6 py-2 rounded-lg font-bold flex items-center justify-center flex-1 sm:flex-none animate-pulse border border-orange-200">
                        Awaiting card...
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleMarkPaid(order._id)}
                        disabled={processingId === order._id}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-sm shadow-emerald-500/20"
                      >
                        {processingId === order._id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <><Check size={18} className="mr-2" /> Mark Paid</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  )
}
