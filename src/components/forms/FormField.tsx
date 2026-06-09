import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  className?: string
}

export function FormField({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const errorMessage =
    error && typeof error.message === 'string' ? error.message : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={cn(
          errorMessage &&
            'border-red-500 focus-visible:ring-red-500',
        )}
        aria-describedby={errorMessage ? `${name}-error` : undefined}
        aria-invalid={!!errorMessage}
      />
      {errorMessage && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-red-500"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
