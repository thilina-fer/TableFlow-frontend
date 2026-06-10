import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, PaginatedResponse, Restaurant, SuperAdmin, AuditLog } from "@/types"

export class SuperAdminService {
  static async login(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; superAdmin: SuperAdmin }>>("/superadmin/auth/login", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getRegistrations(params?: { status?: string; page?: number; limit?: number }) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>("/superadmin/registrations", { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getRegistrationById(id: string) {
    try {
      const response = await apiClient.get<ApiResponse<Restaurant>>(`/superadmin/registrations/${id}`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async approveRegistration(id: string) {
    try {
      const response = await apiClient.patch<ApiResponse<void>>(`/superadmin/registrations/${id}/approve`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async rejectRegistration(id: string, reason: string) {
    try {
      const response = await apiClient.patch<ApiResponse<void>>(`/superadmin/registrations/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async suspendRegistration(id: string, reason: string) {
    try {
      const response = await apiClient.patch<ApiResponse<void>>(`/superadmin/registrations/${id}/suspend`, { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async reactivateRegistration(id: string) {
    try {
      const response = await apiClient.patch<ApiResponse<void>>(`/superadmin/registrations/${id}/reactivate`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getRestaurants(params?: { status?: string; page?: number }) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>("/superadmin/restaurants", { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getRestaurantById(id: string) {
    try {
      const response = await apiClient.get<ApiResponse<Restaurant>>(`/superadmin/restaurants/${id}`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async deleteRestaurant(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/superadmin/restaurants/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async resetRestaurantPassword(id: string) {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/superadmin/restaurants/${id}/reset-password`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getAuditLogs(params?: { action?: string; startDate?: string; endDate?: string; page?: number }) {
    try {
      const response = await apiClient.get<PaginatedResponse<AuditLog>>("/superadmin/audit-log", { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
