import { useState, useEffect } from "react"
import PageHeader from "@/components/shared/PageHeader"
import LineChart from "@/components/shared/charts/LineChart"
import { DataTable } from "@/components/shared/DataTable"
import { theme } from "@/lib/theme"
import { formatPrice } from "@/lib/utils"
import { getSuperAdminSummary, getRegistrationGrowth, getOrdersPerRestaurant } from "@/api/analytics.api"
import { Store, ShoppingBag, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminAnalytics() {
  const [summary, setSummary] = useState<any>(null)
  const [growthData, setGrowthData] = useState<any[]>([])
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, growthRes, ordersRes] = await Promise.all([
          getSuperAdminSummary(),
          getRegistrationGrowth(),
          getOrdersPerRestaurant()
        ])
        
        setSummary(summaryRes.data.data)
        setGrowthData(growthRes.data.data.map(item => ({ label: item.month, value: item.count })))
        setOrdersData(ordersRes.data.data)
      } catch (err: any) {
        toast.error(err.message || "Failed to load platform analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const columns = [
    { header: "Restaurant Name", accessor: "restaurantName" as keyof typeof ordersData[0] },
    { header: "Total Orders", accessor: "orders" as keyof typeof ordersData[0] },
    { 
      header: "Total Revenue", 
      accessor: "revenue" as keyof typeof ordersData[0],
      render: (val: number) => <span className="font-medium text-slate-900">{formatPrice(val)}</span>
    }
  ]

  return (
    <div>
      <PageHeader 
        title="Platform Analytics" 
        subtitle="Monitor system-wide growth and performance" 
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`${theme.card} p-5 border-l-4 border-l-blue-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Restaurants</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalRestaurants || 0}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Store className="text-blue-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-purple-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalOrders || 0}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingBag className="text-purple-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-emerald-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(summary?.totalRevenue || 0)}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="text-emerald-500" size={20} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-5 border-l-4 border-l-orange-500`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">New This Month</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.newRegistrationsThisMonth || 0}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp className="text-orange-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme.card} p-6`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Registration Growth</h3>
          <LineChart data={growthData} color="#3b82f6" />
        </div>

        <div className={`${theme.card} p-6 overflow-hidden flex flex-col`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Orders Per Restaurant</h3>
          <div className="flex-1 overflow-auto">
             <DataTable 
               data={ordersData} 
               columns={columns} 
             />
          </div>
        </div>
      </div>
    </div>
  )
}
