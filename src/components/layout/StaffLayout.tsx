import React from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { clearCredentials, selectCurrentUser } from "@/features/auth/authSlice"
import { RoleBadge } from "@/components/shared/RoleBadge"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/theme"
import logoImage from "@/assets/logo.png"

interface StaffLayoutProps {
  children: React.ReactNode
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate("/login")
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
      {/* Topbar */}
      <header className={theme.topbar}>
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="TableFlow Logo" className="h-7 w-auto object-contain" />
        </div>
        
        {user?.role && (
          <div className="flex items-center justify-center flex-1">
            <RoleBadge role={user.role} />
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
            {user?.name || "Staff Member"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-0">
        {children}
      </div>
    </div>
  )
}

export default StaffLayout
