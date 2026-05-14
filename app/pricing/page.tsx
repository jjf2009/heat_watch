'use client';

import { useAuth } from '@/lib/auth-context';
import PricingCard from '@/components/PricingCard';
import { Badge } from '@/components/ui/badge';
import { Accordion } from '@/components/ui/accordion';

export default function PricingPage() {
  const { user } = useAuth();

  const pricingTiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for exploring heat analysis',
      features: [
        'Global location search',
        'Real-time weather data',
        'Heat zone detection',
        '5 reports per month',
        'Basic temperature analysis',
      ],
      cta: user ? 'Continue with free tier' : 'Get Started',
      ctaLink: '/dashboard?plan=free',
    },
    {
      name: 'Professional',
      price: '2000Rs',
      period: '/month',
      description: 'For serious climate analysts',
      features: [
        'Everything in Free, plus:',
        'ML-powered risk assessment',
        'Peak hour predictions',
        '50 reports per month',
        'Intervention simulator',
        'Priority support',
        'PDF export',
        'Historical data access (1 year)',
      ],
      highlighted: true,
      badge: 'MOST POPULAR',
      cta: user ? 'Continue with professional' : 'Upgrade Now',
      ctaLink: '/dashboard?plan=professional',
    },
    {
      name: 'Enterprise',
      price: '10000Rs',
      period: '/month',
      description: 'For organizations & governments',
      features: [
        'Everything in Professional, plus:',
        'Unlimited reports',
        'API access',
        'Custom integrations',
        'Dedicated support team',
        'White-label options',
        'Advanced analytics',
        'Multi-user collaboration',
      ],
      cta: 'Continue with enterprise',
      ctaLink: '/dashboard?plan=enterprise',
    },
  ];

  const faqItems = [
    {
      value: 'billing',
      title: 'How does billing work?',
      children: (
        <p>
          Premium plans are billed monthly. You can cancel anytime from your account settings. All plans automatically renew on the same date each month.
        </p>
      ),
    },
    {
      value: 'features',
      title: 'Can I switch between plans?',
      children: (
        <p>
          Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we&apos;ll prorate any differences in your next billing cycle.
        </p>
      ),
    },
    {
      value: 'data',
      title: 'Is my data secure?',
      children: (
        <p>
          Absolutely. We use bank-level encryption (AES-256) and maintain SOC 2 Type II compliance. All data is encrypted in transit and at rest.
        </p>
      ),
    },
    {
      value: 'api',
      title: 'Do you offer API access?',
      children: (
        <p>
          API access is available on Professional and Enterprise plans. You get full REST and GraphQL APIs with rate limits based on your tier.
        </p>
      ),
    },
    {
      value: 'support',
      title: 'What support options are available?',
      children: (
        <p>
          Free users get community support. Professional users get email support within 24 hours. Enterprise users get priority phone and Slack support.
        </p>
      ),
    },
    {
      value: 'team',
      title: 'Can multiple users access one account?',
      children: (
        <p>
          Professional plans include up to 3 users. Enterprise plans support unlimited team members with role-based access controls.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] py-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 text-center mb-20">
        <Badge variant="info" className="mb-4">Pricing</Badge>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--foreground)]">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
          Choose the perfect plan for your climate analysis needs. All plans include free access to basic features.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, idx) => (
            <div key={idx} className="animate-fadeUp" style={{ animationDelay: `${idx * 0.1}s` }}>
              <PricingCard {...tier} />
            </div>
          ))}
        </div>
      </section>

      {/* Comparison section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8">
          <h2 className="text-3xl font-serif font-bold mb-8 text-[var(--foreground)]">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 px-4 text-[var(--foreground)] font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-[var(--foreground)] font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-[var(--foreground)] font-semibold">Professional</th>
                  <th className="text-center py-4 px-4 text-[var(--foreground)] font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Location Search', free: true, pro: true, ent: true },
                  { name: 'Weather Data', free: true, pro: true, ent: true },
                  { name: 'Heat Zone Detection', free: true, pro: true, ent: true },
                  { name: 'ML Risk Assessment', free: false, pro: true, ent: true },
                  { name: 'Peak Hour Predictions', free: false, pro: true, ent: true },
                  { name: 'Intervention Simulator', free: false, pro: true, ent: true },
                  { name: 'PDF Reports', free: false, pro: true, ent: true },
                  { name: 'API Access', free: false, pro: true, ent: true },
                  { name: 'Priority Support', free: false, pro: true, ent: true },
                  { name: 'Custom Integrations', free: false, pro: false, ent: true },
                  { name: 'White-label', free: false, pro: false, ent: true },
                  { name: 'Dedicated Support', free: false, pro: false, ent: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--surface-light)]">
                    <td className="py-4 px-4 text-[var(--foreground)]">{row.name}</td>
                    <td className="text-center py-4 px-4">{row.free ? '✓' : '—'}</td>
                    <td className="text-center py-4 px-4">{row.pro ? '✓' : '—'}</td>
                    <td className="text-center py-4 px-4">{row.ent ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-serif font-bold mb-8 text-[var(--foreground)] text-center">
          Frequently Asked Questions
        </h2>
        <Accordion items={faqItems} />
      </section>
    </div>
  );
}
