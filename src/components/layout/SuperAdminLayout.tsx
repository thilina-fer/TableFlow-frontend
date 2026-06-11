import React from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
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
import { AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/layout/PageTransition"
import logoImage from "@/assets/logo.png"
export const SuperAdminLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const superAdmin = useAppSelector(selectSuperAdmin)

  const navGroups = [
    {
      label: "OVERVIEW",
      links: [
        { to: "/superadmin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, end: true },
        { to: "/superadmin/analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
      ]
    },
    {
      label: "MANAGEMENT",
      links: [
        { to: "/superadmin/registrations", label: "Registrations", icon: <ClipboardList className="h-5 w-5" /> },
        { to: "/superadmin/restaurants", label: "Restaurants", icon: <Store className="h-5 w-5" /> },
        { to: "/superadmin/audit-log", label: "Audit Log", icon: <Shield className="h-5 w-5" /> },
      ]
    }
  ]

  const handleLogout = () => {
    dispatch(clearSuperAdminCredentials())
    navigate("/login")
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={theme.sidebar.wrapper}>
        <div className={theme.sidebar.logo}>
          <img src={logoImage} alt="TableFlow Logo" className="w-full h-auto object-contain" />
        </div>
        <nav className={theme.sidebar.nav}>
          {navGroups.map((group) => (
            <div key={group.label} className={theme.sidebar.navGroup}>
              <div className={theme.sidebar.navGroupLabel}>{group.label}</div>
              {group.links.map((link) => (
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
            </div>
          ))}
        </nav>
        <div className={theme.sidebar.footer}>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 mb-3 px-3 h-10 rounded-lg font-medium"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
          <div className={theme.sidebar.footerProfile}>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-white">
                {superAdmin?.name || "Super Admin"}
              </span>
              <span className="text-xs text-orange-100 truncate">System Access</span>
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
              Super Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Topbar actions can go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
