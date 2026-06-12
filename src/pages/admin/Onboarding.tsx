import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Rocket, CheckCircle2, PartyPopper, ChevronRight, Loader2 } from "lucide-react"

import { getOnboardingStatus } from "@/api/analytics.api"
import type { OnboardingStatus } from "@/types"
import { theme } from "@/lib/theme"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function Onboarding() {
  const navigate = useNavigate()
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getOnboardingStatus()
        if (res.data.success) {
          setOnboarding(res.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch onboarding status", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand h-8 w-8" /></div>
  if (!onboarding) return null

  const steps = [
    {
      id: "category",
      title: "Add a Category",
      description: "Create categories like 'Mains', 'Drinks', or 'Desserts'",
      isDone: onboarding.hasCategory,
      path: "/admin/categories"
    },
    {
      id: "menu",
      title: "Add Menu Items",
      description: "Add your delicious dishes with prices and images",
      isDone: onboarding.hasMenuItem,
      path: "/admin/menu"
    },
    {
      id: "tables",
      title: "Set Up Tables",
      description: "Generate QR codes for your restaurant tables",
      isDone: onboarding.hasTable,
      path: "/admin/tables"
    },
    {
      id: "staff",
      title: "Add Staff Members",
      description: "Create accounts for kitchen, waiters, and cashiers",
      isDone: onboarding.hasStaff,
      path: "/admin/staff"
    }
  ]

  const completedCount = steps.filter(s => s.isDone).length

  if (onboarding.isComplete) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-emerald-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">You're all set!</h1>
        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
          Your restaurant is fully configured and ready to accept orders. Let the magic begin!
        </p>
        <Button 
          onClick={() => navigate("/admin")}
          className="bg-brand hover:bg-orange-600 text-white font-bold h-12 px-8 text-lg rounded-xl shadow-lg shadow-brand/20"
        >
          Go to Dashboard <ChevronRight size={20} className="ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="bg-orange-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border-4 border-orange-100 shadow-sm">
          <Rocket className="h-10 w-10 text-brand" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Let's get you set up</h1>
        <p className="text-slate-500 text-lg">Complete these steps to start accepting orders</p>
      </div>

      <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-slate-900">Setup Progress</span>
          <span className="font-bold text-brand bg-orange-50 px-3 py-1 rounded-full text-sm">{completedCount} of 4 steps complete</span>
        </div>
        <Progress value={(completedCount / 4) * 100} className="h-3 bg-slate-100" />
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id} className={`${theme.card} p-5 flex items-center gap-5 transition-all hover:border-brand/30 hover:shadow-md group`}>
            <div className="shrink-0">
              <CheckCircle2 className={`h-8 w-8 transition-colors ${step.isDone ? "text-emerald-500 fill-emerald-50" : "text-slate-200"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg leading-tight mb-1 ${step.isDone ? "text-slate-900" : "text-slate-700"}`}>
                {idx + 1}. {step.title}
              </h3>
              <p className="text-slate-500 text-sm truncate">{step.description}</p>
            </div>
            <div className="shrink-0">
              {!step.isDone && (
                <Button 
                  onClick={() => navigate(step.path)}
                  variant="outline" 
                  className="border-brand/30 text-brand hover:bg-orange-50 hover:text-orange-700 font-semibold rounded-lg"
                >
                  Set Up <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
