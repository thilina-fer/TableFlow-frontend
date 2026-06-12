import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, Clock, CheckCircle, Package, CreditCard, XCircle, ChevronLeft } from "lucide-react"

import { getOrderById } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import type { Order } from "@/types"
import { formatDateTime, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"

export default function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { socket } = useSocket() // no token for public socket

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id)
        if (res.data.success) {
          setOrder(res.data.data)
        } else {
          setError(res.data.message || "Failed to load order")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (!socket || !id) return

    // Join room for this specific order
    socket.emit("join_order_room", { orderId: id })

    // Listeners
    socket.on("order_approved", () => setOrder(prev => prev ? { ...prev, status: "preparing" } : null))
    socket.on("order_rejected", (data) => setOrder(prev => prev ? { ...prev, status: "rejected", rejectionReason: data.reason } : null))
    socket.on("order_completed", () => setOrder(prev => prev ? { ...prev, status: "completed" } : null))
    socket.on("order_delivered", () => setOrder(prev => prev ? { ...prev, status: "delivered" } : null))
    socket.on("payment_success", () => setOrder(prev => prev ? { ...prev, paymentStatus: "paid" } : null))

    return () => {
      socket.off("order_approved")
      socket.off("order_rejected")
      socket.off("order_completed")
      socket.off("order_delivered")
      socket.off("payment_success")
    }
  }, [socket, id])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading order...</div>
  if (error || !order) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">{error || "Order not found"}</div>

  const isRejected = order.status === "rejected"
  const isPaid = order.paymentStatus === "paid"

  // Determine active step index
  let currentStep = 0
  if (order.status === "placed") currentStep = 1
  else if (order.status === "preparing") currentStep = 2
  else if (order.status === "completed") currentStep = 3
  else if (order.status === "delivered") {
    currentStep = order.paymentStatus === "paid" ? 5 : 4
  }

  const steps = [
    { label: "Order Placed", icon: <Clock size={20} /> },
    { label: "Being Prepared", icon: <CheckCircle2 size={20} /> },
    { label: "Ready for Delivery", icon: <CheckCircle size={20} /> },
    { label: "Delivered", icon: <Package size={20} /> },
    { label: "Paid", icon: <CreditCard size={20} /> },
  ]

  const showPaymentCTA = order.paymentMethod === "card" && order.paymentStatus === "pending" && order.status === "delivered"

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm border border-slate-200">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-xs font-semibold">Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId.tableNumber}</span>
              <span className="text-sm text-slate-500 font-medium">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {isRejected ? (
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center shadow-sm">
            <XCircle className="mx-auto text-red-500 h-16 w-16 mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Order Rejected</h2>
            <p className="text-red-700 font-medium mb-6">{order.rejectionReason || "Sorry, we could not process your order at this time."}</p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-full">
              Start New Order
            </Button>
          </div>
        ) : (
          <div className={`${theme.card} p-8 relative`}>
            <div className="absolute top-0 bottom-0 left-[43px] w-0.5 bg-slate-100" />
            <div className="space-y-8 relative">
              {steps.map((step, index) => {
                const stepNum = index + 1
                const isActive = stepNum === currentStep
                const isCompleted = stepNum < currentStep || (stepNum === 5 && isPaid)
                const isPending = stepNum > currentStep

                return (
                  <div key={index} className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors duration-500 ${
                      isCompleted ? "bg-emerald-500 text-white" :
                      isActive ? "bg-brand text-white ring-4 ring-orange-100" :
                      "bg-slate-100 text-slate-400 border-2 border-slate-200"
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${
                        isCompleted ? "text-slate-900" :
                        isActive ? "text-brand" :
                        "text-slate-400"
                      }`}>{step.label}</h3>
                      {isActive && <p className="text-sm text-slate-500 font-medium animate-pulse">In progress...</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showPaymentCTA && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg text-center transform hover:scale-[1.02] transition-transform">
            <h2 className="text-xl font-bold mb-2">Your order is ready!</h2>
            <p className="text-orange-50 mb-5 font-medium">Please proceed to card payment to complete your order.</p>
            <Button 
              onClick={() => navigate(`/order/${id}/pay`)} 
              className="w-full bg-white text-orange-600 hover:bg-slate-50 rounded-xl h-12 text-lg shadow-sm"
            >
              Pay {formatPrice(order.totalAmount)}
            </Button>
          </div>
        )}

        {/* Order Summary */}
        <div className={`${theme.card} p-6`}>
          <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-sm">{item.quantity}x</span>
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.variantName && <p className="text-xs text-slate-500">{item.variantName}</p>}
                  </div>
                </div>
                <span className="font-medium text-slate-700">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-sm font-medium text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Payment Method</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {order.paymentMethod === "cash" ? "💵 Cash" : "💳 Card"}
            </div>
          </div>
          {order.specialNote && (
             <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm italic font-medium">
               "{order.specialNote}"
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
