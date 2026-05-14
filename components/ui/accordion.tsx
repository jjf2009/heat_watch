"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItemProps {
  value: string
  title: string | React.ReactNode
  children: React.ReactNode
}

interface AccordionProps {
  items: AccordionItemProps[]
  type?: "single" | "multiple"
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, type = "single" }, ref) => {
    const [expanded, setExpanded] = React.useState<string | string[]>(
      type === "single" ? "" : []
    )

    const toggle = (value: string) => {
      if (type === "single") {
        setExpanded(expanded === value ? "" : value)
      } else {
        setExpanded(prev => {
          const arr = Array.isArray(prev) ? prev : []
          return arr.includes(value) 
            ? arr.filter(v => v !== value)
            : [...arr, value]
        })
      }
    }

    const isExpanded = (value: string) => {
      return type === "single" 
        ? expanded === value 
        : Array.isArray(expanded) && expanded.includes(value)
    }

    return (
      <div ref={ref} className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent-fire)]/50 transition-colors">
            <button
              onClick={() => toggle(item.value)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-light)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">{item.title}</span>
              <ChevronDown 
                size={20} 
                className={`text-[var(--accent-fire)] transition-transform duration-300 ${
                  isExpanded(item.value) ? "rotate-180" : ""
                }`}
              />
            </button>
            {isExpanded(item.value) && (
              <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)] text-[var(--text-muted)]">
                {item.children}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
)

Accordion.displayName = "Accordion"

export { Accordion }
