'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is an Urban Heat Island (UHI)?',
    answer: 'An Urban Heat Island is a phenomenon where urban areas experience higher temperatures than surrounding rural areas due to the replacement of natural vegetation with heat-absorbing materials like concrete and asphalt. HeatWatch helps you monitor and predict these effects.',
  },
  {
    question: 'How accurate is HeatWatch\'s data?',
    answer: 'Our ML models achieve 95%+ accuracy by combining NASA satellite data, ground weather stations, and advanced algorithms. We continuously validate our predictions against real-world temperature measurements.',
  },
  {
    question: 'Can I use HeatWatch for free?',
    answer: 'Yes! Our free plan includes global location search, real-time weather data, current heat zone detection, and basic temperature analysis. Premium features like advanced ML analytics and predictions require a paid subscription.',
  },
  {
    question: 'Which cities does HeatWatch cover?',
    answer: 'HeatWatch provides coverage for 50+ major cities worldwide, with the ability to analyze any location globally. We\'re continuously expanding our monitored cities based on user demand.',
  },
  {
    question: 'How do the peak hour predictions work?',
    answer: 'Our neural networks analyze historical temperature patterns and weather conditions to predict when urban areas will reach peak heat. This helps you plan heat mitigation strategies and public health responses.',
  },
  {
    question: 'What is the Intervention Simulator?',
    answer: 'The Intervention Simulator lets you test the potential impact of different cooling strategies (like green infrastructure, reflective roofs, etc.) on UHI intensity before investing in expensive implementations.',
  },
  {
    question: 'How often is the data updated?',
    answer: 'Free plan data updates daily. Premium plan includes real-time updates with satellite passes and weather station data refreshing multiple times throughout the day.',
  },
  {
    question: 'Can I export reports?',
    answer: 'Yes! Premium subscribers can export comprehensive PDF reports with all analysis, forecasts, and recommendations. Free users can view results but cannot export.',
  },
  {
    question: 'Do you offer API access?',
    answer: 'Yes, premium subscribers can access our API for custom integrations and automation. Contact our support team for API documentation and rate limits.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'Free plan users have access to our knowledge base and community forums. Premium subscribers receive priority email support and access to our climate science team for strategic guidance.',
  },
  {
    question: 'Is my data secure?',
    answer: 'We use enterprise-grade encryption for all data transmission and storage. All user data is encrypted at rest and in transit. We comply with GDPR and international data protection standards.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply sign up for free to start analyzing any location worldwide. Select a city, click analyze, and within seconds you\'ll see current heat zones and weather data. Premium features unlock after subscription.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about HeatWatch and how we help you understand urban heat islands.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 text-lg">{item.question}</span>
                <ChevronDown
                  size={24}
                  className={`text-orange-600 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't find your answer?</h2>
          <p className="text-lg text-orange-100 mb-8">
            Our team is here to help. Contact us anytime for more information.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg hover:text-orange-700"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
