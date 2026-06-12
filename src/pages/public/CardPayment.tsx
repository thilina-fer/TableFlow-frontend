import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Lock, Loader2, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

import { createPaymentIntent } from "@/api/payment.api"
import { getOrderById } from "@/api/order.api"
import type { Order } from "@/types"
import { formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { ErrorAlert } from "@/components/shared"

// Load stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")

const CheckoutForm = ({ order, clientSecret }: { order: Order; clientSecret: string }) => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setIsProcessing(false)
      return
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!")
        navigate(`/order/${order._id}/track`)
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorAlert message={error} />}
      
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#0f172a",
                fontFamily: "Inter, sans-serif",
                "::placeholder": { color: "#94a3b8" },
                iconColor: "#f97316"
              },
              invalid: {
                color: "#ef4444",
                iconColor: "#ef4444"
              }
            }
          }} 
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? <Loader2 className="animate-spin mr-2" size={24} /> : null}
        {isProcessing ? "Processing..." : `Pay ${formatPrice(order.totalAmount)}`}
      </Button>

      <p className="text-center text-xs text-slate-400 font-medium pt-2">
        Powered securely by <span className="font-bold text-slate-600">Stripe</span>
      </p>
    </form>
  )
}

export default function CardPayment() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const initPayment = async () => {
      try {
        const orderRes = await getOrderById(id)
        if (!orderRes.data.success) throw new Error(orderRes.data.message)
        
        const fetchedOrder = orderRes.data.data
        setOrder(fetchedOrder)

        if (fetchedOrder.paymentStatus === "paid") {
          navigate(`/order/${id}/track`)
          return
        }

        const intentRes = await createPaymentIntent(id)
        if (!intentRes.data.success) throw new Error(intentRes.data.message)

        setClientSecret(intentRes.data.data.clientSecret)
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment")
      } finally {
        setLoading(false)
      }
    }

    initPayment()
  }, [id, navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-brand h-8 w-8" /></div>
  if (error || !order || !clientSecret) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">{error || "Payment not available"}</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        
        <Button variant="ghost" className="mb-6 text-slate-500" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} className="mr-1" /> Back to Order
        </Button>

        <div className={`${theme.card} p-8 shadow-xl border-slate-200/60`}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-slate-700 h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Payment</h1>
            <p className="text-slate-500 mt-1 font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm order={order} clientSecret={clientSecret} />
          </Elements>
        </div>
      </div>
    </div>
  )
}
