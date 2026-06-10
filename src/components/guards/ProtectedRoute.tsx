import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import { selectAccessToken, selectCurrentUser } from "@/features/auth/authSlice"

interface ProtectedRouteProps {
  children?: React.ReactNode
  roles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectCurrentUser)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <>{children ? children : <Outlet />}</>
}

export default ProtectedRoute
