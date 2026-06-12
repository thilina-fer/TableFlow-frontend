import api from "@/services/apiClient"
import type { ApiResponse } from "@/types"

export const createPaymentIntent = (orderId: string) =>
  api.post<ApiResponse<{ clientSecret: string }>>("/payment/create-intent", { orderId })
