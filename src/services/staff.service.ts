import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, User } from "@/types"

export class StaffService {
  static async getStaff() {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>("/admin/staff")
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async createStaff(data: { name: string; email: string; role: string }) {
    try {
      const response = await apiClient.post<ApiResponse<User>>("/admin/staff", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async updateStaff(id: string, data: Partial<{ name: string; isActive: boolean }>) {
    try {
      const response = await apiClient.put<ApiResponse<User>>(`/admin/staff/${id}`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async deactivateStaff(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/admin/staff/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async resetStaffPassword(id: string) {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/admin/staff/${id}/reset-password`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
