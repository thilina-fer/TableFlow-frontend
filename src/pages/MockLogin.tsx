import { useAppDispatch } from "@/app/hooks"
import { setCredentials } from "@/features/auth/authSlice"
import { setSuperAdminCredentials } from "@/features/superAdmin/superAdminSlice"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { User } from "@/types"

export const MockLogin = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogin = (role: User["role"]) => {
    dispatch(
      setCredentials({
        user: {
          _id: "user-123",
          restaurantId: "rest-123",
          name: "Mock " + role,
          email: `${role}@example.com`,
          role,
          isActive: true,
          isFirstLogin: false,
          createdAt: new Date().toISOString(),
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        isFirstLogin: false,
      })
    )
    if (role === "admin") navigate("/admin")
    else navigate(`/${role}`)
  }

  const handleSuperAdminLogin = () => {
    dispatch(
      setSuperAdminCredentials({
        superAdmin: {
          _id: "sa-123",
          name: "Mock Super Admin",
          email: "sa@example.com",
        },
        token: "mock-sa-token",
      })
    )
    navigate("/superadmin")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-sm w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">TableFlow Login</h1>
        <p className="text-slate-500 text-sm">Select a mock role below to log in and preview the UI layouts.</p>
        
        <div className="flex flex-col gap-3">
          <Button onClick={() => handleLogin("admin")} className="w-full">Login as Admin</Button>
          <Button onClick={() => handleLogin("waiter")} variant="secondary" className="w-full">Login as Waiter</Button>
          <Button onClick={() => handleLogin("kitchen")} variant="secondary" className="w-full">Login as Kitchen</Button>
          <Button onClick={() => handleLogin("cashier")} variant="secondary" className="w-full">Login as Cashier</Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Button onClick={handleSuperAdminLogin} variant="outline" className="w-full border-slate-300">
            Login as Super Admin
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Button onClick={() => navigate("/showcase")} variant="ghost" className="w-full text-brand">
            View Component Showcase
          </Button>
        </div>
      </div>
    </div>
  )
}
