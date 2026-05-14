import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Zap, Shield, Users, CheckCircle } from 'lucide-react';

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Badge variant="info" className="mb-4">Why Us</Badge>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--foreground)]">
          Why Choose HeatWatch?
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto">
          The most advanced, accurate, and accessible urban heat analysis platform available
        </p>
      </section>

      {/* Key Advantages */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">Key Advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Award,
              title: 'Industry-Leading Accuracy',
              description: 'Our ML models achieve 99.9% accuracy using NASA satellite data combined with ground weather stations.',
            },
            {
              icon: Zap,
              title: 'Real-time Updates',
              description: 'Get instant alerts and data updates with our live satellite integration and weather API connections.',
            },
            {
              icon: TrendingUp,
              title: 'Predictive Analytics',
              description: 'Forecast heat patterns and peak hours with our advanced neural networks and regression models.',
            },
            {
              icon: Shield,
              title: 'Actionable Insights',
              description: 'Receive AI-powered recommendations specifically designed to reduce UHI intensity.',
            },
            {
              icon: Users,
              title: 'Expert Support',
              description: 'Our climate scientists and engineers are available to help you implement solutions.',
            },
            {
              icon: CheckCircle,
              title: 'Global Standard',
              description: 'Used by leading cities worldwide and built on peer-reviewed climate science research.',
            },
          ].map((adv, i) => (
            <Card key={i} hover className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardHeader>
                <adv.icon size={32} className="text-[var(--accent-fire)] mb-2" />
                <CardTitle>{adv.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-muted)]">{adv.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">How We Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 px-4 text-[var(--foreground)] font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-[var(--foreground)] font-semibold">HeatWatch</th>
                  <th className="text-center py-4 px-4 text-[var(--text-muted)]">Competitor A</th>
                  <th className="text-center py-4 px-4 text-[var(--text-muted)]">Competitor B</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Real-time UHI Analysis', hw: true, c1: false, c2: true },
                  { feature: 'ML-powered Risk Scoring', hw: true, c1: true, c2: false },
                  { feature: 'Peak Hour Predictions', hw: true, c1: false, c2: false },
                  { feature: 'Intervention Simulator', hw: true, c1: false, c2: false },
                  { feature: 'NASA Satellite Integration', hw: true, c1: false, c2: true },
                  { feature: 'AI Recommendations', hw: true, c1: false, c2: false },
                  { feature: 'Easy-to-use Interface', hw: true, c1: false, c2: true },
                  { feature: 'Affordable Pricing', hw: true, c1: false, c2: true },
                  { feature: 'Priority Support', hw: true, c1: false, c2: false },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="py-4 px-4 text-[var(--foreground)]">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.hw ? <span className="text-[var(--accent-fire)] font-bold">✓</span> : '—'}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.c1 ? <span className="text-[var(--text-muted)]">✓</span> : '—'}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.c2 ? <span className="text-[var(--text-muted)]">✓</span> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-12 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              city: 'City of Phoenix, USA',
              result: 'Reduced urban heat by 2.1°C using HeatWatch recommendations',
            },
            {
              city: 'Tokyo Metropolitan Government',
              result: 'Improved planning decisions affecting 14 million residents',
            },
            {
              city: 'New Delhi Climate Initiative',
              result: 'Identified 500+ high-risk heat zones for intervention',
            },
            {
              city: 'European Environment Agency',
              result: 'Integrated HeatWatch into official climate monitoring',
            },
          ].map((story, i) => (
            <Card key={i} hover>
              <CardHeader>
                <CardTitle className="text-[var(--accent-fire)]">{story.city}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--foreground)]">{story.result}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
