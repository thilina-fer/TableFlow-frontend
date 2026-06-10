import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, User } from "@/types"

export class AuthService {
  static async loginStaff(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User & { isFirstLogin: boolean } }>>("/auth/login", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async logoutStaff() {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async getMe() {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me")
      return response.data.data.user
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const response = await apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", { refreshToken })
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    try {
      const response = await apiClient.post<ApiResponse<void>>("/auth/change-password", data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
