'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Globe, LineChart, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Monitor Urban <span className="text-orange-600">Heat Islands</span> with Precision
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Advanced AI-powered analysis combining satellite data, weather patterns, and machine learning to predict and manage urban heat island effects for smarter cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={user ? '/dashboard' : '/pricing'}
                className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={20} />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Schedule Demo <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl aspect-square flex items-center justify-center text-white text-6xl shadow-2xl">
            🌡️📊
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Powerful Features</h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Everything you need to understand and combat urban heat islands
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe size={32} className="text-orange-600" />,
              title: 'Global Coverage',
              description: 'Access real-time data from any location worldwide with our satellite integration.',
              free: true,
            },
            {
              icon: <LineChart size={32} className="text-orange-600" />,
              title: 'Advanced Analytics',
              description: 'Comprehensive heat island analysis with predictive models and historical trends.',
              free: false,
            },
            {
              icon: <Zap size={32} className="text-orange-600" />,
              title: 'Real-time Data',
              description: 'Live weather updates, NASA satellite imagery, and instant heat zone detection.',
              free: true,
            },
            {
              icon: <Shield size={32} className="text-orange-600" />,
              title: 'Risk Assessment',
              description: 'ML-powered risk scoring with detailed mitigation recommendations.',
              free: false,
            },
            {
              icon: <LineChart size={32} className="text-orange-600" />,
              title: 'Forecasting',
              description: 'Peak hour predictions and temperature trend analysis powered by regression models.',
              free: false,
            },
            {
              icon: <Zap size={32} className="text-orange-600" />,
              title: 'Intervention Simulator',
              description: 'Test green infrastructure impacts and optimize urban cooling strategies.',
              free: false,
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="flex items-center gap-2">
                {feature.free ? (
                  <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    Free
                  </span>
                ) : (
                  <span className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                    Premium
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose the plan that works for you
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-colors">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold mb-8">
                Get Started
              </button>
              <div className="space-y-4">
                {[
                  'Global location search',
                  'Real-time weather data',
                  'Current heat zone detection',
                  'Basic temperature analysis',
                  '5 reports/month',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-yellow-300 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold text-sm">
              POPULAR
            </div>
            <div className="p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
              <p className="text-orange-100 mb-6">For professionals & organizations</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-orange-100">/month</span>
              </div>
              <button className="w-full py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold mb-8 hover:text-orange-700">
                Start Free Trial
              </button>
              <div className="space-y-4">
                {[
                  'Everything in Free, plus:',
                  'Advanced ML-powered risk assessment',
                  'Peak hour predictions',
                  'Intervention simulator',
                  'NASA satellite integration',
                  'ONNX neural network insights',
                  'Unlimited reports',
                  'PDF export & sharing',
                  'Priority support',
                ].map((feature, i) => (
                  <div key={i} className={`flex items-center gap-3 ${i === 0 ? 'font-semibold text-orange-100 mt-2' : ''}`}>
                    {i > 0 && <CheckCircle size={20} className="text-white" />}
                    <span className={i === 0 ? 'text-white' : 'text-orange-50'}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make Your City Cooler?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join city planners and climate authorities worldwide using HeatWatch to combat urban heat islands.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-lg"
          >
            Explore Plans <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
