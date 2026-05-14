"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Thermometer, TrendingUp, Shield } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent-fire)] rounded-full mix-blend-screen opacity-10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent-heat)] rounded-full mix-blend-screen opacity-10 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-light)]/50 backdrop-blur mb-8 animate-fadeUp">
          <Thermometer size={16} className="text-[var(--accent-fire)]" />
          <span className="text-sm text-[var(--text-muted)]">Advanced Climate Analytics Platform</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fadeUp text-[var(--foreground)] leading-tight" style={{ animationDelay: "0.1s" }}>
          Understand Urban
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-heat)] to-[var(--accent-fire)]">Heat Island Effects</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto mb-8 animate-fadeUp leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Advanced climate prediction powered by machine learning. Analyze urban heat patterns, predict temperature anomalies, and make data-driven decisions to combat climate change.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeUp" style={{ animationDelay: "0.3s" }}>
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Start Free Analysis
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View Premium Features
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fadeUp" style={{ animationDelay: "0.4s" }}>
          {[
            { icon: Thermometer, label: "Real-time Data", desc: "Live temperature and heat index monitoring" },
            { icon: TrendingUp, label: "ML Predictions", desc: "Accurate 7-day forecasts" },
            { icon: Shield, label: "Verified Data", desc: "NASA satellite integration" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface-light)]/50 backdrop-blur hover:border-[var(--accent-fire)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--accent-fire)]/10">
              <item.icon size={32} className="text-[var(--accent-fire)] mb-3 mx-auto" />
              <h3 className="font-semibold mb-2 text-[var(--foreground)]">{item.label}</h3>
              <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
