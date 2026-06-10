import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { setFirstLoginFalse, setAccessToken, selectIsFirstLogin, selectCurrentUser } from "@/features/auth/authSlice"
import { AuthService } from "@/services/auth.service"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/forms"
import { ErrorAlert } from "@/components/shared"
import { theme } from "@/lib/theme"
import { ROLE_REDIRECT } from "@/lib/constants"


const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const isFirstLogin = useAppSelector(selectIsFirstLogin)
  const user = useAppSelector(selectCurrentUser)

  const methods = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { handleSubmit, formState: { isSubmitting } } = methods

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setErrorMsg(null)
    try {
      const res = await AuthService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      dispatch(setAccessToken(res.accessToken))
      dispatch(setFirstLoginFalse())
      toast.success("Password changed successfully", {
        description: "You can now use your new password to sign in.",
      })
      if (user) {
        navigate(ROLE_REDIRECT[user.role] || "/")
      } else {
        navigate("/")
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to change password")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your account security</CardDescription>
        </CardHeader>
        <CardContent>
          {isFirstLogin && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                You must change your password before continuing.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6">
              <ErrorAlert message={errorMsg} />
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className={theme.formGap}>
              <div className="relative">
                <FormField
                  name="currentPassword"
                  label="Current Password"
                  control={methods.control}
                  type={showCurrent ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <FormField
                  name="newPassword"
                  label="New Password"
                  control={methods.control}
                  type={showNew ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <FormField
                  name="confirmPassword"
                  label="Confirm New Password"
                  control={methods.control}
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePassword
