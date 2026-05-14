"use client"

import { useEffect, useState } from "react"

interface StatProps {
  number: string
  label: string
  suffix?: string
}

function StatCard({ number, label, suffix = "" }: StatProps) {
  const [count, setCount] = useState("0")

  useEffect(() => {
    const numValue = parseInt(number.replace(/\D/g, ""))
    const duration = 1500
    const steps = 60

    let current = 0
    const increment = numValue / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= numValue) {
        setCount(number)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current).toString())
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [number])

  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-heat)] mb-2">
        {count}{suffix}
      </div>
      <p className="text-[var(--text-muted)] text-lg">{label}</p>
    </div>
  )
}

export default function StatsSection() {
  const stats = [
    { number: "150", label: "Countries Covered", suffix: "+" },
    { number: "10000", label: "Cities Analyzed", suffix: "+" },
    { number: "99.9", label: "Accuracy Rate", suffix: "%" },
    { number: "50000", label: "Active Users", suffix: "+" },
  ]

  return (
    <section className="py-24 px-6 bg-gradient-to-r from-[var(--surface)] via-[var(--background)] to-[var(--surface)] border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="animate-fadeUp" style={{ animationDelay: `${idx * 0.1}s` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
