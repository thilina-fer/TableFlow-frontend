import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FormTextareaProps {
  name: string
  label: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  className?: string
}

export function FormTextarea({
  name,
  label,
  placeholder,
  rows = 4,
  disabled = false,
  className,
}: FormTextareaProps) {
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
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        {...register(name)}
        className={cn(
          'resize-none',
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
