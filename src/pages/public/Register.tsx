import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowRight, ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react"

import { RestaurantService } from "@/services/restaurant.service"
import { RESTAURANT_TYPES } from "@/lib/constants"
import loginImage from "@/assets/image2.png"

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
  logoUrl: z.any().optional(),
  coverImageUrl: z.any().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const typeOptions = RESTAURANT_TYPES.map((type) => ({ label: type, value: type }))

export const Register = () => {
  const [step, setStep] = useState(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Local state for images (since Cloudinary isn't connected yet)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

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
    mode: "onChange",
  })

  const { handleSubmit, trigger, formState: { isSubmitting } } = methods

  const handleNextStep = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) fieldsToValidate = ["ownerName", "ownerEmail", "ownerPhone"]
    if (step === 2) fieldsToValidate = ["name", "restaurantType", "description", "address", "city"]

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep((s) => s + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo(0, 0)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      if (type === "logo") {
        setLogoFile(file)
        setLogoPreview(previewUrl)
      } else {
        setCoverFile(file)
        setCoverPreview(previewUrl)
      }
    }
  }

  const removeImage = (type: "logo" | "cover") => {
    if (type === "logo") {
      setLogoFile(null)
      setLogoPreview(null)
      if (logoInputRef.current) logoInputRef.current.value = ""
    } else {
      setCoverFile(null)
      setCoverPreview(null)
      if (coverInputRef.current) coverInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg(null)
    try {
      let finalLogoUrl = ""
      let finalCoverUrl = ""

      if (logoFile) {
        finalLogoUrl = await RestaurantService.uploadImage(logoFile)
      }
      
      if (coverFile) {
        finalCoverUrl = await RestaurantService.uploadImage(coverFile)
      }

      const payload = {
        ...data,
        logoUrl: finalLogoUrl,
        coverImageUrl: finalCoverUrl,
      }

      await RestaurantService.register(payload)
      navigate("/register/success")
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Registration failed. Please try again.")
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
      <div className="flex items-center justify-center p-8 sm:p-12 h-full overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
                Step {step} of 3
              </span>
              <span className="text-sm text-slate-500 font-medium">
                {step === 1 && "Owner Details"}
                {step === 2 && "Restaurant Information"}
                {step === 3 && "Branding"}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-orange-500" : "bg-slate-200"
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 1 && "Owner Details"}
              {step === 2 && "Restaurant Info"}
              {step === 3 && "Add your Branding"}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 1 && "Tell us about yourself. You will be the primary super admin."}
              {step === 2 && "Where is your restaurant located and what do you serve?"}
              {step === 3 && "Upload your logo and cover image. (Optional)"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6">
              <ErrorAlert message={errorMsg} />
            </div>
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* STAGE 1: OWNER DETAILS */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  <FormField
                    name="ownerPhone"
                    label="Phone Number"
                    control={methods.control}
                    placeholder="+1 234 567 8900"
                  />

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-md mt-6"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* STAGE 2: RESTAURANT INFO */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  <FormField
                    name="address"
                    label="Street Address"
                    control={methods.control}
                    placeholder="123 Main St, Suite 100"
                  />
                  <FormField
                    name="city"
                    label="City"
                    control={methods.control}
                    placeholder="New York"
                  />
                  <FormTextarea
                    name="description"
                    label="Description"
                    control={methods.control}
                    rows={3}
                    placeholder="Tell us a bit about your restaurant..."
                  />

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="h-11 px-4 border-slate-200 hover:bg-slate-100"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-md"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STAGE 3: BRANDING (FILE UPLOADS) */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Restaurant Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={logoInputRef}
                      onChange={(e) => handleImageSelect(e, "logo")}
                    />

                    {!logoPreview ? (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm font-medium">Click to upload logo</span>
                        <span className="text-xs mt-1 opacity-70">PNG, JPG up to 5MB</span>
                      </div>
                    ) : (
                      <div className="relative border rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
                        <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-md border" />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-slate-900 truncate">{logoFile?.name}</p>
                          <p className="text-xs text-slate-500">{(logoFile?.size ? (logoFile.size / 1024 / 1024).toFixed(2) : 0)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage("logo")}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={coverInputRef}
                      onChange={(e) => handleImageSelect(e, "cover")}
                    />

                    {!coverPreview ? (
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">Click to upload cover image</span>
                        <span className="text-xs mt-1 opacity-70">Recommended size: 1200 x 400px</span>
                      </div>
                    ) : (
                      <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm group">
                        <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage("cover")}
                            className="bg-white/20 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="h-11 px-4 border-slate-200 hover:bg-slate-100"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-md"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </FormProvider>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
