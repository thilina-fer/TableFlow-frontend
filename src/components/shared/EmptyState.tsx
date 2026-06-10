import React from "react"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/theme"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
      {icon && <div className="text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className={theme.btn.brand}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
