import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from "lucide-react"

import { useAppDispatch } from "@/app/hooks"
import { setCredentials } from "@/features/auth/authSlice"
import { AuthService } from "@/services/auth.service"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms"
import { ErrorAlert } from "@/components/shared"
import { theme } from "@/lib/theme"
import { ROLE_REDIRECT } from "@/lib/constants"


const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { handleSubmit, formState: { isSubmitting } } = methods

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null)
    try {
      const { user, accessToken, refreshToken } = await AuthService.loginStaff(data)
      
      dispatch(
        setCredentials({
          user,
          accessToken,
          refreshToken,
          isFirstLogin: user.isFirstLogin,
        })
      )

      if (user.isFirstLogin) {
        navigate("/change-password")
      } else {
        navigate(ROLE_REDIRECT[user.role] || "/")
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-brand rounded-xl p-2 text-white">
              <UtensilsCrossed size={32} />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">TableFlow</span>
          </div>
          <div>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-6">
              <ErrorAlert message={errorMsg} />
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className={theme.formGap}>
              <FormField
                name="email"
                label="Email Address"
                control={methods.control}
                placeholder="you@restaurant.com"
              />
              <div className="relative">
                <FormField
                  name="password"
                  label="Password"
                  control={methods.control}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                className={`w-full mt-6 ${theme.btn.brand}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-sm text-slate-500">
        Want to register your restaurant?{" "}
        <Link to="/register" className="text-brand hover:underline font-medium">
          Apply here
        </Link>
      </div>
    </div>
  )
}

export default Login
