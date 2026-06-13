import api from "@/services/apiClient"
import type { ApiResponse, Order } from "@/types"

// Public
export const placeOrder = (data: {
  tableId: string
  restaurantId: string
  items: { menuItemId: string; quantity: number }[]
  paymentMethod: "cash" | "card"
  specialNote?: string
}) => api.post<ApiResponse<{ order: Order }>>("/orders", data)

export const getOrderById = (id: string) =>
  api.get<ApiResponse<Order>>(`/orders/${id}`)

export const downloadPublicBill = (id: string) =>
  api.get(`/orders/${id}/bill`, { responseType: "blob" })

// Kitchen
export const getKitchenOrders = () =>
  api.get<ApiResponse<Order[]>>("/kitchen")

export const getKitchenHistory = () =>
  api.get<ApiResponse<Order[]>>("/kitchen/history")

export const approveOrder = (id: string) =>
  api.put<ApiResponse<Order>>(`/kitchen/${id}/approve`)

export const rejectOrder = (id: string, reason: string) =>
  api.put<ApiResponse<Order>>(`/kitchen/${id}/reject`, { rejectionReason: reason })

export const completeOrder = (id: string) =>
  api.put<ApiResponse<Order>>(`/kitchen/${id}/complete`)

// Waiter
export const getWaiterOrders = () =>
  api.get<ApiResponse<Order[]>>("/waiter")

export const getWaiterHistory = () =>
  api.get<ApiResponse<Order[]>>("/waiter/history")

export const claimOrder = (id: string) =>
  api.put<ApiResponse<Order>>(`/waiter/${id}/claim`)

export const deliverOrder = (id: string) =>
  api.put<ApiResponse<Order>>(`/waiter/${id}/deliver`)

// Cashier
export const getCashierOrders = () =>
  api.get<ApiResponse<Order[]>>("/cashier")

export const markCashPayment = (id: string) =>
  api.put<ApiResponse<Order>>(`/cashier/${id}/pay`)

export const downloadBill = (id: string) =>
  api.get(`/cashier/${id}/bill`, { responseType: "blob" })
