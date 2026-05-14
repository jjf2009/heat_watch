'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, X, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started with UHI analysis',
      cta: 'Get Started',
      ctaVariant: 'outline' as const,
      features: [
        { name: 'Global location search', included: true },
        { name: 'Real-time weather data', included: true },
        { name: 'Current heat zone detection', included: true },
        { name: 'Basic temperature analysis', included: true },
        { name: '5 reports/month', included: true },
        { name: 'Peak hour predictions', included: false },
        { name: 'Intervention simulator', included: false },
        { name: 'NASA satellite data', included: false },
        { name: 'PDF export & sharing', included: false },
        { name: 'Priority support', included: false },
      ],
    },
    {
      name: 'Premium',
      price: '$99',
      period: '/month',
      description: 'For professionals and organizations',
      cta: 'Start Free Trial',
      ctaVariant: 'primary' as const,
      featured: true,
      features: [
        { name: 'Everything in Free, plus:', included: true },
        { name: 'Advanced ML-powered risk assessment', included: true },
        { name: 'Peak hour predictions', included: true },
        { name: 'Intervention simulator', included: true },
        { name: 'NASA satellite integration', included: true },
        { name: 'ONNX neural network insights', included: true },
        { name: 'Unlimited reports', included: true },
        { name: 'PDF export & sharing', included: true },
        { name: 'API access', included: true },
        { name: 'Priority support', included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works for you. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.featured
                  ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-2 border-orange-400 lg:scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-yellow-300 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold text-sm">
                  POPULAR
                </div>
              )}

              <div className="p-8 relative">
                {/* Header */}
                <h3 className={`text-3xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={plan.featured ? 'text-orange-100' : 'text-gray-600'}>
                  {plan.description}
                </p>

                {/* Pricing */}
                <div className="mt-8 mb-8">
                  <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.featured ? 'text-orange-100' : 'text-gray-600'}>
                    {plan.period}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors flex items-center justify-center gap-2 ${
                    plan.featured
                      ? 'bg-white text-orange-600 hover:bg-orange-50'
                      : 'bg-orange-600 text-white hover:bg-orange-700 border-2 border-gray-300'
                  }`}
                >
                  {plan.cta} <ArrowRight size={20} />
                </button>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle
                          size={20}
                          className={plan.featured ? 'text-white' : 'text-green-500'}
                          strokeWidth={3}
                        />
                      ) : (
                        <X
                          size={20}
                          className={plan.featured ? 'text-orange-200' : 'text-gray-300'}
                          strokeWidth={3}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          plan.featured
                            ? feature.included
                              ? 'text-white'
                              : 'text-orange-100'
                            : feature.included
                              ? 'text-gray-700'
                              : 'text-gray-400'
                        } ${i === 0 ? 'font-semibold' : ''}`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-orange-600">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-700">Free</th>
                  <th className="px-6 py-4 text-center font-bold text-orange-600">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Location Search', free: true, premium: true },
                  { feature: 'Real-time Weather', free: true, premium: true },
                  { feature: 'Heat Zone Detection', free: true, premium: true },
                  { feature: 'Temperature Analysis', free: true, premium: true },
                  { feature: 'Monthly Reports', free: '5', premium: 'Unlimited' },
                  { feature: 'ML Risk Scoring', free: false, premium: true },
                  { feature: 'Peak Hour Predictions', free: false, premium: true },
                  { feature: 'Intervention Simulator', free: false, premium: true },
                  { feature: 'NASA Satellite Data', free: false, premium: true },
                  { feature: 'Neural Network Insights', free: false, premium: true },
                  { feature: 'PDF Export', free: false, premium: true },
                  { feature: 'API Access', free: false, premium: true },
                  { feature: 'Priority Support', free: false, premium: true },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <CheckCircle size={24} className="text-green-500 mx-auto" />
                        ) : (
                          <X size={24} className="text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900 font-semibold">{row.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <CheckCircle size={24} className="text-green-500 mx-auto" />
                        ) : (
                          <X size={24} className="text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900 font-semibold">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Pricing FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              q: 'Can I upgrade or downgrade anytime?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'Do you offer discounts for annual billing?',
              a: 'Yes, we offer 20% discount if you pay annually. Contact us for custom enterprise plans.',
            },
            {
              q: 'Is there a free trial for Premium?',
              a: 'Yes, all new Premium users get a 14-day free trial. No credit card required to start.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, bank transfers, and wire payments for enterprise customers.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">{faq.q}</h4>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-orange-100 mb-8">
            Start with free, upgrade to Premium anytime.
          </p>
          <button className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg hover:text-orange-700">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
