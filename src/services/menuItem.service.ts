import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, MenuItem } from "@/types"

export class MenuItemService {
  static async getAdminMenu() {
    try {
      const response = await apiClient.get<ApiResponse<MenuItem[]>>("/admin/menu")
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async createMenuItem(data: {
    name: string
    description?: string
    price: number
    categoryId: string
    imageUrl?: string
    isAvailable: boolean
    preparationTimeMinutes?: number
    tags?: string[]
  }) {
    try {
      const response = await apiClient.post<ApiResponse<MenuItem>>("/admin/menu", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async updateMenuItem(id: string, data: Partial<{
    name: string
    description: string
    price: number
    categoryId: string
    imageUrl: string
    isAvailable: boolean
    preparationTimeMinutes: number
    tags: string[]
  }>) {
    try {
      const response = await apiClient.put<ApiResponse<MenuItem>>(`/admin/menu/${id}`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async deleteMenuItem(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/menu/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async toggleAvailability(id: string, isAvailable: boolean) {
    try {
      const response = await apiClient.patch<ApiResponse<MenuItem>>(`/admin/menu/${id}/availability`, { isAvailable })
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
