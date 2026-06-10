import React from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  BarChart2,
  Shield,
  LogOut,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { clearSuperAdminCredentials, selectSuperAdmin } from "@/features/superAdmin/superAdminSlice"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"

export const SuperAdminLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const superAdmin = useAppSelector(selectSuperAdmin)

  const navLinks = [
    { to: "/superadmin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: "/superadmin/registrations", label: "Registrations", icon: <ClipboardList className="h-5 w-5" /> },
    { to: "/superadmin/restaurants", label: "Restaurants", icon: <Store className="h-5 w-5" /> },
    { to: "/superadmin/analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { to: "/superadmin/audit-log", label: "Audit Log", icon: <Shield className="h-5 w-5" /> },
  ]

  const handleLogout = () => {
    dispatch(clearSuperAdminCredentials())
    navigate("/superadmin/login")
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={theme.sidebar.wrapper}>
        <div className={theme.sidebar.logo}>
          <span className="text-xl font-bold text-slate-900 tracking-tight">TableFlow SA</span>
        </div>
        <nav className={theme.sidebar.nav}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `${theme.sidebar.linkBase} ${isActive ? theme.sidebar.linkActive : ""}`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={theme.topbar}>
          <div className="flex items-center">
            <span className="text-lg font-medium text-slate-800">
              Super Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 font-medium mr-2">
              {superAdmin?.name || "Super Admin"}
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
