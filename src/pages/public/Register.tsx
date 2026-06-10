import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { UtensilsCrossed, Loader2 } from "lucide-react"

import { RestaurantService } from "@/services/restaurant.service"
import { RESTAURANT_TYPES } from "@/lib/constants"
import { theme } from "@/lib/theme"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormField, FormTextarea, FormSelect } from "@/components/forms"
import { ErrorAlert } from "@/components/shared"


const registerSchema = z.object({
  name: z.string().min(2, "Min 2 characters").max(100),
  ownerName: z.string().min(2, "Min 2 characters").max(100),
  ownerEmail: z.string().email("Enter a valid email"),
  ownerPhone: z.string().min(7, "Min 7 digits").max(15),
  address: z.string().min(5, "Min 5 characters").max(200),
  city: z.string().min(2, "Min 2 characters").max(50),
  restaurantType: z.enum(["Fine Dining", "Fast Food", "Café", "Bakery", "Other"], {
    message: "Select a restaurant type",
  }),
  description: z.string().min(10, "Min 10 characters").max(500),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  coverImageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const typeOptions = RESTAURANT_TYPES.map((type) => ({ label: type, value: type }))

export const Register = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      address: "",
      city: "",
      restaurantType: undefined as any,
      description: "",
      logoUrl: "",
      coverImageUrl: "",
    },
  })

  const { handleSubmit, formState: { isSubmitting } } = methods

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg(null)
    try {
      await RestaurantService.register(data)
      navigate("/register/success")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-brand rounded-xl p-3 text-white mb-4 shadow-sm">
            <UtensilsCrossed size={36} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Register Your Restaurant</h1>
          <p className="text-slate-500">Join TableFlow and start accepting digital orders</p>
        </div>

        {errorMsg && (
          <div className="mb-8">
            <ErrorAlert message={errorMsg} />
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section 1 - Restaurant Info */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  name="name"
                  label="Restaurant Name"
                  control={methods.control}
                  placeholder="e.g. The Golden Fork"
                />
                <FormSelect
                  name="restaurantType"
                  label="Restaurant Type"
                  control={methods.control}
                  options={typeOptions}
                  placeholder="Select type"
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  control={methods.control}
                  rows={3}
                  placeholder="Tell us a bit about your restaurant..."
                />
              </CardContent>
            </Card>

            {/* Section 2 - Owner Info */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Owner Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="ownerName"
                  label="Full Name"
                  control={methods.control}
                  placeholder="John Doe"
                />
                <FormField
                  name="ownerEmail"
                  label="Email Address"
                  control={methods.control}
                  type="email"
                  placeholder="john@example.com"
                />
                <div className="md:col-span-1">
                  <FormField
                    name="ownerPhone"
                    label="Phone Number"
                    control={methods.control}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3 - Location */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  name="address"
                  label="Street Address"
                  control={methods.control}
                  placeholder="123 Main St, Suite 100"
                />
                <div className="w-full md:w-1/2">
                  <FormField
                    name="city"
                    label="City"
                    control={methods.control}
                    placeholder="New York"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 4 - Branding */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Branding</CardTitle>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">Optional</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  name="logoUrl"
                  label="Logo URL"
                  control={methods.control}
                  placeholder="https://example.com/logo.png"
                />
                <FormField
                  name="coverImageUrl"
                  label="Cover Image URL"
                  control={methods.control}
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-xs text-slate-400">
                  Provide direct image URLs (e.g. from Cloudinary or Imgur)
                </p>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full py-6 text-lg ${theme.btn.brand}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </FormProvider>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="text-brand hover:underline font-medium">
            Log in here
          </Link>
        </div>
        
      </div>
    </div>
  )
}

export default Register
