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

import { lazy, Suspense } from 'react'

// Pages (Lazy Loaded)
const Login = lazy(() => import("@/pages/public/Login"))
const ChangePassword = lazy(() => import("@/pages/public/ChangePassword"))
const Register = lazy(() => import("@/pages/public/Register"))
const RegisterSuccess = lazy(() => import("@/pages/public/RegisterSuccess"))
const Showcase = lazy(() => import("@/pages/Showcase"))
const MenuItems = lazy(() => import("@/pages/admin/MenuItems"))
const Categories = lazy(() => import("@/pages/admin/Categories"))
const Tables = lazy(() => import("@/pages/admin/Tables"))
const Staff = lazy(() => import("@/pages/admin/Staff"))
const Registrations = lazy(() => import("@/pages/superadmin/Registrations"))
const RegistrationDetail = lazy(() => import("@/pages/superadmin/RegistrationDetail"))

const CustomerMenu = lazy(() => import("@/pages/public/CustomerMenu"))
const OrderTracking = lazy(() => import("@/pages/public/OrderTracking"))
const CardPayment = lazy(() => import("@/pages/public/CardPayment"))

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"))
const Onboarding = lazy(() => import("@/pages/admin/Onboarding"))

const Kitchen = lazy(() => import("@/pages/staff/Kitchen"))
const KitchenHistory = lazy(() => import("@/pages/staff/KitchenHistory"))
const Waiter = lazy(() => import("@/pages/staff/Waiter"))
const WaiterHistory = lazy(() => import("@/pages/staff/WaiterHistory"))
const Cashier = lazy(() => import("@/pages/staff/Cashier"))

const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"))
const SuperAdminAnalytics = lazy(() => import("@/pages/superadmin/SuperAdminAnalytics"))
const Restaurants = lazy(() => import("@/pages/superadmin/Restaurants"))
const RestaurantDetail = lazy(() => import("@/pages/superadmin/RestaurantDetail"))
const AuditLog = lazy(() => import("@/pages/superadmin/AuditLog"))

// Placeholder components
const NotFound = () => <div className="p-8 text-center text-xl">404 - Not Found</div>
const WaiterDetailsPlaceholder = () => <div className="p-8 text-center text-slate-500 mt-10">Order Details feature coming soon</div>

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50/50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
  </div>
)

const AnimatedRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<RegisterSuccess />} />
        <Route path="/showcase" element={<Showcase />} />
        
        {/* Customer Public Ordering Routes */}
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/order/:id/track" element={<OrderTracking />} />
        <Route path="/order/:id/pay" element={<CardPayment />} />

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
          <Route index element={<Dashboard />} />
          <Route path="onboarding" element={<Onboarding />} />
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
                  <Kitchen />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen/history"
          element={
            <ProtectedRoute roles={["kitchen"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <KitchenHistory />
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
                  <Waiter />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/history"
          element={
            <ProtectedRoute roles={["waiter"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <WaiterHistory />
                </StaffLayout>
              </FirstLoginGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/details"
          element={
            <ProtectedRoute roles={["waiter"]}>
              <FirstLoginGuard>
                <StaffLayout>
                  <WaiterDetailsPlaceholder />
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
                  <Cashier />
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
          <Route index element={<Navigate to="/superadmin/analytics" replace />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="registrations/:id" element={<RegistrationDetail />} />
          <Route path="restaurants/:id" element={<RestaurantDetail />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="analytics" element={<SuperAdminAnalytics />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
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