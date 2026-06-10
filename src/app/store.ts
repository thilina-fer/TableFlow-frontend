import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/features/auth/authSlice"
import superAdminReducer from "@/features/superAdmin/superAdminSlice"
import cartReducer from "@/features/cart/cartSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    cart: cartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
