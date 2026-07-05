import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingBag, DollarSign, Table2, Clock, ChevronRight, Loader2 } from "lucide-react"

import { getAdminSummary, getOnboardingStatus, getFeedbackAnalytics } from "@/api/analytics.api"
import { useAppSelector } from "@/app/hooks"
import { selectCurrentUser } from "@/features/auth/authSlice"
import type { OnboardingStatus } from "@/types"
import { formatPrice } from "@/lib/utils"
import { theme } from "@/lib/theme"

import { PageHeader } from "@/components/shared"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  
  const [summary, setSummary] = useState<{
    totalOrdersToday: number
    revenueToday: number
    activeTables: number
    pendingOrders: number
    recentOrders: any[]
  }>({
    totalOrdersToday: 0,
    revenueToday: 0,
    activeTables: 0,
    pendingOrders: 0,
    recentOrders: []
  })
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, onboardingRes] = await Promise.all([
          getAdminSummary(),
          getOnboardingStatus()
        ])

        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data)
        }
        if (onboardingRes.data.success) {
          setOnboarding(onboardingRes.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      }

      try {
        const feedbackRes = await getFeedbackAnalytics()
        if (feedbackRes.data.success) {
          setReviews(feedbackRes.data.data.reviews || [])
        }
      } catch (err) {
        console.warn("Failed to fetch feedback analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand h-8 w-8" /></div>

  const completedSteps = onboarding ? [
    onboarding.hasCategory,
    onboarding.hasMenuItem,
    onboarding.hasTable,
    onboarding.hasStaff
  ].filter(Boolean).length : 0

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name || 'Admin'}`} 
      />

      {/* Onboarding Banner */}
      {onboarding && !onboarding.isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex-1 w-full space-y-3">
            <h3 className="text-lg font-bold text-amber-900">Complete your setup to start accepting orders</h3>
            <div className="flex items-center gap-4">
              <Progress value={(completedSteps / 4) * 100} className="h-2 bg-amber-200 flex-1" />
              <span className="text-sm font-semibold text-amber-800 shrink-0">{completedSteps}/4 steps complete</span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/admin/onboarding")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shrink-0 flex items-center shadow-sm"
          >
            Continue Setup <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${theme.card} p-6 border-l-4 border-l-brand`}>
          <ShoppingBag className="h-8 w-8 text-brand mb-4" />
          <p className="text-3xl font-bold text-slate-900">{summary.totalOrdersToday}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">Total Orders</p>
        </div>
        
        <div className={`${theme.card} p-6 border-l-4 border-l-emerald-500`}>
          <DollarSign className="h-8 w-8 text-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-slate-900">{formatPrice(summary.revenueToday)}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">Total Revenue</p>
        </div>
        
        <div className={`${theme.card} p-6 border-l-4 border-l-blue-500`}>
          <Table2 className="h-8 w-8 text-blue-500 mb-4" />
          <p className="text-3xl font-bold text-slate-900">{summary.activeTables}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">Active Tables</p>
        </div>
        
        <div className={`${theme.card} p-6 border-l-4 border-l-purple-500`}>
          <Clock className="h-8 w-8 text-purple-500 mb-4" />
          <p className="text-3xl font-bold text-slate-900">{summary.pendingOrders}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">Pending Orders</p>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 text-lg mt-8">Quick Links</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div onClick={() => navigate("/admin/menu")} className={`${theme.card} p-5 cursor-pointer hover:border-brand hover:shadow-md transition-all group flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors">🍔</div>
              <span className="font-bold text-slate-700 group-hover:text-brand transition-colors">Menu</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
          </div>

          <div onClick={() => navigate("/admin/categories")} className={`${theme.card} p-5 cursor-pointer hover:border-brand hover:shadow-md transition-all group flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">📂</div>
              <span className="font-bold text-slate-700 group-hover:text-brand transition-colors">Categories</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
          </div>

          <div onClick={() => navigate("/admin/tables")} className={`${theme.card} p-5 cursor-pointer hover:border-brand hover:shadow-md transition-all group flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">🍽</div>
              <span className="font-bold text-slate-700 group-hover:text-brand transition-colors">Tables</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
          </div>

          <div onClick={() => navigate("/admin/staff")} className={`${theme.card} p-5 cursor-pointer hover:border-brand hover:shadow-md transition-all group flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">👥</div>
              <span className="font-bold text-slate-700 group-hover:text-brand transition-colors">Staff</span>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
          </div>

        </div>
      </div>
      {/* Dashboard Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Recent Orders</h3>
          {summary.recentOrders && summary.recentOrders.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Table</th>
                      <th className="py-4 px-6">Method</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {summary.recentOrders.map((order: any) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="py-4 px-6 font-medium">
                          Table {typeof order.tableId === 'string' ? order.tableId.slice(-4) : order.tableId?.tableNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                            {order.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            order.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'preparing' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                            order.status === 'placed' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900">{formatPrice(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 shadow-sm">
              No orders found.
            </div>
          )}
        </div>

        {/* Right Column: Customer Feedback */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Customer Feedback</h3>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review: any) => (
                <div key={review._id} className={`${theme.card} p-4 bg-white flex flex-col gap-2`}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${review.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 italic font-medium">"{review.comment}"</p>
                  )}
                  {review.aiAnalysis && (
                    <div className="flex flex-wrap gap-1.5 mt-1 border-t border-slate-100 pt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        review.aiAnalysis.sentiment === 'positive' ? 'bg-green-50 text-green-700 border border-green-200' :
                        review.aiAnalysis.sentiment === 'negative' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {review.aiAnalysis.sentiment}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {review.aiAnalysis.category.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 shadow-sm">
              No feedback reviews received yet.
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}
