import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, Category } from "@/types"

export class CategoryService {
  static async getCategories() {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>("/admin/categories")
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async createCategory(data: { name: string; displayOrder: number }) {
    try {
      const response = await apiClient.post<ApiResponse<Category>>("/admin/categories", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async updateCategory(id: string, data: Partial<{ name: string; displayOrder: number; isActive: boolean }>) {
    try {
      const response = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async deleteCategory(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/categories/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async toggleCategory(id: string) {
    try {
      const response = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}/toggle`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
