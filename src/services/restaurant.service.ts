import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse } from "@/types"

export class RestaurantService {
  static async register(data: any) {
    try {
      const response = await apiClient.post<ApiResponse<{ restaurantId: string }>>("/register/restaurant", data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("image", file)
      
      const response = await apiClient.post<ApiResponse<{ url: string }>>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      if (!response.data.data?.url) {
        throw new Error("Failed to get image URL from server")
      }
      
      return response.data.data.url
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
