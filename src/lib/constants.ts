export const API_BASE_URL = import.meta.env.VITE_API_URL as string
export const SOCKET_URL   = import.meta.env.VITE_SOCKET_URL as string

export const ROLES = {
  ADMIN:   "admin",
  KITCHEN: "kitchen",
  WAITER:  "waiter",
  CASHIER: "cashier",
} as const

export const ORDER_STATUS = {
  PLACED:    "placed",
  PREPARING: "preparing",
  COMPLETED: "completed",
  DELIVERED: "delivered",
  REJECTED:  "rejected",
} as const

export const PAYMENT_STATUS = {
  PENDING:   "pending",
  PAID:      "paid",
  FAILED:    "failed",
} as const

export const TABLE_STATUS = {
  AVAILABLE:        "available",
  OCCUPIED:         "occupied",
  AWAITING_PAYMENT: "awaiting_payment",
} as const

export const RESTAURANT_STATUS = {
  PENDING:   "pending",
  APPROVED:  "approved",
  REJECTED:  "rejected",
  SUSPENDED: "suspended",
} as const

export const RESTAURANT_TYPES = [
  "Fine Dining",
  "Fast Food",
  "Café",
  "Bakery",
  "Other",
] as const

export const ROLE_REDIRECT: Record<string, string> = {
  admin:   "/admin",
  kitchen: "/kitchen",
  waiter:  "/waiter",
  cashier: "/cashier",
}
