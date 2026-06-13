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

// Admin analytics
export const getRevenueData = (period: "daily" | "weekly" | "monthly") =>
  api.get<ApiResponse<{ label: string; revenue: number }[]>>(`/admin/analytics/revenue?period=${period}`)

export const getTopItems = () =>
  api.get<ApiResponse<{ name: string; count: number }[]>>("/admin/analytics/top-items")

export const getPeakHours = () =>
  api.get<ApiResponse<{ hour: number; count: number }[]>>("/admin/analytics/peak-hours")

// Super Admin analytics
export const getSuperAdminSummary = () =>
  api.get<ApiResponse<{
    totalRestaurants: number
    totalOrders: number
    totalRevenue: number
    newRegistrationsThisMonth: number
  }>>("/superadmin/analytics/summary")

export const getRegistrationGrowth = () =>
  api.get<ApiResponse<{ month: string; count: number }[]>>("/superadmin/analytics/registrations")

export const getOrdersPerRestaurant = () =>
  api.get<ApiResponse<{ restaurantName: string; orders: number; revenue: number }[]>>("/superadmin/analytics/orders")
