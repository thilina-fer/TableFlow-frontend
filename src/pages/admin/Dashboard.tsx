import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingBag, DollarSign, Table2, Clock, ChevronRight, Loader2 } from "lucide-react"

import { getAdminSummary, getOnboardingStatus } from "@/api/analytics.api"
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
  
  const [summary, setSummary] = useState({
    totalOrdersToday: 0,
    revenueToday: 0,
    activeTables: 0,
    pendingOrders: 0
  })
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)

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
          <p className="text-sm font-medium text-slate-500 mt-1">Orders Today</p>
        </div>
        
        <div className={`${theme.card} p-6 border-l-4 border-l-emerald-500`}>
          <DollarSign className="h-8 w-8 text-emerald-500 mb-4" />
          <p className="text-3xl font-bold text-slate-900">{formatPrice(summary.revenueToday)}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">Revenue Today</p>
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
      
    </div>
  )
}
