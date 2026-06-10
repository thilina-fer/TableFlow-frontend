import { Controller } from "react-hook-form"
import type { Control, FieldValues, Path } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface FormTextareaProps<TFieldValues extends FieldValues> {
  label: string
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  placeholder?: string
  disabled?: boolean
  description?: string
  rows?: number
}

export const FormTextarea = <TFieldValues extends FieldValues>({
  label,
  name,
  control,
  placeholder,
  disabled,
  description,
  rows = 3,
}: FormTextareaProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className={error ? "text-red-500" : ""}>
            {label}
          </Label>
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {description && !error && <p className="text-sm text-slate-500">{description}</p>}
          {error && <p className="text-sm font-medium text-red-500">{error.message}</p>}
        </div>
      )}
    />
  )
}

export default FormTextarea
