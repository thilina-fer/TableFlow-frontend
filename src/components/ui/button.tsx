import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.95] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-550 hover:to-orange-650 hover:shadow-orange-500/30 hover:shadow-xl border border-orange-600/20",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-550 hover:to-red-650 hover:shadow-red-500/30 hover:shadow-xl border border-red-600/20",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg hover:border-slate-300",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-md",
        ghost: "hover:bg-slate-100 hover:text-slate-900 shadow-none hover:shadow-sm",
        link: "text-orange-500 underline-offset-4 hover:underline shadow-none hover:-translate-y-0 hover:scale-100",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
