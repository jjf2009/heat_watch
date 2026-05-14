"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-[var(--background)] to-[var(--surface)] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[var(--accent-fire)] rounded-full mix-blend-screen opacity-5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[var(--foreground)]">
          Ready to Analyze Urban Heat?
        </h2>
        
        <p className="text-xl text-[var(--text-muted)] mb-8 max-w-2xl mx-auto">
          Join thousands of city planners and climate scientists using HeatWatch to make data-driven decisions about urban heat mitigation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="group">
              Get Started Free
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Talk to Our Team
            </Button>
          </Link>
        </div>

        <p className="text-sm text-[var(--text-muted)] mt-8">
          No credit card required. Free tier includes all basic features.
        </p>
      </div>
    </section>
  )
}
