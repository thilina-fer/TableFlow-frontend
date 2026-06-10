import apiClient, { handleApiError } from "./apiClient"
import type { ApiResponse, Table } from "@/types"

export class TableService {
  static async getTables() {
    try {
      const response = await apiClient.get<ApiResponse<Table[]>>("/tables")
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async createTable(data: { tableNumber: string; capacity: number }) {
    try {
      const response = await apiClient.post<ApiResponse<Table>>("/tables", data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async updateTable(id: string, data: Partial<{ tableNumber: string; capacity: number }>) {
    try {
      const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  static async deleteTable(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/tables/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
