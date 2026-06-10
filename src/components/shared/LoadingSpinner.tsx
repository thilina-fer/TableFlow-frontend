import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  fullPage?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", fullPage = false }) => {
  const spinner = <Loader2 className={`animate-spin text-slate-400 ${sizeClasses[size]}`} />

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>
}

export default LoadingSpinner
