import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      default: "bg-[var(--accent-fire)] text-white hover:bg-[var(--accent-heat)] focus:ring-[var(--accent-fire)]",
      secondary: "bg-[var(--surface-light)] text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)]",
      outline: "border border-[var(--accent-fire)] text-[var(--accent-fire)] hover:bg-[var(--accent-fire)]/10",
      ghost: "text-[var(--foreground)] hover:bg-[var(--surface-light)]",
      danger: "bg-[var(--accent-danger)] text-white hover:bg-red-700 focus:ring-[var(--accent-danger)]",
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
