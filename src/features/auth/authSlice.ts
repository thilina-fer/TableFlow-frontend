import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@/types"
import type { RootState } from "@/app/store"

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isFirstLogin: boolean
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isFirstLogin: localStorage.getItem("isFirstLogin") === "true",
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string; isFirstLogin: boolean }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isFirstLogin = action.payload.isFirstLogin

      localStorage.setItem("user", JSON.stringify(action.payload.user))
      localStorage.setItem("accessToken", action.payload.accessToken)
      localStorage.setItem("refreshToken", action.payload.refreshToken)
      localStorage.setItem("isFirstLogin", String(action.payload.isFirstLogin))
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isFirstLogin = false

      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("isFirstLogin")
    },
    setFirstLoginFalse: (state) => {
      state.isFirstLogin = false
      localStorage.setItem("isFirstLogin", "false")
    },
  },
})

export const { setCredentials, clearCredentials, setFirstLoginFalse } = authSlice.actions

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectIsFirstLogin = (state: RootState) => state.auth.isFirstLogin

export default authSlice.reducer
