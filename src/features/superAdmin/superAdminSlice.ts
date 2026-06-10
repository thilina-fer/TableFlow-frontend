import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { SuperAdmin } from "@/types"
import type { RootState } from "@/app/store"

interface SuperAdminState {
  superAdmin: SuperAdmin | null
  token: string | null
}

const initialState: SuperAdminState = {
  superAdmin: JSON.parse(localStorage.getItem("superAdmin") || "null"),
  token: localStorage.getItem("superAdminToken"),
}

export const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    setSuperAdminCredentials: (
      state,
      action: PayloadAction<{ superAdmin: SuperAdmin; token: string }>
    ) => {
      state.superAdmin = action.payload.superAdmin
      state.token = action.payload.token

      localStorage.setItem("superAdmin", JSON.stringify(action.payload.superAdmin))
      localStorage.setItem("superAdminToken", action.payload.token)
    },
    clearSuperAdminCredentials: (state) => {
      state.superAdmin = null
      state.token = null

      localStorage.removeItem("superAdmin")
      localStorage.removeItem("superAdminToken")
    },
  },
})

export const { setSuperAdminCredentials, clearSuperAdminCredentials } = superAdminSlice.actions

export const selectSuperAdmin = (state: RootState) => state.superAdmin.superAdmin
export const selectSuperAdminToken = (state: RootState) => state.superAdmin.token

export default superAdminSlice.reducer
