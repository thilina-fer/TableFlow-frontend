// ─── Role Constants ────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESTAURANT_ADMIN: 'restaurant_admin',
  RESTAURANT_MANAGER: 'restaurant_manager',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  KITCHEN_STAFF: 'kitchen_staff',
  CUSTOMER: 'customer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// ─── Order Status ──────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PLACED: 'placed',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

// ─── Payment Status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

// ─── Table Status ──────────────────────────────────────────────────────────────
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  AWAITING_PAYMENT: 'awaiting_payment',
  RESERVED: 'reserved',
} as const

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS]

// ─── Restaurant Status ─────────────────────────────────────────────────────────
export const RESTAURANT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const

export type RestaurantStatus =
  (typeof RESTAURANT_STATUS)[keyof typeof RESTAURANT_STATUS]

// ─── API & Socket URLs (from Vite env with localhost fallbacks) ────────────────
export const API_BASE_URL: string =
  import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:5000/api'

export const SOCKET_URL: string =
  import.meta.env['VITE_SOCKET_URL'] ?? 'http://localhost:5000'
