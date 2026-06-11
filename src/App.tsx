import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

// Layouts
import AdminLayout from "@/components/layout/AdminLayout"
import SuperAdminLayout from "@/components/layout/SuperAdminLayout"
import StaffLayout from "@/components/layout/StaffLayout"

// Guards
import ProtectedRoute from "@/components/guards/ProtectedRoute"
import SuperAdminRoute from "@/components/guards/SuperAdminRoute"
import FirstLoginGuard from "@/components/guards/FirstLoginGuard"

// Pages
import Login from "@/pages/public/Login"
import ChangePassword from "@/pages/public/ChangePassword"
import Register from "@/pages/public/Register"
import RegisterSuccess from "@/pages/public/RegisterSuccess"
import SuperAdminLogin from "@/pages/superadmin/SuperAdminLogin"
import Showcase from "@/pages/Showcase"
import MenuItems from "@/pages/admin/MenuItems"
import Categories from "@/pages/admin/Categories"
import Tables from "@/pages/admin/Tables"
import Staff from "@/pages/admin/Staff"
import Registrations from "@/pages/superadmin/Registrations"
import RegistrationDetail from "@/pages/superadmin/RegistrationDetail"

// Placeholder components
const NotFound = () => <div className="p-8 text-center text-xl">404 - Not Found</div>

const AdminDashboard = () => <div className="text-xl">Admin Dashboard</div>
const AdminAnalytics = () => <div className="text-xl">Admin Analytics</div>

const KitchenPortal = () => <div className="p-6 text-xl">Kitchen Portal</div>
const WaiterPortal = () => <div className="p-6 text-xl">Waiter Portal</div>
const CashierPortal = () => <div className="p-6 text-xl">Cashier Portal</div>

const SuperAdminDashboard = () => <div className="text-xl">Super Admin Dashboard</div>
const Restaurants = () => <div className="text-xl">Restaurants</div>
const SuperAdminAnalytics = () => <div className="text-xl">Super Admin Analytics</div>
const AuditLog = () => <div className="text-xl">Audit Log</div>

const AnimatedRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<RegisterSuccess />} />
        <Route path="/showcase" element={<Showcase />} />

        {/* Protected - Change Password for First Login */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <FirstLoginGuard>
                <AdminLayout />
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<MenuItems />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tables" element={<Tables />} />
          <Route path="staff" element={<Staff />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute roles={["kitchen"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <KitchenPortal />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter"
          element={
            <ProtectedRoute roles={["waiter"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <WaiterPortal />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute roles={["cashier"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <CashierPortal />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="registrations/:id" element={<RegistrationDetail />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="analytics" element={<SuperAdminAnalytics />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}