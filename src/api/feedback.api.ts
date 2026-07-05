import api from "@/services/apiClient"
import type { ApiResponse } from "@/types"

export const submitFeedback = (data: {
  restaurantId: string
  orderId?: string
  rating: number
  comment?: string
}) => api.post<ApiResponse<{ feedbackId: string }>>("/feedback", data)
