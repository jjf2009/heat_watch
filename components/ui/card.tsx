import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, glow = false, ...props }, ref) => {
    const styles = `bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-300 ${
      hover ? "hover:border-[var(--accent-fire)] hover:shadow-lg hover:shadow-[var(--accent-fire)]/20" : ""
    } ${
      glow ? "glow-border" : ""
    } ${className}`
    
    return <div ref={ref} className={styles} {...props} />
  }
)

Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 border-b border-[var(--border)] ${className}`} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", ...props }, ref) => (
    <h3 ref={ref} className={`text-xl font-semibold text-[var(--foreground)] ${className}`} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-sm text-[var(--text-muted)] mt-1 ${className}`} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props} />
  )
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 border-t border-[var(--border)] flex items-center justify-between ${className}`} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
