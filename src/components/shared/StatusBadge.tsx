import React from "react"
import { theme } from "@/lib/theme"

interface StatusBadgeProps {
  status: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalizedStatus = status.toLowerCase()
  const statusTheme = theme.colors.status[normalizedStatus] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  }

  const formattedStatus = normalizedStatus
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusTheme.bg} ${statusTheme.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusTheme.dot}`} aria-hidden="true" />
      {formattedStatus}
    </span>
  )
}
