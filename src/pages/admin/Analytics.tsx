import { useState, useEffect } from "react"
import PageHeader from "@/components/shared/PageHeader"
import LineChart from "@/components/shared/charts/LineChart"
import BarChart from "@/components/shared/charts/BarChart"
import { theme } from "@/lib/theme"
import { formatPrice } from "@/lib/utils"
import { getAdminSummary, getRevenueData, getTopItems, getPeakHours, getFeedbackAnalytics } from "@/api/analytics.api"
import { ShoppingBag, DollarSign, TrendingUp, Award, Loader2, Sparkles, Star, MessageSquare, Heart } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Analytics() {
  const [summary, setSummary] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [topItems, setTopItems] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])
  
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [loading, setLoading] = useState(true)

  // Feedback State
  const [activeView, setActiveView] = useState("sales")
  const [feedbackData, setFeedbackData] = useState<any>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)

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

  const fetchFeedbackData = async () => {
    setLoadingFeedback(true)
    try {
      const res = await getFeedbackAnalytics()
      setFeedbackData(res.data.data)
    } catch (err: any) {
      toast.error("Failed to load feedback analytics")
    } finally {
      setLoadingFeedback(false)
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

  useEffect(() => {
    if (activeView === "feedback" && !feedbackData) {
      fetchFeedbackData()
    }
  }, [activeView])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const formatRevenue = (val: number) => formatPrice(val)

  // Sentiment metrics calculation
  const getSentimentStats = () => {
    if (!feedbackData?.summary?.sentimentBreakdown) return { posPct: 0, neuPct: 0, negPct: 0 }
    const { positive = 0, neutral = 0, negative = 0 } = feedbackData.summary.sentimentBreakdown
    const total = positive + neutral + negative || 1
    return {
      posPct: Math.round((positive / total) * 100),
      neuPct: Math.round((neutral / total) * 100),
      negPct: Math.round((negative / total) * 100)
    }
  }

  const { posPct, neuPct, negPct } = getSentimentStats()

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics" 
        subtitle="Track your restaurant performance" 
      />

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 mb-6">
          <TabsTrigger value="sales" className="px-4 py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">
            Sales & Performance
          </TabsTrigger>
          <TabsTrigger value="feedback" className="px-4 py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500 fill-amber-500" />
            Customer Feedback (AI)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Revenue Chart */}
          <div className={`${theme.card} p-6`}>
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

          {/* Top Items & Peak Hours */}
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
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {loadingFeedback ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : !feedbackData ? (
            <div className={`${theme.card} p-12 text-center text-slate-500`}>
              No feedback analytics loaded. Please submit customer feedback first.
            </div>
          ) : (
            <>
              {/* Feedback Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${theme.card} p-5 border-l-4 border-l-blue-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Reviews</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{feedbackData.summary?.totalReviews || 0}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <MessageSquare className="text-blue-500" size={20} />
                    </div>
                  </div>
                </div>

                <div className={`${theme.card} p-5 border-l-4 border-l-amber-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Average Rating</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {(feedbackData.summary?.averageRating || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                      </h3>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Star className="text-amber-500 fill-amber-500" size={20} />
                    </div>
                  </div>
                </div>

                <div className={`${theme.card} p-5 border-l-4 border-l-emerald-500`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Customer Satisfaction</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">{posPct}% Positive</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Heart className="text-emerald-500 fill-emerald-500" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable AI Suggestions */}
              <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl">
                <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-amber-600 animate-pulse" />
                  AI Actionable Improvements
                </h3>
                {feedbackData.suggestions && feedbackData.suggestions.length > 0 ? (
                  <ul className="space-y-2 text-sm text-amber-800 list-disc list-inside">
                    {feedbackData.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-800 text-sm italic">Gathering more customer feedback to generate recommendations...</p>
                )}
              </div>

              {/* Sentiment Breakdown & Topics Mentioned */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Breakdown Bar */}
                <div className={`${theme.card} p-6`}>
                  <h3 className="font-bold text-slate-800 mb-6">AI Sentiment Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-emerald-600">Positive Comments</span>
                        <span className="font-bold text-slate-700">{posPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${posPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-500">Neutral Comments</span>
                        <span className="font-bold text-slate-700">{neuPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full transition-all duration-500" style={{ width: `${neuPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-rose-600">Negative Comments</span>
                        <span className="font-bold text-slate-700">{negPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${negPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics Mentioned */}
                <div className={`${theme.card} p-6`}>
                  <h3 className="font-bold text-slate-800 mb-6">Topic Mentions (AI Categorized)</h3>
                  <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
                    {feedbackData.summary?.categoryBreakdown && Object.keys(feedbackData.summary.categoryBreakdown).length > 0 ? (
                      Object.entries(feedbackData.summary.categoryBreakdown).map(([category, count]: any) => (
                        <div key={category} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700 text-sm capitalize">{category}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            {count} mention{count !== 1 && 's'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 py-6 text-center">No categories mapped yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback History Feed */}
              <div className={`${theme.card} p-6`}>
                <h3 className="font-bold text-slate-800 mb-6">Customer Review Feed</h3>
                <div className="space-y-6 divide-y divide-slate-100">
                  {feedbackData.reviews && feedbackData.reviews.length > 0 ? (
                    feedbackData.reviews.map((review: any, idx: number) => {
                      const sentiment = review.aiAnalysis?.sentiment || "neutral"
                      const category = review.aiAnalysis?.category || "general"
                      const summaryText = review.aiAnalysis?.summary

                      return (
                        <div key={review._id} className={idx > 0 ? "pt-5" : ""}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2.5">
                            <div className="flex items-center gap-3">
                              {/* Rating Stars */}
                              <div className="flex text-amber-400 text-sm">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex gap-2">
                              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded ${
                                sentiment === "positive" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                sentiment === "negative" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                                "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}>
                                {sentiment}
                              </span>
                              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                {category}
                              </span>
                            </div>
                          </div>

                          {review.comment ? (
                            <p className="text-sm text-slate-700 italic">"{review.comment}"</p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">No comment left.</p>
                          )}

                          {summaryText && (
                            <div className="mt-2.5 text-xs bg-indigo-50/70 border border-indigo-100 text-indigo-800 px-3 py-2 rounded-xl">
                              <span className="font-extrabold">AI Analysis Summary:</span> {summaryText}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-slate-500 py-6 text-center">No customer feedback reviews found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

