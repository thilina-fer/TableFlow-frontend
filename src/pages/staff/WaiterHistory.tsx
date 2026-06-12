import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Clock, Loader2, History as HistoryIcon } from "lucide-react"

import { getWaiterHistory } from "@/api/order.api"
import type { Order } from "@/types"
import { timeAgo, formatPrice } from "@/lib/utils"

export default function WaiterHistory() {
  const [historyOrders, setHistoryOrders] = useState<Order[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
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
    fetchHistory()
  }, [])

  if (loadingHistory) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500 h-8 w-8" /></div>

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <HistoryIcon className="text-orange-500" />
            Order History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            A complete record of all your past deliveries.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {historyOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <HistoryIcon className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No history available</h3>
            <p className="text-slate-500 text-sm">Your past deliveries will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {historyOrders.map(order => (
                <div key={order._id} className="p-5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-200 flex flex-col relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg text-slate-800">
                        Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-1">
                        <Clock size={12} />
                        {timeAgo(order.createdAt)}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1 mb-4 flex-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span><span className="font-medium text-slate-400 mr-2">{item.quantity}x</span>{item.name}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-xs italic text-slate-400 mt-1">+{order.items.length - 3} more items</div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-200/60 flex justify-between items-center">
                     <span className="text-xs text-slate-500 font-medium">Total</span>
                     <span className="font-bold text-slate-800">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
