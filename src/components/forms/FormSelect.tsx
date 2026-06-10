import { Controller } from "react-hook-form"
import type { Control, FieldValues, Path } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FormSelectProps<TFieldValues extends FieldValues> {
  label: string
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  options: { label: string; value: string }[]
  placeholder?: string
  disabled?: boolean
  description?: string
}

export const FormSelect = <TFieldValues extends FieldValues>({
  label,
  name,
  control,
  options,
  placeholder,
  disabled,
  description,
}: FormSelectProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className={error ? "text-red-500" : ""}>
            {label}
          </Label>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={error ? "border-red-500 focus:ring-red-500" : ""}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !error && <p className="text-sm text-slate-500">{description}</p>}
          {error && <p className="text-sm font-medium text-red-500">{error.message}</p>}
        </div>
      )}
    />
  )
}

export default FormSelect
