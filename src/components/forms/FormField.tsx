import { Controller } from "react-hook-form"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Type constraint for Control generic
interface FormFieldProps<TFieldValues extends FieldValues> {
  label: string
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  placeholder?: string
  type?: string
  disabled?: boolean
  description?: string
}

export const FormField = <TFieldValues extends FieldValues>({
  label,
  name,
  control,
  placeholder,
  type = "text",
  disabled,
  description,
}: FormFieldProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className={error ? "text-red-500" : ""}>
            {label}
          </Label>
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {description && !error && <p className="text-sm text-slate-500">{description}</p>}
          {error && <p className="text-sm font-medium text-red-500">{error.message}</p>}
        </div>
      )}
    />
  )
}

export default FormField
