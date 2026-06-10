import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import { selectSuperAdminToken } from "@/features/superAdmin/superAdminSlice"

interface SuperAdminRouteProps {
  children?: React.ReactNode
}

export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const token = useAppSelector(selectSuperAdminToken)

  if (!token) {
    return <Navigate to="/superadmin/login" replace />
  }

  return <>{children ? children : <Outlet />}</>
}

export default SuperAdminRoute
