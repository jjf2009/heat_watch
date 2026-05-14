'use client';

import { Badge } from '@/components/ui/badge';
import { Accordion } from '@/components/ui/accordion';

export default function FAQPage() {
  const faqItems = [
    {
      value: 'uhi',
      title: 'What is an Urban Heat Island (UHI)?',
      children: (
        <p>
          An Urban Heat Island is a phenomenon where urban areas experience higher temperatures than surrounding rural areas due to the replacement of natural vegetation with heat-absorbing materials like concrete and asphalt. HeatWatch helps you monitor and predict these effects.
        </p>
      ),
    },
    {
      value: 'accuracy',
      title: 'How accurate is HeatWatch&apos;s data?',
      children: (
        <p>
          Our ML models achieve 99.9% accuracy by combining NASA satellite data, ground weather stations, and advanced algorithms. We continuously validate our predictions against real-world temperature measurements.
        </p>
      ),
    },
    {
      value: 'free',
      title: 'Can I use HeatWatch for free?',
      children: (
        <p>
          Yes! Our free plan includes global location search, real-time weather data, current heat zone detection, and basic temperature analysis. Premium features like advanced ML analytics and predictions require a paid subscription.
        </p>
      ),
    },
    {
      value: 'coverage',
      title: 'Which cities does HeatWatch cover?',
      children: (
        <p>
          HeatWatch provides coverage for 150+ countries and 10,000+ cities worldwide, with the ability to analyze any location globally. We&apos;re continuously expanding our monitored cities based on user demand.
        </p>
      ),
    },
    {
      value: 'predictions',
      title: 'How do the peak hour predictions work?',
      children: (
        <p>
          Our neural networks analyze historical temperature patterns and weather conditions to predict when urban areas will reach peak heat. This helps you plan heat mitigation strategies and public health responses.
        </p>
      ),
    },
    {
      value: 'simulator',
      title: 'What is the Intervention Simulator?',
      children: (
        <p>
          The Intervention Simulator lets you test the potential impact of different cooling strategies (like green infrastructure, reflective roofs, etc.) on UHI intensity before investing in expensive implementations.
        </p>
      ),
    },
    {
      value: 'updates',
      title: 'How often is the data updated?',
      children: (
        <p>
          Free plan data updates daily. Premium plan includes real-time updates with satellite passes and weather station data refreshing multiple times throughout the day.
        </p>
      ),
    },
    {
      value: 'export',
      title: 'Can I export reports?',
      children: (
        <p>
          Yes! Premium subscribers can export comprehensive PDF reports with all analysis, forecasts, and recommendations. Free users can view results but cannot export.
        </p>
      ),
    },
    {
      value: 'api',
      title: 'Do you offer API access?',
      children: (
        <p>
          Yes, premium subscribers can access our API for custom integrations and automation. Contact our support team for API documentation and rate limits.
        </p>
      ),
    },
    {
      value: 'support',
      title: 'What kind of support do you offer?',
      children: (
        <p>
          Free plan users have access to our knowledge base and community forums. Premium subscribers receive priority email support and access to our climate science team for strategic guidance.
        </p>
      ),
    },
    {
      value: 'security',
      title: 'How is my data secured?',
      children: (
        <p>
          We use bank-level encryption (AES-256) for all data in transit and at rest. HeatWatch maintains SOC 2 Type II compliance and regular security audits to protect your information.
        </p>
      ),
    },
    {
      value: 'training',
      title: 'Do you offer training for organizations?',
      children: (
        <p>
          Yes! We offer customized training sessions for government agencies and organizations. Enterprise customers receive dedicated onboarding and regular training updates.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Badge variant="info" className="mb-4">FAQ</Badge>
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-[var(--foreground)]">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
          Find answers to common questions about HeatWatch features, pricing, and security.
        </p>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <Accordion items={faqItems} />
      </section>
    </div>
  );
}
