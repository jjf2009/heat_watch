import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[var(--accent-fire)]/20 text-[var(--accent-fire)] border border-[var(--accent-fire)]/30",
      success: "bg-green-500/20 text-green-400 border border-green-500/30",
      warning: "bg-[var(--accent-heat)]/20 text-[var(--accent-heat)] border border-[var(--accent-heat)]/30",
      danger: "bg-[var(--accent-danger)]/20 text-red-400 border border-[var(--accent-danger)]/30",
      info: "bg-[var(--accent-cool)]/20 text-blue-400 border border-[var(--accent-cool)]/30",
    }
    
    return (
      <div
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
