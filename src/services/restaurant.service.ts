import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse } from "@/types"

export class RestaurantService {
  static async register(data: any) {
    try {
      const response = await apiClient.post<ApiResponse<{ restaurantId: string }>>("/restaurants/register", data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
