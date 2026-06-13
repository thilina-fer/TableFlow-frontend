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
import Showcase from "@/pages/Showcase"
import MenuItems from "@/pages/admin/MenuItems"
import Categories from "@/pages/admin/Categories"
import Tables from "@/pages/admin/Tables"
import Staff from "@/pages/admin/Staff"
import Registrations from "@/pages/superadmin/Registrations"
import RegistrationDetail from "@/pages/superadmin/RegistrationDetail"

import CustomerMenu from "@/pages/public/CustomerMenu"
import OrderTracking from "@/pages/public/OrderTracking"
import CardPayment from "@/pages/public/CardPayment"

import Dashboard from "@/pages/admin/Dashboard"
import Onboarding from "@/pages/admin/Onboarding"

import Kitchen from "@/pages/staff/Kitchen"
import KitchenHistory from "@/pages/staff/KitchenHistory"
import Waiter from "@/pages/staff/Waiter"
import WaiterHistory from "@/pages/staff/WaiterHistory"
import Cashier from "@/pages/staff/Cashier"

import AdminAnalytics from "@/pages/admin/Analytics"
import SuperAdminAnalytics from "@/pages/superadmin/SuperAdminAnalytics"
import Restaurants from "@/pages/superadmin/Restaurants"
import RestaurantDetail from "@/pages/superadmin/RestaurantDetail"
import AuditLog from "@/pages/superadmin/AuditLog"

// Placeholder components
const NotFound = () => <div className="p-8 text-center text-xl">404 - Not Found</div>
const WaiterDetailsPlaceholder = () => <div className="p-8 text-center text-slate-500 mt-10">Order Details feature coming soon</div>

const AnimatedRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
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