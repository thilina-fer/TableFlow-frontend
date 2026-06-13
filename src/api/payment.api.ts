import api from "@/services/apiClient"
import type { ApiResponse } from "@/types"

export const createPaymentIntent = (orderId: string) =>
  api.post<ApiResponse<{ clientSecret: string, stripePaymentIntentId: string, isMock?: boolean }>>("/payment/intent", { orderId })

export const mockPaymentSuccess = (orderId: string) =>
  api.post<ApiResponse<void>>("/payment/mock-success", { orderId })
