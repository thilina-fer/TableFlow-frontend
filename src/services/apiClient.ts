import axios from "axios"
import { API_BASE_URL } from "@/lib/constants"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const isSuperAdminRoute = config.url?.includes("/superadmin")
  const token = isSuperAdminRoute 
    ? localStorage.getItem("superAdminToken") 
    : localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config

    const isLoginRoute = 
      originalRequest?.url?.includes("/auth/login") || 
      originalRequest?.url?.includes("/superadmin/auth/login")

    if (error.response?.status === 401 && !isLoginRoute) {
      if (originalRequest?.url?.includes("/superadmin")) {
        localStorage.removeItem("superAdmin")
        localStorage.removeItem("superAdminToken")
        window.location.href = "/superadmin/login"
      } else {
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Standardizes API error handling across all services.
 */
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || "An unexpected API error occurred"
    throw new Error(message)
  }
  throw error instanceof Error ? error : new Error("An unknown error occurred")
}

export default apiClient
