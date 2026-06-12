import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { CartItem } from "@/types"
import type { RootState } from "@/app/store"

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  tableId: string | null
  paymentMethod: "cash" | "card" | null
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  tableId: null,
  paymentMethod: null,
}

const getItemId = (item: CartItem) => `${item.menuItemId}-${item.variantName || 'base'}`

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setTableContext: (state, action: PayloadAction<{ restaurantId: string; tableId: string }>) => {
      state.restaurantId = action.payload.restaurantId
      state.tableId = action.payload.tableId
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const payloadId = getItemId(action.payload)
      const existingItem = state.items.find((item) => getItemId(item) === payloadId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => getItemId(item) !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => getItemId(item) !== action.payload.id)
      } else {
        const item = state.items.find((item) => getItemId(item) === action.payload.id)
        if (item) {
          item.quantity = action.payload.quantity
        }
      }
    },
    clearCart: () => initialState,
    setPaymentMethod: (state, action: PayloadAction<"cash" | "card">) => {
      state.paymentMethod = action.payload
    },
  },
})

export const {
  setTableContext,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setPaymentMethod,
} = cartSlice.actions

export const selectCartItems = (state: RootState) => state.cart.items
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0)
export const selectTableContext = (state: RootState) => ({
  restaurantId: state.cart.restaurantId,
  tableId: state.cart.tableId,
})
export const selectPaymentMethod = (state: RootState) => state.cart.paymentMethod

export default cartSlice.reducer
