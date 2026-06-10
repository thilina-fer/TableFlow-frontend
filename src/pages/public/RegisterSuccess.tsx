import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/theme"

export const RegisterSuccess = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto mt-24 shadow-lg border-slate-200 text-center">
        <CardHeader className="space-y-6 pb-4">
          <div className="flex justify-center">
            <CheckCircle2 size={64} className="text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Application Submitted!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for registering with TableFlow.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-slate-600 text-sm leading-relaxed">
            We'll review your application within 1-2 business days and send login credentials to your email once approved.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className={`w-full ${theme.btn.brand}`}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterSuccess
