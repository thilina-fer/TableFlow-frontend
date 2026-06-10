import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"
import { selectIsFirstLogin } from "@/features/auth/authSlice"

interface FirstLoginGuardProps {
  children?: React.ReactNode
}

export const FirstLoginGuard: React.FC<FirstLoginGuardProps> = ({ children }) => {
  const isFirstLogin = useAppSelector(selectIsFirstLogin)

  if (isFirstLogin) {
    return <Navigate to="/change-password" replace />
  }

  return <>{children ? children : <Outlet />}</>
}

export default FirstLoginGuard
