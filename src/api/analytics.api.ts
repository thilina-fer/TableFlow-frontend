import api from "@/services/apiClient"
import type { ApiResponse } from "@/types"

export const getAdminSummary = () =>
  api.get<ApiResponse<{
    totalOrdersToday: number
    revenueToday: number
    activeTables: number
    pendingOrders: number
  }>>("/admin/analytics/summary")

export const getOnboardingStatus = () =>
  api.get<ApiResponse<{
    hasCategory: boolean
    hasMenuItem: boolean
    hasTable: boolean
    hasStaff: boolean
    isComplete: boolean
  }>>("/admin/analytics/onboarding/status")
