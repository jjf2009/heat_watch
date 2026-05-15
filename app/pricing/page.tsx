'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAuthGate } from '@/lib/useAuthGate';
import PricingCard from '@/components/PricingCard';
import LoginModal from '@/components/LoginModal';
import { Accordion } from '@/components/ui/accordion';
import { Check, Minus } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { gate, loginModalOpen, onAuthSuccess, closeModal } = useAuthGate();

  const pricingTiers = [
    {
      name: 'Free',
      price: '₹0',
      description: 'Perfect for exploring heat analysis',
      tier: 'free' as const,
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
      price: '₹2000',
      period: '/month',
      description: 'For serious climate analysts',
      tier: 'professional' as const,
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
      price: '₹10,000',
      period: '/month',
      description: 'For organizations & governments',
      tier: 'enterprise' as const,
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

  const handlePlan = (planSlug: string) =>
    gate(() => router.push(`/dashboard?plan=${planSlug}`));

  const comparisonRows = [
    { name: 'Location Search', category: 'Core', free: true, pro: true, ent: true },
    { name: 'Real-time Weather Data', category: 'Core', free: true, pro: true, ent: true },
    { name: 'Heat Zone Detection', category: 'Core', free: true, pro: true, ent: true },
    { name: 'Reports per Month', category: 'Core', free: '5', pro: '50', ent: 'Unlimited' },
    { name: 'ML Risk Assessment', category: 'Intelligence', free: false, pro: true, ent: true },
    { name: 'Peak Hour Predictions', category: 'Intelligence', free: false, pro: true, ent: true },
    { name: 'Historical Data Access', category: 'Intelligence', free: false, pro: '1 Year', ent: '5 Years' },
    { name: 'Intervention Simulator', category: 'Intelligence', free: false, pro: true, ent: true },
    { name: 'PDF Export', category: 'Export', free: false, pro: true, ent: true },
    { name: 'API Access', category: 'Export', free: false, pro: true, ent: true },
    { name: 'Custom Integrations', category: 'Enterprise', free: false, pro: false, ent: true },
    { name: 'White-label Options', category: 'Enterprise', free: false, pro: false, ent: true },
    { name: 'Dedicated Support', category: 'Enterprise', free: false, pro: false, ent: true },
    { name: 'Multi-user Collaboration', category: 'Enterprise', free: false, pro: 'Up to 3', ent: 'Unlimited' },
  ];

  type RowValue = string | boolean;

  const renderCell = (val: RowValue, color: string) => {
    if (val === true) {
      return (
        <div className="flex justify-center">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}50` }}>
            <Check size={12} style={{ color }} strokeWidth={3} />
          </div>
        </div>
      );
    }
    if (val === false) {
      return (
        <div className="flex justify-center">
          <Minus size={16} className="text-gray-600" />
        </div>
      );
    }
    return <span className="text-xs font-semibold" style={{ color }}>{val}</span>;
  };

  const faqItems = [
    {
      value: 'billing',
      title: 'How does billing work?',
      children: <p>Premium plans are billed monthly. You can cancel anytime from your account settings. All plans automatically renew on the same date each month.</p>,
    },
    {
      value: 'features',
      title: 'Can I switch between plans?',
      children: <p>Yes, you can upgrade or downgrade at any time. Changes take effect immediately, and we&apos;ll prorate any differences in your next billing cycle.</p>,
    },
    {
      value: 'data',
      title: 'Is my data secure?',
      children: <p>Absolutely. We use bank-level encryption (AES-256) and maintain SOC 2 Type II compliance. All data is encrypted in transit and at rest.</p>,
    },
    {
      value: 'api',
      title: 'Do you offer API access?',
      children: <p>API access is available on Professional and Enterprise plans. You get full REST and GraphQL APIs with rate limits based on your tier.</p>,
    },
    {
      value: 'support',
      title: 'What support options are available?',
      children: <p>Free users get community support. Professional users get email support within 24 hours. Enterprise users get priority phone and Slack support.</p>,
    },
    {
      value: 'team',
      title: 'Can multiple users access one account?',
      children: <p>Professional plans include up to 3 users. Enterprise plans support unlimited team members with role-based access controls.</p>,
    },
  ];

  return (
    <div className="min-h-screen py-20" style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0f0d0b 50%, #0a0808 100%)' }}>

      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-3" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 text-center mb-24 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
          💰 Pricing Plans
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
          Simple,{' '}
          <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transparent
          </span>{' '}
          Pricing
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Choose the perfect plan for your climate analysis needs. Start free, scale as you grow.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-6 mb-28 relative">
        {/* Spin border keyframe */}
        <style>{`
          @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes spin-border {
            to { --angle: 360deg; }
          }
          @keyframes card-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              style={{
                animationDelay: `${idx * 0.1}s`,
                animation: tier.highlighted ? 'card-float 4s ease-in-out infinite' : 'none',
              }}
            >
              <PricingCard
                {...tier}
                onCtaClick={() => handlePlan(tier.ctaLink.split('plan=')[1])}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-6 mb-24 relative">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white mb-3">Feature Comparison</h2>
          <p className="text-gray-500 text-sm">Everything you get across all plans at a glance</p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #141414, #0f0f0f)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-4 px-6 py-5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Feature</span>
            </div>
            {[
              { label: 'Free', color: '#60a5fa' },
              { label: 'Professional', color: '#f97316' },
              { label: 'Enterprise', color: '#a855f7' },
            ].map((col) => (
              <div key={col.label} className="text-center">
                <span className="text-sm font-bold" style={{ color: col.color }}>{col.label}</span>
              </div>
            ))}
          </div>

          {/* Group rows by category */}
          {['Core', 'Intelligence', 'Export', 'Enterprise'].map((category) => {
            const rows = comparisonRows.filter((r) => r.category === category);
            return (
              <div key={category}>
                {/* Category label */}
                <div className="px-6 py-2 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">{category}</span>
                </div>
                {rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="grid grid-cols-4 px-6 py-4 border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.02] group"
                  >
                    <div className="text-sm text-gray-300 group-hover:text-white transition-colors">{row.name}</div>
                    <div className="flex justify-center items-center">{renderCell(row.free, '#60a5fa')}</div>
                    <div className="flex justify-center items-center">{renderCell(row.pro, '#f97316')}</div>
                    <div className="flex justify-center items-center">{renderCell(row.ent, '#a855f7')}</div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* CTA row at bottom */}
          <div className="grid grid-cols-4 px-6 py-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center">
              <span className="text-xs text-gray-600">Get started today</span>
            </div>
            {[
              { label: 'Get Started', color: '#60a5fa', plan: 'free' },
              { label: 'Upgrade Now', color: '#f97316', plan: 'professional' },
              { label: 'Contact Us', color: '#a855f7', plan: 'enterprise' },
            ].map((btn) => (
              <div key={btn.plan} className="flex justify-center">
                <button
                  onClick={() => handlePlan(btn.plan)}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: `${btn.color}15`,
                    border: `1px solid ${btn.color}40`,
                    color: btn.color,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = `${btn.color}25`;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px ${btn.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = `${btn.color}15`;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }}
                >
                  {btn.label} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm">Got questions? We&apos;ve got answers.</p>
        </div>
        <Accordion items={faqItems} />
      </section>

      {/* Auth gate modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeModal}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}
