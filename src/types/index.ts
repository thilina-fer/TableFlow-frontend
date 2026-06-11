export interface Restaurant {
  _id: string
  name: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  address: string
  city: string
  restaurantType: "Fine Dining" | "Fast Food" | "Café" | "Bakery" | "Other"
  description: string
  logoUrl?: string
  coverImageUrl?: string
  status: "pending" | "approved" | "rejected" | "suspended"
  isActive: boolean
  suspensionReason?: string
  rejectionReason?: string
  approvedAt?: string
  createdAt: string
}

export interface User {
  _id: string
  restaurantId: string
  restaurantName?: string
  restaurant?: Restaurant
  name: string
  email: string
  role: "admin" | "kitchen" | "waiter" | "cashier"
  isActive: boolean
  isFirstLogin: boolean
  createdAt: string
}

export interface SuperAdmin {
  _id: string
  name: string
  email: string
}

export interface Category {
  _id: string
  restaurantId: string
  name: string
  displayOrder: number
  isActive: boolean
}

export interface MenuItem {
  _id: string
  restaurantId: string
  categoryId: string | Category
  name: string
  description?: string
  price: number
  variants?: { name: string; price: number }[]
  imageUrl?: string
  isAvailable: boolean
  preparationTimeMinutes?: number
  tags?: string[]
}

export interface Table {
  _id: string
  restaurantId: string
  tableNumber: string
  capacity: number
  qrCodeUrl: string
  status: "available" | "occupied" | "awaiting_payment"
  currentOrderId?: string
}

export interface OrderItem {
  menuItemId: string
  name: string
  variantName?: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  _id: string
  restaurantId: string
  tableId: string | Table
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentMethod: "cash" | "card"
  paymentStatus: "pending" | "paid" | "failed"
  status: "placed" | "preparing" | "completed" | "delivered" | "rejected"
  assignedWaiterId?: string
  rejectionReason?: string
  billPdfUrl?: string
  stripePaymentIntentId?: string
  specialNote?: string
  createdAt: string
}

export interface AuditLog {
  _id: string
  action: string
  targetRestaurantId: string
  targetRestaurantName: string
  performedBy: string
  reason?: string
  createdAt: string
}

export interface CartItem {
  menuItemId: string
  name: string
  variantName?: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface OnboardingStatus {
  hasCategory: boolean
  hasMenuItem: boolean
  hasTable: boolean
  hasStaff: boolean
  isComplete: boolean
}
