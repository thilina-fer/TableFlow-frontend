import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price as LKR
export const formatPrice = (amount: number): string =>
  `LKR ${amount.toFixed(2)}`

// Format date/time
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

export const formatTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

export const formatDateTime = (dateStr: string): string =>
  `${formatDate(dateStr)} ${formatTime(dateStr)}`

// Time ago
export const timeAgo = (dateStr: string): string => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Download blob as file
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
