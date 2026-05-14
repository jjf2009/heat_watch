"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, MapPin, Zap, Database, Brain, LineChart } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "Global Location Search",
    description: "Search and analyze any location worldwide with precision mapping",
    badge: "Free",
    color: "text-blue-400"
  },
  {
    icon: Database,
    title: "Real-time Weather Data",
    description: "Live temperature, humidity, and atmospheric data integration",
    badge: "Free",
    color: "text-cyan-400"
  },
  {
    icon: BarChart3,
    title: "Heat Zone Detection",
    description: "Identify and map urban heat islands with satellite precision",
    badge: "Free",
    color: "text-orange-400"
  },
  {
    icon: Brain,
    title: "ML Risk Assessment",
    description: "Neural network-powered heat risk and hazard prediction",
    badge: "Premium",
    color: "text-purple-400"
  },
  {
    icon: LineChart,
    title: "Peak Hour Predictions",
    description: "Forecast temperature peaks and optimal intervention times",
    badge: "Premium",
    color: "text-red-400"
  },
  {
    icon: Zap,
    title: "Intervention Simulator",
    description: "Model and simulate cooling interventions in real-time",
    badge: "Premium",
    color: "text-yellow-400"
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">Features</Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-[var(--foreground)]">
            Powerful Climate Analytics
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Comprehensive tools for analyzing, predicting, and responding to urban heat island effects
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              hover
              className="animate-fadeUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <feature.icon size={32} className={feature.color} />
                  <Badge variant={feature.badge === "Premium" ? "danger" : "default"}>
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
