import { useState, useEffect } from "react"
import PageHeader from "@/components/shared/PageHeader"
import LineChart from "@/components/shared/charts/LineChart"
import BarChart from "@/components/shared/charts/BarChart"
import { theme } from "@/lib/theme"
import { formatPrice } from "@/lib/utils"
import { getAdminSummary, getRevenueData, getTopItems, getPeakHours } from "@/api/analytics.api"
import { ShoppingBag, DollarSign, TrendingUp, Award, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Analytics() {
  const [summary, setSummary] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [topItems, setTopItems] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])
  
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [loading, setLoading] = useState(true)

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [summaryRes, topItemsRes, peakHoursRes] = await Promise.all([
        getAdminSummary(),
        getTopItems(),
        getPeakHours(),
      ])
      
      setSummary(summaryRes.data.data)
      setTopItems(topItemsRes.data.data.map(item => ({ label: item.name, value: item.count })))
      
      // format peak hours: hour -> "14:00"
      setPeakHours(peakHoursRes.data.data.map(ph => ({ 
        label: `${ph.hour.toString().padStart(2, '0')}:00`, 
        value: ph.count 
      })))
      
      // Fetch revenue separately since it depends on period
      await fetchRevenueData(period)
      
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueData = async (selectedPeriod: "daily" | "weekly" | "monthly") => {
    try {
      const res = await getRevenueData(selectedPeriod)
      setRevenueData(res.data.data)
    } catch (err: any) {
      toast.error("Failed to load revenue data")
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchRevenueData(period)
    }
  }, [period])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const formatRevenue = (val: number) => formatPrice(val)

  return (
    <div>
      <PageHeader 
        title="Analytics" 
        subtitle="Track your restaurant performance" 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`${theme.card} p-5 border-l-4 border-l-blue-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalOrdersToday || 0}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingBag className="text-blue-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-emerald-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(summary?.revenueToday || 0)}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="text-emerald-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-orange-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg Order Value</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {formatPrice((summary?.revenueToday || 0) / (summary?.totalOrdersToday || 1))}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp className="text-orange-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-purple-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Top Item</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-[120px]">
                {topItems.length > 0 ? topItems[0].label : "N/A"}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.card} p-6 mb-8`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-slate-900">Revenue Over Time</h3>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  period === p 
                    ? "bg-slate-900 text-white" 
                    : "bg-white text-slate-600 hover:bg-slate-50"
                } ${p !== "daily" ? "border-l border-slate-200" : ""}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <LineChart data={revenueData} formatY={formatRevenue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme.card} p-6`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Ordered Items</h3>
          <BarChart data={topItems} horizontal color="#3b82f6" />
        </div>

        <div className={`${theme.card} p-6`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Peak Order Hours</h3>
          <BarChart data={peakHours} color="#f97316" />
        </div>
      </div>
    </div>
  )
}
