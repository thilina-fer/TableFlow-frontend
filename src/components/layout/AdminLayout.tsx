import React from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  Table2,
  Users,
  BarChart2,
  LogOut,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { clearCredentials, selectCurrentUser } from "@/features/auth/authSlice"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, end: true },
    { to: "/admin/menu", label: "Menu", icon: <UtensilsCrossed className="h-5 w-5" /> },
    { to: "/admin/categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
    { to: "/admin/tables", label: "Tables", icon: <Table2 className="h-5 w-5" /> },
    { to: "/admin/staff", label: "Staff", icon: <Users className="h-5 w-5" /> },
    { to: "/admin/analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
  ]

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={theme.sidebar.wrapper}>
        <div className={theme.sidebar.logo}>
          <span className="text-xl font-bold text-slate-900 tracking-tight">TableFlow</span>
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
        <div className={theme.sidebar.footer}>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-brand text-white text-xs font-medium">
                {user?.name ? getInitials(user.name) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-900 truncate">
                {user?.name || "Admin User"}
              </span>
              <span className="text-xs text-slate-500 truncate">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={theme.topbar}>
          <div className="flex items-center">
            <span className="text-lg font-medium text-slate-800">
              Restaurant
            </span>
          </div>
          <div className="flex items-center gap-4">
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

export default AdminLayout
