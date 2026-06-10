import React from "react"
import { theme } from "@/lib/theme"

interface RoleBadgeProps {
  role: string
  className?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = "" }) => {
  const normalizedRole = role.toLowerCase()
  const roleTheme = theme.colors.role[normalizedRole] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
  }

  const formattedRole = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleTheme.bg} ${roleTheme.text} ${className}`}
    >
      {formattedRole}
    </span>
  )
}
