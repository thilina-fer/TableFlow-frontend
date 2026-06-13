import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, Clock, CheckCircle, Package, CreditCard, XCircle, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

import { getOrderById, downloadPublicBill } from "@/api/order.api"
import { useSocket } from "@/hooks/useSocket"
import type { Order } from "@/types"
import { formatDateTime, formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"

const OrderTimer = ({ createdAt, status }: { createdAt: string, status: string }) => {
  const [elapsed, setElapsed] = useState("")

  useEffect(() => {
    if (status === "delivered" || status === "rejected") return
    
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
      if (diff < 0) return
      const m = Math.floor(diff / 60)
      const s = diff % 60
      setElapsed(`${m}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [createdAt, status])

  if (status === "delivered" || status === "rejected") return <span>Done</span>

  return <span>{elapsed || "0:00"}</span>
}

export default function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  
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

  const handleDownloadBill = async () => {
    setDownloading(true)
    try {
      const res = await downloadPublicBill(order._id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `receipt-${order._id.slice(-6).toUpperCase()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to download bill. It may not be generated yet.")
    } finally {
      setDownloading(false)
    }
  }

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
          <div className={`${theme.card} p-6 sm:p-8 relative`}>
            {/* Header & Timer */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h3 className="font-bold text-slate-800">Live Status</h3>
               <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                  <Clock size={16} className={order.status !== "delivered" ? "animate-spin-slow" : ""} />
                  <OrderTimer createdAt={order.createdAt.toString()} status={order.status} />
               </div>
            </div>

            {/* Horizontal Steps (Uber Eats Style) */}
            <div className="flex justify-between items-center relative w-full pt-4 pb-2 px-2">
              {/* background connecting line */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[10%] right-[10%] h-1 bg-slate-200 -z-10 rounded-full" />
              {/* active connecting line */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 left-[10%] h-1 bg-brand transition-all duration-1000 -z-10 rounded-full" 
                style={{ width: `${Math.max(0, (currentStep - 1) / (steps.length - 1) * 80)}%` }} 
              />
              
              {steps.map((step, index) => {
                const stepNum = index + 1
                const isActive = stepNum === currentStep
                const isCompleted = stepNum < currentStep || (stepNum === 5 && isPaid)

                return (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                      isCompleted ? "bg-emerald-500 text-white shadow-md scale-100 sm:scale-105" :
                      isActive ? "bg-brand text-white shadow-lg ring-4 ring-orange-100 scale-110 sm:scale-110" :
                      "bg-slate-100 text-slate-300 border-2 border-white"
                    }`}>
                      <div className="scale-75 sm:scale-100">{step.icon}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Current Step Description */}
            <div className="text-center mt-6 mb-2">
               <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                 {isPaid ? "Payment Successful" : steps[currentStep - 1]?.label || "Order Completed"}
               </h3>
               <p className="text-sm text-slate-500 font-medium mt-1">
                 {currentStep === 1 && "Waiting for kitchen to accept..."}
                 {currentStep === 2 && "Your food is being cooked with care."}
                 {currentStep === 3 && "Waiting for waiter to pick up."}
                 {currentStep === 4 && (!isPaid ? "Enjoy your meal!" : "Thank you for dining with us!")}
                 {currentStep === 5 && "Thank you for visiting!"}
               </p>
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
                <span className="font-medium text-slate-700 shrink-0 ml-3">{formatPrice(item.subtotal)}</span>
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
              <span className="shrink-0">{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span className="shrink-0">{formatPrice(order.totalAmount)}</span>
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

          {isPaid && (
            <Button 
              onClick={handleDownloadBill} 
              disabled={downloading}
              className="w-full mt-6 bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 shadow-md"
            >
              {downloading ? "Downloading..." : "Download Bill (PDF)"}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}
