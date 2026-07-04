import api from "@/services/apiClient"
import type { ApiResponse, MenuItem } from "@/types"

export const getPublicMenu = (restaurantId: string) =>
  api.get<ApiResponse<MenuItem[]>>(`/menu?restaurantId=${restaurantId}`)

export const getTableContext = (tableId: string) =>
  api.get<ApiResponse<{ tableId: string; restaurantId: string; tableNumber: string; restaurantName?: string }>>(`/tables/${tableId}/menu`)

export const generateMenuItemAI = (data: { name: string; categoryName: string }) =>
  api.post<ApiResponse<{
    description: string
    tags: string[]
    suggestedPrice: number
  }>>("/admin/ai/menu-generate", data)


