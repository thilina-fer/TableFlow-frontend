import React, { useEffect, useState } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  LogOut,
  Calendar,
  Clock,
  ChefHat,
  Banknote,
  History as HistoryIcon,
  ClipboardList
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { clearCredentials, selectCurrentUser } from "@/features/auth/authSlice"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/layout/PageTransition"
import logoImage from "@/assets/logo.png"

export const StaffLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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

  let navLinks = []
  if (user?.role === "waiter") {
    navLinks = [
      { to: "/waiter", label: "Waiter Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, end: true },
      { to: "/waiter/details", label: "Order Details", icon: <ClipboardList className="h-5 w-5" />, end: true },
      { to: "/waiter/history", label: "Order History", icon: <HistoryIcon className="h-5 w-5" />, end: true }
    ]
  } else if (user?.role === "kitchen") {
    navLinks = [
      { to: "/kitchen", label: "Kitchen Dashboard", icon: <ChefHat className="h-5 w-5" />, end: true },
      { to: "/kitchen/history", label: "Order History", icon: <HistoryIcon className="h-5 w-5" />, end: true }
    ]
  } else if (user?.role === "cashier") {
    navLinks = [{ to: "/cashier", label: "Cashier Dashboard", icon: <Banknote className="h-5 w-5" />, end: true }]
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={theme.sidebar.wrapper}>
        <div className={theme.sidebar.logo}>
          <img src={logoImage} alt="TableFlow Logo" className="w-full h-auto object-contain" />
        </div>
        <nav className={theme.sidebar.nav}>
          <div className={theme.sidebar.navGroup}>
            <div className={theme.sidebar.navGroupLabel}>PORTAL</div>
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
          </div>
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
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
              <AvatarFallback className="bg-white/20 text-white font-semibold">
                {user?.name ? getInitials(user.name) : "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-white">
                {user?.name || "Staff Member"}
              </span>
              <span className="text-xs text-orange-100 truncate capitalize">{user?.role || "Staff"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={theme.topbar}>
          {/* Left Side: Empty for balance */}
          <div className="flex-1"></div>

          {/* Center: Restaurant Name */}
          <div className="flex-1 flex justify-center items-center">
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">
              {user?.restaurantName || user?.restaurant?.name || "Your Restaurant"}
            </span>
          </div>

          {/* Right Side: Date and Time */}
          <div className="flex-1 flex items-center justify-end gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
              <Calendar className="h-4 w-4 text-orange-500" />
              {new Intl.DateTimeFormat('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).format(currentTime)}
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
              <Clock className="h-4 w-4 text-orange-500" />
              {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(currentTime)}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children || <Outlet />}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default StaffLayout
