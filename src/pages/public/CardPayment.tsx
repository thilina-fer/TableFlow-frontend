import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Lock, Loader2, ChevronLeft, CreditCard as CardIcon } from "lucide-react"
import { toast } from "sonner"

import { createPaymentIntent, mockPaymentSuccess } from "@/api/payment.api"
import { getOrderById } from "@/api/order.api"
import type { Order } from "@/types"
import { formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/shared"

// Load stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "")

const MockCheckoutForm = ({ order }: { order: Order }) => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")

  const handleMockPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || !expiry || !cvc || !name) {
      toast.error("Please fill in all card details")
      return
    }

    setIsProcessing(true)
    try {
      const res = await mockPaymentSuccess(order._id)
      if (res.data.success) {
        toast.success("Payment successful!")
        navigate(`/order/${order._id}/track`)
      }
    } catch (err) {
      toast.error("Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleMockPayment} className="space-y-6">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-200 flex items-start gap-3 text-left">
        <CardIcon className="shrink-0 mt-0.5 text-blue-500" size={18} />
        <p>This is a simulated payment gateway. Any dummy card details will work.</p>
      </div>
      
      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="mock-name">Name on Card</Label>
          <Input 
            id="mock-name" 
            placeholder="John Doe" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="h-12 bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mock-card">Card Number</Label>
          <Input 
            id="mock-card" 
            placeholder="4242 4242 4242 4242" 
            value={cardNumber} 
            onChange={(e) => setCardNumber(e.target.value)} 
            maxLength={19}
            className="h-12 bg-white tracking-widest font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mock-expiry">Expiry Date</Label>
            <Input 
              id="mock-expiry" 
              placeholder="MM/YY" 
              value={expiry} 
              onChange={(e) => setExpiry(e.target.value)} 
              maxLength={5}
              className="h-12 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mock-cvc">CVC</Label>
            <Input 
              id="mock-cvc" 
              placeholder="123" 
              value={cvc} 
              onChange={(e) => setCvc(e.target.value)} 
              maxLength={4}
              type="password"
              className="h-12 bg-white tracking-widest font-mono"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl mt-4"
        disabled={isProcessing}
      >
        {isProcessing ? <Loader2 className="animate-spin mr-2" size={24} /> : null}
        {isProcessing ? "Processing..." : `Pay ${formatPrice(order.totalAmount)}`}
      </Button>
    </form>
  )
}

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
  const [isMock, setIsMock] = useState(false)
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
        if (intentRes.data.data.isMock) {
          setIsMock(true)
        }
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

          {/* Order Summary on Payment Page */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-slate-500">{item.quantity}x</span>
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-700 shrink-0 ml-3">{formatPrice(item.subtotal || (item.price * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span className="shrink-0">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 text-base">
                <span>Total to Pay</span>
                <span className="shrink-0">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {isMock ? (
            <MockCheckoutForm order={order} />
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm order={order} clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
