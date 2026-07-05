import React from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  Table2,
  Users,
  BarChart2,
  LogOut,
  Calendar,
  Clock,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { clearCredentials, selectCurrentUser, setCredentials } from "@/features/auth/authSlice"
import { AuthService } from "@/services/auth.service"
import { theme } from "@/lib/theme"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AnimatePresence } from "framer-motion"
import { PageTransition } from "@/components/layout/PageTransition"
import logoImage from "@/assets/logo.png"


export const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)

  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (user && !user.restaurantName) {
      AuthService.getMe()
        .then((updatedUser) => {
          dispatch(
            setCredentials({
              user: updatedUser,
              accessToken: localStorage.getItem("accessToken") || "",
              refreshToken: localStorage.getItem("refreshToken") || "",
              isFirstLogin: updatedUser.isFirstLogin,
            })
          )
        })
        .catch(console.error)
    }
  }, [user, dispatch])

  const navGroups = [
    {
      label: "OVERVIEW",
      links: [
        { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, end: true },
        { to: "/admin/analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
      ]
    },
    {
      label: "MANAGEMENT",
      links: [
        { to: "/admin/menu", label: "Menu", icon: <UtensilsCrossed className="h-5 w-5" /> },
        { to: "/admin/categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
        { to: "/admin/tables", label: "Tables", icon: <Table2 className="h-5 w-5" /> },
        { to: "/admin/staff", label: "Staff", icon: <Users className="h-5 w-5" /> },
      ]
    }
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
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
              <AvatarFallback className="bg-white/20 text-white font-semibold">
                {user?.name ? getInitials(user.name) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-white">
                {user?.name || "Admin User"}
              </span>
              <span className="text-xs text-orange-100 truncate">Admin</span>
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
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
