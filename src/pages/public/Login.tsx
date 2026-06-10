import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

import { useAppDispatch } from "@/app/hooks"
import { setCredentials } from "@/features/auth/authSlice"
import { AuthService } from "@/services/auth.service"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms"
import { ErrorAlert } from "@/components/shared"
import { ROLE_REDIRECT } from "@/lib/constants"
import loginImage from "@/assets/image.png"

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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-slate-50">
      {/* Left Side: Image overlay */}
      <div className="hidden lg:block relative h-full w-full">
        <img 
          src={loginImage} 
          alt="Restaurant background" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight text-white tracking-tight">
            Elevate your<br />restaurant operations.
          </h1>
          <p className="text-lg text-slate-200/90 max-w-lg leading-relaxed">
            Streamline your workflow from host stand to kitchen with TableFlow's intuitive management suite.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 h-full">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">
              Please enter your details to sign in to your account.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6">
              <ErrorAlert message={errorMsg} />
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                name="email"
                label="Email Address"
                control={methods.control}
                placeholder="manager@restaurant.com"
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
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-slate-500 font-medium">Remember me</span>
                </label>
                <Link to="#" className="text-orange-500 hover:text-orange-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </FormProvider>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Want to register your restaurant?{" "}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 hover:underline">
              Apply here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
