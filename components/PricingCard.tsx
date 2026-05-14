"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

interface PricingCardProps {
  name: string
  price: string | number
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
  cta: string
  ctaLink: string
}

export default function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  highlighted = false,
  badge,
  cta,
  ctaLink,
}: PricingCardProps) {
  return (
    <Card
      className={`relative transition-all duration-300 ${
        highlighted
          ? "border-[var(--accent-fire)] shadow-xl shadow-[var(--accent-fire)]/20 md:scale-105"
          : "hover:border-[var(--accent-fire)]"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="danger">MOST POPULAR</Badge>
        </div>
      )}

      <CardHeader className={highlighted ? "pt-8" : ""}>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div className="space-y-2">
          {period ? (
            <>
              <span className="text-4xl font-bold text-[var(--accent-fire)]">{price}</span>
              <span className="text-[var(--text-muted)] ml-2">{period}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-[var(--foreground)]">{price}</span>
          )}
        </div>

        {/* CTA Button */}
        <Link href={ctaLink} className="block">
          <Button
            variant={highlighted ? "default" : "outline"}
            className="w-full"
            size="lg"
          >
            {cta}
          </Button>
        </Link>

        {/* Features list */}
        <div className="space-y-3 border-t border-[var(--border)] pt-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-[var(--foreground)]">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
