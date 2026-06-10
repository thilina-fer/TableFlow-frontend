import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, SuperAdmin } from "@/types"

export class SuperAdminService {
  static async login(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string; superAdmin: SuperAdmin }>>("/superadmin/auth/login", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
