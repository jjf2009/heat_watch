import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-md 
          bg-[var(--surface-light)] 
          border border-[var(--border)]
          text-[var(--foreground)]
          placeholder-[var(--text-muted)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
